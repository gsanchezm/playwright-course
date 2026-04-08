// ============================================================
// Mini-clase 4.1 — getByRole (⭐ EL LOCATOR FAVORITO)
// ============================================================
// Analogía: Imagina que le describes una página web a un ciego.
// Le dirías: "hay un botón llamado 'Agregar al carrito'",
// no "hay un <button> con class 'btn-primary'".
//
// getByRole es exactamente eso: busca elementos por su ROL
// semántico (button, link, heading, textbox, checkbox, etc.)
// y el "accessible name" (el texto que un lector de pantalla leería).
//
// ROLES MÁS COMUNES:
//   button, link, heading, textbox, checkbox, radio,
//   combobox, dialog, list, listitem, navigation, main, form
//
// Ventajas:
// ✅ Robusto: no depende de CSS ni DOM structure.
// ✅ Accesible: si tu test funciona, tu app es accesible.
// ✅ Legible: el test se lee como instrucciones humanas.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByRole en playwright.dev', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://playwright.dev/');
  });

  test('link por su nombre accesible', async ({ page }) => {
    // "hay un link que se llama 'Get started'"
    const getStartedLink = page.getByRole('link', { name: 'Get started' });
    await expect(getStartedLink).toBeVisible();
  });

  test('heading principal', async ({ page }) => {
    // "hay un encabezado H1 en la página"
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
  });

  test('navegación principal', async ({ page }) => {
    // "hay una navegación con un link llamado 'Docs'"
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: 'Docs' }).first()).toBeVisible();
  });

  test('click en el link usando rol', async ({ page }) => {
    // Combina find + action: encuentra y haz click
    await page.getByRole('link', { name: 'Get started' }).click();

    // Después del click debemos estar en la página de instalación
    await expect(
      page.getByRole('heading', { name: 'Installation' })
    ).toBeVisible();
  });
});

// ============================================================
// 💡 Opciones útiles de getByRole:
//
//   page.getByRole('button', { name: 'Submit' })
//   page.getByRole('button', { name: 'Submit', exact: true })  // match exacto
//   page.getByRole('button', { name: /submit/i })              // regex, case-insensitive
//   page.getByRole('link', { name: 'Docs' }).first()           // primer match
//   page.getByRole('heading', { level: 2 })                    // solo h2
//   page.getByRole('textbox', { name: 'Email' })               // input con label "Email"
// ============================================================
