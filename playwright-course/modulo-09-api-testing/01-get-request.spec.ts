// ============================================================
// Mini-clase 9.1 — GET request
// ============================================================
// Analogía: Un GET es como pedirle a alguien: "por favor,
// dame la información del usuario 42". No cambias nada, solo lees.
//
// Casos de uso en QA automation:
// - Verificar que un endpoint devuelve el status esperado.
// - Validar el shape de la respuesta (estructura del JSON).
// - Validar valores específicos (ej. el email del usuario).
// ============================================================

import { test, expect } from '@playwright/test';

const API_BASE = 'https://reqres.in/api';

test.describe('API GET requests', () => {
  test('GET /users/2 devuelve 200 y los datos del usuario', async ({ request }) => {
    // 1. Act — hacer el GET
    const response = await request.get(`${API_BASE}/users/2`);

    // 2. Assert — validar status HTTP
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy(); // ok() = true si 2xx

    // 3. Parsear el body como JSON
    const body = await response.json();

    // 4. Validar la estructura y valores
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id', 2);
    expect(body.data).toHaveProperty('email');
    expect(body.data.email).toContain('@reqres.in');
  });

  test('GET /users devuelve una lista paginada', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users?page=1`);

    expect(response.status()).toBe(200);

    const body = await response.json();

    // Validaciones del contrato de la API
    expect(body).toHaveProperty('page', 1);
    expect(body).toHaveProperty('per_page');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('GET /users/999 devuelve 404 para un ID inexistente', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/999`);

    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });
});
