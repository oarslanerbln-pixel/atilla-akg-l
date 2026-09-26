/**
 * The compass mark — the brand's icon.
 *
 * A four-point north star whose north ray breaks out of its ring: direction,
 * travel, the one fixed point a destination film is built around. Each ray is
 * split into a dark half and a gold half, alternating clockwise, so the star
 * reads as one turning figure rather than a plus sign.
 *
 * The dark halves and the ring take `currentColor`, so the mark follows
 * whatever text colour its parent sets (white over the hero, ink once the
 * header turns solid). The gold halves stay gold everywhere. Exported artwork
 * for print and social lives in public/brand/.
 */
export const RAYS: Array<[string, string]> = [
  ["50,1 46,46 50,50", "50,1 54,46 50,50"],
  ["80,50 54,46 50,50", "80,50 54,54 50,50"],
  ["50,80 54,54 50,50", "50,80 46,54 50,50"],
  ["20,50 46,54 50,50", "20,50 46,46 50,50"],
];

export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2.4" />
      {RAYS.map(([dark, gold]) => (
        <g key={dark}>
          <polygon points={dark} fill="currentColor" />
          <polygon points={gold} fill="var(--accent-gold)" />
        </g>
      ))}
    </svg>
  );
}
