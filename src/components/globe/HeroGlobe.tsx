"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import BrandMark from "@/components/BrandMark";
import { socialLinks } from "@/components/SocialIcons";
import { useLanguage } from "@/context/LanguageContext";
import { useIntroDone } from "@/hooks/useIntroDone";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { fill } from "@/i18n/format";
import { BASE, BASE_LABEL, bearing, formatCoords, partners } from "@/lib/partners";
import { stays } from "@/lib/stays";
import type { GlobeFrame, GlobeLayout, GlobeScene, GlobeState } from "./GlobeScene";
import styles from "./HeroGlobe.module.css";

/** Seconds from Berlin to touchdown, and on the ground before the next flight. */
const FLIGHT = 2.6;
const LAYOVER = 0.8;
/** A hotel keeps the light longer: its name is only on the globe while it is visited. */
const STAY = 2.2;
/** Dots this many CSS pixels apart, whatever the globe's size. */
const DOT_GAP = 6.4;

/** Every place the light flies to: the partners, then the hotels. Route i leads to place i. */
const PLACES = [
  ...partners.map((p) => ({ name: p.name, nameLang: p.nameLang, region: p.region, coords: p.coords, stay: false })),
  ...stays.map((s) => ({ name: s.name, nameLang: s.nameLang, region: s.place, coords: s.coords, stay: true })),
];
/**
 * The order the light flies them: the hotels spread evenly between the
 * partners, a partner first, so no two hotels follow each other.
 */
const slot = (i: number) =>
  i < partners.length ? i / partners.length : (i - partners.length + 0.5) / Math.max(stays.length, 1);
const STOPS = PLACES.map((_, i) => i).sort((a, b) => slot(a) - slot(b));

/** The course from Berlin to each place, in whole degrees. */
const HEADINGS = PLACES.map((p) => Math.round(bearing(BASE, p.coords)));
type Side = "top" | "bottom" | "left" | "right";
/**
 * Berlin's label sits above it, clear of every route; partners west of it
 * carry theirs on the left. A hotel's hangs below, clear of the partners'.
 */
const SIDES: Side[] = [
  "top",
  ...PLACES.map((p): Side => (p.stay ? "bottom" : p.coords.lon < BASE.lon ? "left" : "right")),
];
/** Between a marker and its label, and the least room left to the screen edge. */
const GAP = 12;
const MARGIN = 8;
/** A hotel in focus quiets the labels whose markers sit this close to its own. */
const CROWD = 72;
const OFFSET: Record<Side, (x: number, y: number) => string> = {
  top: (x, y) => `translate3d(${x.toFixed(1)}px, ${(y - GAP).toFixed(1)}px, 0) translate(-50%, -100%)`,
  bottom: (x, y) => `translate3d(${x.toFixed(1)}px, ${(y + GAP).toFixed(1)}px, 0) translate(-50%, 0)`,
  left: (x, y) => `translate3d(${(x - GAP).toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-100%, -50%)`,
  right: (x, y) => `translate3d(${(x + GAP).toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(0, -50%)`,
};

/** A label keeps its side while it fits on screen; else it goes above (or across), else across. */
function fit(side: Side, x: number, labelWidth: number, width: number): Side {
  const fits = (s: Side) =>
    s === "right"
      ? x + GAP + labelWidth <= width - MARGIN
      : s === "left"
        ? x - GAP - labelWidth >= MARGIN
        : x - labelWidth / 2 >= MARGIN && x + labelWidth / 2 <= width - MARGIN;
  const order: Side[] =
    side === "bottom"
      ? [side, x > width / 2 ? "left" : "right"]
      : [side, "top", side === "left" ? "right" : "left"];
  return order.find(fits) ?? side;
}

function initialState(): GlobeState {
  return {
    reveal: 0,
    routes: PLACES.map(() => ({ draw: 0, tail: 0, focus: 0 })),
    marks: 0,
    flight: -1,
    head: 0,
    climb: 0,
  };
}

/**
 * The globe fills the stage, whose box the stylesheet sets per breakpoint:
 * beside the copy on a wide screen, above it on a phone. It may reach a
 * little past the stage's sides, never past its top or bottom.
 */
function measure(root: HTMLElement, stage: HTMLElement): GlobeLayout {
  const box = root.getBoundingClientRect();
  const area = stage.getBoundingClientRect();
  return {
    width: box.width,
    height: box.height,
    cx: area.left - box.left + area.width / 2,
    cy: area.top - box.top + area.height / 2,
    r: Math.min(area.width * 0.6, area.height * 0.5),
  };
}

