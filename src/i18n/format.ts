/**
 * Fills `{token}`s in a translation. A token without a value is left in
 * place, so a caller can still split on one the text has to carry as markup
 * (`{link}`).
 */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (token, key: string) => (key in values ? String(values[key]) : token));
}
