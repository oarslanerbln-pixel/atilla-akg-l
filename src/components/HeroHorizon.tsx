"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import styles from "./Hero.module.css";

/**
 * The hero backdrop: a sea at dusk under a low gold sun, drawn live.
 *
 * It replaces two background clips that cost 6–12 MB before the headline had
 * settled, one of which was shaky hand-held footage. This is one fragment
 * shader on raw WebGL — no 3D library, a few kilobytes, nothing fetched —
 * and it tells the same story as the mark: a horizon, a sun, a slow drift
 * forward like a drone over open water.
 *
 * It is careful with the phone it runs on: the canvas renders below screen
 * resolution (water forgives softness), stops when the hero scrolls away or
 * the tab is hidden, and a visitor who asked for less motion or less data
 * gets one still frame. Without WebGL the CSS gradient behind the canvas is
 * the backdrop, and it is also what paints before the first frame, so the
 * page never flashes.
 */

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_look;
uniform float u_sunX;
uniform float u_fade;
// 0 at the top of the page, 1 once the hero has scrolled away.
uniform float u_climb;

const vec3 ZENITH  = vec3(0.030, 0.023, 0.017);
const vec3 HORIZON = vec3(0.330, 0.205, 0.110);
const vec3 SUN     = vec3(0.960, 0.640, 0.320);
const vec3 GOLD    = vec3(0.702, 0.545, 0.349);
const vec3 DEEP    = vec3(0.016, 0.014, 0.012);

vec3 sunDir() { return normalize(vec3(u_sunX, 0.012, 1.0)); }

vec3 sky(vec3 rd) {
  float up = max(rd.y, 0.0);
  vec3 col = mix(HORIZON, ZENITH, pow(up, 0.35));
  float s = max(dot(rd, sunDir()), 0.0);
  // Kept below clipping so the disc stays gold instead of burning to a pale
  // yellow once tone-mapped.
  col += GOLD * (pow(s, 6.0) * 0.12 + pow(s, 40.0) * 0.22 + pow(s, 400.0) * 0.25);
  col += SUN * smoothstep(0.99976, 0.99983, s) * 0.8;
  // A warm haze sits on the horizon line itself.
  col += GOLD * 0.10 * exp(-abs(rd.y) * 45.0);
  return col;
}

// Sum of directional sines with their analytic gradient: cheap, and the
// gradient gives the normal without extra samples.
vec2 waveGrad(vec2 p, float detail) {
  vec2 g = vec2(0.0);
  float a = 0.11, f = 0.32;
  for (int i = 0; i < 6; i++) {
    float ang = float(i) * 1.73 + 0.4;
    vec2 d = vec2(cos(ang), sin(ang));
    float ph = dot(d, p) * f + u_time * (0.55 + float(i) * 0.23);
    g += a * f * d * cos(ph);
    a *= 0.58 * mix(1.0, 0.8, 1.0 - detail);
    f *= 1.9;
  }
  return g;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float roll = 0.012 * sin(u_time * 0.23);
  uv = mat2(cos(roll), -sin(roll), sin(roll), cos(roll)) * uv;

  // Scrolling away climbs like a drone: higher, a little further forward, and
  // tilting down so the horizon rises in the frame and more sea comes in.
  vec3 ro = vec3(0.0, 1.05 + 2.1 * u_climb + 0.06 * sin(u_time * 0.35), u_time * 0.6 + u_climb * 5.0);
  vec3 rd = normalize(vec3(uv.x + u_look.x * 0.03, uv.y + 0.12 - 0.34 * u_climb + u_look.y * 0.015, 1.6));

  vec3 col;
  if (rd.y < -0.0005) {
    float dist = -ro.y / rd.y;
    vec3 p = ro + rd * dist;
    float detail = exp(-dist * 0.035);
    vec2 g = waveGrad(p.xz, detail) * detail;
    vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
    vec3 r = reflect(rd, n);
    r.y = abs(r.y);
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
    col = mix(DEEP, sky(r), fres);
    float s = max(dot(r, sunDir()), 0.0);
    col += SUN * (pow(s, 420.0) * 1.3 + pow(s, 60.0) * 0.10);
    col = mix(col, HORIZON * 0.9, 1.0 - exp(-dist * 0.012));
  } else {
    col = sky(rd);
  }

  // Interleaved gradient noise: film grain without the banding a sin-hash
  // shows on some GPUs.
  float grain = fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(0.06711056, 0.00583715)) + fract(u_time * 7.0)));
  col += (grain - 0.5) * 0.025;
  col = col / (1.0 + col * 0.35);
  gl_FragColor = vec4(col * u_fade, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function HeroHorizon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const calm = usePrefersCalm();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One triangle that covers the viewport.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uLook = gl.getUniformLocation(program, "u_look");
    const uSunX = gl.getUniformLocation(program, "u_sunX");
    const uFade = gl.getUniformLocation(program, "u_fade");
    const uClimb = gl.getUniformLocation(program, "u_climb");

    const resize = () => {
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const scale = Math.min(window.devicePixelRatio || 1, 1.25) * (mobile ? 0.6 : 0.75);
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      // Keep the sun off the headline: right of centre on wide screens,
      // closer to the middle on a phone, where the frame is narrow.
      gl.uniform1f(uSunX, Math.min(0.5, 0.225 * (w / h)));
    };

    // Time only advances while the scene is on screen, so it resumes where it
    // stopped; it wraps well before float precision would blur the waves.
    let time = 12;
    let fade = calm ? 1 : 0;
    let climb = 0;
    let last = 0;
    let frame = 0;
    let visible = true;
    let shown = false;
    const look = { x: 0, y: 0, tx: 0, ty: 0 };

    const draw = () => {
      gl.uniform1f(uTime, time);
      gl.uniform2f(uLook, look.x, look.y);
      gl.uniform1f(uFade, fade);
      gl.uniform1f(uClimb, climb);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      time = (time + dt) % 900;
      fade = Math.min(1, fade + dt / 1.6);
      // Follows the scroll with a little lag, so the climb glides.
      const target = Math.min(1, Math.max(0, window.scrollY / Math.max(1, canvas.clientHeight)));
      climb += (target - climb) * Math.min(1, dt * 5);
      look.x += (look.tx - look.x) * 0.04;
      look.y += (look.ty - look.y) * 0.04;
      draw();
      if (!shown) {
        shown = true;
        setReady(true);
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (calm || frame || !visible || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      look.tx = (event.clientX / window.innerWidth) * 2 - 1;
      look.ty = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onLost = (event: Event) => {
      event.preventDefault();
      stop();
      setReady(false);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (calm) draw();
    });
    resizeObserver.observe(canvas);
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    viewObserver.observe(canvas);

    resize();
    if (calm) {
      draw();
      requestAnimationFrame(() => setReady(true));
    } else {
      start();
    }

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      stop();
      resizeObserver.disconnect();
      viewObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      // The context stays with the canvas: losing it here would leave a dead
      // context for the next mount (Strict Mode mounts twice).
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [calm]);

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.horizonCanvas} ${ready ? styles.horizonReady : ""}`}
      aria-hidden="true"
    />
  );
}
