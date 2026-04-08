// ============================================================
// Mini-clase 4.7 — Filtros y encadenamiento
// ============================================================
// Analogía: Imagina una tabla con 20 filas de usuarios. Necesitas
// hacer click en el botón "Eliminar" de la fila de "María".
//
// ❌ Mal: getByRole('button', { name: 'Eliminar' }) → ambiguo (20 botones)
// ✅ Bien: encontrar la fila de María y luego buscar el botón dentro.
//
// Playwright te da 2 herramientas para esto:
//
// 1. ENCADENAMIENTO: chain de locators
//    page.getByRole('row', { name: 'María' }).getByRole('button', { name: 'Eliminar' })
//
// 2. FILTROS: .filter({ hasText: '...' }) o .filter({ has: locator })
//    page.getByRole('row').filter({ hasText: 'María' }).getByRole('button')
//
// 3. POSICIONAL: .first(), .last(), .nth(n)
//    page.getByRole('button').nth(2)  // el 3er botón (0-indexed)
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Filtros y encadenamiento en TodoMVC', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');

    // Agregamos 3 todos de ejemplo
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Comprar leche');
    await input.press('Enter');
    await input.fill('Estudiar Playwright');
    await input.press('Enter');
    await input.fill('Hacer ejercicio');
    await input.press('Enter');
  });

  test('primer y último todo con .first() y .last()', async ({ page }) => {
    const todos = page.getByTestId('todo-title');

    await expect(todos.first()).toHaveText('Comprar leche');
    await expect(todos.last()).toHaveText('Hacer ejercicio');
  });

  test('el segundo todo con .nth(1)', async ({ page }) => {
    // nth es 0-indexed: 0 = primero, 1 = segundo, 2 = tercero
    const segundoTodo = page.getByTestId('todo-title').nth(1);
    await expect(segundoTodo).toHaveText('Estudiar Playwright');
  });

  test('contar todos con toHaveCount', async ({ page }) => {
    await expect(page.getByTestId('todo-title')).toHaveCount(3);
  });

  test('filter con hasText para encontrar un todo específico', async ({ page }) => {
    // Encuentra el <li> (todo item) que contiene el texto "Estudiar"
    const todoEstudiar = page
      .getByRole('listitem')
      .filter({ hasText: 'Estudiar' });

    await expect(todoEstudiar).toBeVisible();
  });

  test('encadenamiento: checkbox dentro del todo de Estudiar', async ({ page }) => {
    // 1. Encontrar el <li> que contiene "Estudiar Playwright"
    // 2. Dentro de ese <li>, encontrar el checkbox y marcarlo
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Estudiar' })
      .getByRole('checkbox')
      .check();

    // Verificamos que ese todo quedó marcado como completo
    const completedTodo = page
      .getByRole('listitem')
      .filter({ hasText: 'Estudiar' });
    await expect(completedTodo).toHaveClass(/completed/);
  });

  test('filter con NOT (has-not)', async ({ page }) => {
    // Marcar solo el primer todo como completo
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Comprar leche' })
      .getByRole('checkbox')
      .check();

    // Encontrar todos los todos que NO estén completos (no tengan clase "completed")
    const pendientes = page
      .getByRole('listitem')
      .filter({ hasNotText: 'Comprar leche' });

    await expect(pendientes).toHaveCount(2);
  });
});
