# M06 · Guía del módulo: Setup

> 🎁 **Proyecto de referencia.** En el repo del curso, este módulo incluye una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del monorepo). Úsalo como **solución de referencia**: ábrelo aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test:setup` → `pnpm m6`. Los pasos de esta guía siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto".

**Duración estimada:** 55-75 min
**Piezas que suma al framework:**
- `tests/setup/auth.setup.ts` — un SOLO test: login **por UI** → persiste `storageState` (el "badge").
- `playwright.config.ts` con 2 projects: `setup` corre primero, `chromium` hereda el badge vía `dependencies`.
- `.auth/` en `.gitignore` — el badge contiene una sesión válida y nunca se commitea.

**La idea, en una frase:** inicia sesión **una vez** (como un usuario real), guarda la sesión en un archivo, y declara `dependencies: ['setup']` para que todos tus tests arranquen ya autenticados. Nada más. Ese es el módulo completo — un solo concepto, hecho bien.

---

## 🏗️ Arquitectura al terminar este módulo

Aparece la carpeta **`tests/setup/`** con un único `auth.setup.ts`, y el `playwright.config.ts` **cambia de orquestación por primera vez desde M01**: pasa de un project a **dos**, uno dependiendo del otro.

```
modulo-06-setup/
├── .auth/                          ← 🆕 (gitignored) badge persistido
│   └── user.json                   ← 🆕 storageState generado por auth.setup.ts
├── tests/
│   ├── setup/
│   │   └── auth.setup.ts           ← 🆕 login por UI → guarda .auth/user.json
│   ├── ejemplo.spec.ts             ← 🆕 arranca YA autenticado (goto /catalog, sin login)
│   └── reto.spec.ts                ← 🆕 login negativo (locked_out_user)
├── playwright.config.ts            ← ✏️ 2 projects: setup → chromium (dependencies)
├── package.json · tsconfig.json · .env.example · .gitignore (con .auth/)
```

**Project graph** (cómo Playwright orquesta la ejecución):

```
┌─────────────┐   crea .auth/user.json   ┌───────────────────────────────┐
│   setup     │ ───────────────────────► │  chromium                     │
│ (login UI)  │      dependencies:       │  (hereda el badge vía          │
│             │        ['setup']         │   storageState → autenticado)  │
└─────────────┘                          └───────────────────────────────┘
```

**Flujo del badge** (de dónde sale la sesión y quién la hereda):

```
auth.setup.ts ──► login por UI ──► page.context().storageState({ path })
                                              │  serializa cookies + localStorage
                                              ▼
                                       .auth/user.json  (el "badge")
                                              │  storageState: ".auth/user.json"
                                              ▼
                   cada test del project chromium arranca YA con esa sesión
