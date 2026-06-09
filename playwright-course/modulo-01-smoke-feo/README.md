# Módulo 01 — Setup + primer smoke "feo"

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** `modulo-01-smoke-feo/ejemplo.spec.ts` plano, sin POM, sin fixtures, sin data-driven. **Todo el dolor es deliberado.**

---

## 🏗️ Arquitectura al terminar este módulo

Este es el **punto de partida del framework**. El proyecto se llama **`playwright_architecture`** (lo creaste en M00 con `git init`). En M01 lo llenas con el **installer oficial** (`pnpm create playwright`) y luego lo **moldeas** a la arquitectura incremental del curso:

```
playwright_architecture/
├── .env                       ← 🆕 creas tú desde .env.example (gitignored)
├── .env.example               ← 🆕 plantilla versionada de variables
├── .gitignore                 ← lo trae el installer; le añades .env y .auth/
├── package.json               ← scripts (pnpm m1…m6) + dotenv como dep
├── playwright.config.ts       ← 🆕 lo genera el installer; lo reconcilias al estado M01
├── tsconfig.json              ← 🆕 lo creas tú (el installer NO lo genera)
├── .github/workflows/         ← lo deja el installer; LATENTE hasta M06
│   └── playwright.yml
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
| `.github/workflows/` (uso real) | M06 | CI/CD en GitHub Actions |

> 💡 **Para el facilitador:** muestra esta tabla al inicio. Los alumnos suelen preguntar *"¿y dónde van los Page Objects?"* — esta tabla les da la respuesta: **todavía no existen, y por eso vas a sentir el dolor**.
>
> 🔍 **Ojo con el `playwright.yml` y el `tests/`:** el installer ya deja un workflow de GitHub Actions y una carpeta `tests/` con un `example.spec.ts`. **No los usamos en M01**: el workflow queda **latente** (lo activamos de verdad en M06) y `tests/` lo borramos porque nuestro `testMatch` solo recoge `modulo-*/`. En el Paso 4 verás por qué.

---

## Analogía de apertura

Vas a escribir tu primer caso de prueba automatizado **como lo haría un tester manual copiando pasos en una hoja de Excel**: todo en un bloque, locators inline, sin reutilización. Cuando escribas el segundo y tercer caso vas a sentir la duplicación en los dedos — **esa sensación es el motor de los 5 módulos siguientes**.

---

## ¿Qué aprenderás?

1. **Installer oficial + reconciliación:** `pnpm create playwright` y cómo moldear el starter genérico a la arquitectura del curso.
2. **`dotenv` + `.env`:** activar el hook que el installer dejó comentado, crear el archivo y manejar secrets como un profesional desde el día 1.
3. **`test()` y `expect()`** — el TC y el resultado esperado.
4. **Auto-waiting** — Playwright es paciente; no usamos `sleep()`.
5. **`getByRole` vs `getByTestId`** — dos formas de localizar.
6. **Cold start de Render absorbido por timeouts generosos** — el backend en free tier se duerme; no hacemos warmup explícito, los timeouts del config aguantan el primer request lento.
7. **Depurar y reportar:** `--debug` (Playwright Inspector) y el HTML report (`show-report`).

---

## Conceptos JIT (con analogía QA)

| Concepto | Analogía |
|---|---|
| `test('...', async ({ page }) => {...})` | Caso de prueba (TC-001) con sus pasos |
| `expect(locator).toBeVisible()` | Resultado esperado del TC documentado |
| `page.goto('/')` | Abrir el navegador en la URL inicial |
| `getByRole('button', { name: 'Sign In' })` | Localizar como un lector de pantalla |
| `getByTestId('login-button')` | Localizar por el sticker que el dev puso |
| Auto-waiting | La paciencia del tester: espera a que cargue antes de clickear |
| `dotenv` | Librería npm que **lee tu `.env` y mete sus valores en `process.env`** |
| `.env` | La libreta personal del tester con URLs y passwords — **NO se commitea** |
| Cold start de Render | El servidor de QA dormido: primer request tarda 30-40s |

---

## Paso a paso

> **Cómo leer esta sección.** Cada paso grande se parte en **micro-pasos `N.M`** y cada micro-paso lleva la misma tripleta:
> **Qué hago** (el comando o la línea exacta) · **Por qué** (la razón / el riesgo que evita) · **Cómo verifico** (algo ejecutable u observable que confirma que quedó bien).
> Verás también recuadros **🔷 TypeScript** la primera vez que aparece un concepto del lenguaje, con un enlace al curso de TypeScript donde lo viste a fondo.

### Paso 0 — Pre-requisitos

Antes de empezar, asegúrate de tener (revisa con `node -v` / `pnpm -v` / `git --version`):

- **Node.js 20.x** (`node -v` → `v20.x.x`)
- **pnpm 9+** (`pnpm -v` → `9.x.x` o superior)
- **Git** instalado (`git --version`)
- Estar **dentro del proyecto** que creaste en M00 (`playwright_architecture`, ya con `git init` y tu primer commit):
  ```bash
  cd playwright_architecture
  pwd   # debe terminar en /playwright_architecture
  git log --oneline -1   # ves el primer commit que hiciste en M00
  ```

> 💡 **Para el facilitador:** si alguien no tiene Node/pnpm, mándalo al módulo [`00-setup/`](../../00-setup/) del monorepo antes de continuar. No hagas troubleshooting de setup aquí.

---

### Paso 1 — Instalar Playwright con el installer oficial

> **Lección clave de este módulo:** no instalamos Playwright "a mano". Usamos el **installer oficial** (`pnpm create playwright`, [doc oficial](https://playwright.dev/docs/intro)) y luego **moldeamos** lo que genera a la arquitectura incremental del curso. El installer te da un *starter genérico* (3 navegadores, `testDir: "./tests"`, CI flags…). Tu trabajo en los Pasos 3-4 es **reconciliarlo** al estado mínimo de M01. Aprender a leer y recortar un scaffold es una habilidad real de QA.

**1.1 — Lanzar el installer oficial**
- **Qué hago:** desde la raíz `playwright_architecture/` (tu proyecto de M00), corro:
  ```bash
  pnpm create playwright
  ```
  Responde los **prompts interactivos**:
  | Prompt | Qué elegir | Por qué |
  |---|---|---|
  | **TypeScript or JavaScript?** | `TypeScript` | Todo el curso es TS tipado |
  | **Where to put your tests?** | `tests` (default) | Lo aceptas; en el Paso 4 cambiamos el `testMatch` |
  | **Add a GitHub Actions workflow?** | `true` | Lo deja **latente**; lo activamos de verdad en M06 |
  | **Install Playwright browsers?** | `true` | Descarga Chromium/Firefox/WebKit (~300 MB) |
- **Por qué:** un solo comando instala `@playwright/test`, descarga los navegadores, genera `playwright.config.ts`, `tests/example.spec.ts`, un `.gitignore` propio y el workflow de GitHub Actions — todo de una pieza y según la **versión más reciente** de Playwright (no fijes una versión a mano; el installer trae la última).
- **Cómo verifico:**
  ```bash
  pnpm list @playwright/test          # aparece, con la versión que instaló el installer
  cat package.json | grep -A 8 '"scripts"'   # ves los scripts base
  ls playwright.config.ts tests/      # el config y la carpeta tests existen
  ```

> 💡 **¿Por qué `pnpm` y no `npm`/`npx`?**
> Este curso usa **pnpm** (más rápido, mejor con disk space, lockfile más estable). `pnpm create playwright` es el equivalente a `npm init playwright@latest`. Si nunca usaste pnpm: `corepack enable && corepack prepare pnpm@latest --activate`.

**1.2 — Mirar lo que el installer dejó (antes de tocar nada)**
- **Qué hago:** inspecciono el scaffold tal cual quedó:
  ```bash
  ls -la                       # .gitignore, playwright.config.ts, package.json, tests/, .github/
  cat playwright.config.ts     # fíjate: testDir "./tests", 3 projects, un bloque dotenv COMENTADO
  cat .gitignore               # trae /playwright/.auth/  … pero NO trae .env
  ```
- **Por qué:** antes de reconciliar hay que **ver el punto de partida**. Tres cosas que vas a tocar en los Pasos 3-4: (1) el `.gitignore` del installer **no** ignora `.env`; (2) el config trae un bloque `dotenv` **comentado** — el installer ya te dejó el hook, solo hay que encenderlo; (3) `testDir` apunta a `./tests`, pero el curso vive en `modulo-*/`.
- **Cómo verifico:** ves en `playwright.config.ts` un comentario tipo `// import dotenv from 'dotenv'` / `// dotenv.config(...)` (comentado) y `projects` con `chromium`, `firefox` y `webkit`.

