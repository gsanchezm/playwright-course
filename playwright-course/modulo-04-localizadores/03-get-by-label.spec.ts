// ============================================================
// Mini-clase 4.3 — getByLabel
// ============================================================
// Analogía: En un formulario, cada campo tiene una "etiqueta"
// (el texto "Nombre", "Email", "Contraseña" que aparece al lado
// o arriba del input). getByLabel busca el input por esa etiqueta.
//
// Ejemplo HTML:
//   <label for="email">Email address</label>
//   <input id="email" type="email" />
//
//   → page.getByLabel('Email address').fill('test@test.com')
//
// Es el locator RECOMENDADO para inputs de formulario porque:
// ✅ Refleja cómo un usuario real describe el campo.
// ✅ Te obliga a que los devs usen <label> correctamente (accesibilidad).
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByLabel en un formulario real', () => {
  // Usaremos la página de búsqueda de Playwright docs.
  // Nota: el sitio oficial no tiene un formulario clásico con labels,
  // así que este ejemplo usa un sitio público de TodoMVC.

  test('escribir en el input "What needs to be done?"', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');

    // El input tiene un aria-label "New Todo Input"
    // getByLabel encuentra inputs por label, aria-label o aria-labelledby
    const newTodoInput = page.getByLabel('New Todo Input');

    await newTodoInput.fill('Aprender getByLabel');
    await newTodoInput.press('Enter');

    // Verificamos que el todo se agregó
    await expect(page.getByText('Aprender getByLabel')).toBeVisible();
  });

  test('agregar múltiples todos con getByLabel', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');

    const input = page.getByLabel('New Todo Input');

    await input.fill('Estudiar Playwright');
    await input.press('Enter');

    await input.fill('Escribir tests');
    await input.press('Enter');

    await input.fill('Revisar PRs');
    await input.press('Enter');

    // Verificamos que los 3 todos están visibles
    await expect(page.getByText('Estudiar Playwright')).toBeVisible();
    await expect(page.getByText('Escribir tests')).toBeVisible();
    await expect(page.getByText('Revisar PRs')).toBeVisible();
  });
});
