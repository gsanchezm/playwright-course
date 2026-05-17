// ============================================================
// 🚩 Reto M04 — Admin setup + project paralelo + mock con latencia
// ============================================================
// Tiene DOS partes independientes:
//
//   PARTE A — Crear un setup project para el rol "admin":
//     · `tests/setup/admin.setup.ts` con login de admin_user
//     · `.auth/admin.json` como storageState distinto
//     · project `ui-admin-chromium` en playwright.config.ts
//
//   PARTE B — Mock con latencia y validar el skeleton/loader:
//     · usar page.route() + setTimeout + route.continue()
//     · validar que el UI muestra el spinner durante la espera
// ============================================================
//
// 🧰 Pre-requisitos:
//   ✔ pnpm test:setup pasa y existe .auth/user.json
//   ✔ pnpm m4 corre en verde
//   ✔ Conoces fixtures/omnipizza.ts y sabes qué hace `dependencies`
//
// ▶ Cómo correr SOLO este reto (parte B):
//   pnpm exec playwright test modulo-04-setup-fixtures/reto.spec.ts \
//     --headed --project=ui-chromium
//
//   Para la parte A, primero tendrás un NUEVO project (ui-admin-chromium)
//   y correrás:
//     pnpm exec playwright test --project=ui-admin-chromium
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

// ============================================================
// PARTE A — Admin setup project
// ============================================================
test.describe("Reto M04 — PARTE A: admin setup", () => {
  test.skip("TODO — implementar admin.setup.ts + ui-admin-chromium", async ({
    page,
  }) => {
    // ────────────────────────────────────────────────────────
    // TODO A1 — Crear `tests/setup/admin.setup.ts`
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Copia `tests/setup/auth.setup.ts` y modifícalo:
    //     · usa el usuario `admin_user` (de data/users.json)
    //     · guarda el storageState en `.auth/admin.json`
    //
    // Pista (esqueleto):
    //   import { test as setup } from "@playwright/test";
    //   import usersJson from "../../data/users.json";
    //   import type { User } from "../../types";
    //
    //   const admin = (usersJson as User[]).find(u => u.username === "admin_user")!;
    //
    //   setup("auth admin", async ({ page, request }) => {
    //     // POST /auth/login con admin
    //     // Guardar storageState en .auth/admin.json
    //   });
    //
    // Cómo verificar:
    //   pnpm exec playwright test tests/setup/admin.setup.ts --project=setup
    //   → genera `.auth/admin.json` (`ls .auth/`).


    // ────────────────────────────────────────────────────────
    // TODO A2 — Añadir el project `ui-admin-chromium` al config
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   En playwright.config.ts, dentro del array `projects`, añade:
    //     {
    //       name: "ui-admin-chromium",
    //       use: { ...devices["Desktop Chrome"], storageState: ".auth/admin.json" },
    //       dependencies: ["setup"],
    //       testIgnore: [/tests\/setup\//, /tests\/api\//, /modulo-05-api-layer\//],
    //     }
    //
    // Cómo verificar:
    //   pnpm exec playwright test --list --project=ui-admin-chromium
    //   → debe listar los tests del módulo sin error.


    // ────────────────────────────────────────────────────────
    // TODO A3 — Validar que el admin ve funcionalidades extra
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Ya autenticado como admin (vía storageState), abre el catálogo
    //   y verifica que aparece un elemento exclusivo de admin
    //   (ej. botón "Admin panel", banner "ADMIN MODE", etc).
    //
    // Pista:
    //   await page.goto("/catalog");
    //   await expect(page.getByTestId("admin-panel-link")).toBeVisible();
    //
    // 💡 Si OmniPizza no expone diferencias visuales entre rol y rol,
    //    valida al menos que el `role` del JWT decodificado es "admin"
    //    (puedes inspeccionar localStorage con page.evaluate).
    expect(true).toBe(true);
  });
});

// ============================================================
// PARTE B — Mock con latencia simulada
// ============================================================
test.describe("Reto M04 — PARTE B: mock con latencia @regression", () => {
  test("respuesta lenta del backend muestra skeleton/loader", async ({
    page,
  }) => {
    // ────────────────────────────────────────────────────────
    // TODO B1 — Registrar el mock con delay artificial
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Interceptar GET /api/pizzas* y antes de dejar pasar el request
    //   al backend real, esperar 3 segundos. Eso simula un backend lento.
    //
    // Pista (ya viene rellenado abajo; léelo, no lo borres):
    await page.route("**/api/pizzas*", async (route) => {
      await new Promise((r) => setTimeout(r, 3_000));
      await route.continue();
    });

    // ────────────────────────────────────────────────────────
    // TODO B2 — Navegar al catálogo
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   page.goto al catálogo. El mock se va a disparar y vas a tener
    //   ~3s de "loading" hasta que el backend real responda.
    //
    // Pista:
    //   await page.goto("/catalog");


    // ────────────────────────────────────────────────────────
    // TODO B3 — Validar que el skeleton/loader aparece
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   ANTES de que las pizzas reales aparezcan (en los primeros
    //   ~3 segundos), debe ser visible un indicador de carga. Su
    //   testid puede ser `catalog-loading`, `skeleton-card`, etc.
    //
    // Pista (ajusta el testid al DOM real de OmniPizza):
    //   await expect(page.getByTestId("catalog-loading")).toBeVisible();
    //
    // 💡 Si OmniPizza no muestra un skeleton, este reto te enseña algo:
    //    abre un bug. Las cargas largas SIN feedback visual son un
    //    defecto de UX clásico — esa es la conversación QA↔UX.


    // ────────────────────────────────────────────────────────
    // TODO B4 — Validar que tras los 3s, las pizzas aparecen
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Esperar a que aparezcan tarjetas reales de pizza
    //   (el mock dejó pasar el request, así que el backend responde
    //    tarde pero responde).
    //
    // Pista:
    //   const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
    //   await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
    //
    // Criterio de éxito:
    //   El test pasa. La duración total será ≥ 3s.


    // Placeholder para que el TS compile aunque no hayas terminado.
    await expect(page.locator("body")).toBeVisible();
  });
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. PARTE A — ¿Cuántos archivos tocaste para añadir el rol admin?
//      (Esperado: 2 — `admin.setup.ts` + `playwright.config.ts`.)
//
//   2. PARTE A — ¿Cómo evitarías duplicar el código de
//      `auth.setup.ts` y `admin.setup.ts`? Pista: una función
//      `loginAndSave(user, path)` en `helpers/`.
//
//   3. PARTE B — Si el mock NO existiera (latencia real del backend),
//      ¿el test sería determinista? (Esperado: NO — el tiempo real
//      varía. Por eso mockeamos.)
//
// 👉 En M05 vas a ver la otra cara de la moneda: en lugar de
//    mockear UI, vas a probar la API DIRECTAMENTE con servicios
//    tipados (BaseService abstracta + factory pattern).
// ============================================================
