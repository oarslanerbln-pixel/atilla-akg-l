"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { ArrowUpRight, Check, Globe, IdCard, QrCode, RotateCcw, Share2, UserPlus } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import BrandWordmark from "@/components/BrandWordmark";
import { InstagramIcon, WhatsAppIcon } from "@/components/SocialIcons";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { fill } from "@/i18n/format";
import type { Language, TranslationKeys } from "@/i18n/translations";
import { LANGUAGES, pagePath } from "@/lib/locales";
import { BASE, formatCoords } from "@/lib/partners";
import { businessCard, socialProfiles } from "@/lib/site";
import { PAGE_QR_COLORS, QR_TARGETS, prettyUrl, qrSvg, type CardCodes, type QrTarget } from "./qr";
import styles from "./CardPage.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

const TARGETS: Record<QrTarget, { label: TranslationKeys; Icon: ComponentType<{ className?: string }> }> = {
  card: { label: "card_qr_card", Icon: IdCard },
  whatsapp: { label: "card_qr_whatsapp", Icon: WhatsAppIcon },
  instagram: { label: "card_qr_instagram", Icon: InstagramIcon },
  web: { label: "card_qr_web", Icon: Globe },
};

/**
 * /card — the digital business card, in DE, EN and TR.
 *
 * One card on a gallery wall. The front is the person: the lounge portrait,
 * the outlined wordmark in gold foil, and the three ways to reach him
 * (WhatsApp, Instagram, the website) as real links. Tapping anywhere else on
 * it turns it over; the back is porcelain with one QR code, which the visitor
 * points at this card, WhatsApp, Instagram or the website, so a person
 * standing opposite can scan whichever they need. Below the card: the contact
 * file (/atilla-barbarossa.vcf) and the share sheet.
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
 * buttons landed on the card's container or on the front behind it. At rest
 * the card is now always flat.
 *
 * With a mouse the card leans towards the pointer and the foil catches the
 * light; on touch and for calm visitors it stays still. Nothing here loads
 * from a third party: the codes are drawn from matrices computed on the
 * server, the portrait ships from public/.
 */
