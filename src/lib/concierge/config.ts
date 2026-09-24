export type Lang = 'de' | 'en' | 'tr';
export type Channel = 'whatsapp' | 'instagram';

export const CONCIERGE = {
  brand: 'Atilla Barbarossa Journeys',
  model: 'claude-opus-5',
  timezone: process.env.TOUR_TIMEZONE ?? 'Europe/Istanbul',
  // Customers often send several short messages in a row; wait for the burst to end.
  debounceMs: 4000,
  historyLimit: 40,
  maxAgentIterations: 8,
  holdHours: 24,
  graphVersion: process.env.META_GRAPH_VERSION ?? 'v23.0',
  commentKeywords: (process.env.IG_COMMENT_KEYWORDS ?? 'tur,tour,reise,info,preis,price,fiyat')
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean),
};

export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export function isLang(value: unknown): value is Lang {
  return value === 'de' || value === 'en' || value === 'tr';
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
