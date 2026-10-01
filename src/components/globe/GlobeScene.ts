import {
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
 * great-circle routes from Berlin to each partner, a light flying them.
 *
 * Framework-free on purpose. The component owns the timing (GSAP tweens
 * `state`), the layout and the DOM overlay; this class only draws what
 * `state` says and reports where things landed on screen (`onFrame`).
 */

export interface GlobeState {
  /** 0–1: the ripple of dots spreading out from Berlin. */
  reveal: number;
  /** One per destination, 0–1: how much of its route is drawn. */
  routes: { draw: number }[];
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
  /** 0–1: facing the viewer and, for a destination, reached by its route. */
  visible: number;
}

export interface GlobeFrame {
  /** Berlin first, then each destination. */
  markers: GlobeMarker[];
}

interface GlobeOptions {
  base: Coords;
  destinations: Coords[];
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

const LAND_VERTEX = /* glsl */ `
  attribute float aDist;
  attribute float aRand;
  uniform float uReveal;
  uniform float uSize;
  uniform float uDepth;
  uniform float uDpr;
  varying float vAlpha;
  varying float vFront;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    float facing = dot(normalize(world.xyz), normalize(cameraPosition - world.xyz));
    // The ripple: a dot appears once the wave from Berlin has passed it,
    // and the dots on the wave front itself flare gold.
    float front = aDist - uReveal * 3.3;
    float shown = 1.0 - smoothstep(-0.03, 0.0, front);
    vFront = exp(-front * front * 90.0) * step(uReveal, 0.999);
    vAlpha = shown * smoothstep(0.0, 0.4, facing) * (0.72 + 0.28 * aRand);
    vec4 mv = viewMatrix * world;
    gl_PointSize = uSize * (1.0 + vFront * 0.9) * uDpr * (uDepth / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const LAND_FRAGMENT = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uGold;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vFront;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float disc = smoothstep(0.5, 0.32, d);
    gl_FragColor = vec4(mix(uInk, uGold, vFront), disc * vAlpha * mix(uOpacity, 1.0, vFront));
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

// Porcelain lit from the upper left, warming to a gold rim at the edge.
const SPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uCentre;
  uniform vec3 uEdge;
  uniform vec3 uRim;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float light = dot(vNormal, normalize(vec3(-0.45, 0.6, 0.65)));
    vec3 body = mix(uEdge, uCentre, smoothstep(-0.3, 0.9, light));
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    gl_FragColor = vec4(mix(body, uRim, rim * 0.9), 1.0);
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

// Drawn up to uDraw; a hot trail runs behind the flying light.
const ROUTE_FRAGMENT = /* glsl */ `
  uniform float uDraw;
  uniform float uHead;
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vAlong;
  void main() {
    if (vAlong > uDraw) discard;
    float trail = smoothstep(uHead - 0.22, uHead, vAlong) * step(vAlong, uHead);
    gl_FragColor = vec4(mix(uColor, uHot, trail), 0.5 + 0.5 * trail);
    #include <colorspace_fragment>
  }
`;

const SPOT_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;
  uniform float uDepth;
  uniform float uDpr;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = aColor;
    vAlpha = aAlpha;
    gl_PointSize = aSize * uDpr * (uDepth / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

// A solid core inside a soft halo: the markers and the flying light.
const SPOT_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.2, 0.14, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.3;
    gl_FragColor = vec4(vColor, (core + halo) * vAlpha);
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
  /** Berlin, then each destination, on the unit sphere. */
  private readonly anchors: Vector3[];

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
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    this.renderer.setClearColor(0x000000, 0);

    this.scene.add(this.tilt);
    this.tilt.add(this.spin);

    const base = toVector(options.base.lat, options.base.lon);
    this.anchors = [base, ...options.destinations.map((c) => toVector(c.lat, c.lon))];

    // The body. Opaque, so it hides whatever lies on the far side.
    this.spin.add(
      new Mesh(
        new SphereGeometry(1, 96, 64),
        new ShaderMaterial({
          vertexShader: SPHERE_VERTEX,
          fragmentShader: SPHERE_FRAGMENT,
          uniforms: {
            uCentre: { value: new Color("#ffffff") },
            uEdge: { value: new Color("#efe8dc") },
            uRim: { value: GOLD_LIGHT },
          },
        }),
      ),
    );

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

    // The routes, each a fine tube along its great circle.
    for (const to of this.anchors.slice(1)) {
      const curve = new RouteCurve(base, to);
      const material = new ShaderMaterial({
        vertexShader: ROUTE_VERTEX,
        fragmentShader: ROUTE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uDraw: { value: 0 },
          uHead: { value: -1 },
          uColor: { value: GOLD },
          uHot: { value: GOLD_DEEP },
        },
      });
      this.curves.push(curve);
      this.routes.push(material);
      this.spin.add(new Mesh(new TubeGeometry(curve, 96, 0.0042, 6, false), material));
    }

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

    // The markers (Berlin in ink, destinations in gold) and, last, the light.
    const count = this.anchors.length + 1;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    this.anchors.forEach((anchor, i) => {
      anchor.clone().multiplyScalar(1.004).toArray(positions, i * 3);
      (i === 0 ? INK : GOLD_DEEP).toArray(colors, i * 3);
      sizes[i] = i === 0 ? 20 : 16;
    });
    GOLD_DEEP.toArray(colors, (count - 1) * 3);
    sizes[count - 1] = 30;
    const spotGeometry = new BufferGeometry();
    spotGeometry.setAttribute("position", new BufferAttribute(positions, 3));
    spotGeometry.setAttribute("aColor", new BufferAttribute(colors, 3));
    spotGeometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
    spotGeometry.setAttribute("aAlpha", new BufferAttribute(new Float32Array(count), 1));
    this.spots = new Points(
      spotGeometry,
      new ShaderMaterial({
        vertexShader: SPOT_VERTEX,
        fragmentShader: SPOT_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: { uDepth: { value: 1 }, uDpr: { value: 1 } },
      }),
    );
    this.spin.add(this.spots);
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
          uInk: { value: INK },
          uGold: { value: GOLD },
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

    this.land.material.uniforms.uReveal.value = state.reveal;
    this.land.material.uniforms.uDepth.value = distance - 1;
    this.spots.material.uniforms.uDepth.value = distance - 1;
    this.grid.opacity = 0.16 * smoothstep(0.2, 1, state.reveal);

    this.routes.forEach((material, i) => {
      material.uniforms.uDraw.value = state.routes[i]?.draw ?? 0;
      material.uniforms.uHead.value = state.flight === i ? state.head : -1;
    });

    // Markers: Berlin appears with the ripple, a destination when its route lands.
    const arrived = (i: number) =>
      i === 0 ? smoothstep(0, 0.08, state.reveal) : smoothstep(0.9, 1, state.routes[i - 1]?.draw ?? 0);
    const alpha = this.spots.geometry.getAttribute("aAlpha") as BufferAttribute;
    this.anchors.forEach((_, i) => alpha.setX(i, arrived(i)));

    // The light, at the same arc-length position the route's trail uses.
    const light = this.anchors.length;
    const flying = state.flight >= 0 && state.flight < this.curves.length && state.head <= 1;
    if (flying) {
      this.curves[state.flight].getPointAt(Math.max(0, state.head), this.scratch);
      const positions = this.spots.geometry.getAttribute("position") as BufferAttribute;
      positions.setXYZ(light, this.scratch.x, this.scratch.y, this.scratch.z);
      positions.needsUpdate = true;
    }
    alpha.setX(light, flying ? smoothstep(0, 0.05, state.head) * (1 - smoothstep(0.95, 1, state.head)) : 0);
    alpha.needsUpdate = true;

    // A slow pulse from every reached place, and a wide one where the light lands.
    this.pulses.forEach((ring, i) => {
      const landing = i > 0 && state.flight === i - 1 ? smoothstep(0.96, 1.3, state.head) : 0;
      if (landing > 0) {
        ring.scale.setScalar(0.02 + landing * 0.1);
        ring.material.opacity = arrived(i) * (1 - landing) * 0.9;
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
        visible: arrived(i) * smoothstep(0.15, 0.4, facing),
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
