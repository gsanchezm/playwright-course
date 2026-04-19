// ============================================================
// Tests del catálogo usando POM + fixture authenticatedPage
// ============================================================
// Estos tests NO hacen login a mano. La fixture `authenticatedPage`
// ya los recibe dentro de /catalog con el menú cargado.
//
// Los tests se enfocan SOLO en lo que prueban — no en el setup.
// ============================================================

import { test, expect } from '../fixtures/auth';

test.describe.configure({ retries: 1 });

test.describe('Suite: Catálogo con POM', () => {
  test('el catálogo tiene al menos una pizza @smoke', async ({ authenticatedPage, catalogPage }) => {
    // authenticatedPage ya pasó por login + wait. catalogPage opera sobre la misma page.
    await catalogPage.expectHasPizzas();
  });

  test('cada pizza tiene su botón add-to-cart @regression', async ({ authenticatedPage, catalogPage }) => {
    await catalogPage.expectAddButtonCountMatchesPizzaCount();
  });

  test('el primer botón add-to-cart está habilitado @smoke', async ({ authenticatedPage }) => {
    // Nota pedagógica: clickar "Add to Cart" abre el customizer modal
    // (ver reto 10.1). Aquí solo verificamos que el botón responde —
    // el flujo completo con modal se cubre en el reto.
    const addButton = authenticatedPage.locator('[data-testid^="add-to-cart-"]').first();
    await expect(addButton).toBeEnabled();
  });

  test('la categoría "popular" filtra el listado @regression', async ({ authenticatedPage, catalogPage }) => {
    await catalogPage.selectCategory('popular');
    // Tras filtrar, siguen habiendo pizzas (el count puede bajar pero no a 0)
    await catalogPage.expectHasPizzas();
  });
});
