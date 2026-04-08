// ============================================================
// Mini-clase 9.3 — PUT, PATCH, DELETE
// ============================================================
// Analogías:
//
// PUT    = "reemplaza el perfil completo del usuario"
//          → mandas TODOS los campos, incluso los que no cambian.
//
// PATCH  = "cambia solo el email del usuario"
//          → mandas SOLO los campos que quieres modificar.
//
// DELETE = "borra el usuario"
//          → no mandas body. Respuesta típica: 204 No Content.
// ============================================================

import { test, expect } from '@playwright/test';

const API_BASE = 'https://reqres.in/api';

test.describe('API PUT / PATCH / DELETE', () => {
  test('PUT /users/2 reemplaza el usuario completo', async ({ request }) => {
    const updatedUser = {
      name: 'María Pérez',
      job: 'Lead QA Engineer', // promoción!
    };

    const response = await request.put(`${API_BASE}/users/2`, {
      data: updatedUser,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe('María Pérez');
    expect(body.job).toBe('Lead QA Engineer');
    expect(body).toHaveProperty('updatedAt');
  });

  test('PATCH /users/2 actualiza solo el job', async ({ request }) => {
    const response = await request.patch(`${API_BASE}/users/2`, {
      data: { job: 'QA Manager' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.job).toBe('QA Manager');
    expect(body).toHaveProperty('updatedAt');
  });

  test('DELETE /users/2 devuelve 204', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/users/2`);

    // 204 No Content: borrado exitoso sin body de respuesta
    expect(response.status()).toBe(204);
  });
});
