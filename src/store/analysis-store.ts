// Lightweight in-memory store for the trained model + last evaluation, shared across routes.
import type { NBModel, EvalResult, Label } from "@/lib/naive-bayes";

type State = {
  model: NBModel | null;
  evaluation: EvalResult | null;
  trainedAt: string | null;
  trainSize: number;
  testSize: number;
  datasetName: string | null;
  totalSamples: number;
  distribution: Record<Label, number>;
};

const initial: State = {
  model: null,
  evaluation: null,
  trainedAt: null,
  trainSize: 0,
  testSize: 0,
  datasetName: null,
  totalSamples: 0,
  distribution: { positif: 0, netral: 0, negatif: 0 },
};

let state: State = initial;
const listeners = new Set<() => void>();

export const analysisStore = {
  get: () => state,
  set: (patch: Partial<State>) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); },
  reset: () => { state = initial; listeners.forEach((l) => l()); },
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
};

import { useSyncExternalStore } from "react";
export function useAnalysis() {
  return useSyncExternalStore(analysisStore.subscribe, analysisStore.get, analysisStore.get);
}