export default function CardPage({ codes }: { codes: CardCodes }) {
  const { t, activeLang, setActiveLang } = useLanguage();
  const calm = usePrefersCalm();
  const [flipped, setFlipped] = useState(false);
  const [flipper, animate] = useAnimate<HTMLDivElement>();
  const turning = useRef(false);
  const [target, setTarget] = useState<QrTarget>("card");
  const [turns, setTurns] = useState(0);
  const [copied, setCopied] = useState(false);
  const lean = useRef<HTMLDivElement>(null);
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

  const turn = async () => {
    if (turning.current) return;
    turning.current = true;
    followTurn.current = true;
    const toBack = !flipped;
    setTurns((n) => n + 1);
    if (!calm && flipper.current) {
      // Front to back swings left, back to front swings right.
      const edge = toBack ? -90 : 90;
      await animate(flipper.current, { rotateY: edge }, { duration: 0.32, ease: [0.55, 0, 0.8, 0.3] });
      setFlipped(toBack);
      await animate(flipper.current, { rotateY: [-edge, 0] }, { duration: 0.85, ease: EASE });
    } else {
      setFlipped(toBack);
    }
    turning.current = false;
  };

  const tiltTo = (event: PointerEvent<HTMLDivElement>) => {
    const el = lean.current;
    if (!el || calm || event.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    const clamp = (n: number) => Math.max(-1, Math.min(1, n));
    el.style.setProperty("--lean-x", clamp(((event.clientX - box.left) / box.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--lean-y", clamp(((event.clientY - box.top) / box.height) * 2 - 1).toFixed(3));
    el.dataset.leaning = "";
  };

  const settle = () => {
    const el = lean.current;
    if (!el) return;
    el.style.setProperty("--lean-x", "0");
    el.style.setProperty("--lean-y", "0");
    delete el.dataset.leaning;
  };

  // In place, like the other switchers; the address follows.
  const chooseLang = (choice: Language) => {
    setActiveLang(choice);
    window.history.replaceState(null, "", pagePath("card", choice));
  };

  const entry = codes[activeLang][target];
  const svg = useMemo(() => qrSvg(entry.matrix, PAGE_QR_COLORS), [entry]);
  const shown =
    target === "whatsapp"
      ? businessCard.whatsappDisplay
      : target === "instagram"
        ? businessCard.instagramHandle
        : prettyUrl(entry.url);
  const targetName = t(TARGETS[target].label);

  const share = async () => {
    const url = codes[activeLang].card.url;
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

  const whatsappHref = `https://wa.me/${businessCard.whatsapp}?text=${encodeURIComponent(t("whatsapp_message"))}`;
  const links = [
    {
      key: "whatsapp",
      href: whatsappHref,
      external: true,
      label: t("card_qr_whatsapp"),
      value: businessCard.whatsappDisplay,
      Icon: WhatsAppIcon,
    },
    {
      key: "instagram",
      href: socialProfiles.instagram,
      external: true,
      label: t("card_qr_instagram"),
      value: businessCard.instagramHandle,
      Icon: InstagramIcon,
    },
    {
      key: "web",
      href: pagePath("home", activeLang),
      external: false,
      label: t("card_qr_web"),
      // The domain alone, as printed cards give it; the link opens the portfolio in the card's language.
      value: prettyUrl(new URL(codes[activeLang].web.url).origin),
      Icon: Globe,
    },
  ] as const;

  return (
    <>
      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <Link href={pagePath("home", activeLang)} className={styles.brand}>
            <BrandMark className={styles.brandMark} />
            <BrandWordmark className={styles.brandWordmark} />
          </Link>
          <div className={styles.langs} role="group" aria-label={t("pkg_lang_label")}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                className={styles.lang}
                aria-pressed={activeLang === lang}
                onClick={() => chooseLang(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className={styles.page}>
        <div className={styles.stage} onPointerMove={tiltTo} onPointerLeave={settle}>
          <motion.div
            className={styles.enter}
            initial={calm ? false : { opacity: 0.6, y: 36, rotateX: 16 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.1 }}
          >
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
                      priority
                      sizes="(max-width: 480px) 92vw, 380px"
                      className={styles.photoImage}
                    />
                  </div>

                  <p className={styles.eyebrow}>{t("card_eyebrow")}</p>

                  <div className={styles.frontBody}>
                    <div className={styles.identity}>
                      <BrandMark className={styles.mark} />
                      <h1 className={styles.name}>
                        <BrandWordmark className={styles.wordmark} fill="url(#card-foil)">
                          <defs>
                            <linearGradient id="card-foil" x1="0" y1="0" x2="1" y2="0.4">
                              <stop offset="0" className={styles.foilDeep} />
                              <stop offset="0.28" className={styles.foilLight} />
                              <stop offset="0.46" className={styles.foilShine} />
                              <stop offset="0.62" className={styles.foilBase} />
                              <stop offset="0.84" className={styles.foilLight} />
                              <stop offset="1" className={styles.foilDeep} />
                            </linearGradient>
                          </defs>
                        </BrandWordmark>
                      </h1>
                      <p className={styles.role}>{t("mk_about_role")}</p>
                      <p className={styles.cities}>{t("card_cities")}</p>
                    </div>

                    <ul className={styles.links}>
                      {links.map(({ key, href, external, label, value, Icon }) => (
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
                              <span className={styles.linkValue}>{value}</span>
                            </span>
                            <ArrowUpRight className={styles.linkArrow} size={14} strokeWidth={1.5} aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>

                    <p className={styles.coords}>{formatCoords(BASE)}</p>
                  </div>

                  <span className={styles.sheen} aria-hidden="true" />
                  {/* A light passes over the foil once on arrival, and again with each turn. */}
                  {!calm && (
                    <span
                      key={turns}
                      className={styles.glint}
                      style={{ animationDelay: turns === 0 ? "1.1s" : "0.5s" }}
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
                      {QR_TARGETS.map((key) => {
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
          <div className={styles.floor} aria-hidden="true" />
        </div>

        <motion.div
          className={styles.actions}
          initial={calm ? false : { opacity: 0.6, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.45 }}
        >
          {/* A plain link: the file is a download, not a page to route to. */}
          <a href="/atilla-barbarossa.vcf" className={styles.primary}>
            <UserPlus size={16} strokeWidth={1.5} aria-hidden="true" />
            {t("card_save")}
          </a>
          <button type="button" className={styles.secondary} onClick={share}>
            {copied ? (
              <Check size={16} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Share2 size={16} strokeWidth={1.5} aria-hidden="true" />
            )}
            {copied ? t("card_copied") : t("card_share")}
          </button>
        </motion.div>
        <p className={styles.srOnly} aria-live="polite">
          {copied ? t("card_copied") : ""}
        </p>
      </main>

      <footer className={styles.footer}>
        <nav className={styles.footerLinks} aria-label={t("legal_nav")}>
          <Link href="/impressum">{t("footer_imprint")}</Link>
          <Link href={pagePath("privacy", activeLang)}>{t("footer_privacy")}</Link>
        </nav>
      </footer>
    </>
  );
}
