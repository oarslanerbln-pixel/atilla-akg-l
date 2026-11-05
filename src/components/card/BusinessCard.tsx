"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentType, type PointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { ArrowUpRight, BookOpen, Check, Compass, Contact, Globe, IdCard, Mail, QrCode, RotateCcw, Share2, UserPlus, Wallet } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import BrandWordmark from "@/components/BrandWordmark";
import { InstagramIcon, WhatsAppIcon } from "@/components/SocialIcons";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { fill } from "@/i18n/format";
import type { TranslationKeys } from "@/i18n/translations";
import { HTML_LANG, pagePath } from "@/lib/locales";
import { BASE, formatCoords } from "@/lib/partners";
import { audience, businessCard, contact, socialProfiles, totalFollowers } from "@/lib/site";
import { MODE_TARGETS, PAGE_QR_COLORS, prettyUrl, qrSvg, type CardCodes, type CardMode, type QrTarget } from "./qr";
import { inBrowser, noSubscribe, readInApp, readPlatform, type Platform, type WalletOptions } from "./device";
import styles from "./BusinessCard.module.css";

export type { WalletOptions };

const EASE = [0.16, 1, 0.3, 1] as const;

const TARGETS: Record<QrTarget, { label: TranslationKeys; Icon: ComponentType<{ className?: string }> }> = {
  card: { label: "card_qr_card", Icon: IdCard },
  whatsapp: { label: "card_qr_whatsapp", Icon: WhatsAppIcon },
  instagram: { label: "card_qr_instagram", Icon: InstagramIcon },
  web: { label: "card_qr_web", Icon: Globe },
  mediaKit: { label: "card_qr_mediakit", Icon: BookOpen },
  businessCard: { label: "card_qr_card", Icon: IdCard },
  contact: { label: "card_qr_contact", Icon: Contact },
  contactPage: { label: "card_qr_contactpage", Icon: UserPlus },
};

const MODES: CardMode[] = ["personal", "business"];

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/** The idle sway: two slow sines, so the card never repeats a path within a glance. */
const SWAY = { x: 0.32, y: 0.22, periodX: 9, periodY: 7 };

/** Degrees of hand movement for a full lean; the hand's own angle drifts back to rest within about a second. */
const GYRO_RANGE = 18;
const GYRO_DRIFT = 0.015;

type Lean = { x: number; y: number; at: number; source: "mouse" | "gyro" };

type DeviceOrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

/**
 * The digital business card: shown on its own page (/card, `standalone`) and
 * as a section of the portfolio, above Contact.
 *
 * The front is the person: the lounge portrait, the outlined wordmark in gold
 * foil, and the three ways to reach him (WhatsApp, Instagram, the website) as
 * real links. Tapping anywhere else on it turns it over; the back is
 * porcelain with one QR code, which the visitor points at this card,
 * WhatsApp, Instagram or the website, so a person standing opposite can scan
 * whichever they need. Below the card: the contact file
 * (/atilla-barbarossa.vcf) and the share sheet.
 *
 * Each face is its own layer: a full-face button that turns the card, and
 * the face's content above it, transparent to the pointer except for its own
 * links. The face turned away is `inert` and hidden, so neither Tab nor a tap
 * reaches a link facing the wall, and focus follows the turn to the other
 * face's button.
 *
 * The turn is two quarter turns: the card swings edge-on, the faces swap
 * while it shows no face at all, and it swings back flat. A back face kept
 * rotated by 180° behind the front looked the same, but Chrome hit-tests
 * such nested 3D planes unreliably once the card leans: taps on the back's
 * buttons landed on the card's container or on the front behind it.
 *
 * The card is alive while it is on screen: it sways slowly on its own,
 * leans towards a mouse, and on a phone follows the hand through the
 * gyroscope (iOS asks for permission on the first tap that turns the card).
 * The foil catches the light as it moves. One loop drives all three, so they
 * blend instead of jumping, and it stops off screen, in a background tab and
 * for calm visitors. While the QR side faces the front, the screen is kept
 * awake, so the code is still there when the person opposite gets their
 * camera out.
 */