**1.3 — Añadir la única dependencia que el installer NO trae: `dotenv`**
- **Qué hago:**
  ```bash
  pnpm add -D dotenv
  ```
- **Por qué:** el installer instaló `@playwright/test` y los navegadores, pero `dotenv` (para leer `.env` → `process.env`) **no** viene en el scaffold. El config trae el *hook comentado* pero falta la librería. Con `-D` queda en `devDependencies` (solo desarrollo/testing).
- **Cómo verifico:**
  ```bash
  pnpm list dotenv     # aparece con su versión
  ```

> 🔷 **TypeScript — `import` por side-effect**
> En el Paso 4 activarás `import "dotenv/config"`. **No trae ningún símbolo** (no lleva `{ }`): solo **ejecuta** el módulo por su efecto colateral — poblar `process.env`. Es distinto del import normal `import { test } from "@playwright/test"`, que sí trae nombres.
> 📚 Lo viste en [TS · M01 — Hello World](../../typescript-qa-course/modulo-01-hello-world/). Aquí lo aplicas para cargar tu `.env` antes de que el config lea `process.env.BASE_URL`.

> 💡 **Para el facilitador:** este es el momento de explicar la filosofía del curso. El installer es un **andamio (scaffold)**, no un destino. En la industria casi nunca dejas el scaffold tal cual: lo recortas a lo que tu equipo necesita. Los Pasos 3-4 son ese recorte, hecho explícito.

---

### Paso 2 — Crear tu archivo `.env`

> **Archivo que se crea en este paso:** `.env` (en la raíz `playwright_architecture/`, **gitignored**). El `.env.example` ya existe versionado.

**2.1 — Copiar la plantilla**
- **Qué hago:** desde la raíz `playwright_architecture/`, `cp .env.example .env`
- **Por qué:** el `.env` real **no está en el repo** (lo excluye `.gitignore`), pero sí versionamos `.env.example` como plantilla. Copiarla te da un `.env` con los valores correctos sin exponer secrets en Git.
- **Cómo verifico:**
  ```bash
  ls -la .env
  cat .env
  ```
  Debería verse así (los valores ya están listos para OmniPizza, no los cambies):
  ```bash
  BASE_URL=https://omnipizza-frontend.onrender.com
  API_URL=https://omnipizza-backend.onrender.com
  TEST_USER_USERNAME=standard_user
  TEST_USER_PASSWORD=pizza123
  DEFAULT_COUNTRY=MX
  ```

