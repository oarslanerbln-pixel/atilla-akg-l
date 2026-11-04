import "server-only";

/**
 * Which Wallet passes this deployment can sign. Each needs credentials from
 * its provider (docs/wallet-setup.md); the card offers a Wallet button only
 * for a provider that is ready, so no visitor is sent to a file or a page
 * that would fail.
 */

export const APPLE_ENV = {
  passTypeId: "APPLE_WALLET_PASS_TYPE_ID",
  teamId: "APPLE_WALLET_TEAM_ID",
  signerCert: "APPLE_WALLET_SIGNER_CERT",
  signerKey: "APPLE_WALLET_SIGNER_KEY",
  wwdr: "APPLE_WALLET_WWDR_CERT",
} as const;

export const GOOGLE_ENV = {
  issuerId: "GOOGLE_WALLET_ISSUER_ID",
  serviceAccountEmail: "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL",
  privateKey: "GOOGLE_WALLET_PRIVATE_KEY",
} as const;

const set = (names: Record<string, string>) => Object.values(names).every((name) => Boolean(process.env[name]));

export const appleWalletReady = () => set(APPLE_ENV);
export const googleWalletReady = () => set(GOOGLE_ENV);

export type WalletOptions = { apple: boolean; google: boolean };

export const walletOptions = (): WalletOptions => ({ apple: appleWalletReady(), google: googleWalletReady() });
