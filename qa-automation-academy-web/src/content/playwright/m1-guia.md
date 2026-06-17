# M01 · Guía del módulo: primer smoke

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** **`modulo-01-smoke-feo/ejemplo.spec.ts`** plano, sin POM, sin fixtures, sin data-driven. **Todo el dolor es deliberado.**

---

## 🏗️ Arquitectura al terminar este módulo

Este es el **punto de partida del framework**. Lo llenas con el **installer oficial** (`pnpm create playwright`) y luego lo **moldeas** a la arquitectura incremental del curso:

```
playwright-course/
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
| `.github/workflows/` (uso real) | M06 | CI/CD en GitHub Actions (el installer lo deja latente) |

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

## Paso a paso (setup)

### Paso 0 — Pre-requisitos

Antes de empezar, asegúrate de tener (revisa con `node -v` / `pnpm -v` / `git --version`):

- **Node.js 24.x** (`node -v` → `v24.x.x`)
- **pnpm 10+** (`pnpm -v` → `10.x.x` o superior)
- **Git** instalado (`git --version`)
- Estar **dentro de la carpeta del curso**:
  ```bash
  cd playwright-course
  pwd   # debe terminar en /playwright-course
  ```

---

### Paso 1 — Instalar Playwright con el installer oficial

No instalamos Playwright "a mano". Usamos el **installer oficial** ([`pnpm create playwright`](https://playwright.dev/docs/intro)) y luego **moldeamos** lo que genera a la arquitectura incremental del curso. El installer te da un *starter genérico* (3 navegadores, `testDir: "./tests"`, workflow de CI…); tu trabajo en los Pasos 3-4 es **reconciliarlo** al estado mínimo de M01. Aprender a leer y recortar un scaffold es una habilidad real de QA.

#### 1.A — Lanzar el installer oficial

Desde la raíz del curso, corre:

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

Un solo comando instala `@playwright/test`, descarga los navegadores, genera `playwright.config.ts`, `tests/example.spec.ts`, un `.gitignore` propio y el workflow de GitHub Actions — todo según la **versión más reciente** de Playwright (no fijes una versión a mano; el installer trae la última).

Verifica:

```bash
pnpm list @playwright/test     # aparece, con la versión que instaló el installer
ls playwright.config.ts        # el config existe
ls tests                       # la carpeta tests existe
```

> 💡 **¿Por qué `pnpm` y no `npm`/`npx`?**
> Este curso usa **pnpm** (más rápido, mejor con disk space, lockfile más estable). `pnpm create playwright` es el equivalente a `npm init playwright@latest`. Si nunca usaste pnpm: `corepack enable` y luego `corepack prepare pnpm@latest --activate`.

#### 1.B — Mirar lo que el installer dejó (antes de tocar nada)

```bash
ls                           # playwright.config.ts, package.json, tests/ (los dotfiles .gitignore y .github/ no salen en bash; míralos en VS Code)
cat playwright.config.ts     # testDir "./tests", 3 projects, un bloque dotenv COMENTADO
cat .gitignore               # trae /playwright/.auth/ … pero NO trae .env
```

Tres cosas que vas a tocar en los Pasos 3-4: (1) el `.gitignore` del installer **no** ignora `.env`; (2) el config trae un bloque `dotenv` **comentado** — el installer ya te dejó el hook, solo hay que encenderlo; (3) `testDir` apunta a `./tests`, pero el curso vive en `modulo-*/`.

#### 1.C — Añadir las dependencias que el installer NO trae: `dotenv` y `typescript`

```bash
pnpm add -D dotenv typescript
```

El installer instaló `@playwright/test` y los navegadores, pero **dos piezas no vienen** en el scaffold: (1) `dotenv`, para leer `.env` → `process.env` — el config trae el *hook comentado* pero falta la librería; (2) `typescript`, el CLI `tsc` que usarás en todos los `pnpm exec tsc --noEmit` del curso y en el `tsc --init` del Paso 5. ¿Por qué el installer no lo trae? Porque Playwright **transpila tus specs por su cuenta, sin `tsc`** — pero nosotros sí queremos el type-check explícito. Con `-D` quedan en `devDependencies` (solo desarrollo/testing).

```bash
pnpm list dotenv typescript     # aparecen ambos con su versión
```

#### 1.D — Cómo `dotenv` se engancha al curso

Para que `process.env.TEST_USER_USERNAME` funcione, `playwright.config.ts` **debe** importar `dotenv/config` al inicio:

```ts
import "dotenv/config";
```

El installer dejó esa línea **comentada**; en el **Paso 4** la descomentas. Eso ejecuta `dotenv` automáticamente cada vez que Playwright arranca y carga `.env` en `process.env`. Si esa línea falta, `process.env` devuelve `undefined` al leer variables del `.env` — pero ojo: el test **no truena**, porque los fallbacks `??` del config y del spec lo tapan. En el Paso 4 verás esa trampa en detalle.

> 🔷 **TypeScript — `import` por side-effect**
> Fíjate en la forma del import: **no trae ningún símbolo** (no lleva `{ }`); solo **ejecuta** el módulo por su efecto colateral — poblar `process.env`. Es distinto del import normal `import { test } from "@playwright/test"`, que sí trae nombres.
> 📚 Lo viste en [TS · M01 — Hello World](/docs/typescript/m1-console-log). Aquí lo aplicas para cargar tu `.env` antes de que el config lea `process.env.BASE_URL`.

---

### Paso 2 — Crear tu archivo `.env`

El archivo `.env` **no está en el repo** (está listado en `.gitignore`). Lo creas tú a partir de la plantilla versionada `.env.example`:

```bash
# Estando dentro de playwright-course/
cp .env.example .env