> ⚠️ **Importante para el facilitador:** abre `.gitignore` con los alumnos y muéstrales la línea `.env`. Repite en voz alta: **"el `.env` real NUNCA se commitea, solo el `.env.example`"**. Este es el momento de hablar de secrets, leaks de tokens en GitHub y por qué CI usa `secrets.*` (lo veremos en M06).

**2.2 — Comprobar que `dotenv` carga las variables**
- **Qué hago** (opcional, 30 segundos):
  ```bash
  pnpm exec tsx -e "import 'dotenv/config'; console.log('USERNAME =', process.env.TEST_USER_USERNAME)"
  ```
- **Por qué:** confirma de forma aislada que `dotenv` encuentra y parsea tu `.env` antes de invertir tiempo en correr el test completo.
- **Cómo verifico:** imprime `USERNAME = standard_user`. Si imprime `USERNAME = undefined`, el `.env` no se creó o está en otra carpeta — vuelve a 2.1.

---

### Paso 3 — Reconciliar el `.gitignore` (1ª pieza del recorte)

> **Archivo que se edita en este paso:** `.gitignore` (raíz). **No lo creas desde cero**: el installer ya generó uno (con `/playwright/.cache/`, `/playwright/.auth/`, `/test-results/`, `/playwright-report/`, `/blob-report/`). El problema: **NO ignora `.env`**. Lo arreglas **antes** de crear `.env`, para que tus credenciales nunca entren al staging por accidente.

**3.1 — Ver lo que el installer dejó ignorado**
- **Qué hago:**
  ```bash
  cat .gitignore
  ```
- **Por qué:** el `.gitignore` del installer ya cubre los reportes y el `node_modules/`, y trae `/playwright/.auth/` (lo usaremos en M04). Lo que **falta** son las dos líneas críticas de secretos: `.env` y `.auth/`. Reconocer qué ya está te evita duplicar líneas.
- **Cómo verifico:** ves las entradas de Playwright, pero **no** ves `.env` en la lista.

**3.2 — Añadir las líneas de secretos (`.env` + `.auth/`)**
- **Qué hago:** **añado** (no reemplazo) al final del `.gitignore` que ya existe:
  ```bash
  cat >> .gitignore <<'EOF'

  # --- Añadido en M01: secrets y storageState ---
  .env
  .env.local
  .auth/
  EOF
  ```
- **Por qué:** las entradas `.env` y `.auth/` son **críticas**. Si las olvidas, terminas pusheando secrets al repo. En M00 ya viste el **concepto** de `.gitignore` con un mínimo; aquí lo **consolidas** mergeando el del installer con esas dos líneas. (`.auth/` aún no existe, pero lo dejas listo: en M04 guardará el `storageState` de sesión.)
- **Cómo verifico:**
  ```bash
  git check-ignore .env          # imprime ".env" → está siendo ignorado
  ```

> ⚠️ **Importante:** `git check-ignore .env` debe imprimir `.env`. Si no imprime nada, el `.env` **no** está ignorado y tus credenciales se commitearían en el Paso 11. (Cuando ejecutas `cat >> .gitignore` dos veces por error, no pasa nada grave: Git ignora líneas duplicadas; aun así revisa que `.env` aparezca **una** vez.)

---

### Paso 4 — Reconciliar `playwright.config.ts` (el recorte principal)

> **📐 El config NO nace en blanco: lo genera el installer**
> El installer ya te dejó un `playwright.config.ts` **genérico**. Tu trabajo aquí es **moldearlo** al estado mínimo de M01 — y entender **cada recorte**. A partir de **M04** este archivo crece de verdad; cada módulo siguiente mostrará sólo el **diff** respecto al anterior, para que veas la evolución incremental sin perderte.
>
> **El estado M01 contiene lo mínimo:** `import "dotenv/config"` (descomentado), `baseURL` desde `process.env`, timeouts generosos (cold start de Render) y **un solo project** `ui-chromium`. Todavía NO hay: setup project, `storageState`, multi-browser (M04), project `api` (M05), ni la matrix de CI real (M06).

Este es **el "master test plan"** del framework: define dónde están los tests, el baseURL, timeouts, qué navegador y qué hacer cuando algo falla.

> **Archivo que se edita en este paso:** `playwright.config.ts` (raíz) — el que generó el installer.

**4.1 — Entender el diff: de lo generado al estado M01**
- **Qué hago:** comparo lo que trae el installer contra lo que necesita M01. Esta es la tabla de reconciliación (la lección del módulo):

  | Lo que genera el installer | Lo dejamos en M01 como | Por qué |
  |---|---|---|
  | `testDir: "./tests"` | `testDir: "."` + `testMatch: [/modulo-.*\/.*\.spec\.ts/]` | El curso vive en `modulo-*/`, no en `tests/` |
  | `projects: [chromium, firefox, webkit]` | **solo** `ui-chromium` | Multi-browser distrae en M01; **firefox/webkit vuelven en M04** |
  | bloque `dotenv` **comentado** | **descomentado** → `import "dotenv/config"` | El installer dejó el hook; solo lo enciendes (ya instalaste `dotenv` en 1.3) |
  | `trace: "on-first-retry"` | `trace: "retain-on-failure"` | En M01 no hay `retries`; con `on-first-retry` nunca verías el trace al fallar |
  | (sin timeouts custom) | `timeout` + `expect.timeout` + `actionTimeout`/`navigationTimeout` generosos | Render free tier despierta en 30-40s; sin esto el 1er run sería flaky |
  | `reporter: "html"` | `reporter: [["html",…], ["list"]]` | `list` te da feedback en la terminal **mientras** corre |
  | `fullyParallel`/`forbidOnly`/`retries`/`workers` (CI) | se quedan **latentes** | La matrix real de CI llega en **M06**; en M01 no estorban |

