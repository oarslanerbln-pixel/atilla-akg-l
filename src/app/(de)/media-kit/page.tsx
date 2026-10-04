import MediaKitPage from "@/components/mediakit/MediaKitPage";
import JsonLd from "@/components/JsonLd";
import { mediaKitMetadata } from "@/components/mediakit/share";
import { mediaKitGraph } from "@/lib/structuredData";

/**
 * The media kit, in German: the page sent by email to hotels, restaurants
 * and brands. English and Turkish live at /media-kit/en and /media-kit/tr,
 * under their own root layouts. See components/mediakit/MediaKitPage.tsx.
 */
export const metadata = mediaKitMetadata("DE");

export default function MediaKit() {
  return (
    <>
      <JsonLd data={mediaKitGraph("DE")} />
      <MediaKitPage />
    </>
  );
}
