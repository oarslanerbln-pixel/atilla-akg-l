import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://atillabarbarossa.com"),
  title: "Atilla BARBAROSSA | Visual Storytelling & Creative Direction",
  description: "Global visual storyteller, creative director and premium filmmaker specializing in luxury hospitality, executive aviation, and high-end lifestyle.",
  keywords: ["Atilla Barbarossa", "Visual Storytelling", "Creative Director", "Luxury Filmmaker", "Content Creator", "DACH region"],
  openGraph: {
    title: "Atilla BARBAROSSA | Visual Storytelling",
    description: "Global visual storyteller and premium filmmaker.",
    url: "https://atillabarbarossa.com",
    siteName: "Atilla Barbarossa Portfolio",
    images: [
      {
        url: "/og-image.jpg", // This would be the gold/black poster
        width: 1200,
        height: 630,
        alt: "Atilla Barbarossa - Creative Direction",
      },
    ],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atilla BARBAROSSA | Visual Storytelling",
    description: "Global visual storyteller and premium filmmaker.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Providers } from "./Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
