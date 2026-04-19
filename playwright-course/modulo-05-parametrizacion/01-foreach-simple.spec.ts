// ============================================================
// Mini-clase 5.1 — forEach con array inline
// ============================================================
// La forma más simple de parametrizar: un array con los casos y
// un forEach que genera un test por cada item.
//
// OmniPizza nos regala 5 usuarios deterministas — perfectos para
// un test parametrizado que cubre happy path + casos de error.
// ============================================================

import { test, expect } from '@playwright/test';

type LoginCase = {
  username: string;
  shouldSucceed: boolean;
  slow?: boolean;
};

const loginCases: LoginCase[] = [
  { username: 'standard_user', shouldSucceed: true },
  { username: 'locked_out_user', shouldSucceed: false },
  { username: 'problem_user', shouldSucceed: true },
  { username: 'performance_glitch_user', shouldSucceed: true, slow: true },
  { username: 'error_user', shouldSucceed: true },
];

test.describe('Login parametrizado con forEach', () => {
  loginCases.forEach(({ username, shouldSucceed, slow }) => {
    // Cada iteración del forEach genera un test NUEVO con nombre dinámico.
    // En el reporte verás 5 tests distintos, uno por usuario.
    test(`${username} (esperado: ${shouldSucceed ? 'éxito' : 'falla'})`, async ({ page }) => {
      if (slow) test.slow();

      await page.goto('/');
      await page.getByTestId('username-desktop').fill(username);
      await page.getByTestId('password-desktop').fill('pizza123');
      await page.getByTestId('login-button-desktop').click();

      if (shouldSucceed) {
        await expect(page).toHaveURL(/\/catalog/);
      } else {
        await expect(page.getByTestId('login-error')).toBeVisible();
      }
    });
  });
});

// ============================================================
// Ventajas vs escribir 5 tests manualmente:
//   ✅ Una sola fuente de verdad (loginCases) — agregar un usuario
//      nuevo es añadir una línea al array.
//   ✅ Los cambios en la lógica del test aplican a TODOS los casos.
//   ✅ El reporte los muestra agrupados bajo el describe.
//
// Cuándo NO usar forEach:
//   ❌ Cuando cada caso tiene lógica MUY distinta (mejor tests separados).
//   ❌ Cuando los datos son demasiados — mejor un archivo JSON (siguiente spec).
// ============================================================
