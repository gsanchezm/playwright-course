// ============================================================
// Mini-clase 4.2 — Datos: usuarios de prueba
// ============================================================
// Importamos el type desde su archivo hermano.
// Analogía QA: una "fixture" con datos reutilizables para los tests.
// ============================================================

import type { TestUser } from "./test-user.type";

export const adminUser: TestUser = {
  username: "admin@test.com",
  password: "SecurePass123!",
  isActive: true,
};

export const viewerUser: TestUser = {
  username: "viewer@test.com",
  password: "Viewer123!",
  isActive: false,
};
