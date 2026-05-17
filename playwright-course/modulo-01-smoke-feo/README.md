# Módulo 01 — Setup + primer smoke "feo"

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** `modulo-01-smoke-feo/ejemplo.spec.ts` plano, sin POM, sin fixtures, sin data-driven. **Todo el dolor es deliberado.**

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

## Paso a paso

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

> 💡 **Para el facilitador:** si alguien no tiene Node/pnpm, mándalo al módulo [`00-setup/`](../../00-setup/) del monorepo antes de continuar. No hagas troubleshooting de setup aquí.

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

### Paso 7 — Crear tu primer spec file

Ahora sí, **el código del módulo**. Crea la carpeta y el archivo:

```bash
# 1. Crea la carpeta del módulo (si no existe)
mkdir -p modulo-01-smoke-feo

# 2. Crea el archivo del spec
touch modulo-01-smoke-feo/ejemplo.spec.ts
```

Abre `modulo-01-smoke-feo/ejemplo.spec.ts` en VS Code y **escribe esto exactamente** (no copies y pegues a ciegas — escribirlo a mano fija la sintaxis):

```ts
import { test, expect } from "@playwright/test";

// Credenciales leídas de .env (gracias a dotenv en playwright.config.ts)
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test.describe("Smoke OmniPizza — versión fea (M01)", () => {
  test("TC-001 — login exitoso con usuario válido @smoke", async ({ page }) => {
    // Paso 1 — abrir la pantalla de login
    await page.goto("/");

    // Paso 2 — seleccionar mercado (MX)
    await page.getByTestId("market-MX").click();

    // Paso 3 — llenar credenciales
    await page.getByTestId("username-desktop").fill(USERNAME);
    await page.getByTestId("password-desktop").fill(PASSWORD);

    // Paso 4 — enviar formulario
    await page.getByTestId("login-button-desktop").click();

    // Resultado esperado — aterrizar en el catálogo
    await expect(page).toHaveURL(/\/catalog/);
  });
});
```

**Anatomía línea por línea** (el facilitador la repite en voz alta):

| Línea | Concepto |
|---|---|
| `import { test, expect } from "@playwright/test"` | El runner y la librería de aserciones |
| `process.env.TEST_USER_USERNAME ?? "standard_user"` | `dotenv` cargó esto; el `??` es el fallback si falta |
| `test.describe(...)` | Suite — agrupa varios `test()` con un nombre común |
| `test("TC-001 — ...", async ({ page }) => {...})` | Un caso de prueba; `page` es la pestaña inyectada por Playwright |
| `await page.goto("/")` | Concatena con `baseURL` del config → `https://omnipizza-frontend.onrender.com/` |
| `await page.getByTestId(...)` | Locator nivel 3 de la jerarquía (M02 explica los otros niveles) |
| `await expect(page).toHaveURL(/\/catalog/)` | Aserción con regex; Playwright espera automáticamente |

**Verifica que compila** antes de ejecutarlo:

```bash
pnpm exec tsc --noEmit
# Sin output = sin errores = puedes correr el test.
```

> 📌 **Nota sobre el spec del repo:** el archivo `ejemplo.spec.ts` que ya viene en el curso es **más completo** — incluye un `test.beforeAll` para warmup del backend dormido y un `TC-002` para validar el catálogo. **No te lo entrego completo aquí a propósito**: la idea del Paso 9 es que escribas TC-002 a mano y **sientas la duplicación** entre los dos tests. Si quieres el archivo final ya hecho, ábrelo desde el repo.

---

### Paso 8 — Ejecutar el ejemplo

Tres formas de correrlo, en orden de utilidad pedagógica:

```bash
# A) UI mode — RECOMENDADO para la primera vez (ves cada paso en vivo)
pnpm test:ui

# B) Modo headed — abre el navegador real, sin UI mode
pnpm exec playwright test modulo-01-smoke-feo --headed --project=ui-chromium

# C) Headless — la forma rápida (sin ventana)
pnpm m1
```

**Qué debería pasar:**

1. La primera vez tarda 30-40 segundos (cold start de OmniPizza en Render free tier).
2. Verás **2 tests verdes**: `TC-001` y `TC-002`.
3. Si te falla con `TimeoutError` en el primer test, **vuelve a correr el comando** — el backend ya estará despierto.

> 💡 **Para el facilitador:** este es buen momento para abrir el **HTML report** (`pnpm exec playwright show-report`) y mostrar trazas, screenshots y video. Los alumnos suelen quedar enganchados con el Trace Viewer.

---

### Paso 9 — Observar el dolor (lectura guiada de 5 min)

Abre `ejemplo.spec.ts` lado a lado con el alumno y haz que **señalen con el dedo**:

1. **Líneas duplicadas entre TC-001 y TC-002:**
   - `page.goto("/")` — repetida.
   - `page.getByTestId("market-MX").click()` — repetida.
   - `fill(USERNAME)` y `fill(PASSWORD)` — repetidas.
   - `click()` en `login-button-desktop` — repetido.
   - `expect(page).toHaveURL(/\/catalog/)` — repetido.
2. **Locators inline** — el string `"market-MX"` está hardcoded; no hay un "objeto LoginPage" que lo encapsule.
3. **El warmup del backend** vive dentro del mismo spec (`beforeAll`) — en M04 esto se convierte en un `setup project` reutilizable.
4. **Las credenciales** se leen con `process.env.TEST_USER_USERNAME ?? "standard_user"` — el fallback existe por seguridad, pero **la fuente real es `.env`**.

**Pregunta al grupo:** *"si añadieran un tercer smoke, ¿cuántas líneas duplicarían?"* — la respuesta esperada es **~8**. Esa es la deuda que M02 y M03 van a pagar.

---

### Paso 10 — Resolver el reto

Abre `reto.spec.ts`. El objetivo es **escribir TC-003 copiando deliberadamente** las mismas líneas que ya viste duplicadas. **No intentes ser elegante** — el dolor es el ejercicio.

Cada TODO en el reto tiene:

- **Qué hacer** (la acción puntual).
- **Pista** (el método de Playwright que necesitas).
- **Cómo verificar** (qué deberías ver en UI mode o en el HTML report).

Sigue los TODOs en orden. Cuando termines, corre el reto:

```bash
pnpm exec playwright test modulo-01-smoke-feo/reto.spec.ts --headed --project=ui-chromium
```

**Criterio de éxito:** el test pasa en verde **y** al final del archivo puedes responder las 3 preguntas del comentario final.

> 💡 **Para el facilitador:** al cerrar el reto, abre `ejemplo.spec.ts` y `reto.spec.ts` lado a lado y pide al grupo contar las líneas idénticas entre TC-001 / TC-002 / TC-003. Anota el número en el pizarrón — lo vamos a destruir en M03.

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

## Comandos útiles del módulo

```bash
# Setup
pnpm install                                     # instala dotenv + Playwright + types
pnpm exec playwright install                     # descarga navegadores
cp .env.example .env                             # crea tu .env local

# Correr
pnpm m1                                          # correr M01 (headless)
pnpm test:ui                                     # UI mode
pnpm exec playwright test --debug modulo-01-smoke-feo/ejemplo.spec.ts
pnpm exec playwright test --headed --project=ui-chromium

# Reportes
pnpm exec playwright show-report                 # último HTML report
```

---

## ¿Qué viene en M02?

En el próximo módulo vas a **parametrizar** este smoke para que un mismo test corra contra los 4 mercados de OmniPizza (MX/US/CH/JP) consumiendo JSON tipado — primer paso para matar la duplicación.
