// ============================================================
// tests/setup/auth.setup.ts — Login vía API (M04)
// ============================================================
// Analogía QA: el proceso de "registro en recepción". Se hace
// UNA SOLA VEZ al llegar; todos los TCs posteriores entran con
// el badge (storageState) ya emitido.
//
// Corre como project "setup" gracias al patrón 2026 de Playwright:
//   - project: { name: "setup", testMatch: /.*\.setup\.ts/ }
//   - los demás projects declaran `dependencies: ["setup"]`
//
// Ventajas vs globalSetup con UI login:
//   ✅ Mucho más rápido (1 POST vs navegación completa)
//   ✅ Determinista (sin flakiness de UI)
//   ✅ Reutilizable — el mismo pattern para admin, user, etc.
// ============================================================

import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const AUTH_DIR = ".auth";
const USER_FILE = path.join(AUTH_DIR, "user.json");

const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";
const BASE_URL = process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com";
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

setup.describe.configure({ mode: "serial" });

setup.beforeAll(() => {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
});

setup("wake up backend (warmup cold start)", async ({ request }) => {
  // Render free tier duerme el backend después de 15 min.
  // Este setup hace el primer request del día y garantiza que
  // todos los tests que siguen tengan el backend despierto.
  setup.setTimeout(90_000);
  const res = await request.get(`${API_URL}/health`, { timeout: 80_000 });
  expect(res.ok(), "backend /health debe responder 200").toBeTruthy();
});

setup("authenticate as standard_user", async ({ browser, request }) => {
  // 1. Login vía API para obtener el token.
  const apiRes = await request.post(`${API_URL}/api/auth/login`, {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(apiRes.ok(), `login API debe ser 200. Status: ${apiRes.status()}`).toBeTruthy();
  const { access_token } = (await apiRes.json()) as { access_token: string };
  expect(access_token, "debe venir access_token en la respuesta").toBeTruthy();

  // 2. Abrir un contexto de navegador y sembrar la sesión.
  //    OmniPizza persiste el token en localStorage — lo escribimos ahí.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE_URL);

  await page.evaluate(([token, username]) => {
    window.localStorage.setItem("access_token", token);
    window.localStorage.setItem("username", username);
  }, [access_token, USERNAME]);

  // 3. Persistir el storageState para todos los projects UI.
  await context.storageState({ path: USER_FILE });
  await context.close();
});
