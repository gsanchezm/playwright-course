// ============================================================
// Tests de TodoMVC usando el Page Object Model
// ============================================================
// Nota: estos tests son SUPER legibles porque toda la lógica
// sucia (selectores, esperas, clicks) está en el Page Object.
// El test solo describe QUÉ hace el usuario, no CÓMO.
// ============================================================

import { test, expect } from '@playwright/test';
import { TodoMvcPage } from '../pages/TodoMvcPage';

test.describe('TodoMVC con Page Object Model', () => {
  let todoPage: TodoMvcPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoMvcPage(page);
    await todoPage.goto();
  });

  test('agregar un solo todo', async () => {
    await todoPage.addTodo('Comprar leche');

    // Las assertions viven en el TEST, no en el POM
    expect(await todoPage.getTodoCount()).toBe(1);
    expect(await todoPage.getAllTodoTexts()).toContain('Comprar leche');
  });

  test('agregar múltiples todos', async () => {
    await todoPage.addTodos([
      'Aprender Playwright',
      'Escribir tests',
      'Revisar PRs del equipo',
    ]);

    expect(await todoPage.getTodoCount()).toBe(3);
  });

  test('marcar un todo como completado', async () => {
    await todoPage.addTodo('Tarea importante');
    await todoPage.toggleTodo('Tarea importante');

    // Aquí hacemos una assertion avanzada usando el locator expuesto
    await expect(
      todoPage.items.filter({ hasText: 'Tarea importante' })
    ).toHaveText('Tarea importante');
  });

  test('borrar un todo', async () => {
    await todoPage.addTodos(['Uno', 'Dos', 'Tres']);
    expect(await todoPage.getTodoCount()).toBe(3);

    await todoPage.deleteTodo('Dos');

    expect(await todoPage.getTodoCount()).toBe(2);
    expect(await todoPage.getAllTodoTexts()).not.toContain('Dos');
  });

  test('clear completed elimina solo los marcados', async () => {
    await todoPage.addTodos(['A', 'B', 'C']);
    await todoPage.toggleTodo('B');

    await todoPage.clearCompleted();

    expect(await todoPage.getTodoCount()).toBe(2);
    expect(await todoPage.getAllTodoTexts()).toEqual(['A', 'C']);
  });
});

// ============================================================
// 💡 Compara este archivo con el ejemplo sin POM del README.md
// Notarás:
//   - No hay ni un solo selector en los tests.
//   - Los nombres de los métodos son verbos humanos.
//   - Si mañana TodoMVC cambia de layout, solo editas TodoMvcPage.ts.
//   - Puedes reutilizar el mismo POM en 100 tests distintos.
// ============================================================
