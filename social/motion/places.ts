import { join } from "node:path";
import { OUT, still } from "./engine";
import { PLACES, TIME_IDS } from "./src/cartoon/Backdrop";

// npm run places: every set in every light, one still each, to look at after touching a backdrop.
for (const [i, place] of PLACES.entries()) {
  const time = TIME_IDS[i % TIME_IDS.length];
  const scenes = [{ place, time, cast: [{ id: "host", preset: "host", x: 1150, script: [{ at: 0.2, do: "talk" }] }, { id: "b", preset: ["traveller", "guide", "concierge", "photographer", "elder", "traveller"][i], x: 1330, facing: "left" }] }];
  console.log(await still("Cartoon-wide", 45, join(OUT, "places", `${place}-${time}.png`), { kind: "cartoon", name: "places", scenes }));
}
process.exit(0);
