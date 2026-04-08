// ============================================================
// RETO — Módulo 9: API Testing
// ============================================================
// Todos los retos usan https://reqres.in/api
// ============================================================

import { test, expect } from '@playwright/test';

const API_BASE = 'https://reqres.in/api';

// ----------------------------------------------------------------
// Reto 9.1 — GET /users/3
// Valida que:
//   (a) status es 200
//   (b) body.data.id es 3
//   (c) body.data.email contiene "@reqres.in"
// ----------------------------------------------------------------
test.fixme('9.1: GET usuario por ID', async ({ request }) => {
  // TODO:
});

// ----------------------------------------------------------------
// Reto 9.2 — GET /users?page=2
// Valida que:
//   (a) el campo "page" del body es 2
//   (b) data es un array con al menos 1 elemento
//   (c) cada usuario tiene las propiedades: id, email, first_name, last_name
// ----------------------------------------------------------------
test.fixme('9.2: GET lista paginada', async ({ request }) => {
  // TODO:
});

// ----------------------------------------------------------------
// Reto 9.3 — POST /users
// Crea un usuario con { name: "Tu Nombre", job: "QA Learner" }.
// Valida status 201 y que el body contiene los campos enviados + "id" + "createdAt".
// ----------------------------------------------------------------
test.fixme('9.3: POST crear usuario', async ({ request }) => {
  // TODO:
});

// ----------------------------------------------------------------
// Reto 9.4 — POST /register con credenciales correctas
// Endpoint: POST /register
// Body: { "email": "eve.holt@reqres.in", "password": "pistol" }
// Valida status 200 y que la respuesta contiene "token".
// ----------------------------------------------------------------
test.fixme('9.4: POST register válido', async ({ request }) => {
  // TODO:
});

// ----------------------------------------------------------------
// Reto 9.5 — POST /register SIN password
// Debe devolver 400 y un body con "error" que diga "Missing password".
// ----------------------------------------------------------------
test.fixme('9.5: POST register inválido', async ({ request }) => {
  // TODO:
});

// ----------------------------------------------------------------
// Reto 9.6 — Flujo completo CRUD
// 1. POST /users para crear un usuario → guarda el ID.
// 2. PUT /users/{id} para actualizar el job.
// 3. GET /users/{id} para verificar que existe (nota: reqres.in es mock,
//    así que el GET puede devolver datos aleatorios — es ok).
// 4. DELETE /users/{id} → validar 204.
// ----------------------------------------------------------------
test.fixme('9.6: flujo CRUD completo', async ({ request }) => {
  // TODO:
});

// ----------------------------------------------------------------
// Reto 9.7 — BONUS: UI + API
// 1. [API] POST /login para obtener un token.
// 2. [UI] Navegar a https://playwright.dev y validar el título.
// 3. Console.log del token y del título para confirmar que ambos mundos corrieron.
// ----------------------------------------------------------------
test.fixme('9.7: UI + API combinados', async ({ page, request }) => {
  // TODO:
});
