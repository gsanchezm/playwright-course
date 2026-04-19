# Módulo 8 — Repositorios y CI: correr el framework contra OmniPizza en GitHub Actions

> **Historia del curso:** ya tienes una mini-suite completa contra OmniPizza. Hoy la publicas en GitHub y la haces correr automáticamente en cada push/PR — **la automatización de la automatización**.
>
> **Prerrequisito:** haber completado el [curso de Git/GitHub](../../git-github-course/).
>
> **Referencia oficial:** [CI](https://playwright.dev/docs/ci) · [CI Intro](https://playwright.dev/docs/ci-intro)

---

## Analogía

CI = asistente robótico que corre **toda tu regresión** cada vez que alguien toca el código.

| Sin CI | Con CI |
|---|---|
| Dev hace cambio | Dev hace push |
| Automatizador se entera horas después | GitHub Actions corre la suite |
| Corre tests local | 5-10 min, todos saben si algo rompió |
| Reporta fallos | El PR se **bloquea** si falla |

---

## 1. Estructura del repo del curso

```
playwright-course/
├── .github/
│   └── workflows/
│       └── playwright.yml     ← ⭐ el pipeline (lo crearás en el reto)
├── modulo-01..10/             ← los tests
├── fixtures/                  ← (llega en M10 con POM)
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── .gitignore
└── README.md
```

---

## 2. `.gitignore` del curso

```gitignore
node_modules/
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
.env
.env.local
.DS_Store
```

Ya está en tu repo. Nunca commits artefactos ni secretos.

---

## 3. El workflow — `.github/workflows/playwright.yml`

Usa el archivo [`playwright.yml.example`](./playwright.yml.example) como base. Versión abreviada:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:smoke
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

**Puntos importantes para este curso:**

- **`--with-deps`** — Ubuntu runners no tienen las libs nativas que los navegadores de Playwright necesitan. El flag las instala.
- **`chromium` solo** — en CI restringimos a un navegador para ahorrar minutos. Local puedes probar Firefox/WebKit.
- **`pnpm test:smoke`** — en PR corremos solo `@smoke`. `@regression` completo se reserva para merges a `main` (ver sección 5).
- **`if: always()`** — el upload del reporte HTML corre **incluso si los tests fallan** (sin este flag, justo cuando más lo necesitas no lo tendrías).

---

## 4. OmniPizza en Render + CI: el problema del cold start

Render free tier duerme al servicio tras 15 min sin tráfico. El primer request tras dormir tarda ~30-40s.

**En CI esto puede causar el primer test al día siempre falle**. Soluciones del curso:

### Solución A — Warm-up en `beforeAll` (ya aplicada en M2)

El `modulo-02-anotaciones/04-hooks-all.spec.ts` tiene:

```ts
test.beforeAll(async () => {
  const api = await request.newContext();
  await api.get('https://omnipizza-backend.onrender.com/health', { timeout: 60_000 });
  await api.dispose();
});
```

Esto despierta el backend antes de que corran los tests reales.

### Solución B — Step pre-test en el workflow

```yaml
- name: Warm up OmniPizza backend
  run: |
    curl -f --max-time 60 https://omnipizza-backend.onrender.com/health || true
    curl -f --max-time 60 https://omnipizza-frontend.onrender.com/ || true
  continue-on-error: true
```

`|| true` y `continue-on-error` aseguran que si el warm-up falla, el workflow sigue a los tests reales.

### Solución C — `retries: 2` en CI

Ya está en el `playwright.config.ts`:

```ts
retries: process.env.CI ? 2 : 0,
```

Un reintento absorbe el cold-start sin ocultar bugs reales.

---

## 5. Smoke en PRs, regression completa en main

```yaml
jobs:
  smoke:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      # ...setup...
      - run: pnpm test:smoke

  regression:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      # ...setup...
      - run: pnpm test:regression
```

**Beneficio:** los PRs corren rápido (~2-3 min de smoke); el merge a main corre la regresión completa.

---

## 6. Shards por mercado (OmniPizza-flavored)

En M5 aprendiste que el mismo test corre para los 4 mercados (MX/US/CH/JP). En CI puedes **partir la suite en 4 shards** — uno por mercado:

```yaml
jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]

    steps:
      # ...setup...
      - name: Run shard ${{ matrix.shard }}
        run: pnpm test --shard=${{ matrix.shard }}
```

Cuatro jobs corren en paralelo en 4 runners distintos. Total ~4× más rápido.

---

## 7. Secrets — NUNCA hardcodear

GitHub → **Settings → Secrets and variables → Actions**. Crea:
- `TEST_USER` (opcional, por si quieres forzar un usuario distinto).
- `TEST_PASS` (opcional).

> En OmniPizza los usuarios son **públicos deterministas** (`standard_user` / `pizza123`), así que **no hay secretos reales que proteger** en este curso. Pero el patrón queda enseñado para cuando trabajes con apps con credenciales reales.

---

## 8. Badge de CI en el README

```markdown
![Playwright Tests](https://github.com/<tu-user>/<tu-repo>/actions/workflows/playwright.yml/badge.svg)
```

Verde = último run pasó. Rojo = falló. Es la vitrina de tu framework.

---

## 9. Artifacts — descargar el reporte HTML del run

Cuando el CI termina, tienes **30 días** para descargar:
- `playwright-report.zip` → descomprímelo y abre `index.html`.
- Ves EXACTAMENTE lo mismo que `pnpm report` local.

El Trace Viewer (M7) funciona igual — puedes abrir un trace de un fallo que ocurrió en CI sin reproducirlo local.

---

## Cheatsheet

| Concepto | Comando / Config |
|---|---|
| Crear workflow | `.github/workflows/playwright.yml` |
| Instalar browsers en runner | `pnpm exec playwright install --with-deps chromium` |
| Warm-up de Render | curl al `/health` antes de los tests |
| Retries en CI | `retries: process.env.CI ? 2 : 0` |
| Shards en paralelo | `matrix: shard: [1/4, 2/4, 3/4, 4/4]` |
| Subir reporte | `actions/upload-artifact@v4` con `if: always()` |
| Badge | `https://...actions/workflows/playwright.yml/badge.svg` |

➡️ [reto.md](./reto.md) · [Módulo 9 — API testing](../modulo-09-api-testing/)
