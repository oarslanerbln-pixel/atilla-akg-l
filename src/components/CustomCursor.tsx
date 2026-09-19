"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./CustomCursor.module.css";

/**
 * Bespoke cursor: a dot pinned to the pointer and a ring that eases after it.
 *
 * The positions deliberately never enter React state. The earlier version
 * called setState on every mousemove *and* on every animation frame, so the
 * component re-rendered roughly sixty times a second for as long as the
 * pointer was on the page — for two elements whose only change is a transform.
 * Coordinates are written straight to the nodes instead, and state is reserved
 * for the things that genuinely change the markup: visibility and the label.
 */
export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverText, setHoverText] = useState("");

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on devices with fine pointer (mouse)
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFinePointer) return;

    document.body.classList.add("has-custom-cursor");

    let animationFrameId: number;
    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "a, button, [role='button'], input, textarea, video, .clickable, [data-cursor]"
      );

      if (interactive) {
        setIsHovering(true);
        const customText = interactive.getAttribute("data-cursor");
        if (customText) {
          setHoverText(customText);
        } else if (interactive.tagName.toLowerCase() === "video" || interactive.closest("[data-video]")) {
          setHoverText("PLAY");
        } else if (interactive.tagName.toLowerCase() === "a" || interactive.tagName.toLowerCase() === "button") {
          setHoverText("VIEW");
        } else {
          setHoverText("");
        }
      } else {
        setIsHovering(false);
        setHoverText("");
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const render = () => {
      // Smooth lerp for ring
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;

      // Written as custom properties, not as `transform`, so the stylesheet
      // keeps ownership of the -50% centring offset and the hover state.
      if (dotRef.current) {
        dotRef.current.style.setProperty("--cx", `${targetX}px`);
        dotRef.current.style.setProperty("--cy", `${targetY}px`);
      }
      if (ringRef.current) {
        ringRef.current.style.setProperty("--cx", `${ringX}px`);
        ringRef.current.style.setProperty("--cy", `${ringY}px`);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={isHovering ? styles.cursorHover : ""} aria-hidden="true">
      <div ref={dotRef} className={styles.cursorDot} />
      <div ref={ringRef} className={styles.cursorRing}>
        {hoverText && <span className={styles.cursorText}>{hoverText}</span>}
      </div>
    </div>
  );
}
