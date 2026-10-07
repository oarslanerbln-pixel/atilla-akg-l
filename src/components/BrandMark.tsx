import { MARK } from "./brandMarkPaths";

/**
 * The brand mark: an A drawn as a spire of hairlines, its crossbar two teal
 * needles on a horizon, a gold sun where they would meet.
 *
 * The paths are generated from social/brand/mark.ts (`npm run brand`) at a
 * line weight that stays legible from 22 px up. The ink lines take
 * `currentColor`, so the mark follows its parent's text colour (white over
 * the hero, ink once the header turns solid); the needles stay teal and the
 * sun gold. Exported artwork for print and social lives in public/brand/.
 */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {MARK.ink.map((d) => (
        <path key={d} d={d} fill="currentColor" />
      ))}
      {MARK.teal.map((d) => (
        <path key={d} d={d} fill="var(--brand-teal)" />
      ))}
      <circle cx={MARK.sun.cx} cy={MARK.sun.cy} r={MARK.sun.r} fill="var(--accent-gold)" />
    </svg>
  );
}
