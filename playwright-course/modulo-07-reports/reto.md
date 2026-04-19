# Reto — Módulo 7: Reports + Trace Viewer

## Reto 7.1 — HTML Report

```bash
pnpm test modulo-02-anotaciones --project=chromium
pnpm report
```

Explora:
- La lista de tests (status, duración).
- Los filtros arriba (passed / failed / flaky).
- Click en un test que pasó — ¿puedes ver los pasos?

**✅ Resultado esperado:** entiendes la estructura del reporte y cómo navegar.

---

## Reto 7.2 — Rompe un test y ve el Trace Viewer

1. Abre `modulo-02-anotaciones/01-test-basico.spec.ts` y rompe el assertion (ej. cambia `/\/catalog/` por `/\/dashboard/`).
2. Corre `pnpm test modulo-02-anotaciones/01-test-basico.spec.ts --retries=1`.
3. Abre el reporte: `pnpm report`.
4. Click en el test fallido → **"View trace"**.
5. Explora:
   - **Timeline** arriba → click en distintos pasos.
   - **DOM Snapshot** (izquierda) → cómo se veía la página en ese paso.
   - **Network** tab → requests de la session.
   - **Console** tab → logs del navegador.
6. Restaura el assertion original.

**✅ Resultado esperado:** sentiste el poder del Trace Viewer como reproductor de fallos.

---

## Reto 7.3 — Flakiness con `performance_glitch_user`

Crea `modulo-07-reports/flaky.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('performance_glitch_user llega al catálogo', async ({ page }) => {
  // Intencionalmente SIN test.slow() — queremos ver cómo se ve un flaky
  await page.goto('/');
  await page.getByTestId('username-desktop').fill('performance_glitch_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();
  await expect(page).toHaveURL(/\/catalog/);
});
```

Corre con retries:
```bash
pnpm test modulo-07-reports/flaky.spec.ts --project=chromium --retries=2
```

Abre el HTML report:
- El test puede aparecer como **flaky** (falló una vez, pasó al retry).
- Click en el retry → View trace.
- En la pestaña **Network**, busca el POST `/api/auth/login` → ¿cuántos ms tardó?

**✅ Resultado esperado:** diagnosticas que `performance_glitch_user` agrega latencia por request — evidencia para justificar `test.slow()`.

---

## Reto 7.4 — Reporters de terminal

```bash
pnpm test modulo-02-anotaciones --reporter=list --project=chromium
pnpm test modulo-02-anotaciones --reporter=line --project=chromium
pnpm test modulo-02-anotaciones --reporter=dot --project=chromium
```

Observa la diferencia visual.

**✅ Resultado esperado:** entiendes que `list` es el default detallado, `line` muestra progreso continuo, `dot` es minimalista (ideal para CI con mucho output).

---

## Reto 7.5 — JUnit XML y JSON

Edita temporalmente `playwright.config.ts`:

```ts
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results/results.json' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],
],
```

Corre `pnpm test modulo-02-anotaciones --project=chromium`. Luego abre:
- `test-results/results.json` — estructura completa.
- `test-results/junit.xml` — para Jenkins/GitLab.

Restaura el config original (quita json y junit).

---

## Reto 7.6 — Preguntas

1. ¿Por qué `trace: 'on-first-retry'` es mejor que `trace: 'on'`?
2. ¿Qué reporter usarías en GitHub Actions?
3. ¿Qué reporter usarías en Jenkins?
4. Al ver el Trace Viewer del test de `performance_glitch_user`, ¿en qué pestaña ves los 3 segundos de delay?

**Respuestas:**

1. Porque grabar trace en cada test es **costoso** (aumenta duración y tamaño del disco). `on-first-retry` solo graba cuando un test ya falló y se está reintentando — los casos donde realmente necesitas el trace.
2. `github` + `html`. El primero pone anotaciones inline en PRs; el segundo sube como artifact para revisión.
3. `junit` XML — Jenkins lo parsea automáticamente y lo muestra en el dashboard.
4. En la pestaña **Network** del Trace Viewer, donde ves el POST a `/api/auth/login` tardando ~3000 ms — esa es la evidencia.

---

## ✅ Checklist

- [ ] Abrí el HTML report y navegué por los tests.
- [ ] Usé Trace Viewer en un test fallido.
- [ ] Diagnostiqué la latencia de `performance_glitch_user` en la pestaña Network.
- [ ] Probé `list`, `line` y `dot` en terminal.
- [ ] Generé JUnit XML y JSON para CI.

➡️ Siguiente: [Módulo 8 — Repositorios y CI](../modulo-08-repositorios/)
