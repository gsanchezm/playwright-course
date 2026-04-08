// ============================================================
// Mini-clase 5.3 — Variables de entorno
// ============================================================
// Caso de uso real: quieres correr la MISMA suite contra distintos
// ambientes sin cambiar el código.
//
//   pnpm test                              → QA (default)
//   BASE_URL=https://staging.app.com pnpm test   → Staging
//   BASE_URL=https://prod.app.com pnpm test      → Prod ⚠️ cuidado
//
// Las credenciales también deben venir de env vars, nunca hardcoded:
//
//   TEST_USER=admin TEST_PASS=Test1234! pnpm test
//
// Analogía QA: es como tener un "config profile" en Postman
// (QA, staging, prod) y cambiar con un click. Pero en tests.
// ============================================================

import { test, expect } from '@playwright/test';

// process.env son las variables de entorno.
// El operador "??" devuelve el valor de la derecha si la izquierda es undefined/null.
const BASE_URL = process.env.BASE_URL ?? 'https://playwright.dev';
const ENV_NAME = process.env.ENV_NAME ?? 'default';

test.describe(`Tests contra ambiente: ${ENV_NAME}`, () => {
  test('la homepage del ambiente responde', async ({ page }) => {
    console.log(`[INFO] Corriendo contra: ${BASE_URL}`);

    const response = await page.goto(BASE_URL);

    // Validamos que la respuesta HTTP fue 200
    expect(response?.status()).toBe(200);
  });

  test('el ambiente correcto está en la URL', async ({ page }) => {
    await page.goto(BASE_URL);
    expect(page.url()).toContain(new URL(BASE_URL).hostname);
  });
});

// ============================================================
// 💡 En la práctica usarás un archivo .env con dotenv:
//
//   # .env (NUNCA subir a Git)
//   BASE_URL=https://qa.miempresa.com
//   TEST_USER=qa-user
//   TEST_PASS=secret123
//
// Y en playwright.config.ts:
//   import dotenv from 'dotenv';
//   dotenv.config();
//
// Luego en la terminal simplemente:
//   pnpm test
//
// Las vars se cargan automáticamente. ⚠️ .env debe estar en .gitignore.
// ============================================================
