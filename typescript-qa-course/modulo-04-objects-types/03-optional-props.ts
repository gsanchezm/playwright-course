// ============================================================
// Mini-clase 4.3: Propiedades opcionales
// ============================================================
// Analogía: Un bug report donde algunos campos son obligatorios
// (id, title) y otros pueden faltar (assignee, screenshot).
// ============================================================

// "?" marca una propiedad como opcional.
export type BugReport = {
  id: number;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignee?: string;           // puede no estar asignado aún
  screenshot?: string | null;  // opcional Y puede ser null
};

export const bug: BugReport = {
  id: 1042,
  title: "Submit button unresponsive on mobile",
  severity: "HIGH",
  // assignee se omite porque es opcional
  screenshot: null,
};

console.log("\n===== 4.3 propiedades opcionales =====");
console.log(`Bug #${bug.id}: ${bug.title} [${bug.severity}]`);
console.log(`Asignado a: ${bug.assignee ?? "sin asignar"}`);
