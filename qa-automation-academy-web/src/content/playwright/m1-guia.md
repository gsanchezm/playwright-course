# M01 · Guía del módulo: primer smoke

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** **`modulo-01-smoke-feo/ejemplo.spec.ts`** plano, sin POM, sin fixtures, sin data-driven. **Todo el dolor es deliberado.**

---

## 🏗️ Arquitectura al terminar este módulo

Este es el **punto de partida del framework**. Solo lo mínimo para que Playwright corra contra OmniPizza live:

```
playwright-course/
├── .env                       ← 🆕 creas tú desde .env.example (gitignored)
├── .env.example               ← 🆕 plantilla versionada de variables
├── .gitignore                 ← excluye .env, .auth/, node_modules/, reportes
├── package.json               ← scripts (pnpm m1…m6) + dotenv como dep
├── playwright.config.ts       ← 🆕 import "dotenv/config" + baseURL + projects
├── tsconfig.json
└── modulo-01-smoke-feo/       ← 🆕 ESTE MÓDULO
    ├── README.md
    ├── ejemplo.spec.ts        ← 🆕 TC-001 login, TC-002 catálogo (con duplicación)
    └── reto.spec.ts           ← 🆕 TC-003 filtrar por categoría "popular"
```

**Qué NO existe todavía** (lo agregaremos en módulos siguientes):

| Carpeta | Llega en | Para qué |
|---|---|---|
| `data/`, `types/` | M02 | Datos tipados (mercados, usuarios) |
| `pages/` | M03 | Page Object Model |
| `tests/setup/`, `fixtures/`, `helpers/`, `.auth/` | M04 | Setup project + custom fixtures |
| `services/`, `tests/api/` | M05 | Capa de servicios para API testing |
| `.github/workflows/` | M06 | CI/CD en GitHub Actions |

> 💡 **Para el facilitador:** muestra esta tabla al inicio. Los alumnos suelen preguntar *"¿y dónde van los Page Objects?"* — esta tabla les da la respuesta: **todavía no existen, y por eso vas a sentir el dolor**.

---

## Analogía de apertura

Vas a escribir tu primer caso de prueba automatizado **como lo haría un tester manual copiando pasos en una hoja de Excel**: todo en un bloque, locators inline, sin reutilización. Cuando escribas el segundo y tercer caso vas a sentir la duplicación en los dedos — **esa sensación es el motor de los 5 módulos siguientes**.

---

## ¿Qué aprenderás?

1. **Setup mínimo:** `playwright.config.ts`, `pnpm test`, UI mode.
2. **`dotenv` + `.env`:** instalar la librería, crear el archivo y manejar secrets como un profesional desde el día 1.
3. **`test()` y `expect()`** — el TC y el resultado esperado.
4. **Auto-waiting** — Playwright es paciente; no usamos `sleep()`.
5. **`getByRole` vs `getByTestId`** — dos formas de localizar.
6. **Workaround del cold start de Render** — backend en free tier se duerme.

---

## Conceptos JIT (con analogía QA)

| Concepto | Analogía |
|---|---|
| `test('...', async ({ page }) => {...})` | Caso de prueba (TC-001) con sus pasos |
| `expect(locator).toBeVisible()` | Resultado esperado del TC documentado |
| `page.goto('/')` | Abrir el navegador en la URL inicial |
| `getByRole('button', { name: 'Login' })` | Localizar como un lector de pantalla |
| `getByTestId('login-button')` | Localizar por el sticker que el dev puso |
| Auto-waiting | La paciencia del tester: espera a que cargue antes de clickear |
| `dotenv` | Librería npm que **lee tu `.env` y mete sus valores en `process.env`** |
| `.env` | La libreta personal del tester con URLs y passwords — **NO se commitea** |
| Cold start de Render | El servidor de QA dormido: primer request tarda 30-40s |

---

## Paso a paso (setup)

### Paso 0 — Pre-requisitos

Antes de empezar, asegúrate de tener (revisa con `node -v` / `pnpm -v` / `git --version`):

- **Node.js 20.x** (`node -v` → `v20.x.x`)
- **pnpm 9+** (`pnpm -v` → `9.x.x` o superior)
- **Git** instalado (`git --version`)
- Estar **dentro de la carpeta del curso**:
  ```bash
  cd playwright-course
  pwd   # debe terminar en /playwright-course
  ```

> 💡 **Para el facilitador:** si alguien no tiene Node/pnpm, mándalo al módulo **`00-setup/`** del monorepo antes de continuar. No hagas troubleshooting de setup aquí.

---

### Paso 1 — Instalar dependencias (incluye `dotenv`)

Este módulo necesita **4 paquetes**:

| Paquete | Tipo | Para qué |
|---|---|---|
| `@playwright/test` | dev | El runner + librería de Playwright |
| `dotenv` | dev | Lee `.env` y mete sus valores en `process.env` |
| `typescript` | dev | Compilador TS (lo usa `tsc --noEmit` y los IDEs) |
| `@types/node` | dev | Tipos de Node (necesarios para `process.env`, `setTimeout`, etc) |

