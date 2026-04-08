// ============================================================
// RETO — Módulo 2: Anotaciones Básicas
// ============================================================
// Completa los TODOs. Cuando termines, corre:
//   pnpm test modulo-02-anotaciones/reto.spec.ts
// ============================================================

import { test, expect } from '@playwright/test';

// ----------------------------------------------------------------
// Reto 2.1 — Crea un describe llamado "Mi primer suite de retos"
// que contenga 2 tests:
//   1. Abre https://playwright.dev/ y valida que el título contenga "Playwright".
//   2. Abre https://playwright.dev/docs/intro y valida que exista un heading "Installation".
// ----------------------------------------------------------------

// TODO: escribe el describe aquí


// ----------------------------------------------------------------
// Reto 2.2 — Agrega un beforeEach al suite anterior que navegue a
// https://playwright.dev/ antes de cada test. Luego elimina los
// goto duplicados del interior de los tests.
// ----------------------------------------------------------------

// TODO: modifica el describe de arriba


// ----------------------------------------------------------------
// Reto 2.3 — Crea un nuevo describe "Tests con modificadores"
// con 4 tests:
//   - Un test normal que pase.
//   - Un test marcado con test.skip (explicando el motivo en un comentario).
//   - Un test marcado con test.fixme (simulando un bug abierto).
//   - Un test marcado como lento con test.slow().
// ----------------------------------------------------------------

// TODO:


// ----------------------------------------------------------------
// Reto 2.4 — Crea un describe "Tests con tags" con 3 tests etiquetados:
//   - uno con @smoke
//   - uno con @regression
//   - uno con @smoke @critical
// Luego córrelo con:
//   pnpm test modulo-02-anotaciones/reto.spec.ts --grep @smoke
// y verifica que solo 2 tests se ejecutaron.
// ----------------------------------------------------------------

// TODO:


// ----------------------------------------------------------------
// Reto 2.5 — BONUS: Crea un describe con beforeAll y afterAll que
// imprima "SUITE INICIADA" y "SUITE TERMINADA EN {segundos}s".
// Adentro, dos tests simples que naveguen a la homepage.
// ----------------------------------------------------------------

// TODO:
