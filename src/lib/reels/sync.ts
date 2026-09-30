import 'server-only';
import { del, list, put } from '@vercel/blob';
import { CONCIERGE } from '@/lib/concierge/config';
import { graphGet } from '@/lib/concierge/meta';
import { instagramAccessToken } from '@/lib/concierge/tokens';
import { MANIFEST_PATH, REELS_PREFIX, readManifest, type Reel } from './manifest';

/** Videos the section shows. */
const MAX_REELS = 9;
/** Pages of 25 posts searched for videos; photos and carousels are skipped. */
const MAX_PAGES = 4;
/** No new download starts after this, so a run ends inside maxDuration; the next run catches up. */
const TIME_BUDGET_MS = 30_000;
/** Mirrored files never change: a new Instagram post gets a new id. */
const ONE_YEAR_S = 365 * 24 * 60 * 60;

const MEDIA_FIELDS = 'id,media_type,media_url,thumbnail_url,permalink,timestamp,caption';

interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  /** Omitted by Instagram when the post contains copyrighted audio. */
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  caption?: string;
}

export interface ReelsSync {
  changed: boolean;
  shown: number;
  added: number;
  /** New videos left for the next run (time budget) or that failed to copy. */
  pending: number;
  /** Videos Instagram offers no file for (copyrighted music). */
  withoutFile: number;
  deleted: number;
}

/**
 * Hashtags that mark a post as advertising (DE, EN, TR). Such videos stay on
 * Instagram and off the portfolio; everything else is shown.
 */
const AD_TAGS = new Set(['ad', 'anzeige', 'werbung', 'sponsored', 'reklam', 'işbirliği', 'isbirligi']);

/**
 * Whether a video belongs on the portfolio. Called for every VIDEO post,
 * newest first, before its file is checked or copied.
 */
function shouldShowOnSite(media: InstagramMedia): boolean {
  for (const [, tag] of (media.caption ?? '').matchAll(/#([\p{L}\p{N}_]+)/gu)) {
    // "İ" first: toLowerCase() would turn it into "i" plus a combining dot.
    if (AD_TAGS.has(tag.replace(/İ/g, 'i').toLowerCase())) return false;
  }
  return true;
}

async function recentVideos(token: string) {
  const videos: InstagramMedia[] = [];
  let withoutFile = 0;
  let next: string | undefined =
    `https://graph.instagram.com/${CONCIERGE.graphVersion}/me/media?fields=${MEDIA_FIELDS}&limit=25`;
  for (let page = 0; next && page < MAX_PAGES && videos.length < MAX_REELS; page++) {
    const json = (await graphGet(next, token)) as { data?: InstagramMedia[]; paging?: { next?: string } };
    for (const media of json.data ?? []) {
      if (videos.length === MAX_REELS) break;
      if (media.media_type !== 'VIDEO' || !shouldShowOnSite(media)) continue;
      if (media.media_url && media.thumbnail_url) videos.push(media);
      else withoutFile++;
    }
    next = json.paging?.next;
  }
  return { videos, withoutFile };
}

/** The caption's first line without hashtags, short enough for a card. */
function titleOf(caption: string | undefined): string {
  const line = (caption ?? '').split('\n').find((l) => l.trim()) ?? '';
  const text = line.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s+/g, ' ').trim();
  return text.length > 90 ? `${text.slice(0, 89).trimEnd()}…` : text;
}

/** Streams one file from Instagram's CDN into the Blob store, never through memory. */
async function mirrorFile(source: string, pathname: string, fallbackType: string): Promise<string> {
  const res = await fetch(source, { cache: 'no-store' });
  if (!res.ok || !res.body) throw new Error(`Download ${pathname}: ${res.status}`);
  const { url } = await put(pathname, res.body, {
    access: 'public',
    contentType: res.headers.get('content-type') ?? fallbackType,
    cacheControlMaxAge: ONE_YEAR_S,
    allowOverwrite: true,
    multipart: fallbackType.startsWith('video/'),
  });
  return url;
}

async function mirror(media: InstagramMedia): Promise<Reel> {
  const [videoUrl, posterUrl] = await Promise.all([
    mirrorFile(media.media_url!, `${REELS_PREFIX}${media.id}.mp4`, 'video/mp4'),
    mirrorFile(media.thumbnail_url!, `${REELS_PREFIX}${media.id}.jpg`, 'image/jpeg'),
  ]);
  return { id: media.id, permalink: media.permalink, title: titleOf(media.caption), postedAt: media.timestamp, videoUrl, posterUrl };
}

/**
 * Brings the Blob store in line with the newest videos on Instagram. Safe to
 * run twice. Files of a video that left the list are deleted one run later, so
 * a page still cached with the previous manifest never points at a gap.
 */
export async function syncReels(): Promise<ReelsSync> {
  const deadline = Date.now() + TIME_BUDGET_MS;
  const { videos, withoutFile } = await recentVideos(await instagramAccessToken());
  const previous = (await readManifest({ cache: 'no-store' }))?.reels ?? [];
  const known = new Map(previous.map((reel) => [reel.id, reel]));

  const reels: Reel[] = [];
  let added = 0;
  let pending = 0;
  for (const media of videos) {
    const stored = known.get(media.id);
    if (stored) {
      // Captions can be edited after posting.
      reels.push({ ...stored, title: titleOf(media.caption), permalink: media.permalink });
      continue;
    }
    if (Date.now() > deadline) {
      pending++;
      continue;
    }
    try {
      reels.push(await mirror(media));
      added++;
    } catch (error) {
      console.error(`[reels] could not mirror ${media.id}`, error);
      pending++;
    }
  }

  const changed = JSON.stringify(reels) !== JSON.stringify(previous);
  if (changed) {
    await put(MANIFEST_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), reels }), {
      access: 'public',
      contentType: 'application/json',
      cacheControlMaxAge: 60,
      allowOverwrite: true,
    });
  }

  const keep = new Set([...previous, ...reels].flatMap((reel) => [reel.videoUrl, reel.posterUrl]));
  const { blobs } = await list({ prefix: REELS_PREFIX });
  const orphans = blobs.filter((blob) => blob.pathname !== MANIFEST_PATH && !keep.has(blob.url)).map((blob) => blob.url);
  if (orphans.length) await del(orphans);

  return { changed, shown: reels.length, added, pending, withoutFile, deleted: orphans.length };
}
