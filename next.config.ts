import type { NextConfig } from "next";

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
