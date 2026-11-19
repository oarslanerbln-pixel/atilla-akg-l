import GamesPage from "@/components/games/GamesPage";
import JsonLd from "@/components/JsonLd";
import { gamesMetadata } from "@/components/games/share";
import { gamesGraph } from "@/lib/structuredData";

/** Barbarossa Games, in German. English and Turkish live at /games/en and /games/tr. */
export const metadata = gamesMetadata("DE");

export default function Games() {
  return (
    <>
      <JsonLd data={gamesGraph("DE")} />
      <GamesPage />
    </>
  );
}