- **Por qué:** este recorte es la habilidad real. El scaffold sirve para arrancar; el framework de tu equipo es siempre una versión **moldeada** del scaffold. Hacer el diff explícito te enseña qué hace cada flag.
- **Cómo verifico:** después de editar, `pnpm exec tsc --noEmit` queda limpio y `cat playwright.config.ts | grep -c "firefox\|webkit"` → `0`.

**4.2 — Reemplazar el contenido por el estado M01**
- **Qué hago:** abro el `playwright.config.ts` generado y dejo **este** contenido (es el resultado de aplicar la tabla de 4.1):

```ts
// playwright.config.ts — Estado en M01 (reconciliado desde el scaffold)
// ---------------------------------------------------------------------
// "master test plan" del framework. Partimos del config que generó
// `pnpm create playwright` y lo recortamos a lo mínimo de M01. En
// módulos siguientes vamos a agregar de nuevo: projects multi-browser
// (M04), setup project con dependencies (M04), project api (M05),
// retries+workers+CI flags reales (M06).

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";   // ← descomentado: carga .env en process.env

export default defineConfig({
  // --- Dónde buscar los tests (el installer ponía "./tests") ---
  testDir: ".",
  testMatch: [/modulo-.*\/.*\.spec\.ts/],

  // --- Timeouts (generosos por el cold start de Render free tier) ---
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // --- Reporteo (html del installer + list para feedback en terminal) ---
  reporter: [["html", { open: "never" }], ["list"]],

  // --- Defaults para todos los projects ---
  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure",   // el installer ponía "on-first-retry"
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  // --- Projects (en M01 solo uno; el installer traía chromium+firefox+webkit) ---
  projects: [
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- **Por qué:** sin un config correcto, Playwright no sabe **dónde** buscar tests, contra qué `baseURL` ni con qué timeouts — y `page.goto("/")` no tendría host que concatenar. Este es el estado mínimo que hace verde el smoke.
- **Cómo verifico:** `pnpm exec tsc --noEmit` no marca errores y el editor no subraya en rojo los imports.

> 🔷 **TypeScript — operador `??` (nullish coalescing)**
> `process.env.BASE_URL ?? "https://…"` devuelve el lado derecho **solo si el izquierdo es `null` o `undefined`**. Cuidado con la alternativa obvia `||`: esa cae al fallback también con `""` o `0`, que a veces son valores válidos. `??` es más preciso para "usa esto solo si de verdad falta".
> 📚 Lo viste en [TS · M02 — Types](../../typescript-qa-course/modulo-02-types/). Aquí lo aplicas como **red de seguridad** del `baseURL` si `.env` no cargó.

**4.3 — Borrar el `tests/example.spec.ts` del installer**
- **Qué hago:**
  ```bash
  rm -rf tests/
  ```
- **Por qué:** el installer dejó una carpeta `tests/` con un `example.spec.ts` de demo. Tu `testMatch` solo recoge `modulo-*/`, así que ese archivo **nunca correría** — pero deja basura en el árbol. Lo quitas para que el proyecto refleje **solo** la arquitectura del curso. (El workflow `.github/workflows/playwright.yml` lo **conservas**: queda latente hasta M06.)
- **Cómo verifico:** `ls tests/ 2>/dev/null` no devuelve nada (la carpeta ya no existe).

**4.4 — Leer el config línea por línea (facilitador):**

| Línea | Qué hace |
|---|---|
| `import "dotenv/config"` | Lo único que conecta `.env` con `process.env` (estaba comentado en el scaffold) |
| `testMatch: [/modulo-.*\/.*\.spec\.ts/]` | Patrón de archivos que cuentan como tests (reemplaza el `testDir: "./tests"`) |
| `timeout: 60_000` | 60s por TC — necesario para el cold start de Render (el scaffold no lo traía) |
| `baseURL` | El frontend live; `page.goto("/")` lo concatena |
| `trace: "retain-on-failure"` | Graba la caja negra al fallar (el scaffold usaba `on-first-retry`, inútil sin retries) |
| `projects: [{ name: "ui-chromium", ... }]` | El único navegador en M01. En M04 vuelven firefox/webkit. |

---

### Paso 5 — Crear `tsconfig.json`

> **Archivo que se crea en este paso:** `tsconfig.json` (raíz). **Este sí lo creas desde cero**: el installer de Playwright **no** genera un `tsconfig.json` (asume el default de TS). Lo añadimos nosotros para fijar `strict`, los tipos de Node y el `include` del curso.

**5.1 — Escribir el `tsconfig.json`**
- **Qué hago:** TypeScript necesita saber cómo compilar tus specs; creo el archivo en la raíz:

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

- **Por qué cada opción importa:**
  - `"strict": true` — bloquea `any` implícitos, null checks, etc. Es la base del tipado fuerte.
  - `"resolveJsonModule": true` — necesario para `import marketsJson from "../data/markets.json"` en M02.
  - `"types": ["node", "@playwright/test"]` — sin esto, `process.env` y `test`/`expect` no tienen tipo.
- **Cómo verifico:**
  ```bash
  pnpm exec tsc --noEmit
  # Si está limpio, no imprime nada. Si imprime errores, léelos y corrige antes de seguir.
  ```

---

### Paso 6 — Añadir el script `m1` a `package.json`

> **Archivo que se edita en este paso:** `package.json` (sección `"scripts"`).

**6.1 — Registrar los scripts del curso**
- **Qué hago:** reviso los scripts que dejó el installer (suele dejar `scripts` casi vacío) y **añado** los que falten:
  ```bash
  # Ver scripts actuales
  cat package.json | grep -A 20 '"scripts"'
  ```
- **Por qué:** `pnpm m1` es **azúcar sintáctica** — equivale a `pnpm exec playwright test modulo-01-smoke-feo --project=ui-chromium`. Un atajo memorable evita teclear el comando largo en cada corrida.
- **Cómo verifico:** `cat package.json | grep '"m1"'` muestra la entrada del script. (Aún no puedes ejecutarlo: el spec file no existe hasta el Paso 7.)

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

Ahora sí, **el código del módulo**.

> **Archivo que se crea en este paso:** `modulo-01-smoke-feo/ejemplo.spec.ts`.

**7.1 — Crear la carpeta y el archivo vacío**
- **Qué hago:**
  ```bash
  # 1. Crea la carpeta del módulo (si no existe)
  mkdir -p modulo-01-smoke-feo

  # 2. Crea el archivo del spec
  touch modulo-01-smoke-feo/ejemplo.spec.ts
  ```
- **Por qué:** el `testMatch` del config (`/modulo-.*\/.*\.spec\.ts/`) solo recoge archivos `*.spec.ts` dentro de `modulo-*`. La ubicación y el nombre importan para que Playwright lo descubra.
- **Cómo verifico:** `ls modulo-01-smoke-feo/` muestra `ejemplo.spec.ts`.

**7.2 — Escribir el encabezado y las credenciales**
- **Qué hago:** abre el archivo en VS Code y escribe (a mano, no copy-paste a ciegas — escribirlo fija la sintaxis):
  ```ts
  import { test, expect } from "@playwright/test";

  // Credenciales leídas de .env (gracias a dotenv en playwright.config.ts)
  const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
  const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";
  ```
- **Por qué:** `import { test, expect }` trae el runner y las aserciones. Las credenciales se leen de `process.env` (poblado por `dotenv`) con un fallback `??` a los valores reales de OmniPizza.
- **Cómo verifico:** el editor no subraya `test`, `expect` ni `process` en rojo (los tipos de `tsconfig.json` están resolviendo).

> 🔷 **TypeScript — anotación de tipo `string` (por inferencia)**
> `USERNAME` y `PASSWORD` son de tipo `string` **sin que escribas `: string`**: TypeScript lo **infiere** porque `process.env.X` es `string | undefined` y el `?? "literal"` garantiza un `string`. Podrías anotarlo explícito (`const USERNAME: string = …`), pero aquí la inferencia es suficiente y más limpia.
> 📚 Lo viste en [TS · M02 — Types](../../typescript-qa-course/modulo-02-types/). Aquí lo aplicas: pasarás estos `string` a `.fill(...)`, que **espera** un `string`.

**7.3 — Escribir el caso TC-001**
- **Qué hago:** dentro de un `test.describe`, agrega el primer test:
  ```ts
  test.describe("Smoke OmniPizza — versión fea (M01)", () => {
    // Nota: OmniPizza vive en Render free tier y el primer request del
    // día tarda 30-40s (cold start). NO hacemos warmup explícito: los
    // timeouts generosos del playwright.config.ts lo absorben. En M04 el
    // backend se despierta de forma controlada con un `auth.setup.ts`.

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

    // TC-002 — lo escribes TÚ en el Paso 9 (ver nota más abajo).
  });
  ```
- **Por qué:** TC-001 es el smoke mínimo: login y aterrizaje en `/catalog`. **No hay `beforeAll` de warmup**: el cold start de Render lo aguantan los timeouts generosos del config (el primer run puede tardar 30-40s y aun así pasa). Cada acción lleva `await` porque Playwright es asíncrono.
- **Cómo verifico:** `pnpm exec tsc --noEmit` queda limpio; en el Paso 8 el test corre en verde.

> 🔷 **TypeScript — `async` / `await` y `Promise` (intro)**
> `.click()`, `.fill()` y `expect(...)` devuelven una **`Promise`** (una operación que terminará *después*). El `await` delante de cada una **pausa** hasta que se resuelve, así el orden real de ejecución coincide con el orden que lees. Una función marcada `async` es la única donde puedes usar `await`.
> 📚 Lo viste en [TS · M03 — Functions](../../typescript-qa-course/modulo-03-functions/). Aquí lo aplicas a **cada** acción y aserción del spec — olvidar un `await` produce falsos positivos (ver 🔍 Detalles).

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

**7.4 — Verificar que compila antes de ejecutar**
- **Qué hago:** `pnpm exec tsc --noEmit`
- **Por qué:** atrapar errores de tipos/sintaxis aquí es mucho más barato que descubrirlos a mitad de una corrida de 40s contra el backend.
- **Cómo verifico:** sin output = sin errores = puedes correr el test (Paso 8).

> 📌 **Nota sobre el spec del repo (híbrido by-design):** el `ejemplo.spec.ts` que ya viene en el curso es **más completo** — incluye un `TC-002` que valida el catálogo (`pizza-card-*`). Pero **el cuerpo de TC-002 NO se entrega aquí a propósito**: la idea del Paso 9 es que lo escribas a mano y **sientas la duplicación** de las ~6 líneas de login que ya tecleaste en TC-001. Si quieres el archivo final ya hecho, ábrelo desde el repo — pero primero siente el dolor.

---

### Paso 8 — Ejecutar el ejemplo

**8.1 — Correr el smoke**
- **Qué hago** (tres formas, en orden de utilidad pedagógica):
  ```bash
  # A) UI mode — RECOMENDADO para la primera vez (ves cada paso en vivo)
  pnpm test:ui

  # B) Modo headed — abre el navegador real, sin UI mode
  pnpm exec playwright test modulo-01-smoke-feo --headed --project=ui-chromium

  # C) Headless — la forma rápida (sin ventana)
  pnpm m1
  ```
- **Por qué:** UI mode te deja ver cada `await` ejecutarse en vivo — ideal la primera vez para entender el auto-waiting. Headless es lo que usarás a diario y en CI.
- **Cómo verifico:** en este punto solo escribiste TC-001, así que verás **1 test verde** (`TC-001`). En el Paso 9 añadirás TC-002 y entonces serán 2. La primera corrida tarda 30-40s por el cold start de Render; si falla con `TimeoutError`, **vuelve a correr** — el backend ya estará despierto.

**8.2 — Depurar paso a paso con `--debug` (Playwright Inspector)**
- **Qué hago:** corro el smoke en modo depuración:
  ```bash
  pnpm exec playwright test modulo-01-smoke-feo --project=ui-chromium --debug
  # (o el atajo del curso: pnpm test:debug)
  ```
  Se abre el **Playwright Inspector** (una ventana aparte) junto al navegador. Usa el botón **▶ (Resume)** para avanzar entre acciones y **⤼ (Step over)** para ejecutar **una sola** línea a la vez.
- **Por qué:** `--debug` **pausa** la ejecución antes de cada acción y resalta en el navegador **el locator exacto** que Playwright va a usar. El Inspector pausa **entre** los `await` (que ya viste en 7.3): cada `await` es el "breakpoint" implícito donde puedes detenerte. Es la herramienta para responder *"¿por qué este `getByTestId` no encuentra nada?"* — ves en vivo si el selector matchea 0, 1 o varios elementos, sin adivinar. Además puedes editar y probar locators en el panel del Inspector.
- **Cómo verifico:** la ejecución se detiene en la primera acción (`page.goto`) y solo avanza cuando das **Step over / Resume**; el elemento objetivo se resalta en el navegador en cada paso.

**8.3 — Abrir el HTML report (`show-report`)**
- **Qué hago:** después de una corrida (con `pnpm m1`, no con UI mode), abro el reporte HTML:
  ```bash
  pnpm exec playwright show-report
  # (o el atajo del curso: pnpm report)
  ```
  Se abre en el navegador en `http://localhost:9323`. Click en un test → verás sus **pasos**, y si falló, su **trace**, **screenshot** y **video**.
