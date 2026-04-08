// ============================================================
// Mini-clase 9.5 — ⭐ Combinar UI + API
// ============================================================
// Este es el verdadero superpoder de Playwright.
//
// Escenario real: quieres probar que un usuario puede ver su
// lista de todos. Con solo UI tendrías que:
//   1. Abrir la página (2s)
//   2. Hacer login (3s)
//   3. Navegar al dashboard (2s)
//   4. Agregar todos uno por uno (5s cada uno)
//   5. Recién AHORA empezar a probar lo que te importa
//
// Total: ~25 segundos antes del test real.
//
// Con UI + API:
//   1. Crear los todos vía API directamente al backend (0.3s)
//   2. Abrir la página y validar que aparecen (3s)
//
// Total: ~3.3 segundos. 7x más rápido.
//
// Regla general:
// 🟢 Usa API para SETUP y TEARDOWN.
// 🟢 Usa UI para VALIDAR lo que el usuario realmente ve.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('UI + API combinados', () => {
  test('validar datos vía API y UI en el mismo test', async ({ page, request }) => {
    // 1. API: consultar cuántos usuarios hay en la base
    const apiResponse = await request.get('https://reqres.in/api/users?page=1');
    expect(apiResponse.status()).toBe(200);
    const apiData = await apiResponse.json();

    console.log(`La API dice que hay ${apiData.total} usuarios.`);
    expect(apiData.data.length).toBeGreaterThan(0);

    // 2. UI: navegar a la app pública
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);

    // 3. Combinación: usar datos de la API para validar la UI
    // (En un caso real, abrirías la página de "usuarios" de tu app
    // y verificarías que los mismos datos de la API aparecen en el DOM.)
  });

  test('setup de datos por API antes de un test de UI', async ({ page, request }) => {
    // 1. SETUP vía API (mucho más rápido que hacerlo por UI)
    const createRes = await request.post('https://reqres.in/api/users', {
      data: { name: 'Test User', job: 'QA' },
    });
    expect(createRes.status()).toBe(201);
    const newUser = await createRes.json();
    console.log(`Usuario creado con ID: ${newUser.id}`);

    // 2. ACT — lo que realmente queremos probar: el flujo UI
    await page.goto('https://playwright.dev/');
    // ...aquí harías el test real en la UI...

    // 3. TEARDOWN vía API
    const deleteRes = await request.delete(`https://reqres.in/api/users/${newUser.id}`);
    expect(deleteRes.status()).toBe(204);
  });
});

// ============================================================
// 💡 Patrón recomendado en proyectos reales:
//
// Para un test "el usuario puede editar su perfil":
//
//   1. [API] Crear usuario con POST /users
//   2. [API] Login y obtener token
//   3. [UI] Login en la interfaz visual (o usar el token directo)
//   4. [UI] Navegar a /profile
//   5. [UI] Cambiar el nombre y dar click en Save
//   6. [UI] Verificar toast "Profile updated"
//   7. [API] GET /users/{id} y verificar que el nombre cambió
//   8. [API] DELETE /users/{id} (teardown)
//
// Los pasos 1-2 son 100x más rápidos por API. El paso 3 puede ser
// por API (set de cookies) o por UI si quieres probar ese flujo.
// Los pasos 4-6 son UI porque es lo que el usuario realmente hace.
// El paso 7 es una doble validación con API.
// ============================================================
