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
//   ✅ Reutilizable — el mismo pattern para otras personas que
//      autentican (problem_user, performance_glitch_user…), no sólo standard.
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
  expect(res.ok(), "backend /health should respond 200").toBeTruthy();
});

// Mercado por defecto que el SPA persiste tras seleccionar la bandera.
// Coincide con el flujo de login por UI (M01 hace click en `market-MX`).
const COUNTRY = process.env.DEFAULT_COUNTRY ?? "MX";

// Mapa de mercado → metadatos que OmniPizza guarda en su store de país.
// Replica lo que el SPA escribe al elegir bandera (idioma/locale/moneda).
const MARKETS: Record<string, { language: string; locale: string; currency: string }> = {
  MX: { language: "es", locale: "es-MX", currency: "MXN" },
  US: { language: "en", locale: "en-US", currency: "USD" },
};

// Decodifica el payload de un JWT sin verificar firma (sólo lectura).
// El token de OmniPizza trae { sub, behavior, exp } — lo necesitamos
// para construir el store de auth igual que el login por UI.
function decodeJwt(token: string): { sub?: string; behavior?: string } {
  const payload = token.split(".")[1] ?? "";
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(normalized, "base64").toString("utf8");
  return JSON.parse(json);
}

setup("authenticate as standard_user", async ({ browser, request }) => {
  // 1. Login vía API para obtener el token (rápido y determinista).
  const apiRes = await request.post(`${API_URL}/api/auth/login`, {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(apiRes.ok(), `login API should be 200. Status: ${apiRes.status()}`).toBeTruthy();
  const { access_token } = (await apiRes.json()) as { access_token: string };
  expect(access_token, "access_token should be present in the response").toBeTruthy();

  // El SPA guarda `username` y `behavior` derivados del token.
  const claims = decodeJwt(access_token);
  const username = claims.sub ?? USERNAME;
  const behavior = claims.behavior ?? "standard";
  const market = MARKETS[COUNTRY] ?? MARKETS.MX;

  // 2. Abrir un contexto de navegador y sembrar la sesión EXACTAMENTE
  //    como lo hace el login por UI. OmniPizza usa Zustand con persist:
  //    la sesión vive en `omnipizza-auth` (objeto { state, version }),
  //    NO en una clave plana `access_token`. El catálogo además exige
  //    un mercado elegido (`omnipizza-country`) o rebota a "/".
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE_URL);

  await page.evaluate(
    ([token, user, beh, countryCode, mkt]) => {
      const { language, locale, currency } = mkt as {
        language: string;
        locale: string;
        currency: string;
      };

      // Store de auth (Zustand persist) — fuente de verdad de la sesión.
      window.localStorage.setItem(
        "omnipizza-auth",
        JSON.stringify({ state: { token, username: user, behavior: beh }, version: 0 }),
      );

      // Store de país — sin un mercado elegido, el guard rebota a "/".
      window.localStorage.setItem(
        "omnipizza-country",
        JSON.stringify({
          state: { countryCode, countryInfo: null, language, locale, currency },
          version: 0,
        }),
      );

      // Mirrors planos que el SPA también escribe en el login por UI.
      window.localStorage.setItem("token", token as string);
      window.localStorage.setItem("username", user as string);
      window.localStorage.setItem("countryCode", countryCode as string);
    },
    [access_token, username, behavior, COUNTRY, market] as const,
  );

  // 3. Persistir el storageState para todos los projects UI.
  await context.storageState({ path: USER_FILE });
  await context.close();
});
