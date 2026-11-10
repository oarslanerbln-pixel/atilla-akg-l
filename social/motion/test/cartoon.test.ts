import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { checkCartoon } from "../check";
import { ROOT } from "../engine";
import { PRESETS, lookOf } from "../src/cartoon/looks";
import { ACTIONS, BONES, STRIDE, WALK_SPEED, actionPose, momentAt, skeleton, spans, type Beat } from "../src/cartoon/rig";
import { cameraAt, cartoonSchema, castAt, sceneSeconds, timeline, viewOf, type CartoonBrief } from "../src/cartoon/scene";
import { FPS } from "../src/lib/tokens";

const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const cartoons = () =>
  readdirSync(join(ROOT, "social", "briefs", "cartoon"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => [f, cartoonSchema.parse(JSON.parse(readFileSync(join(ROOT, "social", "briefs", "cartoon", f), "utf8")))] as const);

test("bones keep their length in every action, at every moment", () => {
  for (const action of ACTIONS) {
    for (let i = 0; i < 90; i++) {
      const s = skeleton(actionPose(action, i / 15, i / 40));
      const near = (got: number, want: number, what: string) => assert.ok(Math.abs(got - want) < 1e-6, `${action} ${what}: ${got}`);
      near(dist(s.hipFront, s.kneeFront), BONES.thigh, "thigh");
      near(dist(s.kneeBack, s.footBack), BONES.shin, "shin");
      near(dist(s.shoulderFront, s.elbowFront), BONES.upperArm, "upper arm");
      near(dist(s.elbowBack, s.handBack), BONES.forearm, "forearm");
    }
  }
});

test("the lower foot stands on the ground unless the character has hopped", () => {
  for (const action of ACTIONS) {
    for (let i = 0; i < 90; i++) {
      const pose = actionPose(action, i / 15, i / 40);
      const s = skeleton(pose);
      assert.ok(Math.abs(Math.max(s.footFront[1], s.footBack[1]) + BONES.foot + pose.lift) < 1e-6, action);
    }
  }
});

test("a walk arrives exactly where it was sent, at a stroll, facing its way", () => {
  const script: Beat[] = [{ at: 1, do: "walk", to: 400 }];
  const [walk] = spans(1000, script);
  assert.ok(Math.abs(walk.end - walk.at - 600 / (WALK_SPEED * 0.82)) < 1e-9);
  assert.deepEqual([momentAt(1000, 1, script, 0.5).x, momentAt(1000, 1, script, 0.5).facing], [1000, 1]);
  const after = momentAt(1000, 1, script, walk.end + 2);
  assert.equal(after.x, 400);
  assert.equal(after.facing, -1);
  // One full cycle of the legs covers one stride of ground: the feet do not slide.
  assert.equal(STRIDE, 150);
});

test("nothing teleports: between two frames a character moves and bends only a little", () => {
  for (const [file, brief] of cartoons()) {
    for (const scene of brief.scenes) {
      for (const c of scene.cast) {
        let before = castAt(c, 0);
        for (let f = 1; f <= sceneSeconds(scene) * FPS; f++) {
          const now = castAt(c, f / FPS);
          assert.ok(Math.abs(now.x - before.x) <= (WALK_SPEED / FPS) * 1.4, `${file} ${c.id}: jumps at frame ${f}`);
          for (const limb of ["armFront", "armBack", "legFront", "legBack"] as const) {
            assert.ok(Math.abs(now.pose[limb][0] - before.pose[limb][0]) < 36, `${file} ${c.id}: ${limb} snaps at frame ${f}`);
          }
          before = now;
        }
      }
    }
  }
});

test("a line holds its bubble for its reading time, and a scene outlasts its script", () => {
  const [line] = spans(0, [{ at: 2, do: "talk", say: "Einmal Istanbul, bitte." }]);
  assert.ok(line.end - line.at >= 1.9);
  for (const [, brief] of cartoons()) {
    const { starts, total } = timeline(brief.scenes);
    assert.equal(starts.length, brief.scenes.length);
    assert.ok(Math.abs(total - brief.scenes.reduce((sum, s) => sum + sceneSeconds(s), 0)) < 1e-9);
    for (const scene of brief.scenes) for (const c of scene.cast) for (const s of spans(c.x, c.script ?? [])) assert.ok(s.end <= sceneSeconds(scene));
  }
});

test("every cartoon brief in the repo passes its checks", () => {
  const all = cartoons();
  assert.ok(all.length > 0);
  for (const [file, brief] of all) assert.deepEqual(checkCartoon(brief).filter((f) => f.level === "error"), [], file);
});

test("a speaker outside the picture, a stranger followed and a walk to nowhere are errors", () => {
  const brief = (over: Partial<CartoonBrief["scenes"][number]>): CartoonBrief => ({
    kind: "cartoon",
    name: "t",
    formats: ["reel"],
    scenes: [{ place: "berlin", time: "day", cast: [{ id: "a", preset: "host", x: 400 }, { id: "b", preset: "guide", x: 1900, script: [{ at: 1, do: "talk", say: "Hallo!" }] }], camera: { from: 400, to: 400 }, ...over }],
  });
  assert.deepEqual(checkCartoon(brief({})).map((f) => f.code), ["off-screen"]);
  assert.deepEqual(checkCartoon(brief({ camera: { follow: "b" } })), []);
  assert.deepEqual(checkCartoon(brief({ camera: { follow: "nobody" } })).map((f) => f.code).sort(), ["follow", "off-screen"]);
  assert.equal(checkCartoon(brief({ camera: { follow: "b" }, cast: [{ id: "b", preset: "guide", x: 1900, script: [{ at: 0, do: "walk" }] }] }))[0].code, "walk");
});

test("a followed character stays in the middle of the view; a look is a preset plus what the brief changes", () => {
  const brief = cartoons()[0][1];
  const scene = brief.scenes.find((s) => s.camera?.follow)!;
  const view = viewOf("reel");
  const who = scene.cast.find((c) => c.id === scene.camera!.follow)!;
  for (let t = 0; t < sceneSeconds(scene); t += 0.25) {
    const { cam } = cameraAt(scene, t, view);
    assert.ok(Math.abs(castAt(who, t).x - (cam + view / 2)) < 40);
  }
  const look = lookOf({ preset: "host", hat: "fedora" });
  assert.equal(look.hat, "fedora");
  assert.equal(look.topColour, PRESETS.host.topColour);
});
