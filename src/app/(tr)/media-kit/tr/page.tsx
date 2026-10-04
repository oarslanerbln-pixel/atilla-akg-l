import MediaKitPage from "@/components/mediakit/MediaKitPage";
import JsonLd from "@/components/JsonLd";
import { mediaKitMetadata } from "@/components/mediakit/share";
import { mediaKitGraph } from "@/lib/structuredData";

/** /media-kit in Turkish. */
export const metadata = mediaKitMetadata("TR");

export default function MediaKitTurkish() {
  return (
    <>
      <JsonLd data={mediaKitGraph("TR")} />
      <MediaKitPage />
    </>
  );
}