#### 1.A — Verificar si ya están instaladas

```bash
# Comprueba qué está declarado en tu package.json
cat package.json | grep -E '"@playwright/test"|"dotenv"|"typescript"|"@types/node"'

# Y qué está realmente resuelto en node_modules
pnpm list @playwright/test dotenv typescript @types/node 2>/dev/null
```

Si las **4 entradas aparecen** con una versión: salta al paso 1.C.
Si **alguna falta** (o no existe `package.json` aún): sigue con 1.B.

#### 1.B — Bootstrap desde cero (si empiezas con la carpeta vacía)

```bash
# 1. Inicializa package.json si no existe
test -f package.json || pnpm init

# 2. Instala las dependencias dev (con `-D` queda registrado en devDependencies)
pnpm add -D @playwright/test dotenv typescript @types/node

# 3. Verifica
pnpm list @playwright/test dotenv typescript @types/node
# Debe listar las 4 con su versión.
```

> 💡 **¿Por qué `-D` y no plano?**
> Estos paquetes solo se usan durante desarrollo y testing — nunca en producción. `-D` los pone en `devDependencies`, así un build de producción los puede saltar. Para tests, es la convención correcta.

> 💡 **¿Por qué no `npm install`?**
> Este curso usa **pnpm** (más rápido, mejor con disk space, lockfile más estable). Si nunca lo usaste: `npm install -g pnpm` o `corepack enable && corepack prepare pnpm@latest --activate`.

#### 1.C — Si `package.json` ya existe pero `node_modules/` no

```bash
pnpm install
# pnpm lee package.json + pnpm-lock.yaml y reconstruye node_modules.
```

#### 1.D — Instalar los navegadores que Playwright manejará

Los paquetes de npm **no** traen Chromium / Firefox / WebKit. Hay que descargarlos por separado:

```bash
pnpm exec playwright install
# Tarda 1-2 min la primera vez (descarga ~300 MB).

# Opción ligera: solo chromium
pnpm exec playwright install chromium
```

#### 1.E — Cómo `dotenv` se engancha al curso

Para que `process.env.TEST_USER_USERNAME` funcione, `playwright.config.ts` **debe** importar `dotenv/config` al inicio:

```ts
import "dotenv/config";
```

Eso ejecuta `dotenv` automáticamente cada vez que Playwright arranca y carga `.env` en `process.env`. **Si esa línea falta, tus tests reciben `undefined` al leer variables del `.env`**.

Verás esa línea ya presente cuando creemos `playwright.config.ts` en el **Paso 4**.

---

### Paso 2 — Crear tu archivo `.env`

El archivo `.env` **no está en el repo** (está listado en `.gitignore`). Lo creas tú a partir de la plantilla versionada `.env.example`:

```bash
# Estando dentro de playwright-course/
cp .env.example .env

# Confirma que existe
ls -la .env
cat .env
```

Tu `.env` debería verse así (los valores ya están listos para OmniPizza, no necesitas cambiarlos):

```bash
BASE_URL=https://omnipizza-frontend.onrender.com
API_URL=https://omnipizza-backend.onrender.com
TEST_USER_USERNAME=standard_user
TEST_USER_PASSWORD=pizza123
DEFAULT_COUNTRY=MX
```

> ⚠️ **Importante para el facilitador:** abre `.gitignore` con los alumnos y muéstrales la línea `.env`. Repite en voz alta: **"el `.env` real NUNCA se commitea, solo el `.env.example`"**. Este es el momento de hablar de secrets, leaks de tokens en GitHub y por qué CI usa `secrets.*` (lo veremos en M06).

**Mini-verificación de que `dotenv` está funcionando** (opcional, 30 segundos):

```bash
pnpm exec tsx -e "import 'dotenv/config'; console.log('USERNAME =', process.env.TEST_USER_USERNAME)"
# Debe imprimir: USERNAME = standard_user
```

Si imprime `USERNAME = undefined` significa que `.env` no se creó o está en otra carpeta.

---

### Paso 3 — Crear `.gitignore`

**Antes** de crear cualquier archivo más, asegúrate de que `.env` (con tus credenciales) **no se commiteará** por accidente. Crea `.gitignore` en la raíz del curso:

```bash
# Si aún no existe
test -f .gitignore || cat > .gitignore <<'EOF'
node_modules/
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
.env
.env.local
.auth/
.DS_Store
EOF

# Verifica
cat .gitignore
```

> ⚠️ **Importante:** las entradas `.env`, `.auth/` y `playwright-report/` son **críticas**. Si las olvidas, terminas pusheando secrets o gigabytes de reportes al repo.

---

### Paso 4 — Crear `playwright.config.ts`

> **📐 El config nace aquí**
> Este es el **punto de partida** — no hay módulo anterior contra qué comparar. A partir de **M04** este archivo crece de verdad; cada módulo siguiente mostrará sólo el **diff** respecto al anterior, para que veas la evolución incremental sin perderte.
>
> **En M01 contiene lo mínimo:** `import "dotenv/config"`, `baseURL` desde `process.env`, timeouts generosos (cold start de Render) y **un solo project** `ui-chromium`. Todavía NO hay: setup project, `storageState`, multi-browser (M04), project `api` (M05), ni flags de CI (M06).

