// ============================================================
// Mini-clase 4.3 — Tipo: BugReport (con propiedades opcionales)
// ============================================================
// "?" marca una propiedad como opcional.
// Analogía QA: un bug report donde algunos campos son obligatorios
// (id, title, severity) y otros pueden faltar (assignee, screenshot).
// ============================================================

export type BugReport = {
  id: number;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignee?: string;           // puede no estar asignado aún
  screenshot?: string | null;  // opcional Y puede ser null
};
