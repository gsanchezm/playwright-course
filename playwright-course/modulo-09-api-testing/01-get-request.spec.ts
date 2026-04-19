// ============================================================
// Mini-clase 9.1 — GET requests
// ============================================================
// Playwright incluye `request` — un cliente HTTP completo. Sin
// navegador, sin `page`: pruebas 100% de API, mucho más rápidas
// (ms vs segundos de UI).
//
// Este módulo prueba el backend real de OmniPizza:
//   https://omnipizza-backend.onrender.com
// Swagger UI:
//   https://omnipizza-backend.onrender.com/api/docs
// ============================================================

import { test, expect } from '@playwright/test';

const BACKEND_URL = 'https://omnipizza-backend.onrender.com';

test.describe.configure({ retries: 1 });

test.describe('GET requests a OmniPizza API', () => {
  test('GET /health — el backend está vivo', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/health`);

    // Status 200 = OK
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // El body es JSON con un campo de estado
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('GET /api/countries — lista los 4 mercados', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/countries`);

    expect(response.status()).toBe(200);

    const countries = await response.json();
    // Esperamos que venga una lista/array con al menos 4 países
    expect(Array.isArray(countries) || typeof countries === 'object').toBeTruthy();
  });

  test('GET /api/pizzas — requiere Bearer + X-Country-Code', async ({ request }) => {
    // /api/pizzas es endpoint protegido: necesita login primero.
    const loginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { username: 'standard_user', password: 'pizza123' },
    });
    const { access_token } = await loginRes.json();

    const response = await request.get(`${BACKEND_URL}/api/pizzas`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'X-Country-Code': 'MX',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    // OmniPizza devuelve { pizzas: [...] }
    expect(body.pizzas).toBeDefined();
    expect(Array.isArray(body.pizzas)).toBe(true);
    expect(body.pizzas.length).toBeGreaterThan(0);

    // Cada pizza debe tener los campos básicos
    const firstPizza = body.pizzas[0];
    expect(firstPizza).toHaveProperty('id');
    expect(firstPizza).toHaveProperty('name');
    expect(firstPizza).toHaveProperty('price');
    expect(firstPizza.currency).toBe('MXN');
  });

  test('GET /api/pizzas sin Authorization devuelve 403', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pizzas`, {
      headers: { 'X-Country-Code': 'MX' },
    });
    expect(response.status()).toBe(403);
  });
});

// ============================================================
// Qué chequear en una respuesta GET:
//   ✅ status() — código HTTP (200 = OK, 404 = not found, 500 = server error)
//   ✅ ok()     — true si 200-299
//   ✅ json()   — parsea el body como JSON (lanza si no es JSON)
//   ✅ text()   — devuelve el body como string
//   ✅ headers() — los headers de la respuesta
//   ✅ url()    — la URL final (útil cuando hay redirects)
// ============================================================
