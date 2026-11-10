import { FPS, clamp, ease, easeInOut, lerp, readTime } from "../lib/tokens";

// The character rig: a puppet of two-bone limbs, posed by angles, and the script that moves it.
// Pure functions of time, so a character is in the same place on every frame of every render,
// and the tests can hold the rig to its rules (bones keep their length, a standing foot is on
// the ground, nothing teleports between two frames).
//
// Units: the puppet stands 400 high with its feet at y = 0 and y growing downwards, facing +x.
// Angles are degrees from "hanging straight down", positive towards the facing direction.

/** The head is drawn larger than life (HEAD_SCALE): a cartoon reads by its face. */
export const HEAD_SCALE = 1.3;
export const BONES = { thigh: 94, shin: 94, upperArm: 70, forearm: 66, torso: 112, neck: 12, head: 38, foot: 8 } as const;
/** Where the limbs attach, relative to the hip centre (the torso leans around it). 3/4 view: one side is nearer. */
export const JOINTS = { hipFront: 10, hipBack: -10, shoulderFront: 25, shoulderBack: -26 } as const;

export interface Pose {
  /** [shoulder, elbow]: the elbow bends the forearm further forward. */
  armFront: [number, number];
  armBack: [number, number];
  /** [hip, knee]: the knee bends the shin backwards. */
  legFront: [number, number];
  legBack: [number, number];
  /** Torso lean, degrees forward. */
  lean: number;
  /** Head tilt, degrees forward (a nod). */
  head: number;
  /** Height above the ground (a hop). */
  lift: number;
  /** Mouth opening, 0 to 1. */
  mouth: number;
  /** -1 (down) to 1 (a full smile). */
  smile: number;
  /** Brows, -1 (lowered) to 1 (raised). */
  brow: number;
}

const REST: Pose = { armFront: [4, 10], armBack: [-4, 8], legFront: [0, 0], legBack: [0, 0], lean: 0, head: 0, lift: 0, mouth: 0, smile: 0.35, brow: 0 };

const rad = (deg: number) => (deg * Math.PI) / 180;
type Pt = [number, number];
const step = (from: Pt, length: number, angle: number): Pt => [from[0] + length * Math.sin(rad(angle)), from[1] + length * Math.cos(rad(angle))];

export interface Skeleton {
  hip: Pt;
  neck: Pt;
  head: Pt;
  shoulderFront: Pt;
  shoulderBack: Pt;
  elbowFront: Pt;
  elbowBack: Pt;
  handFront: Pt;
  handBack: Pt;
  hipFront: Pt;
  hipBack: Pt;
  kneeFront: Pt;
  kneeBack: Pt;
  footFront: Pt;
  footBack: Pt;
}

/** Forward kinematics. The hip is set so that the lower foot stands on the ground (plus `lift`). */
export function skeleton(p: Pose): Skeleton {
  const reach = (leg: [number, number]) => BONES.thigh * Math.cos(rad(leg[0])) + BONES.shin * Math.cos(rad(leg[0] - leg[1]));
  const hipY = -(Math.max(reach(p.legFront), reach(p.legBack)) + BONES.foot + p.lift);
  const hip: Pt = [0, hipY];
  // The torso leans around the hip; everything above goes with it.
  const up = (x: number, h: number): Pt => [hip[0] + x * Math.cos(rad(p.lean)) + h * Math.sin(rad(p.lean)), hip[1] + x * Math.sin(rad(p.lean)) - h * Math.cos(rad(p.lean))];
  const shoulderFront = up(JOINTS.shoulderFront, BONES.torso);
  const shoulderBack = up(JOINTS.shoulderBack, BONES.torso);
  const neck = up(0, BONES.torso + BONES.neck);
  const head = up(BONES.head * 0.1 + Math.sin(rad(p.head)) * 10, BONES.torso + BONES.neck + BONES.head * HEAD_SCALE * 0.9);
  const arm = (shoulder: Pt, [s, e]: [number, number]) => {
    const elbow = step(shoulder, BONES.upperArm, s + p.lean * 0.4);
    return [elbow, step(elbow, BONES.forearm, s + e + p.lean * 0.4)] as const;
  };
  const leg = (x: number, [h, k]: [number, number]) => {
    const top: Pt = [hip[0] + x, hip[1]];
    const knee = step(top, BONES.thigh, h);
    return [top, knee, step(knee, BONES.shin, h - k)] as const;
  };
  const [elbowFront, handFront] = arm(shoulderFront, p.armFront);
  const [elbowBack, handBack] = arm(shoulderBack, p.armBack);
  const [hipFront, kneeFront, footFront] = leg(JOINTS.hipFront, p.legFront);
  const [hipBack, kneeBack, footBack] = leg(JOINTS.hipBack, p.legBack);
  return { hip, neck, head, shoulderFront, shoulderBack, elbowFront, elbowBack, handFront, handBack, hipFront, hipBack, kneeFront, kneeBack, footFront, footBack };
}

