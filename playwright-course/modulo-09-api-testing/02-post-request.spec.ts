// ============================================================
// Mini-clase 9.2 — POST requests (login)
// ============================================================
// POST crea un recurso o dispara una acción. En OmniPizza, el
// POST más importante es /api/auth/login: recibe credenciales,
// devuelve un JWT.
// ============================================================

import { test, expect } from '@playwright/test';

const BACKEND_URL = 'https://omnipizza-backend.onrender.com';

test.describe.configure({ retries: 1 });

test.describe('POST /api/auth/login', () => {
  test('login exitoso con standard_user devuelve 200 y un token', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        username: 'standard_user',
        password: 'pizza123',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    // El body debe traer un access_token (o similar)
    expect(body).toHaveProperty('access_token');
    expect(typeof body.access_token).toBe('string');
    expect(body.access_token.length).toBeGreaterThan(10);
  });

  test('login con locked_out_user devuelve 403', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        username: 'locked_out_user',
        password: 'pizza123',
      },
    });
    expect(response.status()).toBe(403);
  });

  test('login con credenciales incorrectas devuelve 401', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        username: 'standard_user',
        password: 'not-the-password',
      },
    });
    expect(response.status()).toBe(401);
  });

  test('login sin body devuelve error 422 (validation)', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {},
    });
    // FastAPI valida schemas con pydantic y devuelve 422 cuando faltan campos
    expect([400, 422]).toContain(response.status());
  });
});

// ============================================================
// POST con distintos payloads:
//
//   // JSON (lo más común)
//   await request.post(url, { data: { username, password } });
//
//   // Form-urlencoded
//   await request.post(url, { form: { username, password } });
//
//   // Multipart (file upload)
//   await request.post(url, {
//     multipart: { file: { name: 'x.png', mimeType: 'image/png', buffer } },
//   });
// ============================================================
