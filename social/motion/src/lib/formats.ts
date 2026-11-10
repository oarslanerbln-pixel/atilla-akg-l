// Frame sizes and the bands each platform's interface covers. Readable content stays inside `safe`.

export type FormatId = "reel" | "story" | "square" | "wide";

export interface Format {
  width: number;
  height: number;
  /** Pixels to keep clear on each side. */
  safe: { top: number; right: number; bottom: number; left: number };
}

export const FORMATS: Record<FormatId, Format> = {
  // Reels: caption and audio row below, the action column on the right; the profile grid crops
  // to the middle 3:4 (y 240–1680), which the top band respects.
  reel: { width: 1080, height: 1920, safe: { top: 240, right: 140, bottom: 420, left: 72 } },
  // Stories: Instagram's bars cover roughly the top and bottom 250 px (social/README.md).
  story: { width: 1080, height: 1920, safe: { top: 250, right: 72, bottom: 250, left: 72 } },
  square: { width: 1080, height: 1080, safe: { top: 72, right: 72, bottom: 72, left: 72 } },
  // 16:9: the broadcast title-safe area, 5 % in from each edge.
  wide: { width: 1920, height: 1080, safe: { top: 54, right: 96, bottom: 54, left: 96 } },
};

export const formatOf = (width: number, height: number): FormatId =>
  width > height ? "wide" : width === height ? "square" : "reel";
