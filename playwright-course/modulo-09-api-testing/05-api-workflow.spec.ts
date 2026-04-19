// ============================================================
// Mini-clase 9.5 — Flujo end-to-end de API (sin UI)
// ============================================================
// Todos los conceptos del módulo, juntos, para probar un flujo
// real del backend de OmniPizza:
//
//   1. POST /api/auth/login                  → obtener JWT
//   2. GET  /api/auth/profile                → verificar perfil
//   3. GET  /api/pizzas con X-Country-Code   → listar catálogo
//   4. GET  /api/orders                      → historial de órdenes
//
// IMPORTANTE — filosofía del curso:
//   Este archivo NO toca la UI. Es API pura. En un curso avanzado
//   verías cómo combinar API + UI (atomic testing), pero aquí los
//   suites de API y UI viven aislados por diseño pedagógico.
// ============================================================

import { test, expect } from '@playwright/test';

const BACKEND_URL = 'https://omnipizza-backend.onrender.com';

test.describe.configure({ retries: 1 });

test.describe('Flujo end-to-end API de OmniPizza', () => {
  test('standard_user: login → profile → pizzas → orders', async ({ request }) => {
    // ─── 1. Login ─────────────────────────────────────────────
    const loginRes = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { username: 'standard_user', password: 'pizza123' },
    });
    expect(loginRes.status()).toBe(200);

    const { access_token } = await loginRes.json();
    expect(access_token).toBeTruthy();

    const authHeaders = {
      Authorization: `Bearer ${access_token}`,
      'X-Country-Code': 'MX',
    };

    // ─── 2. Profile ───────────────────────────────────────────
    const profileRes = await request.get(`${BACKEND_URL}/api/auth/profile`, {
      headers: authHeaders,
    });
    expect(profileRes.status()).toBe(200);

    const profile = await profileRes.json();
    expect(profile).toHaveProperty('username');
    expect(profile.username).toBe('standard_user');

    // ─── 3. Pizzas (mercado MX) ───────────────────────────────
    const pizzasRes = await request.get(`${BACKEND_URL}/api/pizzas`, {
      headers: authHeaders,
    });
    expect(pizzasRes.status()).toBe(200);

    const pizzas = await pizzasRes.json();
    expect(pizzas).toBeTruthy();

    // ─── 4. Orders ────────────────────────────────────────────
    const ordersRes = await request.get(`${BACKEND_URL}/api/orders`, {
      headers: authHeaders,
    });
    expect(ordersRes.status()).toBe(200);

    const orders = await ordersRes.json();
    // Puede ser lista vacía — solo verificamos que el endpoint respondió
    expect(orders).toBeDefined();
  });
});

// ============================================================
// Ventajas de este enfoque (API pura):
//
//   ⚡ Velocidad — un flujo completo en <1 segundo (vs ~30s en UI).
//   🎯 Aislamiento — un fallo aquí señala un bug de backend,
//      no de frontend.
//   🔁 Determinismo — sin flakiness por timing de UI.
//
// Cuándo usar API puro vs UI puro:
//   - API puro:  lógica de negocio del backend, reglas de validación,
//                cobertura amplia y rápida.
//   - UI puro:   flujos de usuario reales, accesibilidad, diseño responsive.
//
// Ambos suites conviven en el mismo repo pero se ejecutan por separado:
//   pnpm test modulo-09-api-testing     # solo API
//   pnpm test modulo-02-anotaciones     # solo UI
// ============================================================