# Confirma que existe
ls .env
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

**Mini-verificación de que `dotenv` está funcionando** (opcional, 30 segundos):

```bash
pnpm exec tsx -e "import 'dotenv/config'; console.log('USERNAME =', process.env.TEST_USER_USERNAME)"
# Debe imprimir: USERNAME = standard_user
```

Si imprime `USERNAME = undefined` significa que `.env` no se creó o está en otra carpeta.

---

### Paso 3 — Reconciliar el `.gitignore` (1ª pieza del recorte)

**No lo creas desde cero**: el installer ya generó uno (con `/playwright/.cache/`, `/playwright/.auth/`, `/test-results/`, `/playwright-report/`, `/blob-report/`). El problema: **NO ignora `.env`**. Lo arreglas ahora — **antes de tu primer commit** — para que las credenciales del `.env` que creaste nunca entren al staging por accidente.

```bash
# 1. Ver lo que el installer dejó ignorado (no verás .env en la lista)
cat .gitignore
```

Después, **añade** (no reemplaces) las líneas de secretos: abre el archivo en VS Code (`code .gitignore`) y pega al final estas líneas:

```
# --- Añadido en M01: secrets y storageState ---
.env
.env.local
.auth/
```

Verifica que `.env` queda ignorado:

```bash
git check-ignore .env     # imprime ".env" → está siendo ignorado
```

El `.gitignore` del installer ya cubre los reportes y `node_modules/`, y trae `/playwright/.auth/` (lo usaremos en M04). Lo que **falta** son las dos líneas críticas de secretos: `.env` y `.auth/`. (`.auth/` aún no existe, pero lo dejas listo: en M04 guardará el `storageState` de sesión.)

> ⚠️ **Importante:** `git check-ignore .env` debe imprimir `.env`. Si no imprime nada, el `.env` **no** está ignorado y tus credenciales se commitearían. Las entradas `.env` y `.auth/` son **críticas**: si las olvidas, terminas pusheando secrets al repo.

---

### Paso 4 — Reconciliar `playwright.config.ts` (el recorte principal)

