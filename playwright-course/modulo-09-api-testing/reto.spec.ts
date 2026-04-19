// ============================================================
// 🚩 RETO — Módulo 9: API testing puro
// ============================================================
// Completa los TODOs. Todas las pruebas son 100% API — NO uses
// `page` ni navegador.
// ============================================================

import { test, expect } from '@playwright/test';

const BACKEND_URL = 'https://omnipizza-backend.onrender.com';

// ----------------------------------------------------------------
// Reto 9.1 — GET básicos
//
// Escribe 2 tests:
//   a) GET /health devuelve 200.
//   b) GET /api/countries devuelve 200 y al menos 4 países.
// ----------------------------------------------------------------

test('Reto 9.1a — /health responde 200', async ({ request }) => {
  // TODO
});

test('Reto 9.1b — /api/countries lista al menos 4 mercados', async ({ request }) => {
  // TODO
});

// ----------------------------------------------------------------
// Reto 9.2 — Autenticación con POST
//
// a) POST /api/auth/login con performance_glitch_user/pizza123
//    debe devolver 200 y un access_token.
// b) POST /api/auth/login con un username vacío debe devolver 400 o 422.
// ----------------------------------------------------------------

test('Reto 9.2a — login con performance_glitch_user → 200 + token', async ({ request }) => {
  test.slow(); // el usuario añade delay
  // TODO
});

test('Reto 9.2b — login sin username → 400/422', async ({ request }) => {
  // TODO
});

// ----------------------------------------------------------------
// Reto 9.3 — Endpoint protegido con JWT
//
// 1. Haz login con standard_user y obtén el token.
// 2. Llama GET /api/auth/profile con Authorization: Bearer <token>.
// 3. Verifica que la respuesta contiene el username.
// ----------------------------------------------------------------

test('Reto 9.3 — /api/auth/profile con JWT válido', async ({ request }) => {
  // TODO: login → extract token → GET profile con Authorization
});

// ----------------------------------------------------------------
// Reto 9.4 — Data-driven: pizzas por mercado
//
// Usa forEach sobre los 4 mercados (MX/US/CH/JP). Para cada uno:
//   1. Haz GET /api/pizzas con X-Country-Code=<market>.
//   2. Verifica status 200.
//   3. Verifica que la respuesta contiene datos.
// ----------------------------------------------------------------

const markets = ['MX', 'US', 'CH', 'JP'];

markets.forEach((market) => {
  test(`Reto 9.4 — /api/pizzas para mercado ${market}`, async ({ request }) => {
    // TODO
  });
});

// ----------------------------------------------------------------
// Reto 9.5 — BONUS: Detectar un cambio de rendimiento
//
// Llama GET /api/pizzas 3 veces seguidas con X-Country-Code=MX.
// Guarda el tiempo de respuesta de cada llamada. Verifica que
// NINGUNA tomó más de 5 segundos (5000 ms).
//
// Pista: usa Date.now() antes y después del request.
// ----------------------------------------------------------------

test('Reto 9.5 — ninguna llamada a /api/pizzas supera 5s', async ({ request }) => {
  // TODO
});
