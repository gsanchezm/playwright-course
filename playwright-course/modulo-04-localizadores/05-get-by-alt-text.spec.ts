// ============================================================
// Mini-clase 4.5 — getByAltText
// ============================================================
// Localiza un <img> por su atributo "alt". El alt es texto para
// accesibilidad: describe la imagen para lectores de pantalla.
//
// Doc: https://playwright.dev/docs/locators#locate-by-alt-text
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByAltText en OmniPizza', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('el logo principal del login tiene alt "OmniPizza Logo"', async ({ page }) => {
    await expect(page.getByAltText('OmniPizza Logo')).toBeVisible();
  });

  test('hay una ilustración con alt "Art of Pizza"', async ({ page }) => {
    await expect(page.getByAltText('Art of Pizza')).toBeVisible();
  });

  test('regex — cualquier imagen con "pizza" en el alt', async ({ page }) => {
    // Regex case-insensitive: matchea "OmniPizza Logo" y "Art of Pizza"
    const pizzaImages = page.getByAltText(/pizza/i);
    expect(await pizzaImages.count()).toBeGreaterThanOrEqual(2);
  });

  // ─── Catálogo: cada pizza tiene alt = nombre de la pizza ───────
  test('las imágenes del catálogo tienen alt con el nombre de cada pizza', async ({ page }) => {
    // Login
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);

    // En el catálogo hay tarjetas de pizza con <img alt="Margherita" />, etc.
    // Tomamos la primera imagen con alt que NO sea el logo del navbar.
    const pizzaCard = page.locator('[data-testid^="pizza-card-"]').first();
    await expect(pizzaCard).toBeVisible();

    // Dentro de la tarjeta debe haber una imagen con alt
    const cardImage = pizzaCard.locator('img').first();
    await expect(cardImage).toBeVisible();
    const alt = await cardImage.getAttribute('alt');
    expect(alt).toBeTruthy();
    expect(alt!.length).toBeGreaterThan(0);
  });
});

// ============================================================
// getByAltText es útil cuando:
//   ✅ La app tiene imágenes con alt descriptivo (accesibilidad).
//   ✅ Estás validando que una imagen específica esté presente.
//
// Evítalo cuando:
//   ❌ Los alt están vacíos o son placeholders como "image.png".
// ============================================================