> **📐 El config NO nace en blanco: lo genera el installer**
> El installer ya te dejó un `playwright.config.ts` **genérico**. Tu trabajo aquí es **moldearlo** al estado mínimo de M01 — y entender **cada recorte**. A partir de **M04** este archivo crece de verdad; cada módulo siguiente mostrará sólo el **diff** respecto al anterior, para que veas la evolución incremental sin perderte.
>
> **El estado M01 contiene lo mínimo:** `import "dotenv/config"` (descomentado), `baseURL` desde `process.env`, timeouts generosos (cold start de Render) y **un solo project** `ui-chromium`. Todavía NO hay: setup project, `storageState`, multi-browser (M04), project `api` (M05), ni flags de CI (M06).

Este es **el "master test plan"** del framework: define dónde están los tests, el baseURL, timeouts, qué navegador y qué hacer cuando algo falla.

**El diff: de lo generado al estado M01.** Esta es la tabla de reconciliación (la lección del módulo):

| Lo que genera el installer | Lo dejamos en M01 como | Por qué |
|---|---|---|
| `testDir: "./tests"` | `testDir: "."` + `testMatch: [/modulo-.*\/.*\.spec\.ts/]` | El curso vive en `modulo-*/`, no en `tests/` |
| `projects: [chromium, firefox, webkit]` | **solo** `ui-chromium` | Multi-browser distrae en M01; **firefox/webkit vuelven en M04** |
| bloque `dotenv` **comentado** | **descomentado** → `import "dotenv/config"` | El installer dejó el hook; solo lo enciendes (ya instalaste `dotenv` en 1.C) |
| `trace: "on-first-retry"` | `trace: "retain-on-failure"` | En M01 no hay `retries`; con `on-first-retry` nunca verías el trace al fallar |
| (sin timeouts custom) | `timeout` + `expect.timeout` + `actionTimeout`/`navigationTimeout` generosos | Render free tier despierta en 30-40s; sin esto el 1er run sería flaky |
| `reporter: "html"` | `reporter: [["html",…], ["list"]]` | `list` te da feedback en la terminal **mientras** corre |
| `fullyParallel`/`forbidOnly`/`retries`/`workers` (CI) | se quedan **latentes** | La matrix real de CI llega en **M06**; en M01 no estorban |

Abre el `playwright.config.ts` generado y **reemplaza su contenido** por este (el resultado de aplicar la tabla de arriba):

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

**Puntos clave a observar línea por línea:**

