/**
 * The Travel Creator Roadmap, Atilla's e-book. Tentary sells and delivers it;
 * this site only links to its checkouts. If the price changes in Tentary,
 * change it here too — the page must never show a price the checkout doesn't
 * charge.
 */
export const roadmap = {
  /** Paid e-book (PDF, German). */
  checkout: "https://atillabarbarossa.tentary.com/p/oZ1Iat/checkout",
  /** Free excerpt: pitch guide and chapter 1, 0 €. */
  sample: "https://atillabarbarossa.tentary.com/p/V7pCH7/checkout",
  /** Final price in euro, taxes included, as the checkout shows it. */
  price: 49,
} as const;
