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

/**
 * Words that may stand beside a keyword without turning the message into conversation: "Gold
 * bitte", "Tour please", "Lütfen fiyat". Every word here widens what counts as a request, so no
 * articles, verbs or negations ("nicht", "no", "hayır"): with one, "Gold nicht" would get the ad.
 */
const REQUEST_WORDS = new Set(
  [
    'bitte', 'danke', 'hallo', 'pn', // DE ("PN": private Nachricht)
    'please', 'pls', 'plz', 'thanks', 'hi', 'hey', // EN
    'lütfen', 'lutfen', 'teşekkürler', 'tesekkurler', 'merhaba', 'selam', // TR, with and without marks
    'link', 'dm', // all three
  ].map(normalizeWord),
);

/** "@atillabarbarossa" in a reply, "@reise.info" as a tag: a name, never a keyword. An address ("info@…") is no mention. */
const MENTION = /(?<![\w.])@[\w.]+/g;

/**
 * The keywords a comment or message asks for, in the order written, or none when it says
 * anything else. Only a keyword plus request words counts, so "GOLD", "Gold bitte 🙏" and
 * "@atillabarbarossa Tour please!" ask, while "Gute Reise!" and "Which app do you use?" are
 * conversation. Emoji and punctuation are not words and drop out on their own.
 */
export function requestedKeywords(text: string, keywords: readonly string[]): string[] {
  const words = wordsOf(text.replace(MENTION, ' '));
  const wanted = new Set(keywords.map(normalizeWord));
  if (!words.every((w) => wanted.has(w) || REQUEST_WORDS.has(w))) return [];
  return words.filter((w) => wanted.has(w));
}
