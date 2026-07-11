// ============================================================
// features/catalog/catalog.api.spec.ts — capa de API (Service/Adapter)
// ============================================================
// Corre SÓLO en el project "api" (testMatch *.api.spec.ts), SIN browser.
// Ejercita el Service layer de punta a punta: login por API para obtener
// el token y luego CatalogService.list() con Bearer + X-Country-Code.
// Es la otra mitad del framework (API) que complementa los specs de UI.
// ============================================================

import { test, expect } from "../../shared/fixtures";
import { env } from "../../core/env";
import type { CountryCode } from "../../shared/types";
import { AuthService } from "../auth/auth.service";
import { CatalogService } from "./catalog.service";

test.describe("catalog API @api", () => {
  test("lista las pizzas del mercado por defecto vía API", async ({ standardUser }) => {
    // 1) Login por API: obtenemos el token sin pasar por la UI.
    const auth = await AuthService.create(env.apiURL);
    try {
      const { access_token } = await auth.login(standardUser);

      // 2) Service/Adapter: lista el catálogo con Bearer + X-Country-Code.
      const catalog = await CatalogService.create(
        env.apiURL,
        access_token,
        env.country as CountryCode,
      );
      try {
        const pizzas = await catalog.list();
        expect(pizzas.length).toBeGreaterThan(0);
      } finally {
        // Cierra el APIRequestContext para no filtrar conexiones.
        await catalog.dispose();
      }
    } finally {
      await auth.dispose();
    }
  });
});
