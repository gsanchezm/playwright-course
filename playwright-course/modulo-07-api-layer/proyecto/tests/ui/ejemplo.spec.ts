// ============================================================
// M06 → M07 — la capa UI sigue viva junto a la nueva capa de API
// ============================================================
// Este spec corre en el project `chromium`, que declara `dependencies: ['setup']`
// + `storageState: '.auth/user.json'`. Antes de ejecutarlo, Playwright
// corre `tests/setup/auth.setup.ts` (login por UI → guarda el badge) y
// este test HEREDA la sesión.
//
// Por qué sigue aquí: M07 SUMA `services/` + `tests/api/` — no
// reemplaza el POM/fixtures/setup de M04-M06. Un framework real no
// tira la suite de UI al agregar la de API.
//
// 🪝 Por qué no repite los widgets de M05/M06: ya se enseñaron dos
// veces (M05 completos en tests/widgets/, M06 con 1 de muestra bajo
// sesión heredada). Repetirlos por tercera vez no prueba nada distinto
// — la técnica de cada widget no cambia porque exista una capa de API
// al lado. Si quieres repasarlos:
// `modulo-05-fixtures/proyecto/tests/widgets/` y
// `modulo-06-setup/proyecto/tests/ejemplo.spec.ts`.
// ============================================================

import { test, expect } from "../../fixtures/omnipizza";

test.describe("Setup & auth — inherited session (M04-M06, still valid in M07)", () => {
  test("lands on /catalog without logging in @smoke", async ({ page, catalogPage }) => {
    // ⚠️ No hay paso de login. El storageState ya trajo la sesión.
    await page.goto("/catalog");

    // Señal de sesión abierta: seguimos en /catalog (no nos rebotó a "/")
    // y el catálogo muestra al menos una pizza — las mismas assertions
    // de CatalogPage que usaste en M04, no locators nuevos.
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });
});