// --- actions ---

export const ACTIONS = ["idle", "walk", "talk", "wave", "point", "cheer", "nod", "think", "shrug"] as const;
export type Action = (typeof ACTIONS)[number];

/** Ground covered by one full walk cycle (two steps). The feet are placed by distance, so they do not slide. */
export const STRIDE = 150;
/** Walking speed, units a second: an unhurried stroll. */
export const WALK_SPEED = 165;

const sin = Math.sin;

/** The pose of an action `t` seconds into it. `phase` is the walk cycle, driven by distance travelled. */
export function actionPose(action: Action, t: number, phase = 0): Pose {
  // Everything breathes: the smallest lean and sway keep a standing figure alive.
  const breath = sin(t * 1.9);
  const base: Pose = { ...REST, lean: 0.6 * breath, armFront: [4 + 1.5 * breath, 10], armBack: [-4 - 1.5 * breath, 8] };
  switch (action) {
    case "idle":
      return base;
    case "walk": {
      const a = phase * 2 * Math.PI;
      // A leg swings forward with its knee bent and comes back straight under the body.
      const leg = (ph: number): [number, number] => [27 * sin(ph), 5 + 44 * Math.max(0, Math.cos(ph)) ** 1.5];
      return {
        ...base,
        legFront: leg(a),
        legBack: leg(a + Math.PI),
        armFront: [-24 * sin(a), 16 + 8 * sin(a)],
        armBack: [24 * sin(a), 16 - 8 * sin(a)],
        lean: 3,
        head: -1,
      };
    }
    case "talk":
      // The front hand does the talking; the mouth follows two rhythms so it never loops visibly.
      return {
        ...base,
        armFront: [34 + 9 * sin(t * 2.3), 78 + 16 * sin(t * 3.7 + 1)],
        mouth: 0.18 + 0.7 * Math.abs(sin(t * 8.3) * sin(t * 4.9 + 0.7)),
        brow: 0.35 + 0.3 * sin(t * 1.7),
        head: 2 * sin(t * 2.9),
        smile: 0.5,
      };
    case "wave":
      return { ...base, armFront: [152, 24 * sin(t * 9)], smile: 1, mouth: 0.25, brow: 0.6, lean: -1.5 };
    case "point":
      return { ...base, armFront: [84 + 2 * breath, 6], lean: 4, brow: 0.4, smile: 0.5 };
    case "cheer": {
      // Two hops, then the arms stay up.
      const hop = t < 1.3 ? Math.abs(sin(t * (Math.PI / 0.65))) : 0;
      const crouch = (1 - hop) * (t < 1.3 ? 10 : 0);
      return { ...base, armFront: [158, 12 + 8 * sin(t * 7)], armBack: [-158, -12 - 8 * sin(t * 7)], legFront: [crouch, crouch * 2], legBack: [crouch, crouch * 2], lift: hop * 30, smile: 1, mouth: 0.6, brow: 0.9 };
    }
    case "nod":
      return { ...base, head: 9 * sin(t * 8.5) * Math.exp(-t * 1.2), smile: 0.7 };
    case "think":
      return { ...base, armFront: [38, 128], armBack: [-8, 40], head: -4, brow: -0.5, smile: -0.1, lean: -1 };
    case "shrug":
      return { ...base, armFront: [28, 62], armBack: [-28, -62], brow: 0.8, smile: 0, head: -3 };
  }
}

