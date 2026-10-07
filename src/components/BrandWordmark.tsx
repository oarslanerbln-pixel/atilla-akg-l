import type { ReactNode } from "react";
import { WORDMARK } from "./brandWordmarkPaths";

/** The capitals' overshoot: round letters dip a little past cap and baseline. */
const PAD = 2;
const VIEW_BOX = `0 ${-WORDMARK.capHeight - PAD} ${WORDMARK.width} ${WORDMARK.capHeight + 2 * PAD}`;

/**
 * The wordmark, ATILLA BARBAROSSA, drawn from the outlines of the Flow artwork
 * (Montserrat Light, tracked 0.18em) so it reads as the logo does, with no
 * font to download. It fills `currentColor` unless given a `fill` (with any
 * `<defs>` it refers to as children), and is sized by its height: the cap
 * height is the box's height less a fiftieth.
 */
export default function BrandWordmark({
  className,
  fill = "currentColor",
  children,
}: {
  className?: string;
  fill?: string;
  children?: ReactNode;
}) {
  return (
    <svg className={className} viewBox={VIEW_BOX} role="img" aria-label="Atilla Barbarossa" focusable="false">
      {children}
      <path d={WORDMARK.d} fill={fill} />
    </svg>
  );
}
