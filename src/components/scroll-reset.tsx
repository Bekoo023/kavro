"use client";

import { useEffect } from "react";

/**
 * Bij herladen altijd bovenaan beginnen. Browsers onthouden standaard de
 * scrollpositie (en springen naar een #anker in de adresbalk); voor deze
 * one-pager is "bovenaan bij de hero" verwachter. Een nieuw bezoek via een
 * deellink als /#faq springt nog wel gewoon naar die sectie.
 */
export function ScrollReset() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type !== "reload") return;
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return null;
}
