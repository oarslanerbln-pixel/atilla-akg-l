"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { Check, Copy, Nfc } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fill } from "@/i18n/format";
import { prettyUrl } from "./qr";
import styles from "./NfcWriter.module.css";

/** The part of Web NFC used here; not yet in TypeScript's DOM types. */
type NdefReader = { write(message: { records: { recordType: "url"; data: string }[] }): Promise<void> };
type NdefWindow = Window & { NDEFReader?: new () => NdefReader };

const noSubscribe = () => () => {};
const canWrite = () => "NDEFReader" in window;

type Status = { kind: "idle" | "waiting" | "done" } | { kind: "error"; message: string };

/**
 * The owner's tool for physical NFC cards, at /card#nfc: a phone held to the
 * card opens the business card page, with no app. A web page cannot make the
 * phone itself act as an NFC tag; a blank card or sticker (NTAG213/215/216)
 * carries the address instead.
 *
 * Chrome on Android writes the tag from here with Web NFC (one tap, then the
 * card against the phone). Every other browser, the iPhone's included, gets
 * the steps for the free NFC Tools app and the address to paste. Nothing is
 * sent anywhere: the address goes from this page to the tag.
 */
export default function NfcWriter({
  choices,
  initialChoice = 0,
}: {
  choices: { label: string; url: string }[];
  /** The face the page is showing, so /card/business#nfc starts on the business card. */
  initialChoice?: number;
}) {
  const { t } = useLanguage();
  const name = useId();
  const supported = useSyncExternalStore(noSubscribe, canWrite, () => false);
  const [choice, setChoice] = useState(initialChoice);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const url = choices[choice].url;

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const write = async () => {
    const Reader = (window as NdefWindow).NDEFReader;
    if (!Reader) return;
    setStatus({ kind: "waiting" });
    try {
      await new Reader().write({ records: [{ recordType: "url", data: url }] });
      setStatus({ kind: "done" });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : String(error) });
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // No clipboard; the address is on screen to copy by hand.
    }
  };

  return (
    <section className={styles.panel} aria-labelledby={`${name}-title`}>
      <h2 id={`${name}-title`} className={styles.title}>
        <Nfc size={18} strokeWidth={1.5} aria-hidden="true" />
        {t("nfc_title")}
      </h2>
      <p className={styles.intro}>{t("nfc_intro")}</p>

      <fieldset className={styles.choices}>
        <legend className={styles.legend}>{t("nfc_target")}</legend>
        {choices.map((option, index) => (
          <label key={option.url} className={styles.choice}>
            <input
              type="radio"
              name={name}
              checked={choice === index}
              onChange={() => {
                setChoice(index);
                setStatus({ kind: "idle" });
              }}
            />
            <span className={styles.choiceLabel}>{option.label}</span>
            <span className={styles.choiceUrl}>{prettyUrl(option.url)}</span>
          </label>
        ))}
      </fieldset>

      {supported ? (
        <button type="button" className={styles.write} onClick={write} disabled={status.kind === "waiting"}>
          <Nfc size={16} strokeWidth={1.5} aria-hidden="true" />
          {t("nfc_write")}
        </button>
      ) : (
        <>
          <p className={styles.steps}>{t("nfc_unsupported")}</p>
          <div className={styles.address}>
            <code className={styles.url}>{url}</code>
            <button type="button" className={styles.copy} onClick={copy}>
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copied ? t("nfc_copied") : t("nfc_copy")}
            </button>
          </div>
        </>
      )}

      <p className={styles.status} role="status">
        {status.kind === "waiting" && t("nfc_hold")}
        {status.kind === "done" && fill(t("nfc_done"), { url: prettyUrl(url) })}
        {status.kind === "error" && fill(t("nfc_error"), { message: status.message })}
      </p>
    </section>
  );
}
