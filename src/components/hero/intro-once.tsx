"use client";

import { useEffect } from "react";

let pending: ReturnType<typeof setTimeout> | undefined;

/**
 * Laat de hero-intro alleen bij een echte paginaload spelen. Zodra de hero
 * verdwijnt (navigatie naar een andere pagina) markeren we de intro als gespeeld;
 * komt de bezoeker via client-navigatie terug, dan staat de kop er meteen.
 * De korte timeout vangt de dubbele mount van React Strict Mode op.
 */
export function IntroOnce() {
  useEffect(() => {
    clearTimeout(pending);
    return () => {
      pending = setTimeout(() => {
        document.documentElement.dataset.intro = "played";
      }, 0);
    };
  }, []);
  return null;
}