- **Por qué:** el config genera el reporter `html` (lo dejaste en el Paso 4). El HTML report es el **artefacto compartible** del resultado: en CI (M06) lo subiremos como artifact para que el equipo lo revise sin re-correr nada. El **Trace Viewer** (dentro del report, al fallar) es la "caja negra" del test: timeline, DOM snapshot por acción, network y consola.
- **Cómo verifico:** se abre el navegador con la lista de tests; al hacer click en `TC-001` ves sus pasos expandibles. (Si dice *"No report found"*, corre primero `pnpm m1`.)

> 💡 **Para el facilitador:** abre el **Trace Viewer** desde el HTML report (en un test que falle a propósito, p.ej. cambiando un `getByTestId` a un id inexistente) y muestra el timeline + los snapshots del DOM. Los alumnos suelen quedar enganchados con el Trace Viewer — es el mayor "wow" del módulo.

---

### Paso 9 — Escribir TC-002 y observar el dolor (lectura guiada de 5 min)

**9.1 — Escribir TC-002 a mano (sin atajos)**
- **Qué hago:** dentro del mismo `describe`, añado un segundo test `TC-002 — catálogo muestra al menos 1 pizza @smoke`. **No te entrego el cuerpo a propósito** (híbrido by-design): tú lo escribes copiando las ~6 líneas de login de TC-001 (`goto`, `market-MX`, los dos `fill`, el `click` de login, el `expect` de URL) y luego añades una verificación nueva del catálogo: un locator que matchee las cards (`[data-testid^="pizza-card-"]`), un assert de que la primera está visible (con `timeout` generoso por el cold start) y un conteo `> 0`.
- **Por qué:** reescribir el login completo a mano es lo que te hace **sentir la duplicación** en los dedos — ese es el motor pedagógico del curso. Si te entregara el código pegado, no dolería. (Si te atascas en la sintaxis del catálogo, las pistas exactas están en `reto.spec.ts`, TODO 6.)
- **Cómo verifico:** `pnpm m1` muestra **2 verdes** (`TC-001` y `TC-002`).

