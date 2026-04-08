# Módulo 7: Reports (Reporters)

> **Objetivo:** Conocer los reporters built-in de Playwright (HTML, list, line, dot, json, JUnit, GitHub, blob) y saber cuándo usar cada uno.

> **Referencia oficial:** [test-reporters](https://playwright.dev/docs/test-reporters)

---

## 🎯 Analogía principal

> **Un reporter es el "formato de salida" de tu suite.** Así como un tester manual entrega sus resultados en **Word, Excel o un dashboard**, Playwright puede generar sus resultados en varios formatos para distintas audiencias:
>
> - **HTML** → para humanos que revisan en el navegador.
> - **list / dot / line** → para ti mientras desarrollas en la terminal.
> - **JUnit XML** → para que Jenkins/GitLab CI lo entiendan.
> - **JSON** → para integraciones custom.
> - **GitHub** → para anotaciones en PRs.

---

## 1. Los reporters built-in

| Reporter | Para qué | Ejemplo de salida |
|----------|----------|-------------------|
| `list` | Terminal: lista de tests con ✓ o ✗ | `✓ login valid (1.2s)` |
| `line` | Terminal: una sola línea actualizada | `[2/10] Running login spec` |
| `dot` | Terminal minimalista: un punto por test | `...F..` |
| `html` | Reporte visual interactivo | Página web completa |
| `json` | Archivo JSON con todos los resultados | `{ "tests": [...] }` |
| `junit` | XML compatible con Jenkins/GitLab | `<testsuite>...</testsuite>` |
| `github` | Anotaciones automáticas en PRs de GitHub | Inline comments en el diff |
| `blob` | Para mergear reports de varios shards | — |

---

## 2. Configurar reporters en `playwright.config.ts`

Ya están configurados en el curso. Puedes tener **varios a la vez**:

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
});
```

---

## 3. El reporter HTML (el más usado)

Después de correr `pnpm test`, abres el reporte con:

```bash
$ pnpm report
```

Se abre en tu navegador y puedes:
- Ver el listado completo de tests con su duración.
- Filtrar por status (passed / failed / flaky / skipped).
- Hacer click en un test fallido y ver:
  - **Screenshot** del momento del fallo.
  - **Video** de toda la ejecución.
  - **Trace** (el súper poder de Playwright — ver sección 5).
  - Logs paso a paso.

### Abrir el HTML desde cualquier carpeta

```bash
$ pnpm exec playwright show-report ./playwright-report
```

---

## 4. Reporters para terminal (`list`, `line`, `dot`)

Úsalos desde CLI con `--reporter`:

```bash
$ pnpm test --reporter=list   # lista con ✓/✗ (default)
$ pnpm test --reporter=line   # una sola línea que se actualiza
$ pnpm test --reporter=dot    # un punto por test (ideal en CI con mucho output)
```

**Analogía QA:** son distintas vistas de Excel. `list` es detallada, `line` es un "progreso actual", `dot` es minimalista como un indicador de carga.

---

## 5. El Trace Viewer (el súper poder ⭐)

Cuando configuras `trace: 'on-first-retry'` (ya lo hicimos en `playwright.config.ts`), Playwright graba:

- 📸 Snapshots del DOM en cada paso
- 🌐 Todas las requests de red
- 📜 Todos los console logs
- 🎬 Un video completo
- 📋 El stack trace de cualquier error

Para verlo, en el reporte HTML haces click en el botón **"View trace"** de un test fallido. Se abre una interfaz con timeline interactivo.

**Analogía QA:** es como tener una cámara que grabó todo lo que pasó durante la prueba, y además un inspector de consola congelado en el tiempo. No hay herramienta más poderosa para depurar tests que fallan en CI y no puedes reproducir localmente.

Abrir un trace sin reporter:

```bash
$ pnpm exec playwright show-trace test-results/path-to-trace.zip
```

---

## 6. JUnit XML para CI (Jenkins, GitLab, CircleCI)

```typescript
reporter: [['junit', { outputFile: 'test-results/junit.xml' }]],
```

Jenkins/GitLab consumen este XML para mostrar el status de tests en cada build. No necesitas más configuración.

---

## 7. Reporter de GitHub Actions

Cuando tu CI corre en GitHub Actions, usa el reporter especial `github`:

```typescript
reporter: process.env.CI
  ? [['github'], ['html', { open: 'never' }]]
  : [['list'], ['html', { open: 'never' }]],
```

Esto hace que los fallos aparezcan como **anotaciones inline en el PR** — directamente en las líneas del código que causaron el fallo.

---

## 8. Reporter custom (avanzado)

Si necesitas integrar con Slack, Datadog, TestRail, etc., puedes crear un reporter propio implementando la interfaz `Reporter`:

```typescript
// custom-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

export default class MyReporter implements Reporter {
  onBegin(config, suite) {
    console.log(`🚀 Iniciando suite con ${suite.allTests().length} tests`);
  }
  onTestEnd(test: TestCase, result: TestResult) {
    console.log(`${test.title}: ${result.status}`);
    // Aquí enviarías a Slack, Datadog, etc.
  }
  onEnd(result) {
    console.log(`✅ Suite terminó con status: ${result.status}`);
  }
}
```

Y lo usas así:
```typescript
reporter: [['./custom-reporter.ts']],
```

---

## 📋 Pasos explícitos para explicar en clase

1. **Corre `pnpm test` con el reporter default (list + html).** Muestra la salida en terminal.
2. **Abre el reporte HTML con `pnpm report`.** Navega por los tests pasados.
3. **Rompe un test a propósito** (cambia un assertion) y vuelve a correr.
4. **En el reporte HTML**, haz click en el test fallido. Muestra el screenshot, el error, y el botón "View trace".
5. **Abre el Trace Viewer.** Esto es el momento WOW del módulo. Muestra el timeline, el DOM snapshot de cada paso, y cómo puedes ver el error exacto.
6. **Corre con `--reporter=line`** y muestra la diferencia.
7. **Corre con `--reporter=json`** y abre el archivo generado en `test-results/results.json`.
8. **Envía al reto.**

---

## ✅ Checklist

- [ ] Sé correr tests con distintos reporters desde la CLI.
- [ ] Sé abrir el reporte HTML con `pnpm report`.
- [ ] Sé ver el trace de un test fallido.
- [ ] Sé configurar múltiples reporters en `playwright.config.ts`.
- [ ] Entiendo cuándo usar JUnit XML vs HTML vs GitHub reporter.

➡️ Siguiente: [Módulo 8: Repositorios](../modulo-08-repositorios/)
