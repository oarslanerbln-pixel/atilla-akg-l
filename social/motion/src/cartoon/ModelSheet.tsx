import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../palette";
import { FPS } from "../lib/tokens";
import { Character } from "./Character";
import { PRESETS, PRESET_IDS } from "./looks";
import { ACTIONS, STRIDE, actionPose } from "./rig";

// Every preset in every action, on one sheet: what an animator pins to the wall. Render one
// frame of it after touching the rig or a look (npm run sheet), and read it before any film.

export const MODEL_SHEET = { width: 2400, height: 1560 };

export const ModelSheet: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cw = MODEL_SHEET.width / ACTIONS.length;
  const ch = MODEL_SHEET.height / PRESET_IDS.length;
  return (
    <AbsoluteFill style={{ backgroundColor: C.alabaster }}>
      <svg width={MODEL_SHEET.width} height={MODEL_SHEET.height}>
        {PRESET_IDS.map((id, row) =>
          ACTIONS.map((action, col) => (
            <g key={`${id}-${action}`} transform={`translate(${cw * (col + 0.5)} ${ch * (row + 1) - 22}) scale(${(0.5 * PRESETS[id].height).toFixed(3)})`}>
              <Character look={PRESETS[id]} seed={row * 9 + col} moment={{ x: 0, facing: 1, t, pose: actionPose(action, t, (t * 165) / STRIDE) }} />
            </g>
          )),
        )}
      </svg>
    </AbsoluteFill>
  );
};