**9.2 — Señalar el dolor (facilitador)**

Abre `ejemplo.spec.ts` lado a lado con el alumno y haz que **señalen con el dedo**:

1. **Líneas duplicadas entre TC-001 y TC-002:**
   - `page.goto("/")` — repetida.
   - `page.getByTestId("market-MX").click()` — repetida.
   - `fill(USERNAME)` y `fill(PASSWORD)` — repetidas.
   - `click()` en `login-button-desktop` — repetido.
   - `expect(page).toHaveURL(/\/catalog/)` — repetido.
2. **Locators inline** — el string `"market-MX"` está hardcoded; no hay un "objeto LoginPage" que lo encapsule.
3. **El cold start de Render** lo absorben los **timeouts generosos del config** — sin warmup explícito en el spec. En M04 el backend se despertará de forma controlada con un `auth.setup.ts` reutilizable (que además guardará la sesión).
4. **Las credenciales** se leen con `process.env.TEST_USER_USERNAME ?? "standard_user"` — el fallback existe por seguridad, pero **la fuente real es `.env`**.

**Pregunta al grupo:** *"si añadieran un tercer smoke, ¿cuántas líneas duplicarían?"* — la respuesta esperada es **~8**. Esa es la deuda que M02 y M03 van a pagar.

---

### Paso 10 — Resolver el reto

