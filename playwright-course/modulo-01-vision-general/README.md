# Módulo 1 — Visión general de Playwright

> **Historia del curso:** vamos a construir un mini framework de pruebas para **OmniPizza** (app de pedidos de pizza) a lo largo de 10 módulos. Cada módulo añade una pieza al framework. Hoy empezamos por el principio: **un solo test que verifica el login**.

---

## ¿Qué es Playwright?

Playwright es un framework de automatización E2E creado por Microsoft. Controla Chromium, Firefox y WebKit con una sola API de TypeScript/JavaScript.

**Ventajas vs Selenium:**
- **Auto-waiting** — espera automáticamente a que el DOM esté listo; no usas `sleep`.
- **Locators resilientes** — `getByRole`, `getByLabel`, `getByTestId` (los verás a fondo en Módulo 4).
- **Trace Viewer** — graba una "caja negra" con DOM snapshots + video + red (Módulo 7).
- **Paralelismo** por defecto — los archivos corren en workers distintos.

---

## ¿Qué es OmniPizza?

| Aspecto | Valor |
|---|---|
| Frontend live | https://omnipizza-frontend.onrender.com |
| Backend live | https://omnipizza-backend.onrender.com |
| Repo | https://github.com/gsanchezm/OmniPizza |
| Stack | React + Vite (frontend), FastAPI (backend) |
| Autenticación | JWT con usuarios deterministas (ver abajo) |
| Mercados | MX / US / CH / JP — precios, impuestos y form fields cambian según país |

**Usuarios de prueba** (password común: `pizza123`):

| Usuario | Propósito pedagógico |
|---|---|
| `standard_user` | Happy path — usaremos este en M1–M3 |
| `locked_out_user` | 403 en login — test de error esperado |
| `problem_user` | Precios en $0 + imágenes rotas |
| `performance_glitch_user` | Retraso de ~3s — útil para timeouts y retries |
| `error_user` | ~50% falla en checkout — útil para flakiness |

> ⚠️ El backend en Render puede tardar ~30s en "despertar" la primera vez (cold start). Si el primer test falla con timeout, córrelo de nuevo.

---

## Anatomía del primer test (`hello.spec.ts`)

```ts
import { test, expect } from '@playwright/test';

test('smoke: standard_user puede hacer login y llegar al catálogo', async ({ page }) => {
  // ARRANGE — preparar el estado
  await page.goto('/');

  // ACT — ejecutar la acción a probar
  await page.getByTestId('username-desktop').fill('standard_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();

  // ASSERT — verificar el resultado esperado
  await expect(page).toHaveURL(/\/catalog/);
  await expect(page.getByAltText('OmniPizza')).toBeVisible();
});
```

**Patrón AAA** (Arrange, Act, Assert) — la estructura universal de los tests. Playwright es sólo el vehículo; el patrón es del testing.

> 💡 **Sobre `-desktop` en los testids**: el frontend de OmniPizza tiene un hook `tid()` que añade `-desktop` o `-responsive` al `data-testid` según el viewport. A viewport default (1280×720) todos los testids llevan `-desktop`. En **Módulo 4** entraremos al detalle de todas las estrategias de locator.

---

## Cómo correrlo

```bash
# Instala browsers la primera vez
pnpm install
pnpm install-browsers

# Corre solo el smoke
pnpm test modulo-01-vision-general/hello.spec.ts

# Con navegador visible (útil al aprender)
pnpm test:headed modulo-01-vision-general/hello.spec.ts

# Abre Playwright UI (modo interactivo, recomendado)
pnpm test:ui
```

Output esperado (al correr solo en Chromium):

```
Running 1 test using 1 worker
  ✓  [chromium] › hello.spec.ts:14 — smoke: standard_user puede hacer login... (4.2s)

  1 passed (5s)
```

---

## Qué construimos hoy y qué sigue

| Módulo | Pieza del framework que suma |
|---|---|
| **1 (hoy)** | `hello.spec.ts` — primer test plano |
| 2 | `describe` + hooks + tags `@smoke`/`@regression` |
| 3 | Correr el suite en headed / UI mode / multi-browser |
| 4 | Locators (todos los que Playwright ofrece) |
| 5 | Data-driven con los 4 mercados de OmniPizza |
| 6 | Codegen para generar specs nuevas |
| 7 | Reports (HTML, Trace Viewer) + flakiness con `performance_glitch_user` |
| 8 | CI/CD en GitHub Actions contra el deploy live |
| 9 | API testing puro (aislado del UI) contra la REST API |
| 10 | Page Object Model — refactor final del framework |

---

## Tu primera tarea

➡️ Ve al [reto](./reto.md).
