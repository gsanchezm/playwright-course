// ============================================================
// M07 — Setup API: login por HTTP, token sembrado en localStorage
// ============================================================
// Mismo resultado que auth.ui.setup.ts (una sesión guardada), pero
// SIN abrir el formulario de login:
//   1) AuthService (el de M06) hace POST /api/auth/login → token.
//   2) Sembramos en localStorage LO MISMO que el SPA escribe cuando
//      alguien inicia sesión por la UI (mismas claves, misma forma).
//   3) context.storageState() lo guarda en .auth/user.api.json.
//
// Claves que el SPA escribe al hacer login por UI (descubiertas
// inspeccionando origins[].localStorage de .auth/user.ui.json):
//   token              → el JWT
//   username           → "standard_user"
//   countryCode        → "MX"
//   omnipizza-auth     → {"state":{"token","username","behavior"},"version":0}
//   omnipizza-country  → {"state":{"countryCode","countryInfo":null,
//                          "language","locale","currency"},"version":0}
// `omnipizza-auth` es el store (zustand persist) que la app lee para
// saber si hay sesión: sin él, te manda de vuelta al login.
// ============================================================

import { test as setup, expect } from "../../fixtures/omnipizza";
import { AuthService } from "../../services";
import type { LoginResponse } from "../../types";
import { API_AUTH_FILE } from "./auth.paths";

setup("authenticate via API", async ({ page, request, standardUser, defaultMarket, baseURL }) => {
  // Render (free tier) duerme el backend tras 15 min. Presupuesto del cold start:
  // calentar backend (hasta 85 s) + cargar frontend (hasta 85 s) → 180 s de test.
  setup.setTimeout(180_000);

  // 1) Login por API con el AuthService de M06 (apunta al backend).
  const apiURL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

  //    Calentar el backend: AuthService crea su propio contexto, que NO hereda
  //    los timeouts del config (30s por defecto) ni el setTimeout del test. Con
  //    el backend dormido, este GET con timeout explícito absorbe el cold start
  //    y el login ya llega a un servidor despierto. (AuthService queda intacto.)
  await request.get(`${apiURL}/api/pizzas`, { timeout: 85_000 });
  const auth = await AuthService.create(apiURL);
  let login: LoginResponse & { behavior?: string };
  try {
    login = (await auth.login(standardUser)) as LoginResponse & { behavior?: string };
  } finally {
    await auth.dispose(); // M06: SIEMPRE dispose del contexto HTTP
  }
  const token = login.access_token;
  const username = login.username ?? standardUser.username;
  const behavior = login.behavior ?? "standard";
  expect(token).toBeTruthy();

  // 2) Abrir el origen del frontend (localStorage es por origen) y sembrar
  //    exactamente lo que el SPA escribiría tras un login por UI.
  await page.goto(baseURL!, { timeout: 85_000 }); // frontend también puede estar dormido
  await page.evaluate(
    ({ token, username, behavior, market }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("countryCode", market.code);
      localStorage.setItem(
        "omnipizza-auth",
        JSON.stringify({ state: { token, username, behavior }, version: 0 }),
      );
      localStorage.setItem(
        "omnipizza-country",
        JSON.stringify({
          state: {
            countryCode: market.code,
            countryInfo: null,
            language: "es", // MX-específico: markets.json no trae idioma/locale
            locale: "es-MX",
            currency: market.currency,
          },
          version: 0,
        }),
      );
    },
    { token, username, behavior, market: defaultMarket },
  );

  // 3) Guardar el badge. Mismo storageState que el setup UI, otro archivo.
  await page.context().storageState({ path: API_AUTH_FILE });
});
