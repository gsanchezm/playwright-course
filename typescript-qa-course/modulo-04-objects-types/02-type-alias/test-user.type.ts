// ============================================================
// Mini-clase 4.2 — Tipo: TestUser
// ============================================================
// El "molde" reutilizable para un usuario de prueba.
// Otros archivos importan este type para tipar sus datos.
// ============================================================

export type TestUser = {
  username: string;
  password: string;
  isActive: boolean;
};
