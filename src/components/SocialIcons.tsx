import { socialProfiles } from "@/lib/site";

/* Line marks in currentColor, so each hero colours them through its own link
   styles. The link carries the name; the drawing is decoration. */

export const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="15" x="2" y="4.5" rx="4" />
    <polygon points="10 8.5 15 12 10 15.5 10 8.5" fill="currentColor" stroke="none" />
  </svg>
);

/** The profiles a hero links to, in the order they are shown. `cursor` is the custom cursor's label. */
export const socialLinks = [
  { platform: "Instagram", cursor: "INSTAGRAM", href: socialProfiles.instagram, Icon: InstagramIcon },
  { platform: "TikTok", cursor: "TIKTOK", href: socialProfiles.tiktok, Icon: TikTokIcon },
  { platform: "YouTube", cursor: "YOUTUBE", href: socialProfiles.youtube, Icon: YoutubeIcon },
] as const;
