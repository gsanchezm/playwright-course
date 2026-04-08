# Módulo 8: Repositorios (Git + GitHub Actions para tests)

> **Objetivo:** Integrar tu framework de Playwright con Git, GitHub y un pipeline de CI que corra los tests automáticamente en cada push y PR.

> **Prerrequisito:** haber completado el [curso de Git/GitHub](../../git-github-course/).

> **Referencia oficial:** [ci](https://playwright.dev/docs/ci) · [ci-intro](https://playwright.dev/docs/ci-intro)

---

## 🎯 Analogía principal

> **CI (Continuous Integration) es como tener un asistente robótico que corre TODA tu regresión cada vez que alguien toca el código.**
>
> Sin CI:
> 1. Dev hace cambio.
> 2. Automatizador se entera horas después.
> 3. Corre los tests localmente.
> 4. Reporta fallos.
>
> Con CI:
> 1. Dev hace push.
> 2. GitHub Actions corre la suite completa automáticamente.
> 3. En 5 minutos todos saben si algo se rompió.
> 4. El PR se bloquea si los tests fallan.

---

## 1. Estructura de un repo de automatización en GitHub

```
mi-framework-e2e/
├── .github/
│   └── workflows/
│       └── playwright.yml     # ⭐ el pipeline
├── modulo-*/                   # o tests/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── .gitignore
└── README.md
```

## 2. Archivos que SÍ van al repo

- ✅ Todo el código de tests (`*.spec.ts`, `*.ts`)
- ✅ `package.json`, `pnpm-lock.yaml`
- ✅ `playwright.config.ts`
- ✅ `tsconfig.json`
- ✅ `.github/workflows/*.yml`
- ✅ `README.md` con instrucciones de cómo correr los tests
- ✅ `.gitignore`

## 3. Archivos que NO van al repo

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

Ya está en tu `.gitignore` del curso.

---

## 4. El workflow de GitHub Actions para Playwright

Crea `.github/workflows/playwright.yml` en tu repo:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run Playwright tests
        run: pnpm test

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### ¿Qué hace cada paso?

1. **`checkout`**: descarga el código del repo al runner de GitHub.
2. **`setup-node`**: instala Node.js v20.
3. **`pnpm/action-setup`**: instala pnpm.
4. **`pnpm install --frozen-lockfile`**: instala dependencias exactamente como están en `pnpm-lock.yaml` (sin actualizar).
5. **`playwright install --with-deps`**: descarga los navegadores Y sus dependencias del SO (linux libs para Chromium, etc.).
6. **`pnpm test`**: corre todos los tests.
7. **`upload-artifact`**: guarda el reporte HTML como artifact del build. Lo puedes descargar desde la página del run en GitHub. `if: always()` asegura que se sube incluso si los tests fallan.

---

## 5. Shards: correr tests en paralelo en varias máquinas

Cuando tu suite crece a 500+ tests, puedes **partirla en shards** y correr cada shard en paralelo:

```yaml
jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]

    steps:
      # ...pasos anteriores...
      - name: Run tests shard ${{ matrix.shard }}
        run: pnpm test --shard=${{ matrix.shard }}
```

Esto arranca **4 jobs en paralelo**, cada uno corriendo ¼ de la suite. Total: 4x más rápido.

---

## 6. Variables de entorno (secretos)

NUNCA hardcodees credenciales en el yml. Usa **GitHub Secrets**:

1. Ve a **Settings → Secrets and variables → Actions → New repository secret**.
2. Crea `TEST_USER`, `TEST_PASS`, `BASE_URL`, etc.
3. En el workflow:
   ```yaml
   - name: Run tests
     env:
       BASE_URL: ${{ secrets.BASE_URL }}
       TEST_USER: ${{ secrets.TEST_USER }}
       TEST_PASS: ${{ secrets.TEST_PASS }}
     run: pnpm test
   ```

---

## 7. Badge de CI en el README

Agrega al `README.md` de tu repo:

```markdown
![Playwright Tests](https://github.com/tu-usuario/tu-repo/actions/workflows/playwright.yml/badge.svg)
```

Esto muestra un badge verde/rojo según el estado del último run.

---

## 8. Correr solo smoke en PRs, regresión completa en merge a main

Ejemplo de workflow con dos jobs:

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  smoke:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      # ...setup...
      - run: pnpm test --grep @smoke

  regression:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      # ...setup...
      - run: pnpm test
```

**Beneficio:** PRs corren rápido (solo smoke, ~2 min). Merge a main corre todo (~20 min).

---

## 📋 Pasos explícitos para explicar en clase

1. **Pregunta al grupo:** "¿qué pasa en su empresa cuando un dev rompe algo? ¿cómo se enteran?". Usa las respuestas como motivación.
2. **Muestra la estructura de un repo de automatización** bien organizado.
3. **Explica cada sección del `.gitignore`** y por qué importa (secretos, reportes temporales, node_modules).
4. **Muestra el `playwright.yml`** línea por línea. Explica cada `step:` como "un paso de un caso de prueba manual".
5. **Crea un repo en GitHub** (desde el curso de Git) y sube tu framework.
6. **Haz un push** y muestra la pestaña **Actions** corriendo el workflow en vivo.
7. **Rompe un test**, empuja, y muestra el PR marcado en rojo.
8. **Descarga el artifact** del reporte HTML y ábrelo.
9. **Envía al reto.**

---

➡️ Siguiente: [reto.md](./reto.md)
