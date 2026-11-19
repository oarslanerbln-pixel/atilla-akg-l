import GamesPage from "@/components/games/GamesPage";
import JsonLd from "@/components/JsonLd";
import { gamesMetadata } from "@/components/games/share";
import { gamesGraph } from "@/lib/structuredData";

/** Barbarossa Games (/games/en). */
export const metadata = gamesMetadata("EN");

export default function Games() {
  return (
    <>
      <JsonLd data={gamesGraph("EN")} />
      <GamesPage />
    </>
  );
}