| Línea | Qué hace | Por qué este valor en M01 |
|---|---|---|
| `import { defineConfig, devices }` | `defineConfig` envuelve el objeto para darte autocompletado y type-check del config; `devices` es el catálogo oficial de perfiles de dispositivo (viewport, userAgent, touch, scale) | Habilita el spread `...devices["Desktop Chrome"]` del project |
| `import "dotenv/config"` | Import por side-effect: ejecuta `dotenv` y vuelca tu `.env` en `process.env`; no trae símbolos | Va arriba del todo para poblar `process.env` ANTES de que se lea `BASE_URL`; estaba comentado en el scaffold |
| `testDir: "."` | Carpeta base desde donde Playwright empieza a buscar tests | La raíz, porque los specs del curso viven en `modulo-*/`, no en `tests/` (el installer ponía `"./tests"`) |
| `testMatch: [/modulo-.*\/.*\.spec\.ts/]` | Regex que filtra, dentro de `testDir`, qué archivos cuentan como tests | Solo `*.spec.ts` dentro de carpetas `modulo-*`; por eso el `tests/example.spec.ts` del installer nunca correría (lo borras al final de este paso) |
| `timeout: 60_000` | Presupuesto TOTAL de cada `test()` — todas sus acciones y aserciones juntas; si se agota: `TimeoutError` y el test falla. Default: 30s | Doblado a 60s para absorber el cold start de Render (30-40s el primer request del día) |
| `expect: { timeout: 10_000 }` | Tope de CADA aserción `expect()` individual; las aserciones web-first reintentan en bucle hasta cumplirse o agotarlo. Default: 5s | 10s da margen a renders lentos sin permitir que UNA aserción se coma el presupuesto del test entero |
| `reporter: [["html", { open: "never" }], ["list"]]` | Lista de reporters que corren a la vez. `html` genera `playwright-report/` (`open: "never"` = no abre el navegador al terminar; lo abres tú con `pnpm report`); `list` imprime cada test en la terminal según corre | `html` = artefacto compartible (en M06 será el artifact de CI); `list` = feedback inmediato mientras corre |
| `use: { ... }` | Bloque de opciones compartidas que heredan TODOS los projects y tests; cada project puede sobreescribir campos | Con un solo project parece innecesario — pero es lo que permitirá añadir firefox/webkit en M04 sin duplicar config |
| `baseURL` | Host base contra el que se resuelven las URLs relativas: `page.goto("/")` y `toHaveURL` se calculan contra él | Viene de `process.env.BASE_URL` (tu `.env`) con fallback `??`; un único lugar para cambiar de entorno |
| `trace: "retain-on-failure"` | Graba la "caja negra" (timeline, snapshot del DOM por acción, network, consola) de cada test y la conserva SOLO si falla (si pasa, la borra). Valores: `off` / `on` / `on-first-retry` / `retain-on-failure` | El scaffold traía `on-first-retry`, que solo graba al reintentar — inútil sin `retries` en M01: jamás verías un trace. Así tienes el trace desde el primer fallo |
| `screenshot: "only-on-failure"` | Captura automática del estado final de la página solo cuando el test falla; se adjunta al HTML report | Evidencia visual gratis del momento del fallo, sin ensuciar los runs verdes |
| `actionTimeout: 15_000` | Tope por ACCIÓN individual (`click`, `fill`, `check`…; incluye su auto-waiting de visibilidad/estabilidad). Default: 0 = sin tope propio (esperaría hasta agotar el timeout del test) | 15s: si un elemento no aparece, esa acción falla rápido y con error preciso, en vez de quemar los 60s del test |
| `navigationTimeout: 45_000` | Tope específico de navegaciones (`goto`, `reload`, `waitForURL`), separado del de acciones porque navegar es lo más lento | El cold start de Render golpea exactamente aquí: el primer `goto` puede tardar 30-40s. 45 < 60 deja margen para el resto del test |
| `projects: [...]` | Cada project es una configuración de ejecución con nombre (navegador, viewport, overrides de `use`); la suite corre una vez por project | En M01 uno solo para no distraer; en M04 vuelven firefox/webkit y se monta el setup project |
| `name: "ui-chromium"` | Identificador del project: lo que pasas en `--project=ui-chromium` y lo que ves en el report | El prefijo `ui-` anticipa el project `api` de M05 (convención de nombres del curso) |
| `use: { ...devices["Desktop Chrome"] }` | Spread que copia el perfil completo Desktop Chrome del catálogo `devices` (chromium, viewport 1280×720, userAgent, deviceScaleFactor…); puedes sobreescribir cualquier campo después del spread | Perfil desktop estándar y reproducible: el mismo en tu máquina y en CI |

> 🔷 **TypeScript — operador `??` (nullish coalescing)**
> `process.env.BASE_URL ?? "https://…"` devuelve el lado derecho **solo si el izquierdo es `null` o `undefined`**. Cuidado con la alternativa obvia `||`: esa cae al fallback también con `""` o `0`, que a veces son valores válidos. `??` es más preciso para "usa esto solo si de verdad falta".
> 📚 Lo viste en [TS · M02 — Types](/docs/typescript/m2-null-undefined). Aquí lo aplicas como **red de seguridad** del `baseURL` si `.env` no cargó.

