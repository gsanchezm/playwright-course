// ============================================================
// tests/api/with-fixtures/auth.spec.ts — la MISMA suite de
// auth.spec.ts, refactorizada a fixtures (M07 — Paso 9 bis)
// ============================================================
// Compara este archivo con ../auth.spec.ts línea por línea:
// el `beforeAll`/`afterAll` + `users.find(...)` manual desaparecen,
// reemplazados por `{ authService, standardUser }` como parámetros
// del test. Ver README → Paso 9 bis para el porqué.
// ============================================================

import { test, expect } from "../../../fixtures/api";

test.describe("AuthService @api (con fixtures)", () => {
  test("successful login returns access_token", async ({
    authService,
    standardUser,
  }) => {
    const res = await authService.login(standardUser);
    expect(res.access_token).toBeTruthy();
    expect(typeof res.access_token).toBe("string");
  });

  test("login with invalid password fails", async ({
    authService,
    standardUser,
  }) => {
    await expect(
      authService.login({ ...standardUser, password: "wrong-password" }),
    ).rejects.toThrow(/Login failed/);
  });
});