```

**Qué NO existe todavía:**

| Carpeta / pieza | Llega en | Para qué |
|---|---|---|
| firefox / webkit (matriz cross-browser) | M08 | CI/CD con matrix por browser |
| `services/`, `tests/api/` | M07 | Suite de API pura (BaseService abstracta) |

---

## Analogía de apertura

El tester manual, al llegar por la mañana, **se registra en recepción una sola vez** y recibe un **badge**. Con ese badge entra a todas las salas del día sin volver a identificarse en cada puerta. En M05 era como enseñar tu credencial **en cada puerta** (login por UI en cada test); aquí lo haces **una vez**, guardas el badge (`storageState`) y las puertas se abren solas (`dependencies` + `storageState`).

---

## ¿Qué aprenderás?

1. **`auth.setup.ts` como un project** — un test normal, con extensión `.setup.ts`, que corre primero.
2. **`storageState`** — cómo Playwright serializa cookies **y** localStorage a un archivo, y cómo eso captura la sesión de OmniPizza **sin escribir el token a mano**.
3. **`dependencies: ['setup']`** — la precondición declarativa: "no arranques hasta que setup termine en verde".
4. **`storageState` por project** — por qué va en el project `chromium` y no en el `use:` raíz.
5. **Renunciar al badge** con `test.use({ storageState: undefined })` para probar flujos anónimos / login negativo.

---

## Conceptos JIT

| Concepto | Analogía |
|---|---|
| `auth.setup.ts` (project) | Registro en recepción: se hace 1 vez, el badge vale todo el día |
| `.setup.ts` (la extensión) | El sticker que marca "este test es un setup", no un caso normal |
| `storageState` | El badge físico: cookies + localStorage serializados a un archivo |
| `dependencies: ['setup']` | "No ejecutes hasta que setup haya terminado" — precondición declarativa |
| `storageState` por project | Todos los TCs del project heredan el mismo badge |
| `test.use({ storageState: undefined })` | Dejar el badge en recepción: entras anónimo a propósito |

---

## ¿Por qué UI login aquí (y no API)?

Este módulo usa el login **por UI** — exactamente el flujo que ya hiciste a mano en M01 — porque para **aprender el concepto** es lo más claro:

- **Reusa lo conocido:** el alumno YA hizo este login. El setup es "hazlo una vez y guárdalo", no un concepto nuevo de red.
- **Cero magia de `localStorage`:** `page.context().storageState()` serializa cookies **y** localStorage. Como OmniPizza guarda la sesión en localStorage, queda capturada **sin** que escribas `window.localStorage.setItem(...)` a mano — que es justo la parte que más confunde.
- **Es el patrón canónico** de la doc oficial de Playwright (`auth.setup.ts` que llena el formulario y guarda `storageState`).

> 💡 **Nota avanzada — API login (la optimización, no el concepto).**
> El login por **API** es más rápido y determinista (un `POST /api/auth/login` en vez de navegar). Cuando la suite crezca y el setup se vuelva un cuello de botella, cámbialo: `request.post('/api/auth/login')` → obtén el token → siémbralo en `localStorage` → `storageState`. Pagas más complejidad (decodificar el JWT, replicar el store que el SPA escribe) a cambio de velocidad. **Para aprender, UI es más claro; API es la optimización** que aplicas cuando el número lo justifique.

---

## ¿Por qué un setup project (y no `globalSetup`)?

Playwright ofrece dos formas de preparar sesión. Este curso usa el **setup project**, no `globalSetup`:

| Aspecto | `globalSetup` (hook) | `auth.setup.ts` (project) |
|---|---|---|
| Qué es | Una función que corre antes de todo, fuera del runner | Un **test normal** con extensión `.setup.ts` |
| Visibilidad en el reporte | No aparece (es un hook escondido) | **Aparece como test** — ves si el login pasó o falló |
| Orden con otros projects | Manual | Declarativo con `dependencies` |
| Reutilización por rol | Difícil | Trivial (un `.setup.ts` por persona que autentica) |

> El punto pedagógico: `dependencies: ['setup']` hace el orden **explícito y visible**. No escondes el login en un hook — lo declaras como un paso que el reporte muestra.

---

## Paso a paso

> **Cómo leer esta sección:** cada paso dice exactamente **qué archivo se crea o edita** y en qué orden. Primero blindas el `.gitignore`, luego escribes el setup, luego el config que lo ata, y al final corres solo el setup y después el módulo completo.

### Paso 0 — Pre-requisitos

Verifica que **M05 (Fixtures) quede verde** antes de empezar. M06 no depende del código de M05, pero sí del "dolor" que resuelve: en M05 el login corría por UI en **cada** test; aquí lo vas a hacer **una vez**. Tener M05 fresco hace clic el contraste.

```bash
# Desde el proyecto/
pnpm typecheck     # debe pasar limpio
```

---

### Paso 1 — Blinda el `.gitignore` ANTES de generar el badge

**1.1 — Asegura que `.auth/` esté en `.gitignore`.** Abre el `.gitignore` y confirma que tenga `.auth/`. Si no, añádelo al final.

```gitignore
# --- Secrets y storageState ---
.env
.env.local
.auth/
```

El `storageState` que vas a generar contiene una **sesión válida** (el token vive en `localStorage`). Commitearlo es filtrar credenciales en el historial de Git.

> ⚠️ Haz esto **antes** del primer `pnpm test:setup`. Una vez que `.auth/user.json` entra al historial, sacarlo requiere reescribir commits.

**Cómo verifico:** `git check-ignore .auth/` imprime `.auth/` (la ruta quedó cubierta), y `git status` **no** muestra `.auth/` ni siquiera después de correr el setup.

---

### Paso 2 — Escribe `tests/setup/auth.setup.ts` (login por UI → badge)

Crea `tests/setup/` y dentro `auth.setup.ts`. La extensión `.setup.ts` es la que el project `setup` matchea con su `testMatch`; la ubicación en `tests/setup/` lo mantiene separado de los `*.spec.ts` normales. **Un solo test**, sin warmup separado, sin modo serial, sin login por API, sin sembrar `localStorage` a mano.

```ts
// @file modulo-06-setup/tests/setup/auth.setup.ts
// ============================================================
// M06 — Setup & auth: inicia sesión UNA vez, guarda el "badge"
// ============================================================
// Un SOLO test de setup. Sin warmup separado, sin modo serial,
// sin login por API, sin sembrar localStorage a mano.
// Haces lo que un usuario real hace (login por UI, igual que en
// M01) y Playwright guarda la sesión completa en un archivo.
// ============================================================

