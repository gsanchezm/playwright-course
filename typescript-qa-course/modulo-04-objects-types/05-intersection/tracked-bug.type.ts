// ============================================================
// Mini-clase 4.5 — Tipo: TrackedBug (intersection: BugReport & HasTimestamp)
// ============================================================
// Reutilizamos BugReport del ejercicio 4.3 — por eso el import
// cruza a la subcarpeta vecina "../03-optional-props/...".
// ============================================================

import type { BugReport } from "../03-optional-props/bug-report.type";
import type { HasTimestamp } from "./timestamp.type";

// Intersection: el tipo resultante cumple AMBOS contratos.
export type TrackedBug = BugReport & HasTimestamp;
