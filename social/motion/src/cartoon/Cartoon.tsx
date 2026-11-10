import React, { useId } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../../../palette";
import { loadFonts, sans } from "../lib/fonts";
import { FORMATS, formatOf } from "../lib/formats";
import { FPS, clamp, ease, rise } from "../lib/tokens";
import { Backdrop, GROUND } from "./Backdrop";
import { Character } from "./Character";
import { lookOf } from "./looks";
import { DISSOLVE, FIGURE, cameraAt, castAt, dissolveIn, project, sceneSeconds, timeline, type CartoonProps, type Scene } from "./scene";

// A cartoon film: scenes of characters acting on a set, a camera, speech bubbles, a line of
// narration. Everything on screen is a function of the frame number (scene.ts, rig.ts).

const Bubble: React.FC<{ text: string; inn: number; out: number; x: number; y: number; frame: { width: number; height: number }; safe: { left: number; right: number; top: number } }> = ({ text, inn, out, x, y, frame, safe }) => {
  const portrait = frame.height > frame.width;
  const size = portrait ? 40 : 32;
  const maxWidth = Math.min(portrait ? 640 : 560, frame.width - safe.left - safe.right);
  // The bubble sits over the speaker but never leaves the safe area; its tail still points home.
  const half = Math.min(maxWidth, text.length * size * 0.56 + 64) / 2;
  const cx = clamp(x, safe.left + half, frame.width - safe.right - half);
  const bottom = Math.max(y, safe.top + 290);
  const k = inn * (1 - out);
  return (
    <div style={{ position: "absolute", left: cx - half, width: half * 2, top: bottom, transform: `translateY(-100%) translateY(${(1 - inn) * 14}px) scale(${0.92 + 0.08 * inn})`, transformOrigin: `${x - cx + half}px 100%`, opacity: k }}>
      <div style={{ padding: "22px 30px", borderRadius: 30, backgroundColor: C.porcelain, color: C.text, fontFamily: sans, fontWeight: 500, fontSize: size, lineHeight: 1.25, textAlign: "center", boxShadow: "0 10px 30px rgba(20, 15, 10, 0.18)" }}>{text}</div>
      <svg width={40} height={26} style={{ position: "absolute", left: clamp(x - cx + half - 20, 26, half * 2 - 66), bottom: -24 }}>
        <path d="M0 0 L40 0 L18 26 Z" fill={C.porcelain} />
      </svg>
    </div>
  );
};

const SceneView: React.FC<{ scene: Scene; t: number; opacity: number }> = ({ scene, t, opacity }) => {
  const { width, height } = useVideoConfig();
  const safe = FORMATS[formatOf(width, height)].safe;
  const view = (1000 * width) / height;
  const px = height / 1000;
  const { cam, zoom } = cameraAt(scene, t, view);
  const cast = scene.cast.map((c, i) => ({ c, i, look: lookOf(c), m: castAt(c, t) }));
  const caption = scene.caption ? rise(Math.round(t * FPS), 0.4, sceneSeconds(scene), 20) : undefined;
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${view} 1000`}>
        <g transform={`translate(${view / 2} ${GROUND}) scale(${zoom}) translate(${-view / 2} ${-GROUND})`}>
          <Backdrop place={scene.place} time={scene.time} cam={cam} view={view} t={t}>
            {cast.map(({ c, i, look, m }) => (
              <g key={c.id} transform={`translate(${m.x.toFixed(2)} ${GROUND + 26 + i * 7}) scale(${(m.facing * FIGURE * look.height).toFixed(4)} ${(FIGURE * look.height).toFixed(4)})`}>
                <Character look={look} moment={m} seed={i * 13 + 5} />
              </g>
            ))}
          </Backdrop>
        </g>
      </svg>
      {cast.map(({ c, i, look, m }) => {
        if (!m.say) return null;
        const [vx, vy] = project(m.x, GROUND + 26 + i * 7 - (455 + m.pose.lift) * FIGURE * look.height, cam, zoom, view, GROUND);
        return <Bubble key={c.id} text={m.say.text} inn={m.say.in} out={m.say.out} x={vx * px} y={vy * px - 18} frame={{ width, height }} safe={safe} />;
      })}
      {scene.caption && caption && (
        // Narration runs along the top, like a storybook: the lower third belongs to the figures.
        <div style={{ position: "absolute", left: safe.left, right: safe.right, top: safe.top, display: "flex", justifyContent: "center", opacity: caption.opacity, transform: `translateY(${-caption.y}px)` }}>
          <div style={{ padding: "18px 30px", borderRadius: 18, backgroundColor: "rgba(20, 15, 10, 0.82)", color: C.porcelain, fontFamily: sans, fontWeight: 500, fontSize: height > width ? 40 : 32, lineHeight: 1.3, textAlign: "center" }}>{scene.caption}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Cartoon: React.FC<CartoonProps> = ({ scenes }) => {
  loadFonts();
  const id = useId();
  const t = useCurrentFrame() / FPS;
  const { starts } = timeline(scenes);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {scenes.map((scene, i) => {
        const local = t - starts[i];
        // A scene keeps playing under the next one's dissolve, then is dropped.
        if (local < 0 || local > sceneSeconds(scene) + DISSOLVE) return null;
        return <SceneView key={i} scene={scene} t={local} opacity={dissolveIn(i, starts[i], t)} />;
      })}
      {/* paper tooth and a soft vignette over everything: the flat shapes stop looking like vectors */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.16 }}>
        <filter id={`${id}grain`}>
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={4} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 -1.2 1.1" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id}grain)`} />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, rgba(20,15,10,0) 62%, rgba(20,15,10,0.22) 100%)" }} />
      <AbsoluteFill style={{ backgroundColor: C.ink, opacity: 1 - ease(clamp(t / 0.5)) }} />
    </AbsoluteFill>
  );
};