Este es **el "master test plan"** del framework: define dónde están los tests, el baseURL, timeouts, qué navegador y qué hacer cuando algo falla.

```bash
# Verifica si ya existe
test -f playwright.config.ts && echo "Ya existe — revisa su contenido" || echo "No existe — lo creamos"
```

Si NO existe, créalo con este contenido **mínimo para M01**:

```ts
// playwright.config.ts — Estado en M01
// ------------------------------------
// "master test plan" del framework. En módulos siguientes vamos
// a agregar: projects para multi-browser (M04), setup project con
// dependencies (M04), project api (M05), retries+workers para CI (M06).

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";   // ← carga .env en process.env

export default defineConfig({
  // --- Dónde buscar los tests ---
  testDir: ".",
  testMatch: [/modulo-.*\/.*\.spec\.ts/],

  // --- Timeouts (generosos por el cold start de Render free tier) ---
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // --- Reporteo ---
  reporter: [["html", { open: "never" }], ["list"]],

  // --- Defaults para todos los projects ---
  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  // --- Projects (en M01 solo uno: chromium en desktop) ---
  projects: [
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

**Cosas que el facilitador debe señalar línea por línea:**

| Línea | Qué hace |
|---|---|
| `import "dotenv/config"` | Lo único que conecta `.env` con `process.env` |
| `testMatch: [/modulo-.*\/.*\.spec\.ts/]` | Patrón de archivos que cuentan como tests |
| `timeout: 60_000` | 60s por TC — necesario para el cold start de Render |
| `baseURL` | El frontend live; `page.goto("/")` lo concatena |
| `trace: "retain-on-failure"` | Solo graba la caja negra cuando algo falla (ahorra disco) |
| `projects: [{ name: "ui-chromium", ... }]` | El único navegador en M01. En M04 añadiremos firefox/webkit. |

---

### Paso 5 — Crear `tsconfig.json`

TypeScript necesita saber cómo compilar tus specs. Crea el archivo en la raíz:

```bash
test -f tsconfig.json && echo "Ya existe" || cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node", "@playwright/test"]
  },
  "include": [
    "playwright.config.ts",
    "modulo-*/**/*.ts"
  ]
}
EOF
```

**Por qué cada opción importa:**

- `"strict": true` — bloquea `any` implícitos, null checks, etc. Es la base del tipado fuerte.
- `"resolveJsonModule": true` — necesario para `import marketsJson from "../data/markets.json"` en M02.
- `"types": ["node", "@playwright/test"]` — sin esto, `process.env` y `test`/`expect` no tienen tipo.

Verifica:

```bash
pnpm exec tsc --noEmit
# Si está limpio, no imprime nada. Si imprime errores, léelos y corrige antes de seguir.
```

---

### Paso 6 — Añadir el script `m1` a `package.json`

Para tener un atajo cómodo:

```bash
# Ver scripts actuales
cat package.json | grep -A 20 '"scripts"'
```

Si no existen, añade los siguientes a la sección `"scripts"` de `package.json`:

```json
"scripts": {
  "test": "playwright test",
  "test:ui": "playwright test --ui",
  "test:headed": "playwright test --headed",
  "test:debug": "playwright test --debug",
  "typecheck": "tsc --noEmit",
  "report": "playwright show-report",
  "m1": "playwright test modulo-01-smoke-feo --project=ui-chromium"
}
```

> 💡 **Para el facilitador:** explica que `pnpm m1` es **azúcar sintáctica** — equivale a `pnpm exec playwright test modulo-01-smoke-feo --project=ui-chromium`. Los alumnos pueden inspeccionar cualquier script con `cat package.json`.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** `pnpm m1`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep @smoke`) o por archivo (`pnpm exec playwright test modulo-01-smoke-feo/reto.spec.ts`)
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm m1` (no `VAR=x pnpm m1`, que es sintaxis de bash y falla en PowerShell)

---

## Outcome esperado

- [ ] `dotenv` instalado vía `pnpm install` y verificado con `pnpm list dotenv`.
- [ ] Archivo `.env` creado a partir de `.env.example` y **excluido por `.gitignore`**.
- [ ] Test verde contra OmniPizza live (`TC-001` y `TC-002`).
- [ ] Entiendes por qué `sleep()` está prohibido (auto-waiting).
- [ ] Distingues `getByRole` de `getByTestId`.
- [ ] **Puedes señalar con el dedo las líneas duplicadas** entre los specs.
- [ ] Completaste TC-003 en `reto.spec.ts` y mediste cuántas líneas copiaste.

---

## ¿Qué viene en M02?

En el próximo módulo vas a **parametrizar** este smoke para que un mismo test corra contra los 4 mercados de OmniPizza (MX/US/CH/JP) consumiendo JSON tipado — primer paso para matar la duplicación.
