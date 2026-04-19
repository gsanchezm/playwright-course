# Módulo 7 — Reports: HTML, Trace Viewer y flakiness

> **Historia del curso:** ya sabes escribir, parametrizar y grabar tests contra OmniPizza. Hoy aprendes a **leer sus resultados** — HTML reports, Trace Viewer, y cómo diagnosticar un test flaky usando `performance_glitch_user`.
>
> **Referencia oficial:** [Reporters](https://playwright.dev/docs/test-reporters) · [Trace Viewer](https://playwright.dev/docs/trace-viewer)

---

## Analogía

Un reporter es el **formato de salida** de tu suite. Distintos consumidores quieren formatos distintos:

| Consumidor | Reporter |
|---|---|
| Tú viendo resultados en terminal | `list`, `line`, `dot` |
| Revisor humano en el navegador | `html` |
| Jenkins / GitLab CI | `junit` XML |
| Integraciones custom (Slack, Datadog) | `json` o reporter custom |
| GitHub Actions con anotaciones en PR | `github` |

---

## 1. Reporters built-in

| Reporter | Para qué | Ejemplo |
|---|---|---|
| `list` | Terminal con ✓/✗ (default) | `✓ login smoke (1.2s)` |
| `line` | Una sola línea que se actualiza | `[3/12] Running...` |
| `dot` | Minimalista: un punto por test | `......F....` |
| `html` | Reporte visual con filtros + traces | Se abre con `pnpm report` |
| `json` | Archivo JSON con todos los resultados | `{"tests": [...]}` |
| `junit` | XML para Jenkins/GitLab | `<testsuite>...</testsuite>` |
| `github` | Anotaciones inline en PRs | — |
| `blob` | Para mergear reports multi-shard (M8) | — |

---

## 2. Configuración actual del curso

En `playwright.config.ts` ya tienes:

```ts
reporter: [
  ['html', { open: 'never' }],   // no abre el browser automáticamente
  ['list'],                       // lista en terminal
],
```

Para agregar JSON + JUnit (útil en CI):

```ts
reporter: [
  ['html', { open: 'never' }],
  ['list'],
  ['json', { outputFile: 'test-results/results.json' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],
],
```

---

## 3. El reporter HTML (el más usado)

```bash
# Después de correr tests
pnpm report
```

Se abre el navegador con:
- Lista completa de tests con duración y status.
- Filtros: passed / failed / flaky / skipped.
- Al hacer click en un test fallido: screenshot, video, trace, logs.

### Ejemplo: ver el reporte de M5

```bash
pnpm test modulo-05-parametrizacion --project=chromium
pnpm report
```

Verás los 5 tests parametrizados del forEach, los 4 del JSON (uno por mercado), los del env vars y los de la fixture.

---

## 4. Trace Viewer — el súper poder ⭐

Cuando `trace: 'on-first-retry'` (ya configurado), Playwright graba una **caja negra** de cada test que falla + retry:

- 📸 DOM snapshot antes y después de cada acción
- 🌐 Todos los requests de red
- 📜 Console logs del navegador
- 🎬 Video completo de la sesión
- 📋 Stack trace del error

### Cómo abrirlo

1. `pnpm test` — corre tus specs.
2. Si alguno falló: `pnpm report`.
3. Click en el test fallido → botón **"View trace"**.
4. Se abre el Trace Viewer con timeline interactivo.

En el Trace Viewer:
- **Click en un paso** del timeline → ves el DOM congelado en ese momento.
- **Scroll en el video** → se sincroniza con el DOM.
- **Pestaña "Network"** → todas las requests que se hicieron.
- **Pestaña "Console"** → logs del browser.

---

## 5. El caso estrella: diagnosticar flakiness con `performance_glitch_user`

OmniPizza tiene un usuario diseñado para ser lento: **`performance_glitch_user`** agrega ~3s a cada request. Corre este test varias veces para ver cómo el Trace Viewer te ayuda a diagnosticar.

### Test flaky a propósito

```ts
// modulo-07-reports/flaky.spec.ts  (créalo tú)
import { test, expect } from '@playwright/test';

test('performance_glitch_user llega al catálogo @regression', async ({ page }) => {
  // Sin test.slow() ni retries — DEJAMOS que se ponga flaky para el ejercicio.
  await page.goto('/');
  await page.getByTestId('username-desktop').fill('performance_glitch_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();
  await expect(page).toHaveURL(/\/catalog/);
});
```

Córrelo varias veces:
```bash
pnpm test modulo-07-reports/flaky.spec.ts --project=chromium --retries=2
```

Abre el reporte HTML: verás los intentos fallidos y el Trace Viewer te mostrará **exactamente en qué request se fue el tiempo**. Esa pestaña "Network" es la evidencia que presentarías para justificar un `test.slow()` o un timeout mayor.

---

## 6. Reporters de CI

### GitHub Actions

```ts
reporter: process.env.CI
  ? [['github'], ['html', { open: 'never' }]]
  : [['list'], ['html', { open: 'never' }]],
```

El `github` reporter imprime anotaciones directo en los diffs del PR — perfecto cuando alguien abre un PR y un test falla: la anotación aparece en la línea exacta.

### Jenkins / GitLab

```ts
['junit', { outputFile: 'test-results/junit.xml' }]
```

Jenkins/GitLab parsean el XML y muestran el status del build en el dashboard.

---

## 7. Reporter custom (teaser de M8 y proyectos reales)

Puedes crear un reporter que envíe a Slack, Datadog, TestRail…

```ts
// custom-reporter.ts
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

export default class SlackReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      // fetch a un webhook de Slack con el nombre del test
    }
  }
}
```

En `playwright.config.ts`: `reporter: [['./custom-reporter.ts']]`.

---

## Cheatsheet

```bash
# HTML report
pnpm report

# Reporter específico desde CLI
pnpm test --reporter=list
pnpm test --reporter=line
pnpm test --reporter=dot
pnpm test --reporter=json

# Abrir un trace específico sin el reporter
pnpm exec playwright show-trace test-results/ruta-al-trace.zip

# Abrir un HTML report de otra carpeta
pnpm exec playwright show-report ./playwright-report
```

➡️ [reto.md](./reto.md) · [Módulo 8 — Repositorios y CI](../modulo-08-repositorios/)
