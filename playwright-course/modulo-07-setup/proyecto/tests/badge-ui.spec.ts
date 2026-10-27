// ============================================================
// M07 — El badge creado por UI deja la sesión activa
// ============================================================
// Corre SOLO en el project `chromium-ui-badge` (depende de
// `setup-ui`, storageState `.auth/user.ui.json`).
// ============================================================

import fs from "node:fs";
import { test, expect } from "../fixtures/omnipizza";
import { API_AUTH_FILE, UI_AUTH_FILE } from "./setup/auth.paths";

test.describe("Badge UI (M07)", () => {
  test("badge UI deja sesión activa @smoke", async ({ page, catalogPage }) => {
    await page.goto("/catalog");
    await expect(page).toHaveURL(/\/catalog/);
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });

  test("el badge UI existe y vive en una ruta distinta al badge API", async () => {
    expect(UI_AUTH_FILE).not.toBe(API_AUTH_FILE);
    expect(fs.existsSync(UI_AUTH_FILE)).toBe(true);
  });
});