> 🔍 **Detalle que parece obvio — `import "dotenv/config"`**
> **Qué es:** un import por **side-effect** — sin llaves, no trae ningún símbolo a tu archivo. Solo **ejecuta** el módulo `dotenv/config`, que lee `.env` y vuelca sus valores en `process.env` (el enganche que viste en 1.D). Vive al inicio de `playwright.config.ts`.
> **Por qué así (y no la alternativa obvia):** no necesitas una función ni una variable de `dotenv`; lo único que quieres es el *efecto* de poblar `process.env` **antes** de que el config lea `process.env.BASE_URL`. Por eso va arriba del todo y por eso no lleva `{ }`.
> **Qué pasa si lo quitas:** `process.env.BASE_URL` y `process.env.TEST_USER_USERNAME` quedan sin cargar… pero **el test no truena**: tanto el config (`process.env.BASE_URL ?? "https://..."`) como el spec (`process.env.TEST_USER_USERNAME ?? "standard_user"`) tienen un **fallback `??`** que apunta a los valores reales de OmniPizza. El resultado es la trampa más peligrosa: el test sigue verde **usando los defaults hardcodeados**, ocultándote que tu `.env` nunca se cargó. El día que un valor real difiera de su fallback, fallarás sin entender por qué.

**Borra el `tests/example.spec.ts` del installer:** elimina la carpeta `tests/` completa desde el **explorador de VS Code** (click derecho sobre `tests/` → *Delete*). Si prefieres la terminal, no hay comando neutral: bash `rm -rf tests` · 🪟 PowerShell `Remove-Item -Recurse -Force tests`. Verifica que `tests/` ya no aparece en `ls`.

El installer dejó una carpeta `tests/` con un `example.spec.ts` de demo. Tu `testMatch` solo recoge `modulo-*/`, así que ese archivo **nunca correría** — lo quitas para que el proyecto refleje **solo** la arquitectura del curso. (El workflow `.github/workflows/playwright.yml` lo **conservas**: queda latente hasta M06.)

---

### Paso 5 — Crear `tsconfig.json`

**Este sí lo creas desde cero**: el installer de Playwright **no** genera un `tsconfig.json` (asume el default de TS). Lo añadimos nosotros para fijar `strict`, los tipos de Node y el `include` del curso.

> **📐 Generar → moldear, otra vez (la filosofía del Paso 4).** El comando oficial para **generar** un `tsconfig.json` desde consola es `pnpm exec tsc --init` (el CLI `tsc` que instalaste en 1.C): genera un archivo con **decenas de opciones comentadas** — otro scaffold genérico, como el config del installer. Aquí aplicamos la misma filosofía del curso, pero ya conocemos el destino: en vez de quedarnos con ese default gigante y recortarlo línea por línea, escribimos directo el **estado curado** del curso.

TypeScript necesita saber cómo compilar tus specs. Crea el archivo en la raíz con el contenido de abajo. La vía más simple es el **editor**: crea `tsconfig.json` en VS Code (`code tsconfig.json`) y pega el JSON. O desde la terminal:

🐧 **bash:**

```bash
test -f tsconfig.json && echo "Ya existe" || cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "exactOptionalPropertyTypes": false,
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

🪟 **PowerShell** (ojo: el `'@` de cierre va en la **columna 0**, sin indentación, o el here-string no cierra):

```powershell
@'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "exactOptionalPropertyTypes": false,
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
'@ | Set-Content -Encoding utf8 tsconfig.json
```

**Por qué cada opción importa:**

