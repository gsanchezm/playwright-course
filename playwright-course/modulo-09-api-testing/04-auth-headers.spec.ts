// ============================================================
// Mini-clase 9.4 — Autenticación y Headers custom
// ============================================================
// En la vida real, casi todas las APIs requieren autenticación.
// Formas comunes:
//   1. Bearer Token (JWT):     Authorization: Bearer eyJ...
//   2. API Key en header:       X-API-Key: abc123
//   3. Basic Auth:              Authorization: Basic <base64(user:pass)>
//   4. Cookies de sesión:        se manejan solas con el contexto
//
// Playwright te permite:
// - Setear headers por request individual.
// - Setear headers GLOBALES en el config para todo el suite.
// - Crear un "apiContext" con headers pre-configurados.
// ============================================================

import { test, expect } from '@playwright/test';

const API_BASE = 'https://reqres.in/api';

test.describe('Headers y autenticación', () => {
  test('agregar headers custom a un request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/1`, {
      headers: {
        'X-Custom-Header': 'valor-custom',
        'Accept': 'application/json',
      },
    });

    expect(response.status()).toBe(200);
  });

  test('flujo: obtener token con POST /login y usarlo en GET', async ({ request }) => {
    // 1. Login para obtener el token
    const loginResponse = await request.post(`${API_BASE}/login`, {
      data: {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka',
      },
    });

    expect(loginResponse.status()).toBe(200);
    const { token } = await loginResponse.json();
    console.log('Token obtenido:', token);

    // 2. Usar el token en un GET posterior
    const profileResponse = await request.get(`${API_BASE}/users/1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(profileResponse.status()).toBe(200);
  });

  test('pasar query params en un GET', async ({ request }) => {
    // Dos formas de mandar query params:

    // Forma 1: directo en la URL
    const r1 = await request.get(`${API_BASE}/users?page=2`);
    expect(r1.status()).toBe(200);

    // Forma 2: objeto "params" (recomendado, más legible)
    const r2 = await request.get(`${API_BASE}/users`, {
      params: { page: 2, per_page: 5 },
    });
    expect(r2.status()).toBe(200);

    const body = await r2.json();
    expect(body.page).toBe(2);
  });
});

// ============================================================
// 💡 Para headers globales del suite, en playwright.config.ts:
//
//   use: {
//     extraHTTPHeaders: {
//       'Authorization': `Bearer ${process.env.API_TOKEN}`,
//     },
//   }
//
// Así TODOS los requests del suite llevan el token automáticamente.
// ============================================================
