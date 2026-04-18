// ============================================================
// Mini-clase 4.5 — Tipo: HasTimestamp
// ============================================================
// Un "mixin" de tiempo que combinaremos con otros tipos vía "&".
// ============================================================

export type HasTimestamp = {
  createdAt: string;
  updatedAt: string;
};