export default function BusinessCard({
  codes,
  standalone = false,
  wallet,
  initialMode = "personal",
  onModeChange,
}: {
  codes: CardCodes;
  standalone?: boolean;
  wallet?: WalletOptions;
  /** Personal or business face; /card/business opens on the business one. */
  initialMode?: CardMode;
  /** Told when the visitor switches faces, so a page can follow with its address. */
  onModeChange?: (mode: CardMode) => void;
}) {
  const { t, activeLang } = useLanguage();
  const calm = usePrefersCalm();
  const [flipped, setFlipped] = useState(false);
  const [flipper, animate] = useAnimate<HTMLDivElement>();
  const turning = useRef(false);
  const [mode, setMode] = useState<CardMode>(initialMode);
  const [target, setTarget] = useState<QrTarget>(MODE_TARGETS[initialMode][0]);
  const [turns, setTurns] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [copied, setCopied] = useState(false);
  const [motionGranted, setMotionGranted] = useState(0);
  // Read on the client only: the server cannot know the visitor's device.
  const platform = useSyncExternalStore<Platform | null>(noSubscribe, readPlatform, () => null);
  const inApp = useSyncExternalStore(noSubscribe, readInApp, () => false);
  const [storyNote, setStoryNote] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const lean = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const foil = useRef<SVGLinearGradientElement>(null);
  const leanInput = useRef<Lean | null>(null);
  const motionAsked = useRef(false);
  const frontTurn = useRef<HTMLButtonElement>(null);
  const backTurn = useRef<HTMLButtonElement>(null);
  const followTurn = useRef(false);

  // The face that was turned away is inert now; focus goes to the one facing.
  useEffect(() => {
    if (!followTurn.current) return;
    followTurn.current = false;
    (flipped ? backTurn : frontTurn).current?.focus({ preventScroll: true });
  }, [flipped]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  // The loop: sway, mouse and gyroscope, eased into one lean.
  useEffect(() => {
    const el = lean.current;
    const box = stage.current;
    if (!el || !box || calm) return;

    let frame = 0;
    let visible = false;
    let last = 0;
    let x = 0;
    let y = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const seconds = (now - start) / 1000;
      const swayX = SWAY.x * Math.sin((seconds / SWAY.periodX) * 2 * Math.PI);
      const swayY = SWAY.y * Math.sin((seconds / SWAY.periodY) * 2 * Math.PI + 1);

      // A mouse holds the lean until it leaves; the gyroscope counts while it keeps reporting.
      const input = leanInput.current;
      const live = input && (input.source === "mouse" || now - input.at < 1200) ? input : null;
      // A mouse is followed exactly; a phone keeps some sway, so it still breathes lying on a table.
      const swayShare = !live ? 1 : live.source === "gyro" ? 0.4 : 0;
      const tx = clamp((live?.x ?? 0) + swayX * swayShare);
      const ty = clamp((live?.y ?? 0) + swayY * swayShare);

      // Time-based easing: quick behind a hand, slow when returning to the sway.
      const ease = 1 - Math.exp(-dt / (live ? 0.08 : 0.6));
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      el.style.setProperty("--lean-x", x.toFixed(4));
      el.style.setProperty("--lean-y", y.toFixed(4));
      // The foil's catch-light slides along the name as the card leans.
      foil.current?.setAttribute("gradientTransform", `translate(${(x * 0.35).toFixed(4)} 0)`);
      el.toggleAttribute("data-leaning", live !== null);
      frame = requestAnimationFrame(tick);
    };

    const run = () => {
      if (frame || !visible || document.visibilityState !== "visible") return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) run();
      else stop();
    });
    observer.observe(box);
    const onVisibility = () => (document.visibilityState === "visible" ? run() : stop());
    document.addEventListener("visibilitychange", onVisibility);
    el.dataset.alive = "";

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      delete el.dataset.alive;
      el.removeAttribute("data-leaning");
      el.style.removeProperty("--lean-x");
      el.style.removeProperty("--lean-y");
    };
  }, [calm]);

  // The gyroscope, on touch screens. Android sends it as is; iOS once allowed.
  useEffect(() => {
    if (calm || !window.matchMedia("(pointer: coarse)").matches) return;
    let rest: { b: number; g: number } | null = null;
    let lastEvent = 0;

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta == null || event.gamma == null) return;
      // Front-to-back and side-to-side as the screen is held, also in landscape.
      const angle = screen.orientation?.angle ?? 0;
      let b = event.beta;
      let g = event.gamma;
      if (angle === 90) [b, g] = [-g, b];
      else if (angle === 270 || angle === -90) [b, g] = [g, -b];
      else if (angle === 180) [b, g] = [-b, -g];

      const now = performance.now();
      if (!rest || now - lastEvent > 1000) rest = { b, g };
      lastEvent = now;
      // Holding the phone at an angle is not a tilt: the rest position follows the hand, slowly.
      rest.b += (b - rest.b) * GYRO_DRIFT;
      rest.g += (g - rest.g) * GYRO_DRIFT;
      leanInput.current = {
        x: clamp((g - rest.g) / GYRO_RANGE),
        y: clamp((b - rest.b) / GYRO_RANGE),
        at: now,
        source: "gyro",
      };
    };

    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, [calm, motionGranted]);

  // While the QR side faces the front, the screen stays on.
  useEffect(() => {
    if (!flipped || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let released = false;
    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (released) void lock.release();
        else sentinel = lock;
      } catch {
        // Refused (battery saver, a hidden tab); the screen simply follows its own timeout.
      }
    };
    void acquire();
    // The browser drops the lock when the tab is hidden; take it again on return.
    const onVisibility = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release();
    };
  }, [flipped]);

  // iOS only hands out the gyroscope after a tap; turning the card is the first one.
  const askForMotion = () => {
    if (motionAsked.current || calm) return;
    motionAsked.current = true;
    const Orientation = window.DeviceOrientationEvent as DeviceOrientationWithPermission | undefined;
    if (typeof Orientation?.requestPermission !== "function") return;
    Orientation.requestPermission()
      .then((state) => state === "granted" && setMotionGranted((n) => n + 1))
      .catch(() => {});
  };

  const turn = async () => {
    askForMotion();
    if (turning.current) return;
    turning.current = true;
    followTurn.current = true;
    const toBack = !flipped;
    setTurns((n) => n + 1);
    if (!calm && flipper.current) {
      // Front to back swings left, back to front swings right.
      const edge = toBack ? -90 : 90;
      // The card lifts off the wall as it turns, its shadow widening and paling
      // beneath it, and settles back flat.
      const lift = floor.current
        ? animate(floor.current, { scaleX: [1, 0.78, 1], opacity: [1, 0.45, 1] }, { duration: 1.2, ease: EASE })
        : null;
      await animate(
        flipper.current,
        { rotateY: edge, scale: 1.05, y: -10 },
        { duration: 0.34, ease: [0.55, 0, 0.8, 0.3] },
      );
      setFlipped(toBack);
      await animate(
        flipper.current,
        { rotateY: [-edge, 0], scale: [1.05, 1], y: [-10, 0] },
        { duration: 0.9, ease: EASE },
      );
      await lift;
    } else {
      setFlipped(toBack);
    }
    turning.current = false;
  };

  const followMouse = (event: PointerEvent<HTMLDivElement>) => {
    const el = lean.current;
    if (!el || event.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    leanInput.current = {
      x: clamp(((event.clientX - rect.left) / rect.width) * 2 - 1),
      y: clamp(((event.clientY - rect.top) / rect.height) * 2 - 1),
      at: performance.now(),
      source: "mouse",
    };
  };

  const releaseMouse = () => {
    if (leanInput.current?.source === "mouse") leanInput.current = null;
  };

  const entry = codes[activeLang][target];
  const svg = useMemo(() => qrSvg(entry.matrix, PAGE_QR_COLORS), [entry]);
  const business = mode === "business";

  // A new face starts on its own first code.
  const chooseMode = (next: CardMode) => {
    if (next === mode) return;
    setMode(next);
    setTarget(MODE_TARGETS[next][0]);
    onModeChange?.(next);
  };

  const shown =
    target === "contact"
      ? t("card_qr_contact_hint")
      : target === "whatsapp"
      ? businessCard.whatsappDisplay
      : target === "instagram"
        ? businessCard.instagramHandle
        : prettyUrl(entry.url);
  const targetName = t(TARGETS[target].label);

  // The story image for this face and language (/card-story, drawn at build time).
  const storySrc = `/card-story/${HTML_LANG[activeLang]}-${mode}.png`;
  const storyFile = useRef<{ src: string; file: Promise<File | null> } | null>(null);
  const loadStory = () => {
    if (storyFile.current?.src !== storySrc) {
      storyFile.current = {
        src: storySrc,
        file: fetch(storySrc)
          .then((response) => (response.ok ? response.blob() : null))
          .then((blob) => (blob ? new File([blob], "atilla-barbarossa-story.png", { type: "image/png" }) : null))
          .catch(() => null),
      };
    }
    return storyFile.current.file;
  };

  /**
   * "Instagram Story": the card's address goes to the clipboard, for the link
   * sticker, and the story image to the share sheet, where Instagram is one
   * of the targets. Where a browser cannot share files, the image opens to be
   * saved. The image is fetched only once the visitor reaches for the button.
   */
  const shareStory = async () => {
    const url = codes[activeLang][business ? "businessCard" : "card"].url;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // No clipboard; the note still tells them where the link goes.
    }
    setStoryNote(true);
    const file = await loadStory();
    if (file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    window.open(storySrc, "_blank", "noopener");
  };

  const share = async () => {
    const url = codes[activeLang][business ? "businessCard" : "card"].url;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Atilla Barbarossa", text: t("card_share_text"), url });
      } catch {
        // Dismissed by the visitor; nothing to report.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // No clipboard (an insecure context); the address bar still has the link.
    }
  };

  // The Wallet button only where a pass can be added: Apple's on Apple devices,
  // Google's on Android and on other computers (it saves to the Google account).
  const walletProvider =
    !wallet || !platform
      ? null
      : platform === "apple"
        ? wallet.apple
          ? "apple"
          : null
        : wallet.google
          ? "google"
          : null;
  const walletPath = walletProvider ? `/wallet/${walletProvider}?lang=${HTML_LANG[activeLang]}` : null;

  // In Instagram's browser, saving and Wallet go through the phone's own browser.
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const viaBrowser = (path: string) => (inApp ? inBrowser(origin + path, platform) : path);
  const saveHref = viaBrowser("/atilla-barbarossa.vcf");
  const walletHref = walletPath ? viaBrowser(walletPath) : null;

  // The business face asks for a partnership in its first line, as the media kit does.
  const whatsappHref = `https://wa.me/${businessCard.whatsapp}?text=${encodeURIComponent(
    t(business ? "mk_wa_message" : "whatsapp_message"),
  )}`;
  const personalLinks = [
    {
      key: "whatsapp",
      href: whatsappHref,
      external: true,
      label: t("card_qr_whatsapp"),
      value: businessCard.whatsappDisplay,
      Icon: WhatsAppIcon,
      long: false,
    },
    {
      key: "instagram",
      href: socialProfiles.instagram,
      external: true,
      label: t("card_qr_instagram"),
      value: businessCard.instagramHandle,
      Icon: InstagramIcon,
      long: false,
    },
    {
      key: "web",
      href: pagePath("home", activeLang),
      external: false,
      label: t("card_qr_web"),
      // The domain alone, as printed cards give it; the link opens the portfolio in the card's language.
      value: prettyUrl(new URL(codes[activeLang].web.url).origin),
      Icon: Globe,
      long: false,
    },
  ];
  const businessLinks = [
    {
      key: "mediakit",
      href: pagePath("mediaKit", activeLang),
      external: false,
      label: t("card_qr_mediakit"),
      // What the kit holds, rather than its address, which no 280 px card fits.
      value: t("card_mediakit_value"),
      Icon: BookOpen,
      long: false,
    },
    {
      key: "management",
      href: `mailto:${contact.management}?subject=${encodeURIComponent(t("mk_mail_subject"))}`,
      external: false,
      label: t("card_management"),
      value: contact.management,
      Icon: Mail,
      long: true,
    },
    {
      key: "whatsapp",
      href: whatsappHref,
      external: true,
      label: t("card_qr_whatsapp"),
      value: businessCard.whatsappDisplay,
      Icon: WhatsAppIcon,
      long: false,
    },
  ];
  const links = business ? businessLinks : personalLinks;

  // The business face's figures, from the one source the media kit and Stats read.
  const locale = HTML_LANG[activeLang];
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const figures = [
    { value: compact.format(totalFollowers), label: t("card_fig_followers") },
    { value: compact.format(audience.accountsReached), label: t("card_fig_reach") },
    { value: new Intl.NumberFormat(locale, { style: "percent" }).format(audience.dach / 100), label: t("card_fig_dach") },
  ];

  // On its own page the name is the page's heading; in the portfolio the hero has that.
  const Name = standalone ? "h1" : "p";
  // On its own page the card arrives on load; in the portfolio, when it scrolls into view.
  const entrance = calm
    ? { initial: false as const }
    : standalone
      ? {
          // Laid on the table and turned towards the viewer: a quarter-lean in
          // depth, a little low and small, settling flat. Its copy is on screen
          // from the first paint, only softened.
          initial: { opacity: 0.6, y: 48, rotateX: 22, rotateY: -24, scale: 0.94 },
          animate: { opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1 },
          transition: { duration: 1.6, ease: EASE, delay: 0.1 },
        }
      : {
          initial: { opacity: 0, y: 56, rotateX: 24, rotateY: -24, scale: 0.94 },
          whileInView: { opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 1.6, ease: EASE },
        };

  return (
    <div className={styles.root}>
      <div className={styles.modes} role="group" aria-label={t("card_mode_label")}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={styles.mode}
            aria-pressed={mode === m}
            onClick={() => chooseMode(m)}
          >
            {t(m === "business" ? "card_mode_business" : "card_mode_personal")}
          </button>
        ))}
      </div>

      <div ref={stage} className={styles.stage} onPointerMove={followMouse} onPointerLeave={releaseMouse}>
        <motion.div className={styles.enter} {...entrance} onAnimationComplete={() => setArrived(true)}>
          <div ref={lean} className={styles.lean}>
            <div ref={flipper} className={styles.flipper}>
              {/* ---------- Front ---------- */}
              <div className={`${styles.face} ${styles.front}`} inert={flipped}>
                <button
                  ref={frontTurn}
                  type="button"
                  className={styles.turn}
                  onClick={turn}
                  aria-label={t("card_flip_front")}
                >
                  <span className={styles.turnHint} aria-hidden="true">
                    <QrCode size={13} strokeWidth={1.5} />
                    {t("card_hint_front")}
                  </span>
                </button>

                <div className={styles.photo}>
                  <Image
                    src="/card/atilla.webp"
                    alt={t("card_photo_alt")}
                    fill
                    priority={standalone}
                    sizes="(max-width: 480px) 92vw, 380px"
                    className={styles.photoImage}
                  />
                </div>

                <p className={styles.eyebrow}>{t(business ? "card_business_eyebrow" : "card_eyebrow")}</p>

                <div className={styles.frontBody}>
                  <div className={styles.identity}>
                    <BrandMark className={styles.mark} />
                    <Name className={styles.name}>
                      <BrandWordmark className={styles.wordmark} fill="url(#card-foil)">
                        <defs>
                          <linearGradient ref={foil} id="card-foil" x1="0" y1="0" x2="1" y2="0.4" spreadMethod="reflect">
                            <stop offset="0" className={styles.foilDeep} />
                            <stop offset="0.28" className={styles.foilLight} />
                            <stop offset="0.46" className={styles.foilShine} />
                            <stop offset="0.62" className={styles.foilBase} />
                            <stop offset="0.84" className={styles.foilLight} />
                            <stop offset="1" className={styles.foilDeep} />
                          </linearGradient>
                        </defs>
                      </BrandWordmark>
                    </Name>
                    <p className={styles.role}>{t("mk_about_role")}</p>
                    {business ? (
                      <dl className={styles.figures}>
                        {figures.map((figure) => (
                          <div key={figure.label} className={styles.figure}>
                            <dt className={styles.figureLabel}>{figure.label}</dt>
                            <dd className={styles.figureValue}>{figure.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className={styles.cities}>{t("card_cities")}</p>
                    )}
                  </div>

                  <ul className={styles.links}>
                    {links.map(({ key, href, external, label, value, Icon, long }) => (
                      <li key={key}>
                        <a
                          href={href}
                          className={styles.link}
                          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          <span className={styles.linkIcon} aria-hidden="true">
                            <Icon />
                          </span>
                          <span className={styles.linkText}>
                            <span className={styles.linkLabel}>{label}</span>
                            <span className={`${styles.linkValue} ${long ? styles.linkValueLong : ""}`}>{value}</span>
                          </span>
                          <ArrowUpRight className={styles.linkArrow} size={14} strokeWidth={1.5} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>

                  <p className={styles.coords}>{formatCoords(BASE)}</p>
                </div>

                <span className={styles.holo} aria-hidden="true" />
                <span className={styles.sheen} aria-hidden="true" />
                {/* A light passes over the foil once the card has arrived, and again with each turn. */}
                {arrived && !calm && (
                  <span
                    key={turns}
                    className={styles.glint}
                    style={{ animationDelay: turns === 0 ? "0.1s" : "0.5s" }}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* ---------- Back ---------- */}
              <div className={`${styles.face} ${styles.back}`} inert={!flipped}>
                <button
                  ref={backTurn}
                  type="button"
                  className={styles.turn}
                  onClick={turn}
                  aria-label={t("card_flip_back")}
                >
                  <span className={styles.turnHint} aria-hidden="true">
                    <RotateCcw size={13} strokeWidth={1.5} />
                    {t("card_hint_back")}
                  </span>
                </button>

                <div className={styles.backBody}>
                  <div className={styles.backTop}>
                    <BrandMark className={styles.backMark} />
                    <p className={styles.backEyebrow}>{t("card_scan")}</p>
                  </div>

                  <div className={styles.qr}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${activeLang}-${target}`}
                        className={styles.qrCode}
                        role="img"
                        aria-label={fill(t("card_qr_label"), { target: targetName })}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: EASE }}
                        // Drawn by qr.ts from the server's matrix; no input reaches it.
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                    </AnimatePresence>
                  </div>

                  <div className={styles.qrCaption}>
                    <p className={styles.qrTitle}>{targetName}</p>
                    <p className={styles.qrUrl}>{shown}</p>
                  </div>

                  <div className={styles.targets} role="group" aria-label={t("card_qr_group")}>
                    {MODE_TARGETS[mode].map((key) => {
                      const { label, Icon } = TARGETS[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          className={styles.target}
                          aria-pressed={key === target}
                          aria-label={t(label)}
                          onClick={() => setTarget(key)}
                        >
                          <Icon />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <span className={styles.sheenLight} aria-hidden="true" />
              </div>
            </div>
          </div>
        </motion.div>
        <div ref={floor} className={styles.floor} aria-hidden="true" />
      </div>

      <div className={styles.actions}>
        {inApp && (
          <p className={styles.inApp}>
            <Compass size={15} strokeWidth={1.5} aria-hidden="true" />
            <span>{t("card_inapp")}</span>
            <a href={inBrowser(origin + window.location.pathname, platform)} className={styles.inAppLink}>
              {t("card_inapp_open")}
            </a>
          </p>
        )}
        {/* A plain link: the file is a download, not a page to route to. */}
        <a href={saveHref} className={styles.primary}>
          <UserPlus size={16} strokeWidth={1.5} aria-hidden="true" />
          {t("card_save")}
        </a>
        {walletHref && (
          // Plain links: Safari opens the .pkpass in Wallet; Google's goes via its save page.
          <a href={walletHref} className={styles.secondary}>
            <Wallet size={16} strokeWidth={1.5} aria-hidden="true" />
            {t("card_wallet")}
          </a>
        )}
        <button
          type="button"
          className={styles.secondary}
          onPointerDown={() => void loadStory()}
          onClick={shareStory}
        >
          <InstagramIcon />
          {t("card_story")}
        </button>
        {storyNote && <p className={styles.storyNote}>{t("card_story_note")}</p>}
        <button type="button" className={styles.secondary} onClick={share}>
          {copied ? (
            <Check size={16} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Share2 size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
          {copied ? t("card_copied") : t("card_share")}
        </button>
      </div>
      <p className={styles.srOnly} aria-live="polite">
        {copied ? t("card_copied") : ""}
      </p>
    </div>
  );
}
