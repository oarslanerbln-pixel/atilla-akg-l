import GamesPage from "@/components/games/GamesPage";
import JsonLd from "@/components/JsonLd";
import { gamesMetadata } from "@/components/games/share";
import { gamesGraph } from "@/lib/structuredData";

/** Barbarossa Games (/games/tr). */
export const metadata = gamesMetadata("TR");

export default function Games() {
  return (
    <>
      <JsonLd data={gamesGraph("TR")} />
      <GamesPage />
    </>
  );
}
