import { join } from "node:path";
import { OUT, still } from "./engine";

// npm run sheet [-- <frame>]: the cartoon model sheet, every preset in every action.
const frame = Number(process.argv[2] ?? 20);
still("ModelSheet", frame, join(OUT, "model-sheet.png")).then((file) => {
  console.log(file);
  process.exit(0);
});
