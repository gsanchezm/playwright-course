// ============================================================
// Mini-clase 5.3 — Variables de entorno
// ============================================================
// Cuando un dato NO debe ir hardcoded en el código (credenciales,
// URLs, tokens), se pasa por variable de entorno.
//
// Ejemplo de uso:
//   TEST_USER=error_user pnpm test modulo-05-parametrizacion/03-env-variables.spec.ts
//   BASE_URL=http://localhost:5173 pnpm test
//
// En `playwright.config.ts` ya usamos `process.env.CI` para decidir
// retries y workers. Aquí lo aplicamos a nivel de test.
// ============================================================

import { test, expect } from '@playwright/test';

// Leemos del entorno con fallback seguro.
// Si alguien corre sin la env var, el test usa el default.
const USERNAME = process.env.TEST_USER ?? 'standard_user';
const PASSWORD = process.env.TEST_PASS ?? 'pizza123';

test(`login con credenciales desde env (user=${USERNAME})`, async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username-desktop').fill(USERNAME);
  await page.getByTestId('password-desktop').fill(PASSWORD);
  await page.getByTestId('login-button-desktop').click();

  // standard_user, problem_user, performance_glitch_user, error_user → catálogo
  // locked_out_user → error
  if (USERNAME === 'locked_out_user') {
    await expect(page.getByTestId('login-error')).toBeVisible();
  } else {
    await expect(page).toHaveURL(/\/catalog/);
  }
});

// ============================================================
// Patrón común en CI:
//
//   # .github/workflows/playwright.yml
//   env:
//     TEST_USER: ${{ secrets.TEST_USER }}
//     TEST_PASS: ${{ secrets.TEST_PASS }}
//
// Esto permite rotar credenciales sin tocar el código versionado.
//
// Otra variante: archivos .env cargados con dotenv (extensión del
// curso — no incluida para mantener cero dependencias extra).
// ============================================================
