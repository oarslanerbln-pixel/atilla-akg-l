import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Curve,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import type { Coords } from "@/lib/partners";
import { isLand } from "./land";

/**
 * The compass globe: land as fine ink dots on a porcelain sphere, gold
 * great-circle routes from Berlin to each partner, a light flying them,
 * inside a compass bezel whose needle follows the light's heading.
 *
 * Framework-free on purpose. The component owns the timing (GSAP tweens
 * `state`), the layout and the DOM overlay; this class only draws what
 * `state` says and reports where things landed on screen (`onFrame`).
 */

export interface GlobeState {
  /** 0–1: the ripple of dots spreading out from Berlin. */
  reveal: number;
  /**
   * One per destination, then one per stay. `draw`: how much of the route is
   * drawn from Berlin (a stay's runs to 1.3, in step with `head`). `tail`:
   * how much has been taken back again, so a stay's route gathers into it.
   * `focus`, 0–1: a stay in the spotlight, its name shown.
   */
  routes: { draw: number; tail: number; focus: number }[];
  /** 0–1: the stays' marks appearing, one after another. */
  marks: number;
  /** Index of the route the light is flying, or -1. */
  flight: number;
  /** 0–1.3: the light's position along that route; past 1 its trail fades out. */
  head: number;
  /** 0–1: scroll progress out of the hero; the camera climbs. */
  climb: number;
}

export interface GlobeLayout {
  /** Canvas size in CSS pixels. */
  width: number;
  height: number;
  /** Where the globe's centre sits, and its radius, in CSS pixels. */
  cx: number;
  cy: number;
  r: number;
}

export interface GlobeMarker {
  x: number;
  y: number;
  /** 0–1: facing the viewer and, for a destination, reached by its route; for a stay, in the spotlight. */
  visible: number;
}

export interface GlobeFrame {
  /** Berlin first, then each destination, then each stay. */
  markers: GlobeMarker[];
}

interface GlobeOptions {
  base: Coords;
  destinations: Coords[];
  /** Hotels: a diamond each, a route only while the light flies it. */
  stays: Coords[];
  /** The bearing from Berlin along each route, destinations then stays, in degrees. */
  headings: number[];
  state: GlobeState;
  /** Degrees between neighbouring dots. */
  spacing: number;
  onFrame: (frame: GlobeFrame) => void;
}

const DEG = Math.PI / 180;
const FOV = 28;
/** The meridian and parallel the globe rests on: the middle of the routes, between Paris and Astana. */
const REST = { lon: 28, lat: 42 };

const INK = new Color("#181512");
const GOLD = new Color("#b38b59");
const GOLD_LIGHT = new Color("#d8b482");
const GOLD_DEEP = new Color("#7c5423");
/** The glint on a jewel, the glaze on the porcelain. */
const CHAMPAGNE = new Color("#fbf1dc");
/** A stay's diamond at rest, and how much it grows in the spotlight. */
const STAY_SIZE = 13;
const STAY_GROW = 7;
/** The light: a turning star, and how much it flares open where it lands. */
const LIGHT_SIZE = 46;
const LIGHT_FLARE = 44;
/** The bezel's ring, as a multiple of the globe's outline on screen. */
const BEZEL = 1.035;
/** The plane the bezel is drawn on reaches this far past the ring. */
const BEZEL_EXTENT = 1.15;
/** Half the bezel's opening at the bottom, in radians. */
const BEZEL_GAP = 0.4;

function toVector(lat: number, lon: number, radius = 1): Vector3 {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return new Vector3(Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)).multiplyScalar(
    radius,
  );
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** The great circle between two points, lifted off the surface in proportion to its length. */
class RouteCurve extends Curve<Vector3> {
  private readonly from: Vector3;
  private readonly to: Vector3;
  private readonly angle: number;
  private readonly lift: number;

  constructor(from: Vector3, to: Vector3) {
    super();
    this.from = from;
    this.to = to;
    this.angle = from.angleTo(to);
    this.lift = 0.03 + this.angle * 0.26;
  }

  getPoint(t: number, target = new Vector3()): Vector3 {
    const s = Math.sin(this.angle);
    target
      .copy(this.from)
      .multiplyScalar(Math.sin((1 - t) * this.angle) / s)
      .addScaledVector(this.to, Math.sin(t * this.angle) / s);
    return target.multiplyScalar(1 + this.lift * Math.sin(Math.PI * t));
  }
}

