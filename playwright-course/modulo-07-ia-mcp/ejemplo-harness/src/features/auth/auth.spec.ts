// ============================================================
// features/auth/auth.spec.ts — pruebas de la slice de autenticación
// ============================================================
// Demuestra los dos caminos de login del harness:
//  1) por UI, vía el AuthFlow (Facade) con su estrategia por defecto;
//  2) por API, usando ApiLoginStrategy (Strategy) directamente.
// Todo con assertions web-first; sin waitForTimeout.
// ============================================================

import { test, expect } from "../../shared/fixtures";
import { env } from "../../core/env";
import { ApiLoginStrategy } from "../../core/auth/LoginStrategy";
import { UserFactory } from "./auth.factory";

test.describe("auth", () => {
  test("@smoke login por UI aterriza en /catalog", async ({
    page,
    authPage,
    authFlow,
    standardUser,
    defaultMarket,
  }) => {
    // Precondición: la pantalla de login cargó.
    await authPage.goto();
    await authPage.expectLoaded();

    // El flow oculta el "cómo": por defecto usa la estrategia de UI.
    await authFlow.loginAs(standardUser, defaultMarket.code);

    // Web-first: el login válido debe llevarnos al catálogo.
    await expect(page).toHaveURL(/\/catalog/);
  });

  test("@smoke login por API devuelve un token", async () => {
    // Estrategia de API directa: no toca la UI, pega a /api/auth/login.
    const strategy = new ApiLoginStrategy(env.apiURL);
    const user = UserFactory.standard();

    const { token } = await strategy.authenticate(user, "MX");

    // El backend debe devolver un JWT no vacío.
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
  });
});
