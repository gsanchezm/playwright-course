// ============================================================
// Mini-clase 4.3 — Datos: bugs de ejemplo
// ============================================================
// Importamos el type y lo usamos para tipar un bug concreto.
// ============================================================

import type { BugReport } from "./bug-report.type";

export const bug: BugReport = {
  id: 1042,
  title: "Submit button unresponsive on mobile",
  severity: "HIGH",
  // assignee se omite porque es opcional
  screenshot: null,
};
