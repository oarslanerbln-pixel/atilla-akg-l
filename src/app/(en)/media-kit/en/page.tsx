import MediaKitPage from "@/components/mediakit/MediaKitPage";
import JsonLd from "@/components/JsonLd";
import { mediaKitMetadata } from "@/components/mediakit/share";
import { mediaKitGraph } from "@/lib/structuredData";

/** /media-kit in English. */
export const metadata = mediaKitMetadata("EN");

export default function MediaKitEnglish() {
  return (
    <>
      <JsonLd data={mediaKitGraph("EN")} />
      <MediaKitPage />
    </>
  );
}
