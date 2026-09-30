// How comment and message words are compared with the tour and partner-offer keywords. Both
// sides go through normalizeWord, so a keyword matches however either side was typed.

/**
 * One spelling per word: "FİYAT", "Fiyat", "FIYAT" and "fiyat" all become "fiyat".
 * `toLowerCase()` alone turns the Turkish capital İ into "i" plus a combining dot above, which
 * no keyword equals (and which split the word in two at the dot). So I, İ and ı all become a
 * plain "i". NFKC also folds full-width letters and the "fancy font" letters pasted into
 * comments (𝐅𝐈𝐘𝐀𝐓) into ordinary ones.
 *
 * Every other mark stays. Stripping them all would make "Tür" match the tour keyword "tur", and
 * both audiences write it: "direkt vor der Tür" (DE, door), "bu tür oteller" (TR, kind). A
 * spelling without marks is listed as a keyword of its own instead, as offers.sql does with
 * "uçuş" and "ucus".
 */
export function normalizeWord(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/(?<=[Ii])̇/g, '')
    .normalize('NFC')
    .replace(/ı/g, 'i')
    .toLowerCase();
}

export const wordsOf = (text: string) => normalizeWord(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
