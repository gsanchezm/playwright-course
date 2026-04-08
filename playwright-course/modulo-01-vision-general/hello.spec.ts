// ============================================================
// Módulo 1 — Tu primer test: "Hello Playwright"
// ============================================================
// Analogía: Este es el equivalente del "Hola Mundo" del curso
// de TypeScript, pero ahora el mundo es un navegador real.
// ============================================================

import { test, expect } from '@playwright/test';

test('homepage de Playwright tiene el título correcto', async ({ page }) => {
  // 1. Arrange — navegar a la URL de prueba
  await page.goto('https://playwright.dev/');

  // 2. Assert — verificar que el título contiene "Playwright"
  //    La expresión /Playwright/ es una regex: busca esa palabra
  //    en cualquier parte del título, sin importar mayúsculas/minúsculas.
  await expect(page).toHaveTitle(/Playwright/);
});

test('el link "Get Started" lleva a la página de instalación', async ({ page }) => {
  // 1. Arrange
  await page.goto('https://playwright.dev/');

  // 2. Act — hacer click en el link "Get started"
  await page.getByRole('link', { name: 'Get started' }).click();

  // 3. Assert — validar que ya estamos en la página de instalación
  //    Buscamos un heading (h1/h2/h3) con el texto "Installation"
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
