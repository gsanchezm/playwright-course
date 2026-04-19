// ============================================================
// 🚩 RETO — Módulo 2: Anotaciones en OmniPizza
// ============================================================
// Completa los TODOs. Cuando termines, corre:
//   pnpm test modulo-02-anotaciones/reto.spec.ts
// ============================================================

import { test, expect } from '@playwright/test';

// ----------------------------------------------------------------
// Reto 2.1 — Crea un `test.describe` llamado
// "Mi primer suite: UI de la pantalla de login" con 3 tests:
//   1. El logo "Art of Pizza" es visible.
//   2. El botón "Sign In" es visible (testid: login-button-desktop).
//   3. El toggle del password (testid: toggle-password) es visible.
// ----------------------------------------------------------------

// TODO: escribe el describe aquí


// ----------------------------------------------------------------
// Reto 2.2 — Agrega un `beforeEach` al describe anterior que haga
// page.goto('/') antes de cada test. Luego elimina los goto
// duplicados del interior de los tests.
// ----------------------------------------------------------------

// TODO


// ----------------------------------------------------------------
// Reto 2.3 — Crea un describe "Tests con modificadores" con 4 tests:
//   - Uno normal: standard_user hace login exitoso.
//   - Uno con test.skip (explica en comentario por qué está bloqueado).
//   - Uno con test.fixme (simula un bug conocido).
//   - Uno con test.slow() que use `performance_glitch_user`.
// ----------------------------------------------------------------

// TODO


// ----------------------------------------------------------------
// Reto 2.4 — Crea un describe "Tests con tags" con 3 tests:
//   - Uno con @smoke
//   - Uno con @regression
//   - Uno con @smoke @critical
// Luego córrelo con `pnpm test modulo-02-anotaciones/reto.spec.ts --grep @smoke`
// y verifica que solo se ejecutaron los 2 tests con @smoke.
// ----------------------------------------------------------------

// TODO


// ----------------------------------------------------------------
// Reto 2.5 — BONUS: Crea un describe con beforeAll y afterAll que:
//   - beforeAll: haga un GET a https://omnipizza-backend.onrender.com/health
//     usando `request.newContext()` y loguée "Backend vivo (status XXX)".
//   - afterAll: loguée la duración total del suite.
//   - Contenga 2 tests simples que hagan login con `standard_user`.
// ----------------------------------------------------------------

// TODO
