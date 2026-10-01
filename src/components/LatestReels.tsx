import ReelsRail from "@/components/ReelsRail";
import { loadReels } from "@/lib/reels/manifest";

/**
 * The newest videos from Instagram, mirrored every third day by the cron
 * (/api/cron/instagram-reels). Absent until the first sync has run.
 */
export default async function LatestReels() {
  const reels = await loadReels();
  return reels.length ? <ReelsRail reels={reels} /> : null;
}
