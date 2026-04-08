// ============================================================
// RETO — Módulo 4: Localizadores
// ============================================================
// Usa SIEMPRE la jerarquía de preferencia:
//   getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > CSS
//
// Todos los retos usan https://demo.playwright.dev/todomvc
// ============================================================

import { test, expect } from '@playwright/test';

const TODOMVC_URL = 'https://demo.playwright.dev/todomvc';

test.describe('Reto: Localizadores en TodoMVC', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TODOMVC_URL);
  });

  // ----------------------------------------------------------------
  // Reto 4.1 — Agrega un todo con el texto "Mi primer reto"
  // usando getByPlaceholder. Valida que aparece en la lista.
  // ----------------------------------------------------------------
  test.fixme('4.1: agregar un todo con getByPlaceholder', async ({ page }) => {
    // TODO: implementa
  });

  // ----------------------------------------------------------------
  // Reto 4.2 — Agrega 3 todos: "A", "B", "C". Luego valida con
  // toHaveCount que hay 3 items, y que el segundo es "B" usando .nth(1).
  // ----------------------------------------------------------------
  test.fixme('4.2: contar y acceder por nth', async ({ page }) => {
    // TODO:
  });

  // ----------------------------------------------------------------
  // Reto 4.3 — Agrega 3 todos: "Comprar leche", "Pagar renta",
  // "Llamar a mamá". Marca SOLO el segundo como completado usando
  // encadenamiento: listitem + filter + checkbox.
  // ----------------------------------------------------------------
  test.fixme('4.3: marcar un todo específico como completado', async ({ page }) => {
    // TODO:
  });

  // ----------------------------------------------------------------
  // Reto 4.4 — Agrega 2 todos y luego haz click en el link "Active"
  // del footer de TodoMVC (es un link con texto "Active"). Valida que
  // sigue mostrando los 2 todos porque ninguno está completado.
  // Pista: usa getByRole('link', { name: 'Active' })
  // ----------------------------------------------------------------
  test.fixme('4.4: filtro Active con getByRole link', async ({ page }) => {
    // TODO:
  });

  // ----------------------------------------------------------------
  // Reto 4.5 — Agrega un todo. Hover sobre él para mostrar el botón
  // de borrar (X). Haz click en el botón. Valida que la lista queda
  // vacía con toHaveCount(0).
  // Pista: el botón de borrar tiene role "button" y name "Delete"
  // ----------------------------------------------------------------
  test.fixme('4.5: hover y click en botón de borrar', async ({ page }) => {
    // TODO:
  });

  // ----------------------------------------------------------------
  // Reto 4.6 — BONUS: reescribe el reto 4.3 usando 3 locators diferentes:
  //   (a) con filter({ hasText: '...' })
  //   (b) con .nth(1)
  //   (c) con getByRole('listitem', { name: 'Pagar renta' })
  // Y observa cuál se lee mejor.
  // ----------------------------------------------------------------
  test.fixme('4.6: 3 formas de localizar el mismo elemento', async ({ page }) => {
    // TODO:
  });
});
