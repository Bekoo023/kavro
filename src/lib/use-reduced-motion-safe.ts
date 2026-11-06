"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

const subscribeNoop = () => () => {};

/**
 * `useReducedMotion`, maar hydratie-veilig: op de server en tijdens hydratie altijd
 * `false` (zodat de markup gelijk blijft), daarna de echte voorkeur van de bezoeker.
 */
export function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const reduce = useReducedMotion();
  return hydrated && !!reduce;
}
