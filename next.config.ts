import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
