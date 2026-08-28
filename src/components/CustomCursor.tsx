"use client";

import React, { useEffect, useState } from "react";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [hoverText, setHoverText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

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
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      setRingPos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={isHovering ? styles.cursorHover : ""}>
      <div
        className={styles.cursorDot}
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      />
      <div
        className={styles.cursorRing}
        style={{ left: `${ringPos.x}px`, top: `${ringPos.y}px` }}
      >
        {hoverText && <span className={styles.cursorText}>{hoverText}</span>}
      </div>
    </div>
  );
}
