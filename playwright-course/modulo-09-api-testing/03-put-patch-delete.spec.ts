// ============================================================
// Mini-clase 9.3 — PUT / PATCH / DELETE
// ============================================================
// La API de OmniPizza usa solo GET y POST. Para aprender los
// verbos PUT/PATCH/DELETE usamos jsonplaceholder.typicode.com —
// una API mock pública (sin API key) muy usada para enseñar REST.
//
// Los patrones de sintaxis son IDÉNTICOS — solo cambia el verbo.
// Cuando tu app tenga PUT/PATCH/DELETE, reemplazas la URL y listo.
// ============================================================

import { test, expect } from '@playwright/test';

const JSONPH = 'https://jsonplaceholder.typicode.com';

test.describe.configure({ retries: 1 });

test.describe('Verbos PUT / PATCH / DELETE (mock con jsonplaceholder)', () => {
  test('PUT /users/:id — reemplazar un recurso completo', async ({ request }) => {
    // PUT reemplaza TODO el recurso con los datos enviados.
    const response = await request.put(`${JSONPH}/users/2`, {
      data: { name: 'María', username: 'maria', email: 'maria@test.com' },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe('María');
    expect(body.username).toBe('maria');
    expect(body.id).toBe(2);
  });

  test('PATCH /users/:id — actualizar parcialmente', async ({ request }) => {
    // PATCH solo cambia los campos que envías — el resto queda igual.
    const response = await request.patch(`${JSONPH}/users/2`, {
      data: { email: 'nuevo@email.com' },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.email).toBe('nuevo@email.com');
  });

  test('DELETE /users/:id — eliminar un recurso', async ({ request }) => {
    const response = await request.delete(`${JSONPH}/users/2`);
    expect(response.status()).toBe(200);
  });
});

// ============================================================
// Semántica de HTTP:
//
//   GET     — leer. Idempotente, sin side effects.
//   POST    — crear. No idempotente: POST dos veces = 2 recursos.
//   PUT     — reemplazar. Idempotente: PUT dos veces = mismo estado.
//   PATCH   — actualizar parcial. Usualmente idempotente.
//   DELETE  — eliminar. Idempotente: DELETE dos veces = mismo "no existe".
//
// Nota: jsonplaceholder es un MOCK — sus cambios no persisten.
// Úsalo para aprender sintaxis, no para probar persistencia real.
// ============================================================
