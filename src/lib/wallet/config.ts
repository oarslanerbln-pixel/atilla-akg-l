/**
 * Whether each Wallet is set up. The card page asks this to decide which
 * buttons to show: a button that leads to a 503 would promise a card that
 * cannot be delivered. Kept apart from apple.ts and google.ts so the page
 * does not pull the signing code into its own bundle.
 */

export function appleWalletConfigured(): boolean {
  return Boolean(
    process.env.APPLE_PASS_TYPE_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_PASS_CERT &&
      process.env.APPLE_PASS_KEY &&
      process.env.APPLE_WWDR_CERT,
  );
}

export function googleWalletConfigured(): boolean {
  return Boolean(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT);
}
