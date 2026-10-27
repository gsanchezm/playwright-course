// ============================================================
// M07 — El badge creado por API deja la sesión activa
// ============================================================
// Corre SOLO en el project `chromium` (depende de `setup-api`,
// storageState `.auth/user.api.json`). Ningún login por UI aquí.
// ============================================================

import fs from "node:fs";
import { test, expect } from "../fixtures/omnipizza";
import { API_AUTH_FILE, UI_AUTH_FILE } from "./setup/auth.paths";

test.describe("Badge API (M07)", () => {
  test("badge API deja sesión activa @smoke", async ({ page, catalogPage }) => {
    // Página nueva, sin pasar por login: el storageState trae la sesión.
    await page.goto("/catalog");
    await expect(page).toHaveURL(/\/catalog/);
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });

  test("el badge API existe y vive en una ruta distinta al badge UI", async () => {
    expect(API_AUTH_FILE).not.toBe(UI_AUTH_FILE);
    expect(fs.existsSync(API_AUTH_FILE)).toBe(true);
  });
});
