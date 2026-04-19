# Módulo 2 — Anotaciones: de un smoke a un suite

> **Historia del curso:** en M1 escribimos un solo test suelto. Hoy lo **hacemos crecer** a una mini-suite con estructura: agrupamos casos con `describe`, extraemos precondiciones con hooks, marcamos tests bloqueados/lentos y los etiquetamos con tags.
>
> **Referencia oficial:** [Writing Tests](https://playwright.dev/docs/writing-tests) · [Annotations](https://playwright.dev/docs/test-annotations)

---

## Analogía principal

Un suite de Playwright = un plan de pruebas manual organizado:

| Playwright | Plan manual |
|---|---|
| `test()` | Un **caso de prueba** individual |
| `test.describe()` | Una **sección** ("Login", "Checkout") |
| `beforeEach` | La **precondición** que repites en cada caso |
| `afterEach` | La **limpieza** post-caso |
| `beforeAll` | El setup del día (prender ambiente, obtener token) |
| `afterAll` | El cierre final del día |
| Tags `@smoke` | El "filtro" que corre solo los casos críticos |

---

## Archivos del módulo — historia incremental

| # | Archivo | Pieza que añade |
|---|---------|-----------------|
| 2.1 | [01-test-basico.spec.ts](./01-test-basico.spec.ts) | El test más simple: login de `standard_user` |
| 2.2 | [02-describe-agrupacion.spec.ts](./02-describe-agrupacion.spec.ts) | Agrupar casos de login (happy + locked_out) |
| 2.3 | [03-hooks-each.spec.ts](./03-hooks-each.spec.ts) | `beforeEach` extrae `page.goto('/')` |
| 2.4 | [04-hooks-all.spec.ts](./04-hooks-all.spec.ts) | `beforeAll` despierta el backend en Render |
| 2.5 | [05-skip-only-fixme.spec.ts](./05-skip-only-fixme.spec.ts) | Modificadores: `skip`, `only`, `fixme`, `slow` |
| 2.6 | [06-tags-smoke-regression.spec.ts](./06-tags-smoke-regression.spec.ts) | Tags `@smoke` / `@regression` / `@critical` |
| 🚩 | [reto.spec.ts](./reto.spec.ts) | Tu ejercicio: construye tu propia suite |

---

## Conceptos clave por archivo

### 2.1 · test básico
Un solo caso — sin hooks, sin describe. Recordatorio de M1 antes de crecer.

### 2.2 · describe
Agrupa **happy path** (`standard_user`) con **error path** (`locked_out_user`) bajo "Suite: Login". En el reporte HTML vas a ver la jerarquía limpia.

### 2.3 · beforeEach
Los 3 tests del describe comparten `page.goto('/')`. Si mañana OmniPizza mueve la ruta de login, cambias UNA sola línea.

### 2.4 · beforeAll (el truco del curso)
OmniPizza vive en Render free tier. Si nadie tocó el backend en 15 min, el primer request tarda ~30s. Un `beforeAll` con un ping al `/health` **despierta** el servicio antes de que corran los tests — el primer test deja de llevarse el timeout.

### 2.5 · modificadores con usuarios deterministas
Cada usuario de OmniPizza encaja naturalmente:
- `skip` → signup (la feature no existe).
- `fixme` → `error_user` en checkout (bug conocido, flaky ~50%).
- `slow` → `performance_glitch_user` (+3s por request, triplicamos timeout).

### 2.6 · tags
`@smoke` para el happy path y la presencia del form. `@regression` para errores y UI extra. `@critical` para el login exitoso — si falla, **no se puede usar la app**.

---

## Cómo correr

```bash
# Todo el módulo
pnpm test modulo-02-anotaciones

# Solo un archivo
pnpm test modulo-02-anotaciones/04-hooks-all.spec.ts

# Solo smoke
pnpm test:smoke modulo-02-anotaciones

# Solo regression
pnpm test:regression modulo-02-anotaciones

# UI mode (recomendado al aprender)
pnpm test:ui
```

---

## Cheatsheet

```typescript
import { test, expect } from '@playwright/test';

test.describe('Suite', () => {
  test.beforeAll(async () => { /* una vez al inicio */ });
  test.afterAll(async () => { /* una vez al final */ });
  test.beforeEach(async ({ page }) => { /* antes de cada test */ });
  test.afterEach(async ({ page }, testInfo) => { /* después de cada test */ });

  test('caso normal @smoke', async ({ page }) => { /* ... */ });
  test.skip('bloqueado', async () => {});
  test.fixme('bug abierto', async () => {});
  test('lento', async () => { test.slow(); });
});
```

➡️ Cuando termines: [reto.spec.ts](./reto.spec.ts) · Siguiente módulo: [M3 — Ejecuciones](../modulo-03-ejecuciones/)
