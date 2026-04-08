// ============================================================
// Mini-clase 4.5 — getByTestId
// ============================================================
// Analogía: Cuando un elemento NO tiene rol claro, NO tiene label
// visible, y el texto es ambiguo (ej. hay 5 botones "X" en la página
// y necesitas uno específico), los devs pueden agregar un atributo
// data-testid="nombre-unico" al HTML:
//
//   <button data-testid="delete-user-42">❌</button>
//
//   → page.getByTestId('delete-user-42').click()
//
// ⚠️ Esto REQUIERE colaboración con devs. Si tu app no tiene data-testids,
// habla con tu equipo para agregarlos. Es la mejor inversión de 5 minutos
// para tu suite de automatización.
//
// 💡 El nombre del atributo es configurable. Por defecto es "data-testid",
// pero puedes cambiarlo en playwright.config.ts:
//   use: { testIdAttribute: 'data-qa' }
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByTestId en TodoMVC', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');

    // Agreguemos algunos todos para tener elementos con data-testid
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Primer todo');
    await input.press('Enter');
    await input.fill('Segundo todo');
    await input.press('Enter');
  });

  test('encontrar la lista de todos por test-id', async ({ page }) => {
    // TodoMVC usa data-testid="todo-title" en cada item
    const todoTitles = page.getByTestId('todo-title');

    // Verificamos que hay 2 items
    await expect(todoTitles).toHaveCount(2);

    // Verificamos el contenido del primero
    await expect(todoTitles.first()).toHaveText('Primer todo');
    await expect(todoTitles.last()).toHaveText('Segundo todo');
  });
});

// ============================================================
// 📖 ¿Cuándo usar data-testid?
//
// ✅ Cuando un elemento no tiene rol semántico claro.
// ✅ Cuando hay varios elementos iguales y necesitas uno específico.
// ✅ Cuando los textos cambian por localización (i18n).
// ✅ En componentes custom complejos (modales, dropdowns, grids).
//
// ❌ NO lo uses como primera opción. Primero intenta getByRole.
// ❌ NO contamines el HTML con data-testid en cada elemento.
// ============================================================
