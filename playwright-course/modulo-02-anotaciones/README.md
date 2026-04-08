# Módulo 2: Anotaciones Básicas

> **Objetivo:** Dominar las primitivas de Playwright Test: `test`, `test.describe`, los 4 hooks (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`), y los modificadores (`skip`, `only`, `fixme`, `slow`) y tags.

> **Referencia oficial:** [playwright.dev/docs/writing-tests](https://playwright.dev/docs/writing-tests) · [test-annotations](https://playwright.dev/docs/test-annotations)

---

## 🎯 Analogía principal

> **Un test suite de Playwright es como un plan de pruebas manual organizado:**
> - `test()` = un **caso de prueba** individual.
> - `test.describe()` = una **sección del plan** que agrupa casos relacionados (ej. "Login", "Checkout").
> - `beforeEach` = el paso "**Precondición**" que repites antes de cada caso.
> - `afterEach` = el paso "**Limpieza**" que repites después de cada caso (cerrar sesión, borrar datos).
> - `beforeAll` = la preparación que haces **una sola vez** al inicio del día (prender el ambiente).
> - `afterAll` = el reporte final que cierras al terminar toda la sesión.

---

## Archivos del módulo (modular: un concepto por archivo)

| Archivo | Concepto | Analogía |
|---------|----------|----------|
| [01-test-basico.spec.ts](./01-test-basico.spec.ts) | El caso de prueba más simple | "Caso 01: Login con credenciales válidas" |
| [02-describe-agrupacion.spec.ts](./02-describe-agrupacion.spec.ts) | Agrupar con `test.describe` | "Suite de Checkout" en TestRail |
| [03-hooks-each.spec.ts](./03-hooks-each.spec.ts) | `beforeEach` / `afterEach` | Precondiciones repetitivas |
| [04-hooks-all.spec.ts](./04-hooks-all.spec.ts) | `beforeAll` / `afterAll` | Setup del día / teardown final |
| [05-skip-only-fixme.spec.ts](./05-skip-only-fixme.spec.ts) | Modificadores de ejecución | Casos bloqueados, en foco, pendientes |
| [06-tags-smoke-regression.spec.ts](./06-tags-smoke-regression.spec.ts) | Etiquetar tests con tags | Suite de smoke vs regresión |
| [reto.spec.ts](./reto.spec.ts) | Ejercicios del alumno | — |

---

## 📋 Pasos explícitos para explicar en clase

1. **Abre `01-test-basico.spec.ts`.** Explica la anatomía: `import`, `test('nombre', async ({ page }) => { ... })`. Relaciónalo con el curso de TypeScript: el `async` y el `await` ya los conocen.
2. **Corre solo ese archivo:** `pnpm test modulo-02-anotaciones/01-test-basico.spec.ts`. Muestra el reporte.
3. **Abre `02-describe-agrupacion.spec.ts`.** Muestra cómo el reporte ahora agrupa los tests bajo el título del `describe`.
4. **Abre `03-hooks-each.spec.ts`.** Pregunta al grupo: "¿qué harían ustedes si tienen que hacer login antes de CADA test manual?". Responde: exactamente eso hace `beforeEach`.
5. **Abre `04-hooks-all.spec.ts`.** Haz la distinción clara: `beforeAll` corre UNA vez; `beforeEach` corre N veces.
6. **Abre `05-skip-only-fixme.spec.ts`.** Explica cada modificador con un escenario real:
   - `test.skip`: "el backend está caído".
   - `test.only`: "estoy debuggeando UN test y no quiero esperar los otros 200".
   - `test.fixme`: "este test falla porque encontré un bug real, lo dejo marcado".
   - `test.slow`: "este test es lento a propósito, tripliquemos su timeout".
7. **Abre `06-tags-smoke-regression.spec.ts`.** Muestra cómo correr solo smoke: `pnpm test --grep @smoke`.
8. **Envía al reto.**

---

## Cheatsheet del módulo

```typescript
import { test, expect } from '@playwright/test';

// Test individual
test('caso A', async ({ page }) => { /* ... */ });

// Grupo de tests
test.describe('Suite Login', () => {
  test.beforeAll(async () => { /* una vez al inicio */ });
  test.afterAll(async () => { /* una vez al final */ });

  test.beforeEach(async ({ page }) => { /* antes de cada test */ });
  test.afterEach(async ({ page }) => { /* después de cada test */ });

  test('login válido', async ({ page }) => { /* ... */ });
  test.skip('bug abierto', async () => { /* no corre */ });
  test.only('en foco', async () => { /* solo este corre */ });
  test.fixme('pendiente arreglar', async () => { /* marcado */ });
});
```

➡️ Empieza por [01-test-basico.spec.ts](./01-test-basico.spec.ts).