**10.1 — Completar TC-003 en `reto.spec.ts`**
- **Qué hago:** abro `reto.spec.ts` y escribo TC-003 **copiando deliberadamente** las mismas líneas que ya viste duplicadas. Cada TODO trae **qué hacer**, **pista** (el método de Playwright) y **cómo verificar**. No intento ser elegante — el dolor es el ejercicio. Al terminar:
  ```bash
  pnpm exec playwright test modulo-01-smoke-feo/reto.spec.ts --headed --project=ui-chromium
  ```
- **Por qué:** este tercer smoke vuelve a duplicar ~8 líneas de login. Medir cuántas copiaste pone número a la deuda técnica que M03 va a saldar con el Page Object Model.
- **Cómo verifico:** el test pasa en verde **y** al final del archivo puedes responder las 3 preguntas del comentario final.

> 💡 **Para el facilitador:** al cerrar el reto, abre `ejemplo.spec.ts` y `reto.spec.ts` lado a lado y pide al grupo contar las líneas idénticas entre TC-001 / TC-002 / TC-003. Anota el número en el pizarrón — lo vamos a destruir en M03.

---

### Paso 11 — Versiona tu trabajo (Git)

Ya tienes el módulo verde: es el momento natural de guardar un punto de control en Git. (En este curso **Git es just-in-time**: aparece cuando el flujo lo pide, no como bloque inicial.)

**11.1 — Preparar los archivos para el commit**
- **Qué hago:** desde la raíz `playwright_architecture/`, agrego al staging lo que generó el installer y lo que creaste tú en este módulo:
  ```bash
  git add .env.example .gitignore playwright.config.ts tsconfig.json \
          package.json pnpm-lock.yaml .github modulo-01-smoke-feo
  ```
- **Por qué:** listas explícitas evitan arrastrar basura. Aquí entran tanto lo que dejó `pnpm create playwright` (`playwright.config.ts` ya reconciliado, `package.json`, `pnpm-lock.yaml`, el `.github/workflows/playwright.yml` **latente**) como tus archivos (`.env.example`, `tsconfig.json`, el módulo). Fíjate que **`.env` NO está en la lista** — es secreto y ya lo excluye `.gitignore` (Paso 3). Sí versionas `.env.example` (la plantilla pública).
- **Cómo verifico:**
  ```bash
  git status            # .env NO aparece como "to be committed"
  ```
  Si `.env` apareciera en verde, detente: tu `.gitignore` no lo está cubriendo (vuelve al Paso 3).

**11.2 — Crear el commit**
- **Qué hago:**
  ```bash
  git commit -m "feat(m01): smoke feo + dotenv"
  ```
- **Por qué:** un commit pequeño y bien nombrado (convención `feat(m01): …`) deja un historial legible; cada módulo del curso será un punto de control que puedes revisar o revertir.
- **Cómo verifico:**
  ```bash
  git log --oneline -1
  # → <hash> feat(m01): smoke feo + dotenv
  ```

---

## Outcome esperado

- [ ] Instalaste Playwright con `pnpm create playwright` (installer oficial) y añadiste `dotenv` con `pnpm add -D dotenv`.
- [ ] **Reconciliaste** el scaffold al estado M01: `testMatch` en vez de `testDir: "./tests"`, solo `ui-chromium`, `dotenv` descomentado, `trace: retain-on-failure`, timeouts generosos; borraste `tests/example.spec.ts`.
- [ ] Archivo `.env` creado a partir de `.env.example` y **excluido por `.gitignore`** (al que le añadiste `.env` + `.auth/`).
- [ ] Test verde contra OmniPizza live (`TC-001` y `TC-002`).
- [ ] Entiendes por qué `sleep()` está prohibido (auto-waiting).
- [ ] Distingues `getByRole` de `getByTestId`.
- [ ] Sabes depurar con `--debug` (Playwright Inspector) y abrir el HTML report con `show-report`.
- [ ] **Puedes señalar con el dedo las líneas duplicadas** entre los specs.
- [ ] Completaste TC-003 en `reto.spec.ts` y mediste cuántas líneas copiaste.
- [ ] Versionaste tu trabajo con `git commit -m "feat(m01): smoke feo + dotenv"` (y confirmaste que `.env` quedó fuera).

---

## 🔍 Detalles que parecen obvios pero no lo son