/* ShaderMaterial skips three's colour management: colours arrive in linear
   space and `colorspace_fragment` converts the result for the screen, as the
   built-in materials do. Point sizes are CSS pixels at the globe's front. */

/** Where the light comes from: the upper left, a little in front. The camera never turns, so view and world agree. */
const LIGHT_DIR = /* glsl */ `normalize(vec3(-0.45, 0.6, 0.65))`;

/** How much larger a glinting dot is drawn, to leave room for its rays. */
const GLINT_GROW = /* glsl */ `4.6`;

const LAND_VERTEX = /* glsl */ `
  attribute float aDist;
  attribute float aRand;
  uniform float uReveal;
  uniform float uSize;
  uniform float uDepth;
  uniform float uDpr;
  uniform float uTime;
  varying float vAlpha;
  varying float vFront;
  varying float vGlint;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 normal = normalize(world.xyz);
    float facing = dot(normal, normalize(cameraPosition - world.xyz));
    // The ripple: a dot appears once the wave from Berlin has passed it,
    // and the dots on the wave front itself flare gold.
    float front = aDist - uReveal * 3.3;
    float shown = 1.0 - smoothstep(-0.03, 0.0, front);
    vFront = exp(-front * front * 90.0) * step(uReveal, 0.999);
    // Gold leaf catching the light: every dot runs its own slow cycle, and
    // in each a different few in forty glint, rise and fade.
    float cycle = uTime * 0.11 + aRand * 37.0;
    float chosen = step(0.975, fract(aRand * 91.7 + floor(cycle) * 0.618));
    vGlint = chosen * pow(sin(fract(cycle) * 3.14159265), 8.0) * smoothstep(0.999, 1.0, uReveal);
    // The side turned from the light falls back, so the land has volume.
    float lit = smoothstep(-0.55, 0.75, dot(normal, ${LIGHT_DIR}));
    vAlpha = shown * smoothstep(0.0, 0.4, facing) * (0.72 + 0.28 * aRand) * mix(0.5, 1.0, lit);
    vec4 mv = viewMatrix * world;
    gl_PointSize = uSize * (1.0 + vFront * 0.9 + vGlint * ${GLINT_GROW}) * uDpr * (uDepth / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const LAND_FRAGMENT = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uGold;
  uniform vec3 uGoldDeep;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vFront;
  varying float vGlint;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (length(c) > 0.5) discard;
    // Measured in the dot's own size, however large its glint draws it.
    float grow = 1.0 + vGlint * ${GLINT_GROW};
    float d = length(c) * grow;
    float disc = smoothstep(0.5, 0.32, d);
    // A glint: four fine rays and a breath of gold around a deep-gold core.
    float fade = 1.0 - smoothstep(0.08, 0.5, length(c));
    float rays = (exp(-abs(c.y) * grow * 2.4) * (1.0 - smoothstep(0.0, 0.5, abs(c.x)))
                + exp(-abs(c.x) * grow * 2.4) * (1.0 - smoothstep(0.0, 0.5, abs(c.y)))) * vGlint;
    float bloom = exp(-d * d * 3.0) * 0.22 * vGlint;
    vec3 ink = mix(uInk, uGold, vFront);
    vec3 glint = mix(uGoldDeep, uGold, smoothstep(0.0, 0.45, length(c)));
    vec3 color = mix(ink, glint, vGlint);
    float alpha = disc * vAlpha * mix(mix(uOpacity, 1.0, vFront), 1.0, vGlint);
    alpha = max(alpha, min(1.0, rays + bloom) * fade * vAlpha);
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

const SPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

// Glazed porcelain lit from the upper left: a broad sheen and a fine
// highlight on the glaze, a soft shadow on the far side, and a rim that
// warms from champagne in the light to deep gold away from it.
const SPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uCentre;
  uniform vec3 uEdge;
  uniform vec3 uShade;
  uniform vec3 uRim;
  uniform vec3 uRimDeep;
  uniform vec3 uGlaze;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 toLight = ${LIGHT_DIR};
    float light = dot(vNormal, toLight);
    vec3 body = mix(uEdge, uCentre, smoothstep(-0.35, 0.95, light));
    body = mix(body, uShade, smoothstep(0.05, -0.75, light) * 0.3);
    float spec = max(dot(vNormal, normalize(toLight + vView)), 0.0);
    body = mix(body, uGlaze, pow(spec, 14.0) * 0.45 + pow(spec, 140.0) * 0.7);
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    vec3 rimColour = mix(uRimDeep, uRim, smoothstep(-0.5, 0.5, light));
    gl_FragColor = vec4(mix(body, rimColour, rim * 0.7), 1.0);
    #include <colorspace_fragment>
  }
`;

