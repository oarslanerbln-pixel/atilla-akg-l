import 'server-only';
import { unstable_cache } from 'next/cache';
import { BlobNotFoundError, head } from '@vercel/blob';

// The newest Instagram videos, mirrored into Vercel Blob by the cron
// (/api/cron/instagram-reels, every third day). The visitor's browser never contacts Instagram:
// it plays our copy, byte for byte the file Instagram serves, never re-encoded.

export const REELS_PREFIX = 'reels/';
export const MANIFEST_PATH = `${REELS_PREFIX}manifest.json`;
/** Cache tag of the home pages' reels; the cron revalidates it after a change. */
export const REELS_TAG = 'reels';

export interface Reel {
  /** Instagram media id; also names the mirrored files. */
  id: string;
  permalink: string;
  /** First line of the caption, hashtags removed. May be empty. */
  title: string;
  /** ISO timestamp of the Instagram post. */
  postedAt: string;
  videoUrl: string;
  posterUrl: string;
}

/**
 * The case study's film, chosen by its Instagram address rather than its age:
 * the Novotel Bosphorus reel (April 2023) is far below the newest nine.
 */
export const CASE_REEL = {
  shortcode: 'CrYTleIq4dV',
  permalink: 'https://www.instagram.com/reel/CrYTleIq4dV/',
} as const;

export interface ReelsManifest {
  updatedAt: string;
  /** Newest first. */
  reels: Reel[];
  /** The case study's film once mirrored; absent before, or if Instagram offers no file. */
  caseFilm?: Reel & { shortcode: string };
}

/**
 * The stored manifest, or null before the first sync. The URL carries the
 * upload time: an overwritten blob can linger in the CDN for a minute, and the
 * page is regenerated right after the cron writes a new one.
 */
export async function readManifest(): Promise<ReelsManifest | null> {
  let url: string;
  try {
    const meta = await head(MANIFEST_PATH);
    url = `${meta.url}?v=${meta.uploadedAt.getTime()}`;
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Load reels manifest: ${res.status}`);
  const json = (await res.json()) as Partial<ReelsManifest>;
  return {
    updatedAt: json.updatedAt ?? '',
    reels: Array.isArray(json.reels) ? json.reels : [],
    ...(json.caseFilm ? { caseFilm: json.caseFilm } : {}),
  };
}

/**
 * The cache boundary wraps the whole read, not only the manifest fetch: the
 * page then carries the tag and the daily revalidation even when there is no
 * manifest yet. A page built before the first sync would otherwise be plain
 * static, deaf to the cron, and stay empty until the next deploy.
 */
const cachedManifest = unstable_cache(readManifest, [MANIFEST_PATH], {
  tags: [REELS_TAG],
  revalidate: 24 * 60 * 60,
});

/**
 * Reels for the home page. Without a Blob store (local development, a fork)
 * the section simply stays away. Any other failure is thrown on purpose: during
 * a regeneration Next then keeps serving the last good page.
 */
export async function loadReels(): Promise<Reel[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  return (await cachedManifest())?.reels ?? [];
}

/** The case study's film, if the cron has mirrored the reel named in CASE_REEL. */
export async function loadCaseFilm(): Promise<Reel | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const film = (await cachedManifest())?.caseFilm;
  return film?.shortcode === CASE_REEL.shortcode ? film : null;
}
