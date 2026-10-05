/**
 * Fills `{token}`s in a translation. A token without a value is left in
 * place, so a caller can still split on one the text has to carry as markup
 * (`{link}`).
 */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (token, key: string) => (key in values ? String(values[key]) : token));
}

/**
 * The portfolio states each case result as one phrase ("559.316 erreichte
 * Konten", "94.2% Engagement Rate", "%94,2 Etkileşim Oranı"). Where the figure
 * is set large and the words under it, the phrase is split at the end of the
 * figure; anything else is shown whole.
 */
export function splitMetric(text: string): { value: string; label: string } {
  const match = /^(%?\d[\d.,]*(?:\s?%|K)?)\s+(.+)$/.exec(text);
  return match ? { value: match[1], label: match[2] } : { value: text, label: "" };
}
