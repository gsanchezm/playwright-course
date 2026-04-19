// ============================================================
// Mini-clase 9.4 — Headers de autenticación y contexto
// ============================================================
// En OmniPizza hay 2 headers clave:
//   - Authorization: Bearer <JWT>  → identifica al usuario
//   - X-Country-Code: MX|US|CH|JP  → elige el mercado
//
// Podemos pasarlos en CADA request (verboso) o crear un
// "apiContext" con los headers ya aplicados (DRY).
// ============================================================

import { test, expect, request as apiRequest } from '@playwright/test';

const BACKEND_URL = 'https://omnipizza-backend.onrender.com';

test.describe.configure({ retries: 1 });

async function login(request: import('@playwright/test').APIRequestContext): Promise<string> {
  const response = await request.post(`${BACKEND_URL}/api/auth/login`, {
    data: { username: 'standard_user', password: 'pizza123' },
  });
  const body = await response.json();
  return body.access_token as string;
}

test.describe('Headers: auth + X-Country-Code', () => {
  test('sin Authorization, endpoints protegidos responden 401/403', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/auth/profile`);
    expect([401, 403]).toContain(response.status());
  });

  test('con Authorization válido, GET /api/auth/profile responde 200', async ({ request }) => {
    const token = await login(request);
    const response = await request.get(`${BACKEND_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);

    const profile = await response.json();
    expect(profile).toHaveProperty('username');
  });

  test('X-Country-Code cambia el mercado del /api/pizzas', async ({ request }) => {
    const token = await login(request);
    const auth = { Authorization: `Bearer ${token}` };

    const mxResponse = await request.get(`${BACKEND_URL}/api/pizzas`, {
      headers: { ...auth, 'X-Country-Code': 'MX' },
    });
    const jpResponse = await request.get(`${BACKEND_URL}/api/pizzas`, {
      headers: { ...auth, 'X-Country-Code': 'JP' },
    });

    expect(mxResponse.status()).toBe(200);
    expect(jpResponse.status()).toBe(200);

    const mxPizzas = await mxResponse.json();
    const jpPizzas = await jpResponse.json();

    // Ambos devuelven el mismo menú pero con pricing distinto por mercado.
    expect(mxPizzas).toBeTruthy();
    expect(jpPizzas).toBeTruthy();
  });
});

// ============================================================
// Patrón: apiRequest context con headers default
//
//   const ctx = await apiRequest.newContext({
//     baseURL: BACKEND_URL,
//     extraHTTPHeaders: {
//       'Authorization': `Bearer ${token}`,
//       'X-Country-Code': 'MX',
//     },
//   });
//
//   // Ahora todas las requests del ctx llevan esos headers por default
//   const res = await ctx.get('/api/pizzas');
//
// Así evitas repetir los headers en cada request.
// ============================================================

test.describe('apiRequest.newContext con headers default', () => {
  test('contexto autenticado para el mercado MX', async () => {
    const loginCtx = await apiRequest.newContext({ baseURL: BACKEND_URL });
    const token = await login(loginCtx);
    await loginCtx.dispose();

    const ctx = await apiRequest.newContext({
      baseURL: BACKEND_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Country-Code': 'MX',
      },
    });

    const pizzasRes = await ctx.get('/api/pizzas');
    expect(pizzasRes.status()).toBe(200);

    const profileRes = await ctx.get('/api/auth/profile');
    expect(profileRes.status()).toBe(200);

    await ctx.dispose();
  });
});
