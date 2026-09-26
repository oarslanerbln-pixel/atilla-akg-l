"use client";

import React, { useEffect, useState } from "react";

const PLACEHOLDER = "--:--:--";

/**
 * Berlin wall-clock, ticking once a second.
 *
 * It lives in its own component because it used to be state on Navbar: every
 * tick re-rendered the header, its navigation list, the language menu and the
 * animated mobile sheet — sixty times a minute, for a string of eight
 * characters. Now only this span re-renders.
 *
 * The placeholder is rendered on the server and on the first client pass, so
 * hydration sees the same markup and the surrounding row does not jump once
 * the real time arrives.
 */
export default function LiveClock({ className }: { className?: string }) {
  const [time, setTime] = useState(PLACEHOLDER);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("de-DE", {
          timeZone: "Europe/Berlin",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {time}
    </span>
  );
}
