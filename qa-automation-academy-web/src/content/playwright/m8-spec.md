# El spec paso a paso

Esta página cubre la parte de **ejecución y debugging** de M08: forzar y leer trazas en local con el Trace Viewer, provocar un fallo intencional, pushear y observar el pipeline, y descargar los artefactos de un PR. Al final tienes el código completo de `ejemplo.spec.ts`.

---

## Paso 6 — Forzar una traza local (sin CI todavía)

Antes de confiar en CI, practica leer una traza en local:

```bash
# 1. Forzar traza ON en una corrida normal
pnpm exec playwright test modulo-01-smoke-feo --trace=on --project=ui-chromium

# 2. Listar los resultados generados
ls test-results/
# Verás carpetas tipo `modulo-01-smoke-feo-...-chromium`

# 3. Abrir el trace
pnpm exec playwright show-trace test-results/<carpeta>/trace.zip
```

> 🔍 **Detalle que parece obvio — `trace: "retain-on-failure"`**
> **Qué es:** graba la traza (la "caja negra") **sólo cuando un test falla**, no en cada corrida — por eso arriba forzaste `--trace=on`: para tener material que abrir aunque el test pase.
> **Por qué así (y no la alternativa obvia):** `trace: "on"` graba la traza de **todos** los tests, pasen o fallen. Eso es lento y genera artefactos pesados que casi nunca vas a abrir. `retain-on-failure` te da exactamente la traza que necesitas — la del test roto — sin cargar el pipeline con cientos de zips inútiles.
> **Qué pasa si lo cambias:** con `"on"` cada PR sube gigabytes de trazas y los jobs tardan más; con `"off"` te quedas ciego cuando algo falla en CI y no puedes reproducir el bug.

**Qué explorar en el Trace Viewer:**

- **Timeline** (arriba): cada acción del test como una franja temporal.
- **DOM snapshot**: estado del DOM en cada paso (click derecho → "Show element").
- **Network**: cada request HTTP con headers + response.
- **Console**: lo que la app imprimió en `console.log`.
- **Source**: el código del test sincronizado con el paso.

Dedícale unos minutos aquí. **Ningún concepto del módulo importa más que ver una traza:** si no asimilas el Trace Viewer, todo lo demás suena a "más CI".

---

## Paso 7 — Forzar un fallo intencional y leer su traza

`ejemplo.spec.ts` tiene un test `@debug` que **falla a propósito** si activas la flag `DEMO_FAIL=1`:

```bash
DEMO_FAIL=1 pnpm exec playwright test modulo-08-ci-debugging --project=ui-chromium
# El test va a fallar después de 2s.

# Abre la traza generada:
pnpm exec playwright show-trace test-results/<carpeta-debug>/trace.zip
```

(🪟 En PowerShell: `$env:DEMO_FAIL="1"; pnpm exec playwright test modulo-08-ci-debugging --project=ui-chromium`.)

Observa cómo en el último paso se ve el screenshot final + el locator que nunca apareció. **Eso es lo que recibes en un PR fallido**.

---

## Paso 8 — Pushear y observar el pipeline

```bash
# 1. Crea una rama (si no estás ya en una)
git switch -c feature/m08-ci

# 2. Commit (si tienes cambios)
git add .
git commit -m "feat(m08): habilita CI workflow"

# 3. Push
git push -u origin feature/m08-ci

# 4. Abre el PR
gh pr create --base main --head feature/m08-ci --title "feat(m08): habilita CI workflow" --body "Pipeline matrix sobre 3 browsers + API"

# 5. Sigue los checks en vivo
gh pr checks --watch
```

**Qué deberías ver:** **7 jobs** corriendo en paralelo (3 browsers × 2 shards + 1 api). Cuando terminen, todos en verde.

---

## Paso 9 — Descargar artefactos de un PR

Si algún job falla:

```bash
# Lista las corridas recientes
gh run list --workflow=playwright.yml --limit 5

# Descarga todos los artefactos de una corrida
gh run download <run-id>

# Lo descarga a carpetas por nombre de artefacto:
ls
# playwright-report-ui-chromium-shard1/
# playwright-traces-ui-chromium-shard1/
# ...

# Abre el trace del job fallido:
pnpm exec playwright show-trace playwright-traces-ui-chromium-shard1/*/trace.zip
```

(🪟 En PowerShell el `*` no se expande para ejecutables: usa la ruta explícita de la carpeta que descargó `gh run download` — `pnpm exec playwright show-trace playwright-traces-ui-chromium-shard1/<carpeta>/trace.zip`.)

El flujo *"PR rojo → descargo artefactos → leo la traza"* es el día a día de un automatizador. Practicarlo aquí evita pánico en el primer fallo real en tu trabajo.

---

## Código completo — `ejemplo.spec.ts`

```ts
// @file modulo-08-ci-debugging/ejemplo.spec.ts
// ============================================================
// M08 — Tests de demostración para el pipeline de CI
// ============================================================
// Estos tests existen para que el pipeline tenga material real
// con el que demostrar traces, reports y shards.
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

test.describe("M08 — smoke canary @smoke", () => {
  test("home → catalog stays operational", async ({ page, catalogPage }) => {
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });
});

test.describe("M08 — regression multi-category @regression", () => {
  const categories = ["popular", "veggie", "meat"] as const;

  for (const category of categories) {
    test(`category ${category} loads and shows pizzas`, async ({ page, catalogPage }) => {
      await page.goto("/catalog");
      await catalogPage.waitForCatalog();
      await catalogPage.selectCategory(category);
      await catalogPage.expectHasPizzas();
    });
  }
});

test.describe("M08 — trace on failure demo", () => {
  test("this test fails intentionally to demonstrate trace @debug", async ({ page }) => {
    test.skip(!process.env.DEMO_FAIL, "Enable with DEMO_FAIL=1 to see the trace");
    await page.goto("/");
    // Falla intencional — la traza tendrá el screenshot exacto.
    await expect(page.locator("#this-does-not-exist")).toBeVisible({ timeout: 2_000 });
  });
});
```
