// ============================================================
// Mini-clase 9.2 — POST request
// ============================================================
// Analogía: Un POST es como llenar un formulario y dar "Submit".
// Estás CREANDO algo nuevo en el servidor.
//
// Respuesta típica: 201 Created (NO 200 OK).
// El body de respuesta suele contener el recurso recién creado
// con su ID asignado por el servidor.
// ============================================================

import { test, expect } from '@playwright/test';

const API_BASE = 'https://reqres.in/api';

test.describe('API POST requests', () => {
  test('POST /users crea un usuario nuevo', async ({ request }) => {
    const newUser = {
      name: 'María Pérez',
      job: 'QA Automation Engineer',
    };

    const response = await request.post(`${API_BASE}/users`, {
      data: newUser, // Playwright serializa a JSON automáticamente
    });

    // 201 Created es el status correcto de un POST exitoso
    expect(response.status()).toBe(201);

    const body = await response.json();

    // El servidor devuelve el objeto creado + un ID + timestamp
    expect(body).toMatchObject(newUser); // los campos que enviamos están
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('createdAt');
  });

  test('POST /login con credenciales válidas devuelve token', async ({ request }) => {
    const credentials = {
      email: 'eve.holt@reqres.in',
      password: 'cityslicka',
    };

    const response = await request.post(`${API_BASE}/login`, {
      data: credentials,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(body.token).toBeTruthy();
    expect(typeof body.token).toBe('string');
  });

  test('POST /login sin password devuelve 400', async ({ request }) => {
    const response = await request.post(`${API_BASE}/login`, {
      data: { email: 'eve.holt@reqres.in' }, // falta password a propósito
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});
