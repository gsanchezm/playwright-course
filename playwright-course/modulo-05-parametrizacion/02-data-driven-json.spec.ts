// ============================================================
// Mini-clase 5.2 — Data-driven desde un archivo JSON
// ============================================================
// Ventaja sobre inline: los datos viven FUERA del código.
// QA puede agregar casos sin tocar TypeScript.
//
// Flujo recomendado en un equipo real:
// 1. QA manual define los casos en test-data.json.
// 2. El automatizador escribe el test una sola vez.
// 3. Cuando aparecen nuevos casos, solo se agregan al JSON.
// ============================================================

import { test, expect } from '@playwright/test';
import testCases from './test-data.json';

test.describe('TodoMVC — data-driven desde JSON', () => {
  // Iteramos sobre los casos del archivo test-data.json
  for (const tc of testCases) {
    test(tc.name, async ({ page }) => {
      await page.goto('https://demo.playwright.dev/todomvc');

      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill(tc.todo);
      await input.press('Enter');

      // Validamos que el todo se agregó con el texto correcto
      await expect(page.getByTestId('todo-title')).toHaveText(tc.todo);
    });
  }
});

// ============================================================
// 💡 Para agregar un nuevo caso, SOLO editas test-data.json.
// No necesitas tocar este archivo TypeScript.
//
// Ejemplo:
//   {
//     "name": "agregar un todo en chino",
//     "todo": "学习 Playwright"
//   }
// ============================================================