const mixPair = (a: [number, number], b: [number, number], k: number): [number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
export function mix(a: Pose, b: Pose, k: number): Pose {
  return {
    armFront: mixPair(a.armFront, b.armFront, k),
    armBack: mixPair(a.armBack, b.armBack, k),
    legFront: mixPair(a.legFront, b.legFront, k),
    legBack: mixPair(a.legBack, b.legBack, k),
    lean: lerp(a.lean, b.lean, k),
    head: lerp(a.head, b.head, k),
    lift: lerp(a.lift, b.lift, k),
    mouth: lerp(a.mouth, b.mouth, k),
    smile: lerp(a.smile, b.smile, k),
    brow: lerp(a.brow, b.brow, k),
  };
}

// --- a character's script ---

/** One line of a character's script. `walk` needs `to`; `talk` takes `say` (a speech bubble). */
export interface Beat {
  at: number;
  do: Action;
  /** World x to walk to. */
  to?: number;
  /** Seconds the action lasts; then the character idles. Walks and lines time themselves. */
  for?: number;
  say?: string;
  /** The spoken line's loudness, one value a frame (written by the sound step): the mouth follows it. */
  lips?: number[];
}

/** Seconds one pose takes to become the next: eased at both ends, as a limb has weight. */
const BLEND = 0.45;
/** Share of a walk spent getting up to speed, and the same slowing down. */
const RAMP = 0.18;

const walkSeconds = (dist: number) => Math.abs(dist) / (WALK_SPEED * (1 - RAMP));
/** Distance covered, 0 to 1, at time 0 to 1: a ramp up, a steady middle, a ramp down. */
const travel = (u: number) => {
  const k = 1 / (2 * RAMP * (1 - RAMP));
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  if (u < RAMP) return k * u * u;
  if (u > 1 - RAMP) return 1 - k * (1 - u) * (1 - u);
  return (u - RAMP / 2) / (1 - RAMP);
};

/** How long a spoken line holds its bubble. */
export const lineSeconds = (say: string) => readTime(say) * 0.9;

export interface Span extends Beat {
  end: number;
  fromX: number;
  toX: number;
}

/** The script with every beat's end and the ground it covers worked out. Beats are taken in time order. */
export function spans(startX: number, script: Beat[]): Span[] {
  let x = startX;
  let arrived = 0;
  const out: Span[] = [];
  for (const beat of [...script].sort((a, b) => a.at - b.at)) {
    // Nobody waves from the middle of a stride: a beat written too early waits for the walk to arrive.
    const at = Math.max(beat.at, arrived);
    const toX = beat.do === "walk" && beat.to !== undefined ? beat.to : x;
    const seconds = beat.do === "walk" ? walkSeconds(toX - x) : beat.say ? Math.max(lineSeconds(beat.say), beat.for ?? 0) : (beat.for ?? (beat.do === "idle" ? 0.5 : 1.8));
    out.push({ ...beat, at, end: at + seconds, fromX: x, toX });
    if (beat.do === "walk") arrived = at + seconds;
    x = toX;
  }
  return out;
}

export const scriptEnd = (startX: number, script: Beat[]) => Math.max(0, ...spans(startX, script).map((s) => s.end));

export interface Moment {
  x: number;
  /** 1 facing right, -1 facing left. */
  facing: 1 | -1;
  pose: Pose;
  /** The line being spoken, and 0 to 1 for how far its bubble is in. */
  say?: { text: string; in: number; out: number };
  /** Seconds since the film began, for the blink. */
  t: number;
}

/** Where a character is and what its body is doing at second `t` of its scene. */
export function momentAt(startX: number, startFacing: 1 | -1, script: Beat[], t: number): Moment {
  const all = spans(startX, script);
  let x = startX;
  let facing = startFacing;
  // The pose is whatever the current beat says, blended in from what came before it.
  const poseOf = (s: Span | undefined, at: number): Pose => {
    if (!s || at >= s.end) return actionPose("idle", at);
    if (s.do !== "walk") {
      const pose = actionPose(s.do, at - s.at);
      // With a recorded or synthesised line, the mouth opens on its syllables instead of to a rhythm.
      return s.lips ? { ...pose, mouth: s.lips[Math.floor((at - s.at) * FPS)] ?? 0 } : pose;
    }
    const u = travel((at - s.at) / (s.end - s.at));
    return actionPose("walk", at - s.at, (Math.abs(s.toX - s.fromX) * u) / STRIDE);
  };
  let current: Span | undefined;
  let previous: Span | undefined;
  for (const s of all) {
    if (t < s.at) break;
    previous = current;
    current = s;
    if (s.do === "walk" && s.toX !== s.fromX) {
      facing = s.toX > s.fromX ? 1 : -1;
      x = lerp(s.fromX, s.toX, travel((t - s.at) / (s.end - s.at)));
    } else {
      x = s.toX;
    }
  }
  let pose = poseOf(current, t);
  if (current) {
    // Into the beat from the one before it, and out of it into standing.
    const into = easeInOut(clamp((t - current.at) / BLEND));
    if (into < 1) pose = mix(poseOf(previous && previous.end > current.at ? previous : undefined, t), pose, into);
    const after = easeInOut(clamp((t - current.end) / BLEND));
    if (t >= current.end && after < 1) pose = mix(actionPose(current.do, current.end - current.at, current.do === "walk" ? Math.abs(current.toX - current.fromX) / STRIDE : 0), actionPose("idle", t), after);
  }
  const say = current?.say && t < current.end + 0.3 ? { text: current.say, in: ease(clamp((t - current.at) / 0.4)), out: clamp((t - current.end) / 0.3) } : undefined;
  return { x, facing, pose, say, t };
}

/** Eyes closed, 0 to 1. A blink every three to five seconds, at moments fixed by the character's seed. */
export function blink(t: number, seed: number) {
  const period = 3.2 + (seed % 7) * 0.31;
  const local = (t + seed * 0.77) % period;
  return local < 0.14 ? Math.sin((local / 0.14) * Math.PI) : 0;
}