Antes de pasar a los comandos, estos son los detalles del spec que un ojo entrenado nota y un principiante pasa por alto. Cada uno sale del código real de `ejemplo.spec.ts`.

### `await page.goto("/")`

- **Qué es:** abre el navegador en la **ruta raíz** del sitio. La `/` se concatena con el `baseURL` del `playwright.config.ts` → `https://omnipizza-frontend.onrender.com/`.
- **Por qué así (y no la alternativa obvia):** poner solo `/` deja el host en **un único lugar** (el config). El día que el frontend cambie de URL (staging, otro dominio, otro puerto), tocas una línea en el config y **todos los specs siguen funcionando**.
- **Qué pasa si lo cambias:** si hardcodeas `page.goto("https://omnipizza-frontend.onrender.com/")` el test funciona igual hoy… pero esa URL queda regada por cada spec. Multiplica por 50 tests y un cambio de dominio se vuelve un *find & replace* frágil. Además ignora el `baseURL`, así que `--config` o un override por entorno dejan de tener efecto.

### `await page.getByTestId("market-MX").click()`

- **Qué es:** el `await` delante de **cada acción y cada aserción** del spec. Playwright es **asíncrono**: `.click()`, `.fill()` y `expect(...)` devuelven una *promesa*.
- **Por qué así (y no la alternativa obvia):** sin `await`, la promesa se dispara pero **nadie la espera**. El runner sigue a la siguiente línea antes de que el click ocurra, y el orden real de ejecución deja de coincidir con el orden que lees.
- **Qué pasa si lo cambias:** quitar el `await` produce el peor de los bugs de QA: un test que **pasa o falla de forma engañosa**. Una aserción sin `await` (`expect(page).toHaveURL(...)`) puede reportar verde sin haber comprobado nada, porque la promesa quedó pendiente y el test terminó antes. Es un falso positivo silencioso.

### `await page.getByTestId("login-button-desktop").click()`

- **Qué es:** el spec localiza el botón de login por su **test id** (`data-testid="login-button-desktop"`), no por su rol accesible (`getByRole("button", { name: "Sign In" })`).
- **Por qué así (y no la alternativa obvia):** `getByTestId` apunta a un **sticker que el dev puso a propósito** para testing — es estable aunque cambie el texto o el idioma del botón. `getByRole(..., { name })` localiza como un lector de pantalla y depende del **texto visible**; el `name` es lo que cambia todo: si el botón pasa de "Sign In" a "Iniciar sesión", el `getByRole` rompe y el `getByTestId` no.
- **Qué pasa si lo cambias:** migrar a `getByRole` te acerca a probar accesibilidad real (bueno), pero acoplas el test al copy de la UI. En M02 verás la jerarquía de locators completa; en M01 usamos `getByTestId` porque OmniPizza ya trae esos ids y queremos que el smoke sea inmune al texto.

### `await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 })`

- **Qué es:** la espera de que la primera card de pizza aparezca. Fíjate que **no hay ningún `sleep()` ni `waitForTimeout()`** en todo el spec — solo un `timeout` como opción de la aserción.
- **Por qué así (y no la alternativa obvia):** Playwright tiene **auto-waiting**: `toBeVisible()` reintenta en bucle hasta que la condición se cumple o se agota el timeout. Aquí subimos el timeout a 30s **por el cold start de Render**, no para "dar tiempo a que cargue" a ciegas.
- **Qué pasa si lo cambias:** si reemplazas esto por `await page.waitForTimeout(30000)` esperas **siempre** 30 segundos completos aunque la card aparezca en 2 — tests lentos. Y si pones un sleep corto (`waitForTimeout(2000)`) en un día de cold start, la card aún no existe y el test **falla intermitente** (flaky). El auto-waiting espera *lo justo*: sigue en cuanto la condición se cumple.

### `import "dotenv/config"`

- **Qué es:** un import por **side-effect** — sin llaves, no trae ningún símbolo a tu archivo. Solo **ejecuta** el módulo `dotenv/config`, que lee `.env` y vuelca sus valores en `process.env`. Vive al inicio de `playwright.config.ts`.
- **Por qué así (y no la alternativa obvia):** no necesitas una función ni una variable de `dotenv`; lo único que quieres es el *efecto* de poblar `process.env` **antes** de que el config lea `process.env.BASE_URL`. Por eso va arriba del todo y por eso no lleva `{ }`.
- **Qué pasa si lo quitas:** `process.env.BASE_URL` y `process.env.TEST_USER_USERNAME` quedan sin cargar… pero **el test no truena**: tanto el config (`process.env.BASE_URL ?? "https://..."`) como el spec (`process.env.TEST_USER_USERNAME ?? "standard_user"`) tienen un **fallback `??`** que apunta a los valores reales de OmniPizza. El resultado es la trampa más peligrosa: el test sigue verde **usando los defaults hardcodeados**, ocultándote que tu `.env` nunca se cargó. El día que un valor real difiera de su fallback, fallarás sin entender por qué.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** `pnpm m1`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep @smoke`) o por archivo (`pnpm exec playwright test modulo-01-smoke-feo/reto.spec.ts`)
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm m1` (no `VAR=x pnpm m1`, que es sintaxis de bash y falla en PowerShell)

---

## ¿Qué viene en M02?

En el próximo módulo vas a **parametrizar** este smoke para que un mismo test corra contra los 4 mercados de OmniPizza (MX/US/CH/JP) consumiendo JSON tipado — primer paso para matar la duplicación.
