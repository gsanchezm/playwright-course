// ============================================================
// Mini-clase 5.4 — Fixtures personalizadas
// ============================================================
// Una "fixture" es un objeto que Playwright te inyecta en cada test.
// Las fixtures built-in: page, context, browser, request...
//
// Tú puedes crear las tuyas. Ejemplo clásico: una fixture
// "todoMvcPage" que te da una página de TodoMVC ya cargada con
// 3 todos preexistentes, para no repetir ese setup en cada test.
//
// Analogía: Es como tener un "estado inicial del ambiente" listo
// antes de cada caso. Como en pruebas manuales, donde antes de
// probar "editar perfil" tú ya tienes un usuario creado.
// ============================================================

import { test as base, expect, Page } from '@playwright/test';

// Definimos el tipo de nuestras fixtures custom
type MyFixtures = {
  todoMvcPage: Page;
};

// Extendemos el test base con nuestras fixtures
export const test = base.extend<MyFixtures>({
  // La fixture "todoMvcPage": abre TodoMVC y agrega 3 todos
  todoMvcPage: async ({ page }, use) => {
    // Setup
    await page.goto('https://demo.playwright.dev/todomvc');

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Todo 1');
    await input.press('Enter');
    await input.fill('Todo 2');
    await input.press('Enter');
    await input.fill('Todo 3');
    await input.press('Enter');

    // Entregamos la página al test
    await use(page);

    // Teardown (después del test) — opcional
    // Podrías limpiar datos, cerrar conexiones, etc.
  },
});

// Usamos nuestra fixture como si fuera "page"
test('el estado inicial tiene 3 todos', async ({ todoMvcPage }) => {
  // No necesitamos goto ni agregar todos: ya vienen desde la fixture.
  await expect(todoMvcPage.getByTestId('todo-title')).toHaveCount(3);
});

test('marcar el primer todo como completo', async ({ todoMvcPage }) => {
  await todoMvcPage
    .getByRole('listitem')
    .first()
    .getByRole('checkbox')
    .check();

  // Validamos que quedó marcado
  await expect(
    todoMvcPage.getByRole('listitem').first()
  ).toHaveClass(/completed/);
});

test('borrar el segundo todo', async ({ todoMvcPage }) => {
  // Hover para mostrar el botón X
  await todoMvcPage.getByRole('listitem').nth(1).hover();
  await todoMvcPage
    .getByRole('listitem')
    .nth(1)
    .getByRole('button', { name: 'Delete' })
    .click();

  // Ahora hay 2 todos
  await expect(todoMvcPage.getByTestId('todo-title')).toHaveCount(2);
});
