// ============================================================
// Mini-clase 5.1 — forEach con datos inline
// ============================================================
// La forma más simple de parametrizar: un array de datos y un
// forEach que crea N tests dinámicamente.
//
// Analogía: Es como una hoja de Excel con 5 filas de casos,
// y el robot ejecuta cada fila automáticamente.
// ============================================================

import { test, expect } from '@playwright/test';

// Datos de prueba: cada objeto es un caso
const searchTerms = [
  { term: 'Playwright', expected: /Playwright/ },
  { term: 'Locators', expected: /Locators/ },
  { term: 'Fixtures', expected: /Fixtures/ },
];

// El forEach crea UN test por cada elemento del array
searchTerms.forEach(({ term, expected }) => {
  test(`búsqueda en docs: "${term}"`, async ({ page }) => {
    await page.goto('https://playwright.dev/docs/intro');

    // Playwright docs tiene una caja de búsqueda integrada.
    // La abrimos con el shortcut /
    await page.keyboard.press('/');

    // Esperamos a que aparezca el input de búsqueda
    const searchInput = page.getByPlaceholder(/Search docs/i);
    await searchInput.fill(term);

    // Esperamos un resultado y validamos que aparece el término
    await expect(page.getByRole('listbox')).toContainText(expected);
  });
});
