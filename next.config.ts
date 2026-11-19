import type { NextConfig } from "next";

/** Headers for one kind of gzip-compressed Unity WebGL file. */
function unityHeaders(source: string, contentType: string) {
  return {
    source,
    headers: [
      { key: "Content-Type", value: contentType },
      { key: "Content-Encoding", value: "gzip" },
    ],
  };
}

const nextConfig: NextConfig = {
  // Says nothing a visitor needs; it only tells a scanner what to probe for.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // The site is never framed by another origin (clickjacking on the contact form).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
      // Browser games (public/games/<game>/, Unity WebGL builds). Unity writes
      // its files gzip-compressed with a .unityweb extension; served with
      // Content-Encoding the browser unpacks them itself, which is faster
      // than the loader's JavaScript fallback (decompressionFallback, built
      // in, so the game still starts if a proxy drops the header). The wasm
      // keeps its own type, or the browser cannot compile it while it streams.
      unityHeaders("/games/:game/Build/:file*.wasm.unityweb", "application/wasm"),
      unityHeaders("/games/:game/Build/:file*.framework.js.unityweb", "application/javascript"),
      unityHeaders("/games/:game/Build/:file*.data.unityweb", "application/octet-stream"),
    ];
  },
  async redirects() {
    return [
      // A short address to share; the game's own page loads its files by
      // relative path, so it has to be opened at index.html, not rewritten.
      { source: "/games/sila-defteri", destination: "/games/sila-defteri/index.html", permanent: false },
      // The language pages follow the suffix form of the rest of the site
      // (/games/en); the prefix form some links may use leads there too.
      { source: "/en/games", destination: "/games/en", permanent: true },
      { source: "/tr/games", destination: "/games/tr", permanent: true },
    ];
  },
  images: {
    // Posters of the Instagram films mirrored into Vercel Blob
    // (src/lib/reels). Served through /_next/image, so from this origin.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/reels/**" },
    ],
  },
  experimental: {
    // Each language has its own root layout (src/app/(de), (en), (tr)), so an
    // unmatched address has no single layout to render in; this lets
    // src/app/global-not-found.tsx give it a styled 404 of its own.
    globalNotFound: true,
  },
  async rewrites() {
    return {
      // /social-media is sent as ?lang=en or ?lang=tr. Those links are served
      // the prerendered page for that language (src/app/social-media/en, /tr),
      // so the link preview is in the prospect's language, while the address
      // stays the one that was sent. `beforeFiles`, because /social-media is
      // itself a page and would otherwise answer first.
      beforeFiles: [
        {
          source: "/social-media",
          has: [{ type: "query", key: "lang", value: "(?<lang>en|tr)" }],
          destination: "/social-media/:lang",
        },
      ],
    };
  },
};

export default nextConfig;