// The aura: a breath of gold just outside the outline, strongest on the
// lit side, drawn on the inside of a larger sphere that the globe hides.
const AURA_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uInner;
  uniform float uOpacity;
  varying vec3 vNormal;
  void main() {
    float spread = length(vNormal.xy);
    float glow = pow(smoothstep(1.0, uInner, spread), 2.2);
    float side = 0.55 + 0.45 * dot(normalize(vNormal.xy + 1e-4), normalize(vec2(-0.6, 0.8)));
    gl_FragColor = vec4(uColor, glow * side * uOpacity);
    #include <colorspace_fragment>
  }
`;

const ROUTE_VERTEX = /* glsl */ `
  varying float vAlong;
  void main() {
    vAlong = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Drawn from uTail up to uDraw, deepening towards the destination; a hot
// trail runs behind the flying light, and on a drawn route a soft glint
// now and then travels out from Berlin.
const ROUTE_FRAGMENT = /* glsl */ `
  uniform float uDraw;
  uniform float uTail;
  uniform float uHead;
  uniform float uTime;
  uniform float uSeed;
  uniform float uFlow;
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vAlong;
  void main() {
    if (vAlong > uDraw || vAlong < uTail) discard;
    float trail = smoothstep(uHead - 0.26, uHead, vAlong) * step(vAlong, uHead);
    float at = fract(uTime * 0.075 + uSeed) * 1.6 - 0.2;
    float glint = exp(-pow((vAlong - at) * 16.0, 2.0)) * uFlow;
    float hot = max(trail, glint * 0.75);
    gl_FragColor = vec4(mix(uColor, uHot, hot), mix(0.36, 0.6, vAlong) + 0.45 * hot);
    #include <colorspace_fragment>
  }
`;

const SPOT_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;
  attribute float aShape;
  uniform float uDepth;
  uniform float uDpr;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vShape;
  varying float vPhase;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = aColor;
    vAlpha = aAlpha;
    vShape = aShape;
    vPhase = dot(position, vec3(12.9, 7.3, 5.1));
    gl_PointSize = aSize * uDpr * (uDepth / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

// The markers and the flying light. aShape 0: a round jewel, a point of
// light on its core, set in a fine ring, its halo breathing. 1: a stay's
// diamond, with less halo, a different kind of place. 2: the light, a
// small core with four long rays and four short ones, slowly turning.
const SPOT_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uGlint;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vShape;
  varying float vPhase;
  float ray(vec2 p, float width, float reach) {
    return exp(-abs(p.y) / width) * (1.0 - smoothstep(0.0, reach, abs(p.x)));
  }
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (vShape > 1.5) {
      float d = length(c);
      if (d > 0.5) discard;
      float turn = uTime * 0.35;
      vec2 a = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * c;
      vec2 b = mat2(0.7071, 0.7071, -0.7071, 0.7071) * a;
      float rays = ray(a, 0.012, 0.5) + ray(a.yx, 0.012, 0.5) + 0.55 * (ray(b, 0.01, 0.24) + ray(b.yx, 0.01, 0.24));
      float core = smoothstep(0.075, 0.045, d);
      float halo = exp(-d * d * 40.0) * 0.55;
      vec3 color = mix(vColor, uGlint, smoothstep(0.04, 0.0, d) * 0.9);
      gl_FragColor = vec4(color, min(1.0, core + halo + rays * 0.85) * vAlpha);
      #include <colorspace_fragment>
      return;
    }
    float d = mix(length(c), (abs(c.x) + abs(c.y)) * 0.8, vShape);
    if (d > 0.5) discard;
    float round_ = 1.0 - vShape;
    float breathe = 0.7 + 0.3 * sin(uTime * 1.6 + vPhase);
    float core = smoothstep(0.2, 0.14, d);
    float setting = smoothstep(0.024, 0.0, abs(d - 0.27)) * 0.5 * round_;
    float halo = smoothstep(0.5, 0.0, d) * 0.3 * (1.0 - 0.6 * vShape) * mix(1.0, breathe, round_);
    float glint = smoothstep(0.065, 0.0, length(c - vec2(-0.045, -0.05))) * round_;
    gl_FragColor = vec4(mix(vColor, uGlint, glint * 0.85), (core + setting + halo) * vAlpha);
    #include <colorspace_fragment>
  }
`;

// The compass bezel round the globe, in the plane of the screen: a hairline
// with a tick every 5°, longer each 30°, longest at the cardinal points,
// drawn clockwise from north as the globe appears; and the needle, a small
// deep-gold wedge pointing in at the light's heading, the hairline glowing
// either side of it. The bezel parts at the bottom, round the HUD, whose
// own compass carries the heading there.
const BEZEL_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BEZEL_FRAGMENT = /* glsl */ `
  #define PI 3.14159265
  uniform float uReveal;
  uniform float uHeading;
  uniform float uNeedle;
  uniform vec3 uColor;
  uniform vec3 uDeep;
  varying vec2 vUv;
  float hair(float x, float w) {
    return 1.0 - smoothstep(0.0, w, abs(x));
  }
  void main() {
    vec2 p = (vUv * 2.0 - 1.0) * ${BEZEL_EXTENT.toFixed(3)};
    float r = length(p);
    float px = fwidth(r);
    float angle = atan(p.x, p.y);
    float turn = fract(angle / (2.0 * PI) + 1.0);
    float drawn = smoothstep(turn, turn + 0.04, uReveal * 1.04);

    float deg = turn * 360.0;
    float minor = abs(fract(deg / 5.0 + 0.5) - 0.5) * 5.0;
    float major = step(abs(fract(deg / 30.0 + 0.5) - 0.5) * 30.0, 2.5);
    float cardinal = step(abs(fract(deg / 90.0 + 0.5) - 0.5) * 90.0, 2.5);
    float reach = mix(mix(0.014, 0.026, major), 0.04, cardinal);
    float tick = hair(minor * PI / 180.0 * r, px * mix(0.8, 1.2, major))
      * smoothstep(1.0 - px, 1.0, r) * (1.0 - smoothstep(1.0 + reach - px, 1.0 + reach, r));
    float ring = hair(r - 1.0, px);

    float off = abs(mod(angle - uHeading + PI, 2.0 * PI) - PI);
    float glow = hair(r - 1.0, px * 1.8) * exp(-off * off * 28.0) * uNeedle;
    float rise = (r - 1.052) / 0.036;
    float wedge = step(0.0, rise) * step(rise, 1.0)
      * (1.0 - smoothstep(rise * 0.013 - px, rise * 0.013, off * r)) * uNeedle * 0.85;

    float open = smoothstep(${BEZEL_GAP.toFixed(3)}, ${(BEZEL_GAP + 0.14).toFixed(3)}, abs(abs(angle) - PI));
    float soft = (ring * 0.38 + tick * mix(0.26, 0.48, major)) * drawn * open;
    float deep = max(glow, wedge) * open;
    gl_FragColor = vec4(mix(uColor, uDeep, deep / max(soft + deep, 1e-4)), max(soft, deep));
    #include <colorspace_fragment>
  }
`;

export class GlobeScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  private readonly tilt = new Group();
  private readonly spin = new Group();

  private readonly land: Points<BufferGeometry, ShaderMaterial>;
  private readonly grid: LineBasicMaterial;
  private readonly routes: ShaderMaterial[] = [];
  private readonly curves: RouteCurve[] = [];
  private readonly spots: Points<BufferGeometry, ShaderMaterial>;
  private readonly pulses: Mesh<RingGeometry, MeshBasicMaterial>[] = [];
  /** Berlin, then each destination, then each stay, on the unit sphere. */
  private readonly anchors: Vector3[];
  /** The anchor index of the first stay. */
  private readonly firstStay: number;
  private readonly tint = new Color();
  private readonly bezel: Mesh<PlaneGeometry, ShaderMaterial>;
  /** Radians clockwise from north, per route; and where the needle points now. */
  private readonly headings: number[];
  private heading = 0;
  private needle = 0;

  private layout: GlobeLayout = { width: 1, height: 1, cx: 0.5, cy: 0.5, r: 0.25 };
  private readonly pointer = { x: 0, y: 0 };
  private readonly lean = { x: 0, y: 0 };
  private readonly drag = { active: false, offset: 0, velocity: 0 };
  private lastTime: number | null = null;

  private readonly state: GlobeState;
  private readonly onFrame: (frame: GlobeFrame) => void;
  private readonly scratch = new Vector3();
  private readonly toCamera = new Vector3();

  constructor(canvas: HTMLCanvasElement, options: GlobeOptions) {
    this.state = options.state;
    this.onFrame = options.onFrame;
    this.headings = options.headings.map((h) => h * DEG);
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    this.renderer.setClearColor(0x000000, 0);

    this.scene.add(this.tilt);
    this.tilt.add(this.spin);

    const base = toVector(options.base.lat, options.base.lon);
    this.anchors = [base, ...[...options.destinations, ...options.stays].map((c) => toVector(c.lat, c.lon))];
    this.firstStay = 1 + options.destinations.length;

    // The body. Opaque, so it hides whatever lies on the far side.
    this.spin.add(
      new Mesh(
        new SphereGeometry(1, 96, 64),
        new ShaderMaterial({
          vertexShader: SPHERE_VERTEX,
          fragmentShader: SPHERE_FRAGMENT,
          uniforms: {
            uCentre: { value: new Color("#fffdf9") },
            uEdge: { value: new Color("#f3ede3") },
            uShade: { value: new Color("#e4dccf") },
            uRim: { value: GOLD_LIGHT },
            uRimDeep: { value: GOLD_LIGHT.clone().lerp(GOLD, 0.5) },
            uGlaze: { value: new Color("#ffffff") },
          },
        }),
      ),
    );

    // The aura, round the globe at the centre of the scene.
    const AURA = 1.16;
    const aura = new Mesh(
      new SphereGeometry(AURA, 64, 32),
      new ShaderMaterial({
        vertexShader: SPHERE_VERTEX,
        fragmentShader: AURA_FRAGMENT,
        side: BackSide,
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: GOLD_LIGHT }, uInner: { value: 1 / AURA }, uOpacity: { value: 0.32 } },
      }),
    );
    this.scene.add(aura);

    // A navigator's grid: meridians and parallels every 30°.
    const grid: number[] = [];
    const segment = (a: Vector3, b: Vector3) => grid.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lon = 0; lon < 360; lon += 30) {
      for (let lat = -90; lat < 90; lat += 3) segment(toVector(lat, lon, 1.001), toVector(lat + 3, lon, 1.001));
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = 0; lon < 360; lon += 3) segment(toVector(lat, lon, 1.001), toVector(lat, lon + 3, 1.001));
    }
    const gridGeometry = new BufferGeometry();
    gridGeometry.setAttribute("position", new BufferAttribute(new Float32Array(grid), 3));
    this.grid = new LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false });
    this.spin.add(new LineSegments(gridGeometry, this.grid));

    this.land = this.buildLand(options.spacing, base);
    this.spin.add(this.land);

    // The routes, each a fine tube along its great circle; a stay's finer still.
    this.anchors.slice(1).forEach((to, i) => {
      const curve = new RouteCurve(base, to);
      const material = new ShaderMaterial({
        vertexShader: ROUTE_VERTEX,
        fragmentShader: ROUTE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uDraw: { value: 0 },
          uTail: { value: 0 },
          uHead: { value: -1 },
          uTime: { value: 0 },
          uSeed: { value: (i * 0.37) % 1 },
          uFlow: { value: 0 },
          uColor: { value: GOLD },
          uHot: { value: GOLD_DEEP },
        },
      });
      this.curves.push(curve);
      this.routes.push(material);
      const radius = this.isStay(i + 1) ? 0.003 : 0.0042;
      this.spin.add(new Mesh(new TubeGeometry(curve, 96, radius, 6, false), material));
    });

    // Rings that ripple out from each place, lying flat on the surface.
    const up = new Vector3(0, 0, 1);
    for (const anchor of this.anchors) {
      const ring = new Mesh(
        new RingGeometry(0.82, 1, 48),
        new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false }),
      );
      ring.position.copy(anchor).multiplyScalar(1.002);
      ring.quaternion.setFromUnitVectors(up, anchor);
      this.pulses.push(ring);
      this.spin.add(ring);
    }

    // The markers (Berlin in ink, destinations in gold, stays as ink
    // diamonds) and, last, the light.
    const count = this.anchors.length + 1;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const shapes = new Float32Array(count);
    this.anchors.forEach((anchor, i) => {
      anchor.clone().multiplyScalar(1.004).toArray(positions, i * 3);
      const stay = this.isStay(i);
      (i === 0 || stay ? INK : GOLD_DEEP).toArray(colors, i * 3);
      sizes[i] = i === 0 ? 20 : stay ? STAY_SIZE : 16;
      shapes[i] = stay ? 1 : 0;
    });
    GOLD_DEEP.toArray(colors, (count - 1) * 3);
    sizes[count - 1] = LIGHT_SIZE;
    shapes[count - 1] = 2;
    const spotGeometry = new BufferGeometry();
    spotGeometry.setAttribute("position", new BufferAttribute(positions, 3));
    spotGeometry.setAttribute("aColor", new BufferAttribute(colors, 3));
    spotGeometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
    spotGeometry.setAttribute("aAlpha", new BufferAttribute(new Float32Array(count), 1));
    spotGeometry.setAttribute("aShape", new BufferAttribute(shapes, 1));
    this.spots = new Points(
      spotGeometry,
      new ShaderMaterial({
        vertexShader: SPOT_VERTEX,
        fragmentShader: SPOT_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: { uDepth: { value: 1 }, uDpr: { value: 1 }, uTime: { value: 0 }, uGlint: { value: CHAMPAGNE } },
      }),
    );
    this.spin.add(this.spots);

    // The bezel faces the camera from the globe's centre; render() sizes it
    // to the outline, which the globe's own depth keeps it outside of.
    this.bezel = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        vertexShader: BEZEL_VERTEX,
        fragmentShader: BEZEL_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uReveal: { value: 0 },
          uHeading: { value: 0 },
          uNeedle: { value: 0 },
          uColor: { value: GOLD },
          uDeep: { value: GOLD_DEEP },
        },
      }),
    );
    this.scene.add(this.bezel);
  }

  private isStay(anchor: number): boolean {
    return anchor >= this.firstStay;
  }

  /** 0–1: how far an anchor has appeared. Berlin with the ripple, a destination when its route lands, the stays in turn. */
  private arrived(anchor: number): number {
    const { state } = this;
    if (anchor === 0) return smoothstep(0, 0.08, state.reveal);
    if (!this.isStay(anchor)) return smoothstep(0.9, 1, state.routes[anchor - 1]?.draw ?? 0);
    const start = ((anchor - this.firstStay) / (this.anchors.length - this.firstStay)) * 0.5;
    return smoothstep(start, start + 0.5, state.marks);
  }

  /** One dot per land cell on rows of equal spacing, each tagged with its distance from Berlin. */
  private buildLand(spacing: number, base: Vector3): Points<BufferGeometry, ShaderMaterial> {
    const positions: number[] = [];
    const distances: number[] = [];
    const jitter: number[] = [];
    for (let lat = -90 + spacing / 2; lat < 90; lat += spacing) {
      const perRow = Math.max(1, Math.round((360 * Math.cos(lat * DEG)) / spacing));
      for (let i = 0; i < perRow; i++) {
        const lon = -180 + ((i + 0.5) * 360) / perRow;
        if (!isLand(lat, lon)) continue;
        const v = toVector(lat, lon, 1.003);
        positions.push(v.x, v.y, v.z);
        distances.push(v.angleTo(base));
        jitter.push(Math.random());
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute("aDist", new BufferAttribute(new Float32Array(distances), 1));
    geometry.setAttribute("aRand", new BufferAttribute(new Float32Array(jitter), 1));
    return new Points(
      geometry,
      new ShaderMaterial({
        vertexShader: LAND_VERTEX,
        fragmentShader: LAND_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uReveal: { value: 0 },
          uSize: { value: 2.4 },
          uDepth: { value: 1 },
          uDpr: { value: 1 },
          uTime: { value: 0 },
          uInk: { value: INK },
          uGold: { value: GOLD },
          uGoldDeep: { value: GOLD_DEEP },
          uOpacity: { value: 0.62 },
        },
      }),
    );
  }

  setLayout(layout: GlobeLayout, dpr: number): void {
    this.layout = layout;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(layout.width, layout.height, false);
    this.camera.aspect = layout.width / layout.height;
    this.land.material.uniforms.uDpr.value = dpr;
    this.spots.material.uniforms.uDpr.value = dpr;
    // Dots scale with the globe, so a phone shows the same map, only smaller.
    this.land.material.uniforms.uSize.value = Math.max(1.5, layout.r * 0.0085);
  }

  /** Pointer position over the hero, each axis -1 to 1. */
  setPointer(x: number, y: number): void {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  dragStart(): void {
    this.drag.active = true;
    this.drag.velocity = 0;
  }

  /** Turns the globe by a horizontal pointer movement in CSS pixels. */
  dragBy(dx: number): void {
    const turn = dx / Math.max(this.layout.r, 1);
    this.drag.offset += turn;
    this.drag.velocity = turn;
  }

  dragEnd(): void {
    this.drag.active = false;
  }

  /** Draws one frame; `time` in seconds. */
  render(time: number): void {
    const dt = this.lastTime === null ? 0 : Math.min(time - this.lastTime, 0.1);
    this.lastTime = time;
    const { state, layout, drag } = this;

    // A released drag coasts to a stop and eases home, so the routes return
    // to the front on their own. Held still, it keeps no momentum.
    drag.velocity *= Math.pow(drag.active ? 0.75 : 0.92, dt * 60);
    if (!drag.active) {
      drag.offset += drag.velocity;
      drag.offset *= Math.pow(0.985, dt * 60);
    }
    const follow = 1 - Math.exp(-dt * 2.5);
    this.lean.x += (this.pointer.x - this.lean.x) * follow;
    this.lean.y += (this.pointer.y - this.lean.y) * follow;

    const sway = Math.sin(time * 0.16) * 0.09;
    this.spin.rotation.y = -REST.lon * DEG + sway + this.lean.x * 0.14 + drag.offset;
    this.tilt.rotation.x = REST.lat * DEG + this.lean.y * 0.06 + state.climb * 0.45;

    // Climbing away: the globe recedes and rises as the hero scrolls out.
    const r = layout.r * (1 - 0.3 * state.climb);
    const cy = layout.cy - layout.height * 0.06 * state.climb;
    const distance = Math.hypot(1, layout.height / 2 / (r * Math.tan((FOV / 2) * DEG)));
    this.camera.position.set(0, 0, distance);
    this.camera.setViewOffset(
      layout.width,
      layout.height,
      layout.width / 2 - layout.cx,
      layout.height / 2 - cy,
      layout.width,
      layout.height,
    );

    // The bezel: a circle at the centre's depth that lands just outside the
    // outline, whose radius on screen goes as 1 / sqrt(distance² - 1).
    this.bezel.scale.setScalar((BEZEL * BEZEL_EXTENT * distance) / Math.sqrt(distance * distance - 1));
    const bezel = this.bezel.material.uniforms;
    bezel.uReveal.value = smoothstep(0.25, 1, state.reveal);
    // The needle swings the short way round to each new heading, and stays.
    const course = this.headings[state.flight];
    if (course !== undefined) {
      if (this.needle === 0) this.heading = course;
      const turn = ((((course - this.heading + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
      this.heading += turn * (1 - Math.exp(-dt * 3.2));
      this.needle = Math.min(1, this.needle + dt * 0.8);
    }
    bezel.uHeading.value = this.heading;
    bezel.uNeedle.value = smoothstep(0, 1, this.needle);

    this.land.material.uniforms.uTime.value = time;
    this.spots.material.uniforms.uTime.value = time;
    this.land.material.uniforms.uReveal.value = state.reveal;
    this.land.material.uniforms.uDepth.value = distance - 1;
    this.spots.material.uniforms.uDepth.value = distance - 1;
    this.grid.opacity = 0.16 * smoothstep(0.2, 1, state.reveal);

    this.routes.forEach((material, i) => {
      material.uniforms.uDraw.value = state.routes[i]?.draw ?? 0;
      material.uniforms.uTail.value = state.routes[i]?.tail ?? 0;
      material.uniforms.uHead.value = state.flight === i ? state.head : -1;
      material.uniforms.uTime.value = time;
      // Only a partner's route, fully drawn, and not the one being flown.
      const drawn = this.isStay(i + 1) || state.flight === i ? 0 : smoothstep(0.98, 1, state.routes[i]?.draw ?? 0);
      material.uniforms.uFlow.value = drawn;
    });

    const arrived = (i: number) => this.arrived(i);
    const focus = (i: number) => (this.isStay(i) ? (state.routes[i - 1]?.focus ?? 0) : 1);
    const alpha = this.spots.geometry.getAttribute("aAlpha") as BufferAttribute;
    this.anchors.forEach((_, i) => alpha.setX(i, arrived(i)));

    // A stay in the spotlight warms from ink to gold and grows a little.
    const colors = this.spots.geometry.getAttribute("aColor") as BufferAttribute;
    const sizes = this.spots.geometry.getAttribute("aSize") as BufferAttribute;
    for (let i = this.firstStay; i < this.anchors.length; i++) {
      const f = focus(i);
      this.tint.copy(INK).lerp(GOLD_DEEP, f);
      colors.setXYZ(i, this.tint.r, this.tint.g, this.tint.b);
      sizes.setX(i, STAY_SIZE + STAY_GROW * f);
    }
    colors.needsUpdate = true;
    sizes.needsUpdate = true;

    // The light, at the same arc-length position the route's trail uses.
    // Where it lands it stays a moment, flaring open as it fades.
    const light = this.anchors.length;
    const flying = state.flight >= 0 && state.flight < this.curves.length && state.head <= 1.3;
    const landed = smoothstep(1, 1.3, state.head);
    if (flying) {
      this.curves[state.flight].getPointAt(Math.min(1, Math.max(0, state.head)), this.scratch);
      const positions = this.spots.geometry.getAttribute("position") as BufferAttribute;
      positions.setXYZ(light, this.scratch.x, this.scratch.y, this.scratch.z);
      positions.needsUpdate = true;
    }
    sizes.setX(light, LIGHT_SIZE + LIGHT_FLARE * Math.sqrt(landed));
    alpha.setX(light, flying ? smoothstep(0, 0.05, state.head) * (1 - landed) : 0);
    alpha.needsUpdate = true;

    // A slow pulse from every reached place, and a wide one where the light
    // lands. Stays pulse only then, so the globe keeps its quiet.
    this.pulses.forEach((ring, i) => {
      const landing = i > 0 && state.flight === i - 1 ? smoothstep(0.96, 1.3, state.head) : 0;
      if (landing > 0) {
        ring.scale.setScalar(0.02 + landing * 0.1);
        ring.material.opacity = arrived(i) * (1 - landing) * 0.9;
      } else if (this.isStay(i)) {
        ring.material.opacity = 0;
      } else {
        const phase = (time * 0.45 + i * 0.29) % 1;
        ring.scale.setScalar(0.012 + phase * 0.045);
        ring.material.opacity = arrived(i) * (1 - phase) * (1 - phase) * 0.55;
      }
    });

    this.renderer.render(this.scene, this.camera);

    const markers = this.anchors.map((anchor, i) => {
      const world = this.scratch.copy(anchor).applyMatrix4(this.spin.matrixWorld);
      const facing = this.toCamera.copy(this.camera.position).sub(world).normalize().dot(world);
      world.project(this.camera);
      return {
        x: ((world.x + 1) / 2) * layout.width,
        y: ((1 - world.y) / 2) * layout.height,
        visible: arrived(i) * focus(i) * smoothstep(0.15, 0.4, facing),
      };
    });
    this.onFrame({ markers });
  }

  dispose(): void {
    this.scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof Points || object instanceof LineSegments) {
        object.geometry.dispose();
        (object.material as Material).dispose();
      }
    });
    this.renderer.dispose();
  }
}