| Opción | Qué hace | Por qué en este curso |
|---|---|---|
| `target: "ES2022"` | A qué versión de JavaScript se traduce tu TS | Node 20 ejecuta ES2022 nativo; sintaxis moderna sin transpilar de más |
| `module: "commonjs"` | Formato de módulos que asume/emite (`require`/`module.exports`) | Es lo que el runner de Playwright usa al ejecutar en Node |
| `moduleResolution: "node"` | Estrategia para localizar lo que importas (`node_modules`, `index`…) | Resuelve `@playwright/test` y `dotenv` como lo hace Node |
| `strict: true` | Enciende la familia completa de chequeos estrictos (`noImplicitAny`, `strictNullChecks`…) | Errores en compile-time, no a mitad de una corrida de 40s |
| `exactOptionalPropertyTypes: false` | **NO** forma parte de `strict`; en `true` prohíbe asignar `undefined` explícito a una propiedad opcional (`prop?: T`) | **Debe** quedar en `false` en este curso (ver recuadro ⚠️ abajo) |
| `esModuleInterop: true` | Permite `import` default sobre paquetes CommonJS | Sin esto algunos imports de librerías npm obligan a sintaxis rara |
| `skipLibCheck: true` | No type-checkea los `.d.ts` de `node_modules` | Compila más rápido y no te bloquean errores de tipos de terceros que no puedes arreglar |
| `forceConsistentCasingInFileNames: true` | Error si un import difiere en mayúsculas/minúsculas del archivo real | Windows/macOS lo perdonan, el CI en Linux (M06) no; mata el "funciona en mi máquina" |
| `resolveJsonModule: true` | Permite importar `.json` con tipos | Necesario para `import marketsJson from "../data/markets.json"` en M02 |
| `types: ["node", "@playwright/test"]` | Qué declaraciones globales se cargan | Sin `node`, `process.env` no tiene tipo; sin `@playwright/test`, `test`/`expect` tampoco |
| `include` (las 2 entradas) | Qué archivos entran al type-check | El config + todos los `modulo-*/`: espejo del `testMatch` del Paso 4 |

> ⚠️ **¿Por qué `exactOptionalPropertyTypes` debe estar en `false`?**
> Esta flag **no viene incluida en `strict`** (hay que encenderla aparte), y aquí la dejamos apagada **a propósito**. La evidencia sale del propio curso: si la activas, el `playwright.config.ts` deja de compilar. La línea `workers: process.env.CI ? 2 : undefined` — el patrón que genera el installer oficial y que enseñamos en M06 — lanza **TS2769**, porque Playwright declara `workers?: number | string` y la flag prohíbe asignarle un `undefined` explícito a esa propiedad opcional. Y el truco clave de M04, `test.use({ storageState: undefined })` para renunciar a la sesión heredada, solo compila porque Playwright añadió `| undefined` **a mano** en ese tipo: con la flag activa quedas a merced de cómo tipó cada librería sus opciones. `strict: true` ya te da la red de seguridad importante.

Verifica:

```bash
pnpm exec tsc --noEmit
# Si está limpio, no imprime nada. Si imprime errores, léelos y corrige antes de seguir.
```

---

### Paso 6 — Añadir el script `m1` a `package.json`

Para tener un atajo cómodo:

```bash
# Ver scripts actuales: busca la sección "scripts"
cat package.json
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

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** `pnpm m1`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed:** `pnpm test:headed`
- **Depurar (Playwright Inspector):** `pnpm test:debug` (o `pnpm exec playwright test modulo-01-smoke-feo --project=ui-chromium --debug`) — pausa antes de cada acción y resalta el locator exacto
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@smoke"`) o por archivo (`pnpm exec playwright test modulo-01-smoke-feo/reto.spec.ts`)
- **Ver el HTML report:** `pnpm report` (o `pnpm exec playwright show-report`) — el artefacto compartible con pasos, trace, screenshot y video
- **🪟 Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm m1` (no `VAR=x pnpm m1`, que es sintaxis de bash y falla en PowerShell)

---

## Outcome esperado

- [ ] Instalaste Playwright con `pnpm create playwright` (installer oficial) y añadiste `dotenv` y `typescript` con `pnpm add -D dotenv typescript`.
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

## ¿Qué viene en M02?

En el próximo módulo vas a **parametrizar** este smoke para que un mismo test corra contra los 4 mercados de OmniPizza (MX/US/CH/JP) consumiendo JSON tipado — primer paso para matar la duplicación.