/**
 * The desktop hero (HomeHero decides): the compass globe. Berlin at the centre of the work, gold
 * routes to the tourism boards in partners.ts, a light flying each in turn.
 * three.js arrives in its own chunk after the copy is on screen; under
 * usePrefersCalm() the globe is a single still frame with every route drawn.
 */
export default function HeroGlobe() {
  const { t } = useLanguage();
  const calm = usePrefersCalm();
  const introDone = useIntroDone();
  const [ready, setReady] = useState(false);
  const [flight, setFlight] = useState(-1);

  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stateRef = useRef<GlobeState | null>(null);

  // The scene: loaded once the page is interactive, drawn only while on screen.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const copy = copyRef.current;
    if (!root || !canvas || !stage || !copy) return;
    const state = (stateRef.current ??= initialState());
    if (calm) {
      Object.assign(state, { reveal: 1, marks: 1, flight: -1, climb: 0 });
      state.routes.forEach((route, i) => (route.draw = PLACES[i].stay ? 0 : 1));
    }

    let cancelled = false;
    let scene: GlobeScene | null = null;
    const cleanups: (() => void)[] = [];

    const labels = labelRefs.current;
    // Kept current by the resize observer below, so a frame reads no layout.
    const widths: number[] = [];
    let width = root.clientWidth;
    const placeLabels = ({ markers }: GlobeFrame) => {
      // markers[0] is Berlin, so place i is marker i + 1.
      const hush = markers.map(() => 1);
      markers.forEach((stay, i) => {
        if (!PLACES[i - 1]?.stay || stay.visible === 0) return;
        markers.forEach((marker, j) => {
          if (PLACES[j - 1]?.stay || Math.hypot(marker.x - stay.x, marker.y - stay.y) > CROWD) return;
          hush[j] = Math.min(hush[j], 1 - 0.92 * stay.visible);
        });
      });
      markers.forEach((marker, i) => {
        const label = labels[i];
        if (!label) return;
        const side = fit(SIDES[i], marker.x, widths[i] ?? 0, width);
        if (label.dataset.side !== side) label.dataset.side = side;
        label.style.transform = OFFSET[side](marker.x, marker.y);
        label.style.opacity = (marker.visible * hush[i]).toFixed(3);
      });
    };

    import("./GlobeScene").then(({ GlobeScene }) => {
      if (cancelled) return;
      const layout = measure(root, stage);
      const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
      let globe: GlobeScene;
      try {
        globe = new GlobeScene(canvas, {
          base: BASE,
          destinations: partners.map((p) => p.coords),
          stays: stays.map((s) => s.coords),
          headings: HEADINGS,
          state,
          spacing: Math.min(2, Math.max(1, ((DOT_GAP / layout.r) * 180) / Math.PI)),
          onFrame: placeLabels,
        });
      } catch {
        // No WebGL: the hero stands on its copy alone.
        return;
      }
      scene = globe;

      // The section, the stage (which gives way if the instrument under it
      // grows while the section keeps its size) and each label's width.
      const resize = new ResizeObserver((entries) => {
        for (const { target, borderBoxSize } of entries) {
          const i = labels.indexOf(target as HTMLSpanElement);
          if (i >= 0) widths[i] = borderBoxSize[0].inlineSize;
        }
        const layout = measure(root, stage);
        width = layout.width;
        globe.setLayout(layout, dpr());
        if (calm) globe.render(0);
      });
      [root, stage, ...labels].forEach((el) => el && resize.observe(el));
      cleanups.push(() => resize.disconnect());

      if (!calm) {
        const tick = (time: number) => globe.render(time);
        let running = false;
        const visible = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting === running) return;
          running = entry.isIntersecting;
          if (running) gsap.ticker.add(tick);
          else gsap.ticker.remove(tick);
        });
        visible.observe(root);
        cleanups.push(() => {
          visible.disconnect();
          gsap.ticker.remove(tick);
        });

        // A mouse leans the globe toward it; a drag on the stage turns it.
        const lean = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          const box = root.getBoundingClientRect();
          globe.setPointer(
            ((event.clientX - box.left) / box.width) * 2 - 1,
            ((event.clientY - box.top) / box.height) * 2 - 1,
          );
        };
        let lastX: number | null = null;
        const grab = (event: PointerEvent) => {
          lastX = event.clientX;
          stage.setPointerCapture(event.pointerId);
          globe.dragStart();
        };
        const turn = (event: PointerEvent) => {
          if (lastX === null) return;
          globe.dragBy(event.clientX - lastX);
          lastX = event.clientX;
        };
        const release = () => {
          if (lastX === null) return;
          lastX = null;
          globe.dragEnd();
        };
        root.addEventListener("pointermove", lean);
        stage.addEventListener("pointerdown", grab);
        stage.addEventListener("pointermove", turn);
        stage.addEventListener("pointerup", release);
        stage.addEventListener("pointercancel", release);
        cleanups.push(() => {
          root.removeEventListener("pointermove", lean);
          stage.removeEventListener("pointerdown", grab);
          stage.removeEventListener("pointermove", turn);
          stage.removeEventListener("pointerup", release);
          stage.removeEventListener("pointercancel", release);
        });
      }
      setReady(true);
    });

    // Scrolling out of the hero climbs away from the globe. Nothing is
    // pinned: the hero stays one screen tall and the page scrolls as ever.
    if (!calm) {
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const scrollTrigger = { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 };
        gsap.to(state, { climb: 1, ease: "none", scrollTrigger });
        gsap.to(copy, { yPercent: -12, autoAlpha: 0.15, ease: "none", scrollTrigger });
      });
      cleanups.push(() => ctx.revert());
    }

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
      scene?.dispose();
    };
  }, [calm]);

  // The copy's entrance, once the intro has left the screen.
  useEffect(() => {
    const root = rootRef.current;
    const name = nameRef.current;
    if (!root || !name || !introDone) return;
    root.setAttribute("data-ready", "");
    if (calm) return;
    gsap.registerPlugin(SplitText);
    const ctx = gsap.context(() => {
      const split = SplitText.create(name, { type: "words,chars", mask: "words" });
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from("[data-rise='eyebrow']", { autoAlpha: 0, y: 14, duration: 1.2 })
        .from(split.chars, { yPercent: 118, duration: 1.5, stagger: 0.032 }, 0.12)
        .from("[data-rise='body']", { autoAlpha: 0, y: 26, duration: 1.4, stagger: 0.12 }, 0.7);
    }, root);
    return () => ctx.revert();
  }, [introDone, calm]);

  // The globe's own choreography, once both the intro and three.js are done:
  // a ripple of land out of Berlin, the partners' routes drawn one after
  // another, the hotels' diamonds, then a light flying to each place in turn,
  // for as long as the page is open. A hotel's route is drawn by the light
  // itself and, once it has landed, gathers back into the hotel.
  useEffect(() => {
    const state = stateRef.current;
    if (!state || !ready || !introDone || calm) return;
    const ctx = gsap.context(() => {
      const flights = gsap.timeline({ repeat: -1, repeatDelay: LAYOVER });
      let at = 0;
      STOPS.forEach((route, stop) => {
        const flightPath = { duration: FLIGHT, ease: "power1.inOut" };
        flights
          .call(
            () => {
              state.flight = route;
              setFlight(stop);
            },
            [],
            at,
          )
          .fromTo(state, { head: 0 }, { head: 1.3, ...flightPath }, at);
        if (!PLACES[route].stay) {
          at += FLIGHT + LAYOVER;
          return;
        }
        // Later tweens of the same leg must not render their start values
        // before their turn, or every hotel would open in the spotlight.
        const later = { immediateRender: false };
        const leg = state.routes[route];
        flights
          .fromTo(leg, { draw: 0, tail: 0 }, { draw: 1.3, tail: 0, ...flightPath }, at)
          .fromTo(leg, { focus: 0 }, { focus: 1, duration: 0.6, ease: "power2.out", ...later }, at + FLIGHT * 0.6)
          .fromTo(leg, { tail: 0 }, { tail: 1.01, duration: 1.1, ease: "power2.inOut", ...later }, at + FLIGHT)
          .fromTo(
            leg,
            { focus: 1 },
            { focus: 0, duration: 0.7, ease: "power2.in", ...later },
            at + FLIGHT + STAY - 0.7,
          );
        at += FLIGHT + STAY;
      });
      gsap
        .timeline()
        .fromTo(state, { reveal: 0 }, { reveal: 1, duration: 2.8, ease: "power2.inOut" })
        .fromTo(
          state.routes.filter((_, i) => !PLACES[i].stay),
          { draw: 0 },
          { draw: 1, duration: 1.3, ease: "power3.inOut", stagger: 0.3 },
          1.1,
        )
        .fromTo(state, { marks: 0 }, { marks: 1, duration: 1.6, ease: "power2.out" }, "-=0.5")
        .add(flights, "-=0.6");
    });
    return () => ctx.revert();
  }, [ready, introDone, calm]);

  const shown = calm ? 0 : flight;
  const flying = shown >= 0;
  // Before the first flight the instrument is already set, hidden, on the
  // first course: it keeps its height, so the globe is sized only once.
  const course = STOPS[Math.max(shown, 0)];
  const target = PLACES[course];
  const active = flying ? STOPS[shown] : -1;

  return (
    <section className={styles.hero} ref={rootRef} data-globe={ready ? "" : undefined}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />

      <div className={styles.labels} aria-hidden="true">
        <span
          className={styles.label}
          data-side={SIDES[0]}
          ref={(el) => {
            labelRefs.current[0] = el;
          }}
        >
          <span className={styles.labelName} lang={BASE_LABEL.nameLang}>
            {BASE_LABEL.name}
          </span>
        </span>
        {PLACES.map((place, i) => (
          <span
            key={place.name}
            className={styles.label}
            data-active={active === i ? "" : undefined}
            data-stay={place.stay ? "" : undefined}
            data-side={SIDES[i + 1]}
            ref={(el) => {
              labelRefs.current[i + 1] = el;
            }}
          >
            <span className={styles.labelName} lang={place.nameLang ?? "en"}>
              {place.name}
            </span>
            <span className={styles.labelMeta}>{place.stay ? t(place.region) : formatCoords(place.coords)}</span>
          </span>
        ))}
      </div>

      <div className={styles.inner}>
        <div className={styles.copy} ref={copyRef}>
          <p className={`${styles.eyebrow} ${styles.pending}`} data-rise="eyebrow">
            {t("hero_welcome")}
          </p>
          <h1 className={`${styles.name} ${styles.pending}`} ref={nameRef}>
            <span className={styles.nameLine}>Atilla</span>{" "}
            <span className={styles.nameLine}>Barbarossa</span>
          </h1>
          <p className={`${styles.audience} ${styles.pending}`} data-rise="body">
            <span>{t("hero_aud_hotels")}</span>
            <span className={styles.separator} aria-hidden="true" />
            <span>{t("hero_aud_destinations")}</span>
            <span className={styles.separator} aria-hidden="true" />
            <span>{t("hero_aud_brands")}</span>
          </p>
          <p className={`${styles.value} ${styles.pending}`} data-rise="body">
            {t("hero_value")}
          </p>
          <div className={`${styles.actions} ${styles.pending}`} data-rise="body">
            <a href="#contact" className={styles.primaryBtn} data-cursor="CONTACT">
              {t("hero_cta_contact")}
            </a>
            <a href="#work" className={styles.secondaryBtn} data-cursor="PORTFOLIO">
              {t("hero_cta_projects")}
            </a>
            {/* In the buttons' row: where they wrap, the profiles fill the
                space beside the second one instead of adding a line. */}
            <ul className={styles.socials}>
              {socialLinks.map(({ platform, cursor, href, Icon }) => (
                <li key={platform}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.social}
                    data-cursor={cursor}
                    aria-label={fill(t("social_profile"), { platform })}
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.stage} ref={stageRef} data-cursor={calm ? undefined : t("hero_globe_drag")}>
          {!calm && (
            <span className={styles.dragHint} aria-hidden="true">
              {t("hero_globe_drag")}
            </span>
          )}
        </div>

        <div className={styles.hud} data-shown={ready && flying ? "" : undefined} aria-hidden="true">
          <span className={styles.compass} style={{ transform: `rotate(${flying ? HEADINGS[course] : 0}deg)` }}>
            <BrandMark className={styles.mark} />
          </span>
          <span className={styles.hudText}>
            <span className={styles.hudEyebrow}>{t(target.stay ? "hero_globe_stay" : "hero_globe_route")}</span>
            <span key={shown} className={styles.hudRoute} lang={target.nameLang ?? "en"}>
              {target.name}
            </span>
            <span className={styles.hudMeta}>
              {/* Aviation style: three digits. */}
              {String(HEADINGS[course]).padStart(3, "0")}° · {t(target.region)}
            </span>
          </span>
        </div>
      </div>

      <div className={styles.scrollCue} aria-hidden="true">
        <span>{t("hero_scroll")}</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
