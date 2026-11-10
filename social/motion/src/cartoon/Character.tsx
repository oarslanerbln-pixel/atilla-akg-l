import React from "react";
import { shade, type Look } from "./looks";
import { BONES, HEAD_SCALE, blink, skeleton, type Moment } from "./rig";

// The puppet, drawn. Flat shapes, no outlines: the far arm and leg a shade darker, a soft side
// shadow on the body, round joints. It faces +x; the scene mirrors it to face the other way.

type Pt = [number, number];
const p = ([x, y]: Pt) => `${x.toFixed(1)} ${y.toFixed(1)}`;
const limb = (a: Pt, b: Pt, c: Pt) => `M${p(a)}L${p(b)}L${p(c)}`;
const angle = (a: Pt, b: Pt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

const Shoe: React.FC<{ at: Pt; knee: Pt; colour: string }> = ({ at, knee, colour }) => {
  // The foot follows the shin, but never points into the ground when the leg stands.
  const turn = Math.max(-40, Math.min(35, angle(knee, at) - 90)) * 0.7;
  return <path d="M-11 -9 Q-13 5 -6 6 L24 6 Q30 5 27 -1 Q20 -8 6 -9 Z" fill={colour} transform={`translate(${p(at)}) rotate(${turn.toFixed(1)})`} />;
};

const Hair: React.FC<{ look: Look; back?: boolean }> = ({ look, back }) => {
  const c = look.hairColour;
  if (look.hair === "bald") return null;
  if (back) {
    // What falls behind the head and shoulders.
    if (look.hair === "long") return <path d="M-37 -12 Q-44 30 -34 74 Q-10 84 6 70 Q-2 30 2 -10 Z" fill={shade(c, -0.12)} />;
    if (look.hair === "bun") return <circle cx={-30} cy={-34} r={15} fill={shade(c, -0.1)} />;
    return null;
  }
  if (look.hair === "curly") {
    return (
      <g fill={c}>
        {[[-28, -14, 15], [-22, -32, 16], [-4, -42, 17], [16, -38, 15], [28, -24, 12], [-34, 2, 11]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
    );
  }
  // A cap of hair with a parting towards the face; long hair and a bun share it.
  return <path d="M-36 4 Q-42 -44 0 -45 Q36 -44 35 -14 Q22 -30 2 -27 Q-16 -25 -22 -8 Q-24 4 -28 12 Z" fill={c} />;
};

const Hat: React.FC<{ look: Look }> = ({ look }) => {
  if (look.hat === "fedora")
    return (
      <g>
        <path d="M-54 -22 Q0 -8 56 -22 Q58 -29 50 -30 Q0 -20 -48 -30 Q-56 -29 -54 -22 Z" fill="#3a2c22" />
        <path d="M-32 -30 Q-34 -62 -6 -62 Q0 -56 8 -62 Q34 -60 32 -30 Q0 -22 -32 -30 Z" fill="#4a382b" />
        <path d="M-32 -34 Q0 -26 32 -34 L32 -29 Q0 -21 -32 -29 Z" fill="#b38b59" />
      </g>
    );
  if (look.hat === "cap")
    return (
      <g>
        <path d="M-36 -18 Q-38 -52 0 -52 Q36 -50 36 -20 Q0 -30 -36 -18 Z" fill="#38787b" />
        <path d="M30 -24 Q58 -22 62 -12 Q44 -14 30 -16 Z" fill="#2c5f61" />
      </g>
    );
  return null;
};

const Head: React.FC<{ look: Look; moment: Moment; seed: number }> = ({ look, moment, seed }) => {
  const { pose } = moment;
  const shut = blink(moment.t, seed);
  // 3/4 view: the features sit towards the facing side.
  const fx = 9;
  const eye = (x: number) => <ellipse cx={fx + x} cy={-3} rx={3.4} ry={4.4 * (1 - shut) + 0.5} fill="#1c1512" />;
  const browY = -15 - pose.brow * 4;
  const smile = pose.smile * 7;
  const open = pose.mouth * 11;
  return (
    <g>
      <Hair look={look} back />
      {/* ear, on the far side of the face */}
      <ellipse cx={-22} cy={2} rx={6} ry={8} fill={shade(look.skin, -0.1)} />
      <ellipse cx={0} cy={0} rx={33} ry={BONES.head} fill={look.skin} />
      {look.beard && <path d="M-27 6 Q-26 40 4 41 Q32 40 31 8 Q26 22 14 20 Q4 14 -6 20 Q-20 22 -27 6 Z" fill={shade(look.hairColour, 0.08)} />}
      <circle cx={fx + 16} cy={12} r={8} fill="#e98f7a" opacity={0.22} />
      {eye(-7)}
      {eye(15)}
      <path d={`M${fx - 13} ${browY + 1} Q${fx - 7} ${browY - 3} ${fx - 1} ${browY}`} stroke={shade(look.hairColour, -0.1)} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <path d={`M${fx + 9} ${browY} Q${fx + 15} ${browY - 3} ${fx + 21} ${browY + 1}`} stroke={shade(look.hairColour, -0.1)} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <path d={`M${fx + 6} 2 Q${fx + 11} 9 ${fx + 5} 11`} stroke={shade(look.skin, -0.22)} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      {open > 1.5 ? (
        <path d={`M${fx - 5} 21 Q${fx + 4} ${21 + smile * 0.5} ${fx + 13} 21 Q${fx + 4} ${21 + open * 1.9} ${fx - 5} 21 Z`} fill="#5a2222" />
      ) : (
        <path d={`M${fx - 6} ${21 - smile * 0.3} Q${fx + 4} ${21 + smile} ${fx + 14} ${21 - smile * 0.3}`} stroke="#7a3b32" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      )}
      {look.glasses && (
        <g fill="rgba(255,255,255,0.18)" stroke="#2a2623" strokeWidth={2.2}>
          <circle cx={fx - 7} cy={-3} r={9} />
          <circle cx={fx + 15} cy={-3} r={9} />
          <path d={`M${fx + 2} -4 L${fx + 6} -4 M${fx - 16} -4 L-24 -1`} fill="none" />
        </g>
      )}
      <Hair look={look} />
      <Hat look={look} />
    </g>
  );
};

export const Character: React.FC<{ look: Look; moment: Moment; seed: number }> = ({ look, moment, seed }) => {
  const s = skeleton(moment.pose);
  const lean = moment.pose.lean;
  const sleeve = look.top === "tee" ? look.skin : look.topColour;
  const far = -0.16;
  const arm = (shoulder: Pt, elbow: Pt, hand: Pt, isFar: boolean) => (
    <g>
      <path d={limb(shoulder, elbow, hand)} stroke={shade(sleeve, isFar ? far : 0)} strokeWidth={21} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {look.top === "tee" && <path d={`M${p(shoulder)}L${p([(shoulder[0] + elbow[0]) / 2, (shoulder[1] + elbow[1]) / 2])}`} stroke={shade(look.topColour, isFar ? far : 0)} strokeWidth={24} strokeLinecap="round" />}
      <circle cx={hand[0]} cy={hand[1]} r={10.5} fill={shade(look.skin, isFar ? -0.1 : 0)} />
    </g>
  );
  const leg = (hip: Pt, knee: Pt, foot: Pt, isFar: boolean) => (
    <g>
      <path d={limb(hip, knee, foot)} stroke={shade(look.bottomColour, isFar ? far : 0)} strokeWidth={27} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Shoe at={foot} knee={knee} colour={shade(look.shoeColour, isFar ? far : 0)} />
    </g>
  );
  const long = look.top === "coat" || look.top === "dress";
  const hem = long ? (look.top === "dress" ? 96 : 62) : 8;
  // The body in its own frame: hip at the origin, shoulders BONES.torso above it.
  const T = BONES.torso;
  const body = `M-36 ${-T + 10} Q-38 ${-T - 8} -16 ${-T - 9} L18 ${-T - 9} Q38 ${-T - 8} 36 ${-T + 12} L${long ? 33 : 25} ${hem} Q0 ${hem + 9} ${long ? -33 : -24} ${hem} Z`;
  const squash = 1 + Math.sin(moment.t * 1.9) * 0.008;
  return (
    <g>
      <ellipse cx={0} cy={2} rx={58 - moment.pose.lift * 0.5} ry={9 - moment.pose.lift * 0.08} fill="#000" opacity={0.16} />
      {look.carry === "suitcase" && (
        <g transform="translate(-74 0)">
          {/* the handle reaches the hand while it hangs; a raised hand has let go */}
          <path d={s.handBack[1] > -215 ? `M22 -92 L${(s.handBack[0] + 74).toFixed(1)} ${s.handBack[1].toFixed(1)}` : "M22 -92 L30 -150"} stroke="#8a8378" strokeWidth={4} strokeLinecap="round" />
          <rect x={-12} y={-92} width={48} height={80} rx={9} fill="#7c5423" />
          <rect x={-12} y={-66} width={48} height={5} fill="#5d3f1a" />
          <rect x={-12} y={-40} width={48} height={5} fill="#5d3f1a" />
          <circle cx={-2} cy={-6} r={6} fill="#2a2623" />
          <circle cx={26} cy={-6} r={6} fill="#2a2623" />
        </g>
      )}
      {arm(s.shoulderBack, s.elbowBack, s.handBack, true)}
      {leg(s.hipBack, s.kneeBack, s.footBack, true)}
      {leg(s.hipFront, s.kneeFront, s.footFront, false)}
      <g transform={`translate(${p(s.hip)}) rotate(${lean.toFixed(2)}) scale(1 ${squash.toFixed(4)})`}>
        {/* neck */}
        <rect x={-10} y={-T - 24} width={22} height={28} rx={9} fill={shade(look.skin, -0.12)} />
        <path d={body} fill={look.topColour} />
        {/* the side away from the light */}
        <path d={`M-36 ${-T + 10} Q-38 ${-T - 8} -16 ${-T - 9} L-10 ${-T - 9} Q-20 ${-T / 2} ${long ? -15 : -11} ${hem + 3} L${long ? -33 : -24} ${hem} Z`} fill="#000" opacity={0.13} />
        {(look.top === "blazer" || look.top === "coat") && (
          <g>
            <path d={`M-6 ${-T - 9} L8 ${-T + 44} L22 ${-T - 9} Z`} fill={look.shirtColour} />
            <path d={`M-6 ${-T - 9} L8 ${-T + 44} L1 ${-T + 14} Z M22 ${-T - 9} L8 ${-T + 44} L17 ${-T + 14} Z`} fill={shade(look.topColour, 0.12)} />
          </g>
        )}
        {look.top === "dress" && <path d={`M-24 -6 Q0 2 25 -6 L25 2 Q0 10 -24 2 Z`} fill={look.shirtColour} />}
        {look.top === "tee" && <path d={`M-10 ${-T - 9} Q4 ${-T + 6} 18 ${-T - 9} Z`} fill={shade(look.skin, -0.12)} />}
        {look.carry === "camera" && (
          <g>
            <path d={`M-12 ${-T - 6} L10 ${-T + 52} L26 ${-T - 6}`} stroke="#2a2623" strokeWidth={3} fill="none" />
            <rect x={-8} y={-T + 46} width={36} height={24} rx={5} fill="#2a2623" />
            <circle cx={10} cy={-T + 58} r={8} fill="#5a524a" />
            <circle cx={10} cy={-T + 58} r={4} fill="#9fb8c4" />
          </g>
        )}
      </g>
      <g transform={`translate(${p(s.head)}) rotate(${(lean * 0.5 + moment.pose.head).toFixed(2)}) scale(${HEAD_SCALE})`}>
        <Head look={look} moment={moment} seed={seed} />
      </g>
      {arm(s.shoulderFront, s.elbowFront, s.handFront, false)}
    </g>
  );
};