import { test as setup, expect } from "@playwright/test";

const authFile = ".auth/user.json"; // el "badge" que heredarán los tests

setup("authenticate", async ({ page }) => {
  // Render (free tier) duerme el backend tras 15 min → margen extra la 1ª vez.
  setup.setTimeout(90_000);

  // 1) Login por UI — exactamente el flujo que ya practicaste en M01.
  await page.goto("/");
  await page.getByTestId("market-MX").click();
  await page.getByTestId("username-desktop").fill(process.env.TEST_USER_USERNAME ?? "standard_user");
  await page.getByTestId("password-desktop").fill(process.env.TEST_USER_PASSWORD ?? "pizza123");
  await page.getByRole("button", { name: "Sign In" }).click();

  // 2) Señal inequívoca de sesión abierta: llegamos al catálogo.
  await expect(page).toHaveURL(/\/catalog/);

  // 3) Guardar el badge. storageState serializa cookies + localStorage;
  //    OmniPizza guarda la sesión en localStorage, así que queda
  //    capturada AUTOMÁTICAMENTE — sin escribir el token a mano.
  await page.context().storageState({ path: authFile });
});
```

El login por UI reusa lo que ya sabes (M01). El único ajuste nuevo es la última línea: `storageState({ path })` guarda la sesión completa a un archivo. Como OmniPizza persiste la sesión en `localStorage`, `storageState` la captura sola — no tocas `localStorage` tú.

> 🔍 **Detalle que parece obvio — `import { test as setup }` (y la extensión `.setup.ts`)**
> **Qué es:** es un test normal de Playwright, pero renombrado a `setup` por convención y guardado como `auth.setup.ts`. El project `setup` lo matchea con `testMatch: /.*\.setup\.ts/`.
> **Por qué así (y no la alternativa obvia):** la extensión `.setup.ts` es lo que permite que **una sola** regla de `testMatch` capture el setup sin atrapar tus `*.spec.ts`. Y renombrar `test → setup` es solo legibilidad: deja claro que este archivo prepara el terreno, no prueba una feature.
> **Qué pasa si lo cambias:** si lo renombras a `auth.spec.ts`, el project `setup` deja de matchearlo (su regex pide `.setup.ts`) → el badge nunca se genera y `chromium` arranca sin sesión. Al revés: cualquier `*.setup.ts` suelto en `tests/` lo recogerá el setup project aunque no quieras.

> 🔍 **Detalle que parece obvio — `await page.context().storageState({ path: authFile })`**
> **Qué es:** serializa el estado del `BrowserContext` (cookies + localStorage del `page` que acaba de loguearse) a `.auth/user.json` — el "badge".
> **Por qué así (y no la alternativa obvia):** la alternativa "obvia" (y frágil) sería leer el token y escribir el JSON a mano. No hace falta: `storageState` **siempre** guarda cookies + localStorage juntos, así que captura la sesión sea cual sea el mecanismo. Como OmniPizza guarda la sesión en localStorage, el badge queda completo sin que toques `window.localStorage`.
> **Qué pasa si lo cambias:** si omites esta línea, el login ocurre pero **no se persiste nada** → `.auth/user.json` no existe y `chromium` arranca anónimo. Si algún día OmniPizza migrara a cookies httpOnly, este mismo `storageState` seguiría funcionando sin tocar el setup.

> 🔷 **TypeScript — `setup.setTimeout(90_000)` (número con separador `_`)**
> El `_` en `90_000` es un **separador de dígitos**: TS lo ignora al compilar (`90_000 === 90000`), pero para el humano `90_000` se lee "noventa mil" de un vistazo. El gotcha: es solo azúcar visual, no cambia el valor.
> 📚 Lo viste en [TS · M02 — Tipos](/docs/typescript/m2-numbers). Aquí lo aplicas para darle margen al cold start de Render en el primer login del día.

---

### Paso 3 — Escribe el `playwright.config.ts` (2 projects: setup → chromium)

> **📐 Config — cambios vs M05 (aquí el config cambia de orquestación por 1ª vez)**
> ```diff
>   import { defineConfig, devices } from "@playwright/test";
>   import "dotenv/config";
>
>   projects: [
> -   { name: "chromium", use: { ...devices["Desktop Chrome"] } },
> +   { name: "setup", testMatch: /.*\.setup\.ts/ },
> +   {
> +     name: "chromium",
> +     use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
> +     dependencies: ["setup"],
> +   },
>   ]
> ```
> **Se mantiene:** `baseURL`, timeouts, reporter, `trace`. **Entra:** el project `setup` (corre primero, genera el badge) y, en `chromium`, `storageState` + `dependencies: ["setup"]`. **Nota lo que NO entra:** ni firefox/webkit (eso es M08), ni `testIgnore` gigantes (este proyecto solo tiene SUS tests).

**3.1 — Reemplaza `projects` por la versión de 2 projects.**

```ts
// @file modulo-06-setup/playwright.config.ts
// ============================================================
// M06 — Setup & auth: el config MÍNIMO que hace falta
// ============================================================
// Solo 2 projects: `setup` corre primero y crea el badge;
// `chromium` depende de él y arranca ya autenticado.
// (Sin firefox/webkit: la matriz cross-browser vive en M08 · CI.
//  Sin testIgnore gigantes: este proyecto solo tiene SUS tests.)
// ============================================================

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  projects: [
    // 1) Corre primero → genera .auth/user.json (el badge).
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    // 2) Hereda el badge vía storageState + dependencies → arranca autenticado.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
```

El project `setup` corre **primero** y genera el badge; `chromium` lo hereda vía `storageState` + `dependencies`. Fíjate que `chromium` **no** define `testMatch`: usa el default (`*.spec.ts`), así que NO recoge el `auth.setup.ts` — por eso este config no necesita `testIgnore`.

> 🔍 **Detalle que parece obvio — `dependencies: ["setup"]`**
> **Qué es:** la precondición declarativa, a nivel de project: "este project no arranca hasta que el project `setup` termine **en verde**".
> **Por qué así (y no la alternativa obvia):** no es un `import`, ni un `globalSetup`, ni una llamada en un `beforeAll`. No ejecutas el login tú mismo — **declaras** el orden y Playwright construye el grafo (por eso el setup aparece como un test en el reporte y se reutiliza por rol).
> **Qué pasa si lo cambias:** si borras `dependencies`, `chromium` ya **no espera** al setup. Puede arrancar antes de que `.auth/user.json` exista (o con uno viejo) → tests que fallan con "sesión no encontrada" de forma intermitente, según quién gane la carrera.

> 🔍 **Detalle que parece obvio — `storageState: ".auth/user.json"` (en el project `chromium`, NO en el `use:` raíz)**
> **Qué es:** la asignación del badge **por project** — dentro de `chromium`, no en el bloque `use:` global de `defineConfig`.
> **Por qué así (y no la alternativa obvia):** la alternativa "obvia" es ponerlo una vez arriba en `use:` para no repetirlo. Pero eso autenticaría **TODO**, incluido el propio `setup` (que debe correr **sin** sesión, porque su trabajo ES loguearse) y cualquier flujo anónimo/negativo futuro.
> **Qué pasa si lo cambias:** si lo subes al `use:` raíz, el project `setup` arrancaría con una sesión que aún no existe (huevo y gallina), y tus flujos negativos (login inválido, acceso anónimo) arrancarían **ya logueados** y dejarían de probar lo que dicen probar. Los falsos verdes más peligrosos nacen aquí.

**3.2 — Añade los scripts al `package.json`.** Agrega el atajo del módulo y el del setup aislado.

```json
"scripts": {
  "m6": "playwright test --project=chromium",
  "test:setup": "playwright test --project=setup"
}
```

`test:setup` te deja correr **solo** el setup (para inspeccionar el badge); `m6` corre el módulo completo (setup arranca solo por `dependencies`).

**3.3 — Confirma el `tsconfig.json`.** El `include` ya trae `tests/**/*.ts`, así que el nuevo `auth.setup.ts` (vive bajo `tests/setup/`) queda cubierto y `pnpm typecheck` lo valida sin tocar nada más.

---

### Paso 4 — Corre SOLO el setup project

```bash
pnpm test:setup
```

Correr el setup aislado te deja **ver el badge nacer** antes de que ningún test lo herede. Verás **un** test verde en el project `setup`: `authenticate`. Tras la corrida, aparece `.auth/user.json` en disco:

```bash
ls .auth
cat .auth/user.json    # fíjate: "cookies" y "origins" (ahí vive el localStorage)
```

Ese archivo contiene la sesión. **Está en `.gitignore`** — nunca lo commitees.

> 💡 **Si falla** con `TimeoutError` o `ECONNREFUSED`: probablemente OmniPizza está dormido (cold start de Render). El `setup.setTimeout(90_000)` da margen; si aun así falla, vuelve a correr — el backend ya estará despierto.

---

### Paso 5 — Corre el módulo completo (el setup arranca solo)

```bash
# El project chromium declara dependencies: ['setup'],
# así que Playwright corre setup automáticamente primero.
pnpm m6
```

Esto demuestra el grafo — no invocas el setup tú: lo **declaras** y Playwright lo orquesta. Setup corre primero (genera/refresca `.auth/user.json`) y el `ejemplo.spec.ts` arranca **ya autenticado**: hace `page.goto("/catalog")` **sin** paso de login previo y el catálogo carga.

```ts
// @file modulo-06-setup/tests/ejemplo.spec.ts
// ============================================================
// M06 — Arranca YA autenticado gracias al setup project
// ============================================================
// Este spec corre en el project `chromium`, que declara
// `dependencies: ['setup']` + `storageState: '.auth/user.json'`.
// Antes de ejecutarlo, Playwright corre `tests/setup/auth.setup.ts`
// (login por UI → guarda el badge) y este test HEREDA la sesión.
//
// Fíjate en lo que NO hay: ni goto('/'), ni selección de mercado,
// ni fill de credenciales, ni click en "Sign In". El badge ya trajo
// todo eso. Vamos DIRECTO al catálogo.
// ============================================================

import { test, expect } from "@playwright/test";

test.describe("Setup & auth — sesión heredada (M06)", () => {
  test("aterriza en /catalog sin hacer login @smoke", async ({ page }) => {
    // ⚠️ No hay paso de login. El storageState ya trajo la sesión.
    await page.goto("/catalog");

    // Señal de sesión abierta: seguimos en /catalog (no nos rebotó a "/")
    // y el catálogo muestra al menos una pizza.
    await expect(page).toHaveURL(/\/catalog/);
    const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
    await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
  });
});
```

**No hay** `goto('/')`, ni `market-MX`, ni `fill` de credenciales, ni click en "Sign In". El badge trajo todo eso. Ese contraste con M05 (donde el login estaba en cada test) es la prueba de que el setup funcionó.

---

## ▶️ Cómo ejecutar este módulo

- **Correr SOLO el setup (genera el badge):** desde `proyecto/`, `pnpm test:setup`
- **Comando del módulo (completo):** `pnpm m6` (setup arranca solo por `dependencies`)
- **UI mode:** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Solo el reto:** `pnpm exec playwright test tests/reto.spec.ts --headed --project=chromium`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** variables de entorno con `$env:VAR="x"; pnpm m6` (no `VAR=x pnpm m6`, sintaxis bash que falla en PowerShell)

---

## Outcome esperado

- [ ] `.auth/` está en `.gitignore` **antes** del primer `pnpm test:setup`.
- [ ] `.auth/user.json` se crea al correr el setup (login por UI → `storageState`).
- [ ] Puedes explicar por qué el login es **por UI** aquí (y cuándo cambiarías a API).
- [ ] El test de `ejemplo.spec.ts` arranca **ya autenticado**: `page.goto("/catalog")` sin login.
- [ ] Entiendes por qué `storageState` va **en el project** `chromium`, no en el `use:` raíz.
- [ ] Sabes que `dependencies: ['setup']` declara el orden y hace visible el setup en el reporte.
- [ ] Resolviste el login negativo con `locked_out_user` (`Invalid credentials`, URL en `/login`) renunciando al badge con `test.use({ storageState: undefined })`.

---

## ¿Qué viene en M07?

Hasta aquí manejaste la sesión **desde el navegador** (login por UI → badge). En **M07 (API layer)** vas a probar la API **directamente**, sin UI: una capa de servicios tipados (`BaseService` abstracta + factory) que hace requests HTTP y valida contratos. Es la otra mitad del testing — y el lugar natural para la optimización de "API login" que mencionamos en la nota avanzada de este módulo.
