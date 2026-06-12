# 🚩 Reto M06 — Canary matutino programado + alerta automática

## Objetivo

Crear un **segundo workflow** de GitHub Actions que corra automáticamente **cada mañana** un subset de smoke tests contra el deploy live de OmniPizza, y que **abra un issue automáticamente** si algo falla.

Esto es el patrón **canary in the coal mine**: detectar regresiones de producción antes de que un usuario las reporte.

---

## 🧰 Pre-requisitos

- [ ] El workflow principal (`playwright.yml`) ya corre verde en tu PR.
- [ ] Tienes los 4 secrets configurados (`BASE_URL`, `API_URL`, `TEST_USER_USERNAME`, `TEST_USER_PASSWORD`).
- [ ] Conoces el flag `--grep @smoke` y sabes que sólo corre los tests etiquetados.
- [ ] Tienes permisos de **write** sobre el repo (necesario para crear issues vía Actions).

---

## Pasos

### Paso 1 — Crear `.github/workflows/smoke-daily.yml`

**Qué hacer:**

Abre el archivo en VS Code (se crea al guardarlo):

```bash
code .github/workflows/smoke-daily.yml
```

Escríbelo con:

- Trigger `schedule` con cron `'0 14 * * *'` (= 14:00 UTC = 8am hora CDMX).
- Trigger `workflow_dispatch` para poder dispararlo manualmente desde la UI de GitHub.
- Que corra **solo** `--grep "@smoke" --project=ui-chromium` (un browser, no los 3).
- `timeout-minutes: 15` (menos que el workflow principal, porque es un subset).
- Subir el HTML report **si falla** (`if: failure()`).

**Pista — esqueleto mínimo:**

```yaml
name: Smoke Daily

on:
  schedule:
    - cron: "0 14 * * *"   # 14:00 UTC = 8am CDMX
  workflow_dispatch:        # botón "Run workflow" en la UI

permissions:
  contents: read
  issues: write             # ← necesario para el TODO 2

jobs:
  smoke:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    defaults:
      run:
        working-directory: playwright-course
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium

      - name: Smoke @smoke contra live
        run: pnpm exec playwright test --grep "@smoke" --project=ui-chromium
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          API_URL: ${{ secrets.API_URL }}
          TEST_USER_USERNAME: ${{ secrets.TEST_USER_USERNAME }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Subir report si falló
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: smoke-daily-report
          path: playwright-course/playwright-report
          retention-days: 7
```

**Cómo verificar:**

```bash
# Sintaxis del YAML
gh workflow list

# Dispárarlo manualmente para probar
gh workflow run smoke-daily.yml
gh run list --workflow=smoke-daily.yml --limit 1
gh run watch
```

---

### Paso 2 — Crear un issue automático si falla

**Qué hacer:**

Añade un step final al workflow que SOLO se ejecute si los anteriores fallaron. Usa la action [`actions/github-script@v7`](https://github.com/actions/github-script) para llamar a la API de issues.

**Pista — añade este step al final del job:**

```yaml
      - name: Abrir issue si falló
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const date = new Date().toISOString().split("T")[0];
            const runUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`;
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `🚨 Smoke canary falló — ${date}`,
              labels: ["canary", "regression"],
              body: [
                `El smoke matutino contra **OmniPizza live** falló.`,
                ``,
                `**Run:** ${runUrl}`,
                `**Fecha:** ${date}`,
                ``,
                `### Pasos sugeridos`,
                `1. Revisa el HTML report en los artefactos del run.`,
                `2. Descarga la traza con \`gh run download ${context.runId}\`.`,
                `3. Confirma si OmniPizza está realmente caído o si es un flake.`,
                `4. Si es flake recurrente, considera moverlo a una suite quarantined.`,
              ].join("\n"),
            });
```

**Cómo verificar:**

1. Fuerza un fallo: dispara el workflow tras añadir `DEMO_FAIL=1` en el env del step de test, o pushea un cambio que rompa un smoke.
2. Tras la corrida:
   ```bash
   gh issue list --label canary
   ```
   Debe aparecer **un issue nuevo** con el título `🚨 Smoke canary falló — YYYY-MM-DD`.

> 💡 **Importante:** `permissions: issues: write` en el bloque `permissions:` (Paso 1) es **obligatorio**. Sin esa línea, la action falla con `403`. Por defecto los workflows tienen permisos read-only desde 2023.

---

### Paso 3 — Añadir el badge al README principal

**Qué hacer:**

Edita `playwright-course/README.md` (o el del monorepo) y añade el badge **al inicio del archivo**, justo debajo del título:

```markdown
# Playwright Course

![Smoke Daily](https://github.com/<owner>/<repo>/actions/workflows/smoke-daily.yml/badge.svg)
```

Reemplaza `<owner>` y `<repo>` con tu username + nombre real del repo.

**Cómo verificar:**

- En GitHub, abre el README en tu navegador: el badge debe renderizar con un estado (verde si pasó, rojo si falló, gris si nunca corrió).
- Click sobre el badge te lleva a la página del workflow.

---

## ✅ Entregables

- [ ] `.github/workflows/smoke-daily.yml` versionado en `main`.
- [ ] El workflow corrió manualmente al menos una vez (`gh run list --workflow=smoke-daily.yml`).
- [ ] Generaste **un issue de prueba** forzando un fallo (puedes cerrarlo después con `gh issue close <num>`).
- [ ] Badge visible en el README principal y renderizando el estado actual.

---

## 📝 Preguntas de reflexión

1. **¿Por qué el canary corre solo 1 browser en lugar de los 3?**
   *(Pista: costo, ruido, y porque su trabajo es detectar regresiones de backend, no diferencias entre navegadores.)*

2. **¿Qué pasaría si el smoke canary fallara porque Render está dormido?**
   *(Pista: el cold start del backend free tier puede tardar 30-40s. ¿Cómo distinguirías un Render dormido de un bug real? Idea: warm-up step antes del test.)*

3. **¿Cómo evitarías que el canary envíe una alerta falsa por un flake?**
   *(Pista: `retries: 2` ya ayuda. También podrías exigir dos fallos consecutivos antes de abrir el issue, o agrupar issues por día.)*

4. **¿Quién más debería ser notificado?**
   *(Pista: además del issue, podrías añadir un step que use `slack-send` o `actions/notify-teams`. El issue ya es el patrón mínimo viable.)*

---

> 📚 **Profundización opcional:**
> - [Sintaxis de cron](https://crontab.guru/) — calculadora visual.
> - [`actions/github-script`](https://github.com/actions/github-script) — todas las APIs disponibles.
> - [Workflow permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) — entender por qué `permissions:` es necesario.
