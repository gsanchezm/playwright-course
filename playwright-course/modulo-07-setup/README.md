# Módulo 07 — Setup & auth (inicia sesión UNA vez → badge heredado, por UI o por API)

**Duración estimada:** 75-95 min
**Piezas que suma al framework:**
- `tests/setup/auth.ui.setup.ts` — login **por UI** (con el `LoginPage` de M04) → persiste `storageState` en `.auth/user.ui.json`.
- `tests/setup/auth.api.setup.ts` — login **por API** (con el `AuthService` de M06) → siembra el `localStorage` que escribiría el SPA → persiste `storageState` en `.auth/user.api.json`.
- `tests/setup/auth.paths.ts` — una sola fuente de verdad para las rutas de los badges.
- `playwright.config.ts` con 4 projects: `setup-ui` y `setup-api` generan un badge cada uno; `chromium` hereda el de la API y `chromium-ui-badge` hereda el de la UI, ambos vía `dependencies`.
- `.auth/` en `.gitignore` — los badges contienen una sesión válida y nunca se commitean.

**Lo que NO suma — hereda de M04/M05/M06 sin cambios:** `pages/` (set completo: `BasePage`, `LoginPage`, `CatalogPage`, `CheckoutPage`, `MenuPage`, `ProfilePage`, `PizzaCustomizerModal`), `types/`, `data/`, `fixtures/omnipizza.ts` (set completo: `loginPage`, `catalogPage`, `checkoutPage`, `menuPage`, `profilePage`, `pizzaCustomizer`, `standardUser`, `defaultMarket`) y, desde M06, `services/` (`BaseService`, `AuthService`, `PizzaService`, `OrderService`). Los setups **reutilizan** esas piezas — no las reinventan.

---

> 🎁 **Proyecto de referencia — [`proyecto/`](proyecto/).** Este módulo trae una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado final de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del resto del curso). Es la **solución de referencia** para comparar: ábrela aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test:setup-ui` → `pnpm test:setup-api` → `pnpm m7`. Los pasos de este README siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto". Detalles en [`proyecto/README.md`](proyecto/README.md).

## La idea, en una frase

**Inicia sesión UNA vez (por la UI o por la API), guarda la sesión en un archivo, y declara `dependencies` para que todos tus tests arranquen ya autenticados.** Dos formas de hacer el login, un solo mecanismo para heredarlo: `storageState` + `dependencies`. Ese es el módulo completo.

---

## 🏗️ Arquitectura al terminar este módulo

M07 viene **después de M06** (que ya trae `services/`): por eso el setup por API puede reutilizar `AuthService` sin escribir un solo `fetch` nuevo. Aparece la carpeta **`tests/setup/`** con **dos** setups separados (uno por camino de login), y el `playwright.config.ts` pasa de dos projects (M06: `chromium` + `api`) a **cuatro** de UI/setup (`setup-ui`, `setup-api`, `chromium`, `chromium-ui-badge`); el project `api` se queda en M06. El POM, los fixtures y los servicios **no cambian** — es la MISMA base de M04/M05/M06, rodeada de setup projects.

```
modulo-07-setup/proyecto/
├── .auth/                          ← 🆕 (gitignored) badges persistidos
│   ├── user.ui.json                ← 🆕 storageState generado por auth.ui.setup.ts
│   └── user.api.json               ← 🆕 storageState generado por auth.api.setup.ts
├── pages/                          ← (M05 — set completo, sin cambios)
├── services/                       ← (M06 — BaseService, AuthService, PizzaService, OrderService)
├── types/                          ← (M03/M06 — sin cambios)
├── data/                           ← (M03 — sin cambios)
├── fixtures/                       ← (M05 — set completo)
│   └── omnipizza.ts
├── tests/
│   ├── setup/
│   │   ├── auth.paths.ts           ← 🆕 UI_AUTH_FILE · API_AUTH_FILE · (reto) GLITCH_*_FILE
│   │   ├── auth.ui.setup.ts        ← 🆕 login por UI (LoginPage) → .auth/user.ui.json
│   │   └── auth.api.setup.ts       ← 🆕 login por API (AuthService) + localStorage → .auth/user.api.json
│   ├── ejemplo.spec.ts             ← 🆕 arranca YA autenticado (badge API): catálogo sin login,
│   │                                    sesión persistente entre páginas + 1 widget de muestra (modal)
│   ├── badge-api.spec.ts           ← 🆕 el badge API deja sesión activa (project chromium)
│   ├── badge-ui.spec.ts            ← 🆕 el badge UI deja sesión activa (project chromium-ui-badge)
│   └── reto.spec.ts                ← 🆕 login negativo (locked_out_user) + 2º usuario con su badge
├── playwright.config.ts            ← ✏️ 4 projects: setup-ui · setup-api · chromium · chromium-ui-badge
├── package.json · tsconfig.json · .env.example · .gitignore (con .auth/)
```

**Project graph** (cómo Playwright orquesta la ejecución):

```
┌────────────┐  crea .auth/user.api.json  ┌───────────────────────────────┐
│ setup-api  │ ─────────────────────────► │ chromium                      │
│ (login API)│   dependencies:            │ ejemplo · badge-api · reto    │
└────────────┘     ['setup-api']          └───────────────────────────────┘

┌────────────┐  crea .auth/user.ui.json   ┌───────────────────────────────┐
│ setup-ui   │ ─────────────────────────► │ chromium-ui-badge             │
│ (login UI) │   dependencies:            │ badge-ui                      │
└────────────┘     ['setup-ui']           └───────────────────────────────┘
```

**Flujo del badge** (de dónde sale la sesión y quién la hereda):

```
auth.ui.setup.ts  ──► login por UI  ──┐
                                      ├──► page.context().storageState({ path })
auth.api.setup.ts ──► login por API ──┘          │  serializa cookies + localStorage
                      + localStorage             ▼
                      sembrado        .auth/user.ui.json / .auth/user.api.json  (el "badge")
                                                 │  storageState: "<ruta>" (por project)
                                                 ▼
                      cada test de ese project arranca YA con esa sesión
```

**Qué NO existe todavía:**

| Carpeta / pieza | Llega en | Para qué |
|---|---|---|
| firefox / webkit (matriz cross-browser) | M08 | CI/CD con matrix por browser |
| Pipeline de CI que corre los setups | M08 | Workflows, traces descargables |

> 💡 **Para el facilitador:** dibuja el **project graph** en el pizarrón antes de abrir el código. Los alumnos suelen confundir **setup project** con **globalSetup** — el diagrama hace ver que setup es **un test más** (aparece en el reporte), no un hook escondido. Repite en voz alta la frase clave: *"login una vez → guardo el badge → dependencies lo hereda"*.

---

## Analogía de apertura

El tester manual, al llegar por la mañana, **se registra en recepción una sola vez** y recibe un **badge**. Con ese badge entra a todas las salas del día sin volver a identificarse en cada puerta. En M05 era como enseñar tu credencial **en cada puerta** (login por UI en cada test); aquí lo haces **una vez**, guardas el badge (`storageState`) y las puertas se abren solas (`dependencies` + `storageState`). Y hay dos ventanillas para obtenerlo: la **recepción con formulario** (UI) y la **ventanilla de sistemas** (API), que te imprime el mismo badge sin pasar por el mostrador.

---

## ¿Qué aprenderás?

1. **`auth.ui.setup.ts` / `auth.api.setup.ts` como projects** — tests normales, con extensión `.setup.ts`, que corren primero.
2. **`storageState`** — cómo Playwright serializa cookies **y** localStorage a un archivo.
3. **Dos caminos de login** — UI vs API, qué claves de `localStorage` deja cada uno y cuándo conviene cada uno.
4. **`dependencies`** — la precondición declarativa: "no arranques hasta que tu setup termine en verde".
5. **`storageState` por project** — por qué va en cada project y no en el `use:` raíz (y por eso hay un badge por camino).
6. **Renunciar al badge** con `test.use({ storageState: { cookies: [], origins: [] } })` para probar flujos anónimos / login negativo.

---

## Conceptos JIT

| Concepto | Analogía |
|---|---|
| `auth.ui.setup.ts` / `auth.api.setup.ts` (projects) | Registro en recepción (por formulario o por ventanilla de sistemas): se hace 1 vez, el badge vale todo el día |
| `.setup.ts` (la extensión) | El sticker que marca "este test es un setup", no un caso normal |
| `storageState` | El badge físico: cookies + localStorage serializados a un archivo |
| `dependencies: ['setup-api']` | "No ejecutes hasta que setup-api haya terminado" — precondición declarativa |
| `storageState` por project | Todos los TCs del project heredan el mismo badge |
| `test.use({ storageState: { cookies: [], origins: [] } })` | Dejar el badge en recepción: entras anónimo a propósito |

---

## ¿Setup por UI o por API? Dos setups, dos badges

Este módulo trae **dos setups separados** que producen el MISMO resultado (una sesión guardada) por caminos distintos. Viven en archivos y badges distintos para que puedas compararlos sin que uno pise al otro.

| Aspecto | `auth.ui.setup.ts` | `auth.api.setup.ts` |
|---|---|---|
| Cómo inicia sesión | Llena el formulario con `LoginPage` (como un usuario real) | `AuthService.login()` → `POST /api/auth/login` (sin navegador para el login) |
| De dónde sale el `localStorage` | Lo escribe el **SPA** solo; `storageState` lo captura | Lo **siembras tú** con `page.evaluate` (mismas claves, misma forma) |
| Badge que genera | `.auth/user.ui.json` | `.auth/user.api.json` |
| Project / quién lo hereda | `setup-ui` → `chromium-ui-badge` (`badge-ui.spec.ts`) | `setup-api` → `chromium` (`ejemplo`, `badge-api`, `reto`) |
| Complejidad | Baja: cero magia, es el login que ya conoces | Mayor: debes replicar lo que escribe el SPA (si el SPA cambia, el setup se desactualiza) |
| Se rompe cuando… | Cambia el formulario/locators de login | Cambia el contrato de la API o la forma del store del SPA |
| Úsalo cuando… | Quieres que el login de la UI quede cubierto, o estás aprendiendo el concepto | Quieres un setup desacoplado de la UI y con menos pasos de navegador |

**Tiempos medidos en vivo** (`pnpm test:setup-ui` y `pnpm test:setup-api`, backend ya despierto, 3 corridas de cada uno; **orientativos**, dependen de tu red y del estado de Render):

| Setup | Duración del test | Corrida completa |
|---|---|---|
| `setup-ui` | 1.3 - 2.1 s | 2.0 - 3.1 s |
| `setup-api` | 1.7 - 1.8 s | 2.4 - 2.6 s |

> 💡 **Lectura honesta de los números:** con el backend despierto y un solo usuario, **no hay diferencia práctica de velocidad** — el setup API incluye el *warm-up*, un `page.goto` al frontend y la siembra de `localStorage`, así que el "ahorro" del login HTTP no se nota. La ventaja de la API aparece en otros ejes: no depende de locators ni del formulario, y escala mejor cuando necesitas **varios usuarios** (un `POST` por usuario en vez de un login completo por navegador). Elige por **acoplamiento y mantenimiento**, no por la promesa de "la API siempre es más rápida".

### Las cinco claves de `localStorage` que escribe el SPA

El setup por API existe para reproducir **exactamente** lo que el SPA escribe cuando alguien inicia sesión por la UI. Se descubrieron inspeccionando `origins[].localStorage` de `.auth/user.ui.json`:

| Clave | Contenido |
|---|---|
| `token` | El JWT de la sesión |
| `username` | `"standard_user"` |
| `countryCode` | `"MX"` (el mercado elegido al loguear) |
| `omnipizza-auth` | Store de zustand (`persist`): `{"state":{"token","username","behavior"},"version":0}` — **es el que la app lee para saber si hay sesión**; sin él te manda de vuelta al login |
| `omnipizza-country` | Store de zustand: `{"state":{"countryCode","countryInfo":null,"language","locale","currency"},"version":0}` |

> ℹ️ `omnipizza-cart` y `omnipizza-release` también existen en el SPA, pero **no se siembran**: no forman parte de la sesión (el carrito arranca vacío y la versión se resuelve sola).

> ⚠️ **Cold start de Render.** `AuthService.create(apiURL)` abre su propio contexto HTTP, que **no hereda** los timeouts del config ni el `setTimeout` del test. Con el backend dormido (free tier, ~15 min de inactividad) el login podría morir por timeout. Por eso el setup API *calienta* primero con `request.get(`${apiURL}/api/pizzas`, { timeout: 85_000 })` (el `request` del test **sí** acepta timeout explícito) y recién después llama a `AuthService`. `AuthService` queda intacto; el frontend también puede estar dormido, por eso el `page.goto(baseURL, { timeout: 85_000 })`.

---

## ¿Por qué un setup project (y no `globalSetup`)?

Playwright ofrece dos formas de preparar sesión. Este curso usa el **setup project**, no `globalSetup`:

| Aspecto | `globalSetup` (hook) | `auth.*.setup.ts` (project) |
|---|---|---|
| Qué es | Una función que corre antes de todo, fuera del runner | Un **test normal** con extensión `.setup.ts` |
| Visibilidad en el reporte | No aparece (es un hook escondido) | **Aparece como test** — ves si el login pasó o falló |
| Orden con otros projects | Manual | Declarativo con `dependencies` |
| Reutilización por rol | Difícil | Trivial (un `.setup.ts` por persona que autentica) |

> El punto pedagógico: `dependencies` hace el orden **explícito y visible**. No escondes el login en un hook — lo declaras como un paso que el reporte muestra.

---

## Paso a paso

> **Cómo leer esta sección:** cada paso grande se parte en **micro-pasos `N.M`** con la tripleta **Qué hago / Por qué / Cómo verifico**. Cada micro-paso dice exactamente **qué archivo se crea o edita** y en qué orden: primero blindas el `.gitignore`, luego escribes los dos setups, luego el config que los ata, y al final corres y resuelves el reto.

### Paso 0 — Pre-requisitos

**0.1 — Verifica que M06 (API layer) quede verde**
- **Qué hago:** desde el `proyecto/`, `pnpm typecheck`. (Vienes de M06, donde ya tienes `services/` con `AuthService`; el login de la UI aún corre en **cada** test y aquí lo vas a hacer **una vez**.)
- **Por qué:** M07 **sí depende del código de M06**: el setup por API reutiliza `AuthService` tal cual, y el de UI reutiliza el POM/fixtures de M04/M05.
- **Cómo verifico:** `pnpm typecheck` no imprime errores.

**0.2 — Trae POM, fixtures y servicios completos**
- **Qué hago:** de `modulo-06-api-layer/proyecto/` copio `pages/` (con `index.ts`), `services/`, `types/`, `data/` y `fixtures/omnipizza.ts` completo.
- **Por qué:** M07 no es un proyecto nuevo — es M06 **+ storageState**. Traer el set completo mantiene el POM y los servicios consistentes entre módulos: la sesión heredada debe poder ejercitar checkout, menú, perfil y el modal igual que antes.
- **Cómo verifico:** `pnpm exec tsc --noEmit` limpio; `import { AuthService } from "../../services"` y `import { test, expect } from "../../fixtures/omnipizza"` resuelven sin error.

> 💡 **Para el facilitador:** abre M05 y M07 lado a lado. En M05 cada test llamaba `loginPage.loginInMarket(...)`. En M07 esa llamada **se muda** a los setups — el POM y los fixtures son los MISMOS, solo cambia QUIÉN los invoca y CUÁNDO. Ese "antes/después" es el módulo entero.

---

### Paso 1 — Blinda el `.gitignore` ANTES de generar los badges

**1.1 — Asegura que `.auth/` esté en `.gitignore` (edita `.gitignore`)**
- **Qué hago:** abro el `.gitignore` y confirmo que tenga `.auth/`. Si no, lo añado al final.
  ```gitignore
  # --- Secrets y storageState ---
  .env
  .env.local
  .auth/
  ```
- **Por qué:** los `storageState` que vas a generar contienen una **sesión válida** (el token vive en `localStorage`). Commitearlos es filtrar credenciales en el historial de Git.
- **Cómo verifico:** `git check-ignore .auth/` imprime `.auth/` (la ruta quedó cubierta), y `git status` **no** muestra `.auth/` ni siquiera después de correr los setups.

> ⚠️ Haz esto **antes** del primer `pnpm test:setup-ui` / `pnpm test:setup-api`. Una vez que un badge entra al historial, sacarlo requiere reescribir commits.

---

### Paso 2 — Escribe las rutas y el setup por UI

**2.1 — Crea `tests/setup/auth.paths.ts` (una sola fuente de verdad)**
- **Qué hago:** creo `tests/setup/` y el archivo de rutas:
  ```ts
  export const UI_AUTH_FILE = ".auth/user.ui.json";
  export const API_AUTH_FILE = ".auth/user.api.json";
  ```
  (El archivo real trae además dos constantes `GLITCH_*` para el reto; las ves en el Paso 7.)
- **Por qué:** dos setups, dos archivos DISTINTOS. Centralizar las rutas evita que el setup y el `playwright.config.ts` / los tests apunten a strings que se desincronizan.
- **Cómo verifico:** `pnpm exec tsc --noEmit` pasa.

**2.2 — Escribe `auth.ui.setup.ts`: un solo test que loguea por UI y guarda el badge**
- **Qué hago:** escribo el setup. **Un solo test**, sin modo serial, sin sembrar `localStorage` a mano — y SIN reescribir el login: lo importo de `fixtures/omnipizza.ts`.
  ```ts
  import { test as setup, expect } from "../../fixtures/omnipizza";
  import { UI_AUTH_FILE } from "./auth.paths";

  setup("authenticate", async ({ page, loginPage, standardUser, defaultMarket }) => {
    // Render (free tier) duerme el backend tras 15 min → margen extra la 1ª vez.
    setup.setTimeout(90_000);

    // 1) Login por UI — el mismo LoginPage de M04, inyectado por el
    //    fixture de M05. El setup no reinventa el login: lo REUTILIZA.
    await loginPage.loginInMarket(standardUser, defaultMarket.code);

    // 2) Señal inequívoca de sesión abierta: llegamos al catálogo.
    await expect(page).toHaveURL(/\/catalog/);

    // 3) Guardar el badge. storageState serializa cookies + localStorage;
    //    OmniPizza guarda la sesión en localStorage, así que queda
    //    capturada AUTOMÁTICAMENTE — sin escribir el token a mano.
    await page.context().storageState({ path: UI_AUTH_FILE });
  });
  ```
- **Por qué:** el `import { test as setup } from "../../fixtures/omnipizza"` es el punto clave — el setup NO llama `page.goto`/`getByTestId` a mano: reutiliza `loginPage` + `standardUser` + `defaultMarket`. El único ajuste nuevo es la última línea: `storageState({ path })` guarda la sesión completa.
- **Cómo verifico:** `pnpm exec tsc --noEmit` pasa; el test importa `test as setup` desde `../../fixtures/omnipizza` (no de `@playwright/test` a secas).

> 🔍 **Detalle que parece obvio — `import { test as setup } from "../../fixtures/omnipizza"`**
> **Qué es:** el `test` custom de M05 (con `loginPage`, `catalogPage`, `standardUser`, `defaultMarket` inyectados) sigue siendo un `test` de Playwright válido; renombrarlo `as setup` funciona igual que con el `test` base. El project lo matchea por el NOMBRE DE ARCHIVO, no por de dónde viene el `test`.
> **Por qué así (y no la alternativa obvia):** la alternativa — `@playwright/test` + login a mano — DUPLICA lo que `loginPage`/`standardUser` ya resuelven. Extender el `test` de M05 significa que el setup y los specs comparten el MISMO POM: un cambio en `LoginPage` se propaga a ambos.
> **Qué pasa si lo cambias:** si vuelves a `@playwright/test` puro, pierdes los fixtures y reescribes el login con locators crudos — funciona, pero rompe la continuidad con M04/M05. Si renombras el ARCHIVO a `auth.ui.spec.ts`, el project `setup-ui` deja de matchearlo (su regex pide `auth.ui.setup.ts`) → el badge nunca se genera.

> 🔍 **Detalle que parece obvio — `await page.context().storageState({ path: UI_AUTH_FILE })`**
> **Qué es:** serializa el estado del `BrowserContext` (cookies + localStorage del `page` que acaba de loguearse) a `.auth/user.ui.json` — el "badge".
> **Por qué así:** `storageState` **siempre** guarda cookies + localStorage juntos, así que captura la sesión sea cual sea el mecanismo. No lees el token ni escribes el JSON a mano.
> **Qué pasa si lo cambias:** si omites esta línea, el login ocurre pero **no se persiste nada** → el badge no existe y `chromium-ui-badge` arranca anónimo.

> 🔷 **TypeScript — `setup.setTimeout(90_000)` (número con separador `_`)**
> El `_` en `90_000` es un **separador de dígitos**: TS lo ignora al compilar (`90_000 === 90000`), pero para el humano se lee "noventa mil" de un vistazo. Es solo azúcar visual.
> 📚 Lo viste en [TS · M02 — Tipos](../../typescript-qa-course/modulo-02-types/).

---

### Paso 3 — Escribe el setup por API

**3.1 — Escribe `auth.api.setup.ts`: login HTTP + `localStorage` sembrado**
- **Qué hago:** creo el segundo setup. Mismo resultado (un badge), otro camino:
  ```ts
  import { test as setup, expect } from "../../fixtures/omnipizza";
  import { AuthService } from "../../services";
  import type { LoginResponse } from "../../types";
  import { API_AUTH_FILE } from "./auth.paths";

  setup("authenticate via API", async ({ page, request, standardUser, defaultMarket, baseURL }) => {
    // Render (free tier) duerme el backend tras 15 min. Presupuesto del cold start:
    // calentar backend (hasta 85 s) + cargar frontend (hasta 85 s) → 180 s de test.
    setup.setTimeout(180_000);

    // 1) Login por API con el AuthService de M06 (apunta al backend).
    const apiURL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

    //    Calentar el backend (cold start de Render): este GET con timeout
    //    explícito absorbe el arranque en frío y el login ya llega a un
    //    servidor despierto. (AuthService queda intacto.)
    await request.get(`${apiURL}/api/pizzas`, { timeout: 85_000 });
    const auth = await AuthService.create(apiURL);
    let login: LoginResponse & { behavior?: string };
    try {
      login = (await auth.login(standardUser)) as LoginResponse & { behavior?: string };
    } finally {
      await auth.dispose(); // M06: SIEMPRE dispose del contexto HTTP
    }
    const token = login.access_token;
    const username = login.username ?? standardUser.username;
    const behavior = login.behavior ?? "standard";
    expect(token).toBeTruthy();

    // 2) Abrir el origen del frontend (localStorage es por origen) y sembrar
    //    exactamente lo que el SPA escribiría tras un login por UI.
    await page.goto(baseURL!, { timeout: 85_000 });
    await page.evaluate(
      ({ token, username, behavior, market }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("countryCode", market.code);
        localStorage.setItem(
          "omnipizza-auth",
          JSON.stringify({ state: { token, username, behavior }, version: 0 }),
        );
        localStorage.setItem(
          "omnipizza-country",
          JSON.stringify({
            state: {
              countryCode: market.code,
              countryInfo: null,
              language: "es", // MX-específico: markets.json no trae idioma/locale
              locale: "es-MX",
              currency: market.currency,
            },
            version: 0,
          }),
        );
      },
      { token, username, behavior, market: defaultMarket },
    );

    // 3) Guardar el badge. Mismo storageState que el setup UI, otro archivo.
    await page.context().storageState({ path: API_AUTH_FILE });
  });
  ```
- **Por qué:** reutilizas `AuthService` (M06) para el login y siembras con `setItem` las cinco claves de la tabla anterior (`omnipizza-auth` y `omnipizza-country` son JSON de zustand, de ahí el `JSON.stringify`). Se abre primero el frontend porque `localStorage` es **por origen**: sembrar en `about:blank` no serviría. El `page.evaluate` recibe los valores como argumento (corre en el navegador, no ve las variables de Node).
- **Cómo verifico:** `pnpm exec tsc --noEmit` pasa; `AuthService` se importa de `../../services` (M06).

> 🔍 **Detalle que parece obvio — el `GET /api/pizzas` de calentamiento**
> **Qué es:** una petición con el `request` del test (que acepta `timeout` explícito) *antes* de crear el `AuthService`.
> **Por qué así:** `AuthService` crea su propio contexto HTTP; ese contexto NO hereda los timeouts del config ni `setup.setTimeout`. Con el backend dormido el login moriría en ~30 s. El warm-up absorbe el cold start, y el login llega a un servidor despierto.
> **Qué pasa si lo quitas:** funciona con el backend despierto, pero la primera corrida del día falla con `TimeoutError` de forma intermitente — el peor tipo de falla en un setup, porque tumba toda la suite.

> 🔍 **Detalle que parece obvio — `omnipizza-auth`**
> **Qué es:** el store (zustand `persist`) que la app lee para saber si hay sesión.
> **Por qué importa:** sembrar solo `token` NO basta; la app consulta `omnipizza-auth`. Sin él, el `page.goto("/catalog")` te rebota al login aunque el JWT sea válido.
> **Qué pasa si lo cambias:** si el SPA cambia la forma de ese store (versión, campos), el setup API se desactualiza en silencio. Es el costo de mantenimiento de este camino — y la razón de mantener también el setup UI como referencia.

---

### Paso 4 — Escribe el `playwright.config.ts` (4 projects)

> **📐 Config — cambios vs M06 (aquí el config cambia de orquestación por 1ª vez)**
> ```diff
>   import { defineConfig, devices } from "@playwright/test";
>   import "dotenv/config";
>
>   projects: [
> -   { name: "chromium", use: { ...devices["Desktop Chrome"] } },
> +   { name: "setup-ui", testMatch: /auth\.ui\.setup\.ts/ },
> +   { name: "setup-api", testMatch: /auth\.api\.setup\.ts/ },
> +   {
> +     name: "chromium",
> +     testMatch: [/ejemplo\.spec\.ts/, /reto\.spec\.ts/, /badge-api\.spec\.ts/],
> +     use: { ...devices["Desktop Chrome"], storageState: ".auth/user.api.json" },
> +     dependencies: ["setup-api"],
> +   },
> +   {
> +     name: "chromium-ui-badge",
> +     testMatch: /badge-ui\.spec\.ts/,
> +     use: { ...devices["Desktop Chrome"], storageState: ".auth/user.ui.json" },
> +     dependencies: ["setup-ui"],
> +   },
>   ]
> ```
> **Se mantiene:** `baseURL`, timeouts, reporter, `trace`. **Entra:** dos setup projects, y dos projects de navegador, cada uno con SU `storageState` + SU `dependencies`. **Nota lo que NO entra:** ni firefox/webkit (eso es M08).

**4.1 — Reemplaza `projects` por la versión de 4 projects (edita `playwright.config.ts`)**
- **Qué hago:** dejo el config así:
  ```ts
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
      // 1) Setups: cada uno genera SU badge, en su propio archivo.
      { name: "setup-ui", testMatch: /auth\.ui\.setup\.ts/ },
      { name: "setup-api", testMatch: /auth\.api\.setup\.ts/ },

      // 2) Tests autenticados con el badge de la API (el camino rápido).
      {
        name: "chromium",
        testMatch: [/ejemplo\.spec\.ts/, /reto\.spec\.ts/, /badge-api\.spec\.ts/],
        use: { ...devices["Desktop Chrome"], storageState: ".auth/user.api.json" },
        dependencies: ["setup-api"],
      },

      // 3) Mismo navegador, pero con el badge hecho por la UI.
      {
        name: "chromium-ui-badge",
        testMatch: /badge-ui\.spec\.ts/,
        use: { ...devices["Desktop Chrome"], storageState: ".auth/user.ui.json" },
        dependencies: ["setup-ui"],
      },
    ],
  });
  ```
- **Por qué:** cada setup project solo matchea SU archivo (`auth.ui.setup.ts` / `auth.api.setup.ts`), así corre una sola vez en su project. `chromium` y `chromium-ui-badge` tienen un `testMatch` explícito para que ningún spec corra con el badge equivocado.
- **Cómo verifico:** `pnpm exec playwright test --list` muestra 13 tests: 2 setups, 9 bajo `chromium` (`badge-api` 2, `ejemplo` 3, `reto` 4) y 2 bajo `chromium-ui-badge`, sin ningún `.setup.ts` duplicado dentro de un project de navegador.

> 🔍 **Detalle que parece obvio — `dependencies: ["setup-api"]` / `["setup-ui"]`**
> **Qué es:** la precondición declarativa, a nivel de project: "este project no arranca hasta que su setup termine **en verde**".
> **Por qué así (y no la alternativa obvia):** no es un `import`, ni un `globalSetup`, ni una llamada en un `beforeAll`. No ejecutas el login tú mismo — **declaras** el orden y Playwright construye el grafo (por eso el setup aparece como un test en el reporte).
> **Qué pasa si lo cambias:** si borras `dependencies`, el project ya **no espera** al setup. Puede arrancar antes de que el badge exista (o con uno viejo) → fallas intermitentes de "sesión no encontrada", según quién gane la carrera.

> 🔍 **Detalle que parece obvio — `storageState` dentro de cada project, NO en el `use:` raíz**
> **Qué es:** la asignación del badge **por project**. Aquí hay incluso dos badges distintos, uno por project.
> **Por qué así:** subirlo al `use:` raíz autenticaría **TODO**, incluidos los propios setups (que deben correr **sin** sesión, porque su trabajo ES loguearse) y cualquier flujo anónimo/negativo futuro. Además es imposible elegir dos badges desde un solo bloque global.
> **Qué pasa si lo cambias:** el setup arrancaría con una sesión que aún no existe (huevo y gallina) y tus flujos negativos arrancarían **ya logueados**: falsos verdes.

**4.2 — Añade los scripts al `package.json` (edita `package.json`)**
- **Qué hago:** agrego los atajos del módulo y de cada setup aislado.
  ```json
  "scripts": {
    "test:setup-ui": "playwright test --project=setup-ui",
    "test:setup-api": "playwright test --project=setup-api",
    "m7": "playwright test --project=chromium"
  }
  ```
- **Por qué:** `test:setup-ui` / `test:setup-api` te dejan correr **solo** un setup (para inspeccionar su badge); `m7` corre el project `chromium` (el setup API arranca solo por `dependencies`). El project `chromium-ui-badge` no entra en `m7`: lo corres explícito (Paso 6).
- **Cómo verifico:** `pnpm test:setup-ui --list` y `pnpm test:setup-api --list` no fallan con "script not found".

---

### Paso 5 — Corre los setups por separado y compáralos

**5.1 — Genera los dos badges**
- **Qué hago:**
  ```bash
  pnpm test:setup-ui
  pnpm test:setup-api
  ```
- **Por qué:** correr cada setup aislado te deja **ver el badge nacer** antes de que ningún test lo herede, y comparar el tiempo de cada camino (ver la tabla de arriba).
- **Cómo verifico:**
  1. Un test verde por project: `setup-ui › authenticate` y `setup-api › authenticate via API`.
  2. Aparecen los dos archivos en disco:
     ```bash
     ls .auth       # user.ui.json  user.api.json
     ```
  3. Abre ambos: en `origins[].localStorage` encuentras las **mismas cinco claves**. Esa es la prueba de que el setup API reproduce al SPA. Ambos archivos están en `.gitignore` — nunca los commitees.

> 💡 **Si falla** con `TimeoutError` o `ECONNREFUSED`: probablemente OmniPizza está dormido (cold start de Render). Los setups ya suben su timeout (90 s el de UI, 180 s el de API); si aun así falla, vuelve a correr — el backend ya estará despierto.

---

### Paso 6 — Corre los tests autenticados

**6.1 — Corre `pnpm m7` y observa el grafo en acción**
- **Qué hago:**
  ```bash
  # chromium declara dependencies: ['setup-api'],
  # así que Playwright corre setup-api automáticamente primero.
  pnpm m7
  ```
- **Por qué:** demuestra el grafo — no invocas el setup tú: lo **declaras** y Playwright lo orquesta.
- **Cómo verifico:**
  1. `setup-api` corre primero (refresca `.auth/user.api.json`).
  2. Pasan los tests de `ejemplo.spec.ts` y `badge-api.spec.ts`; los de `reto.spec.ts` salen como *skipped* hasta que los resuelvas.

**6.2 — Corre el project del badge UI**
- **Qué hago:**
  ```bash
  pnpm exec playwright test --project=chromium-ui-badge
  ```
- **Por qué:** `chromium-ui-badge` depende de `setup-ui` y hereda `.auth/user.ui.json`; `badge-ui.spec.ts` prueba que el badge hecho por la UI **también** deja la sesión activa.
- **Cómo verifico:** `setup-ui` corre primero y pasan los 2 tests de `badge-ui.spec.ts`. (`pnpm test` corre todo: los 4 projects.)

**6.3 — Lee el `ejemplo.spec.ts` y nota lo que NO tiene**
- **Qué hago:** abro `tests/ejemplo.spec.ts` y señalo:
  ```ts
  import { test } from "../fixtures/omnipizza";

  test("lands on /catalog without logging in @smoke", async ({ page, catalogPage }) => {
    await page.goto("/catalog");        // ← directo al catálogo
    await catalogPage.expectLoaded();   // ← el MISMO CatalogPage de M04
    await catalogPage.expectHasPizzas();
  });
  ```
  **No hay** `goto('/')`, ni `market-MX`, ni `fill` de credenciales, ni click en "Sign In". El badge (aquí, el de la API) trajo todo eso. Y las assertions **no son locators nuevos** — son los mismos métodos de `CatalogPage` de M04.
- **Por qué:** ese contraste con M05 (login en cada test) es la prueba de que el setup funcionó. Usar `catalogPage` demuestra que el POM/fixtures NO desaparecen — solo se les suma el badge por encima.
- **Cómo verifico:** el test pasa y no hay ninguna línea de login en el spec.

**6.4 — El segundo test: la sesión sobrevive varias páginas**
- **Qué hago:** el test `the badge persists across pages without re-login` agrega una pizza en `/catalog`, navega a `/profile` y luego a `/checkout` — sin ningún login en el camino — y confirma que las 3 cargan.
- **Por qué:** el primer test prueba UNA página. Este prueba que el badge no es un truco de la primera pantalla: te sigue por toda la app.
- **Cómo verifico:** el test pasa y no hay ninguna llamada a `loginPage.loginInMarket(...)` en el archivo.

**6.5 — Los dos `badge-*.spec.ts`**
- **Qué hago:** abro `badge-api.spec.ts` y `badge-ui.spec.ts`. Son gemelos: cada uno hace `page.goto("/catalog")` sin login, verifica el catálogo y comprueba que `API_AUTH_FILE` / `UI_AUTH_FILE` son rutas distintas y que el archivo existe (`fs.existsSync`).
- **Por qué:** documentan en un test lo que el README afirma: **cada camino de login deja una sesión utilizable y su propio badge**.
- **Cómo verifico:** ambos pasan, cada uno bajo SU project (`chromium` el de API, `chromium-ui-badge` el de UI).

**6.6 — El widget de muestra: el modal bajo sesión heredada**
- **Qué hago:** reviso el describe `Modal 'Customize Pizza' (M07)`. Es el MISMO modal de M05 (abrir → tamaño → topping → confirmar), pero sin `loginPage.loginInMarket(...)` antes: arranca con `page.goto('/catalog')` directo.
- **Por qué:** M05 ya enseñó los 8 escenarios de widgets; repetirlos aquí no cambiaría la TÉCNICA. Este módulo conserva uno, a modo de prueba, y te manda de vuelta a `modulo-05-fixtures/proyecto/tests/widgets/` para repasar los demás.
- **Cómo verifico:** el test pasa; comparado con M05 es idéntico salvo por la precondición.

> 💡 **Para el facilitador:** pide a cada alumno que **verbalice el flujo**: *"setup corre 1 vez → escribe el badge → mi project lo lee vía storageState → mi test arranca autenticado"*. No avances hasta que lo hayan dicho con sus palabras.

---

### Paso 7 — Resolver el reto (login negativo + segundo usuario)

El reto vive en `tests/reto.spec.ts` y tiene dos partes. Trae TODOs detallados (formato **Qué hacer / Pista / Cómo verificar**); **no** están resueltos ahí a propósito. Importante: OmniPizza **no tiene roles** (todos son `customer`); los usuarios se distinguen por su **comportamiento de login**.

**7.1 — Parte A: login negativo con `locked_out_user`**
- **Qué hago:** pruebo que `locked_out_user` **no** autentica, en dos capas:
  - **UI:** usas el MISMO `LoginPage` (vía el fixture) pero con `loginAs`, no `loginInMarket` (este espera llegar a `/catalog`, y aquí el login debe FALLAR). Verificas la alerta (`role=alert`) con el texto exacto de la app: `Sorry, this user has been locked out.`, y que NO llegaste a `/catalog`.
  - **API:** `AuthService.login(lockedOutUser)` lanza un error `Login failed (403): …locked out…`: la API responde **403**.
- **Por qué:** **(a)** Un usuario bloqueado **no autentica**, así que **no** hay badge que guardar: es un test de auth fallida, no un setup project. **(b)** Este spec corre bajo `chromium`, que ya hereda el badge de `standard_user`; para **ver** el formulario tienes que **renunciar** a esa sesión con `test.use({ storageState: { cookies: [], origins: [] } })` — el mecanismo inverso al `storageState` por project del Paso 4. La UI solo muestra el mensaje que devuelve el backend: mismo usuario, dos capas, mismo texto.
- **Cómo verifico:** los dos tests (UI y API) pasan; la UI muestra `Sorry, this user has been locked out.` y la URL no es `/catalog`.

> 🔍 **Detalle que parece obvio — `test.use({ storageState: { cookies: [], origins: [] } })`**
> **Qué es:** dentro del `describe` de la parte A, esta línea **anula** el `storageState` que el project `chromium` inyecta — solo para ese bloque.
> **Por qué así:** el reto necesita **ver el login**. Pero `chromium` arranca con la sesión de `standard_user`, así que la app te mandaría directo a `/catalog` y el formulario ni se renderiza. Un `storageState` vacío explícito "deja el badge en recepción".
> **Qué pasa si lo cambias:** si borras esa línea, el test arranca autenticado y tus asserts del error nunca encuentran nada. ⚠️ Y `storageState: undefined` da el MISMO fallo: Playwright lo trata como "no anular" (no como "vaciar"), así que la sesión heredada se cuela. Tiene que ser un objeto vacío explícito. (Detalle TS: compila con `undefined` porque `exactOptionalPropertyTypes` está en `false` — compila, pero no hace lo que crees.)

**7.2 — Parte B: un segundo usuario con SU propio badge (`performance_glitch_user`)**
- **Qué hago:** `performance_glitch_user` SÍ inicia sesión con normalidad (solo carga más lento). Escribes sus setups y los registras:
  1. `tests/setup/auth.glitch.ui.setup.ts` — copia de `auth.ui.setup.ts` con `glitchUser` (búscalo en `data/users.json`), guarda en `GLITCH_UI_FILE`.
  2. `tests/setup/auth.glitch.api.setup.ts` — copia de `auth.api.setup.ts` con `glitchUser`, siembra el MISMO `localStorage` (el `behavior` viene en la respuesta del login) y guarda en `GLITCH_API_FILE`.
  3. En `playwright.config.ts` registras UN project para ambos y lo haces dependencia de `chromium`:
     ```ts
     { name: "setup-glitch", testMatch: /auth\.glitch\..*\.setup\.ts/ },
     // ...
     { name: "chromium", /* ... */ dependencies: ["setup-api", "setup-glitch"] },
     ```
  Las rutas (`GLITCH_UI_FILE = ".auth/glitch.ui.json"`, `GLITCH_API_FILE = ".auth/glitch.api.json"`) ya existen en `auth.paths.ts`. Después completas los dos tests B1 (badge UI) y B2 (badge API), que asertan la **identidad**: `localStorage.username` y `omnipizza-auth.state.username` son `performance_glitch_user`.
- **Por qué:** los 4 badges conviven sin pisarse. Aserta el **username**, no solo "el catálogo carga": un badge equivocado también carga el catálogo, y solo la identidad prueba que usaste el correcto. Este usuario es **más lento** (en una medición en vivo, el catálogo tardó ≈5 s contra ≈2 s del usuario estándar, ~2.5×; es orientativo): confía en los timeouts de `expect`, no pongas `sleep`. Los regex de `setup-ui`/`setup-api` NO matchean `auth.glitch.*`, así que cada setup corre en SU project, una sola vez.
- **Cómo verifico:** `pnpm exec playwright test --project=setup-glitch` crea `.auth/glitch.ui.json` y `.auth/glitch.api.json`; luego los tests B1/B2 pasan bajo `chromium`.

> 💡 Si copias un tercer setup, ya es la señal para factorizar un helper `loginAndSave(user, path)`.

---

## 🔙 Git break — Deshacer cambios

Los setups son el archivo más delicado del proyecto: si `auth.api.setup.ts` falla, **todos** los tests que dependen de él fallan en cascada. Es el sitio donde más vas a querer decir "vuelve a como estaba". Git te da una herramienta distinta según *hasta dónde llegó* el error: todavía sin commitear, ya commiteado, o ya publicado.

### 1. Cambié el archivo y no he commiteado → `git restore`

Cambiaste un timeout o una clave de `localStorage` en `tests/setup/auth.api.setup.ts` y ahora el setup no pasa. Antes de tirar nada, mira qué cambió:

```bash
$ git status
$ git diff tests/setup/auth.api.setup.ts
```

Si el cambio no vale la pena, **descártalo** y el archivo vuelve al último commit:

```bash
$ git restore tests/setup/auth.api.setup.ts
```

> ⚠️ `git restore` sobre un archivo modificado **no tiene vuelta atrás**: Git no guardó esos cambios en ningún sitio. Haz `git diff` primero.

Si ya habías hecho `git add` y quieres sacarlo del área de preparación sin perder los cambios:

```bash
$ git restore --staged tests/setup/auth.api.setup.ts
```

### 2. Ya commiteé, pero aún no hice push → `git reset`

```bash
$ git log --oneline -3          # localiza el commit malo
$ git reset --soft HEAD~1       # deshace el commit, deja los cambios en staging
```

| Opción | Qué hace con los cambios del commit |
|---|---|
| `--soft` | Los deja en staging, listos para commitear de nuevo |
| (sin flag, `--mixed`) | Los deja en tu carpeta, sin staging |
| `--hard` | **Los borra** del historial y de tu carpeta |

Para un error de ayer, `--soft` o `--mixed`. `--hard` solo cuando estés seguro de que no quieres nada de ese commit.

### 3. Ya hice push → `git revert`

Si el commit ya está en el remoto, **no reescribas la historia**: otra persona puede haberlo bajado. `revert` crea un commit *nuevo* que invierte al anterior:

```bash
$ git revert <sha-del-commit-malo>
$ git push
```

La historia queda honesta: se ve el error y se ve el arreglo.

### 4. Me pasé con `reset --hard` → `git reflog`

Git recuerda dónde estuvo `HEAD` durante un tiempo, incluso para commits que ya no aparecen en `git log`:

```bash
$ git reflog                     # busca el commit perdido: HEAD@{n}
$ git reset --hard <sha>         # vuelve a ese punto
```

Es la red de seguridad de los commits. No cubre cambios que **nunca** se commitearon (el caso 1).

### 5. Commiteé `.auth/` por error → `git rm --cached`

Es el error típico de este módulo. En el Paso 1 blindaste el `.gitignore`, pero si el badge ya entró en un commit local (sin push), sácalo del índice **sin borrar el archivo**:

```bash
$ git rm --cached .auth/user.api.json
$ git commit -m "chore: stop tracking auth badge"
```

Si ya lo publicaste, trata la sesión como comprometida: el token que contiene es válido. Cierra la sesión o cambia la credencial en la app, y recién después limpia el historial.

### Qué usar, de un vistazo

| Situación | Comando |
|---|---|
| Cambié un archivo, sin commit | `git restore <archivo>` |
| Agregué algo a staging por error | `git restore --staged <archivo>` |
| Commit local, sin push | `git reset --soft HEAD~1` |
| Commit ya publicado | `git revert <sha>` |
| Perdí commits | `git reflog` + `git reset --hard <sha>` |
| Commiteé un archivo que debía ignorar | `git rm --cached <archivo>` |

### 🧪 Practícalo (5 min)

1. En `auth.api.setup.ts` cambia el `GET /api/pizzas` del warm-up por una ruta inexistente y corre `pnpm test:setup-api`: falla.
2. `git diff` para ver tu cambio y `git restore` para descartarlo. Vuelve a correrlo: pasa.
3. Repite el cambio, pero ahora `git commit`. Deshazlo con `git reset --soft HEAD~1` y luego `git restore --staged` + `git restore`.
4. Repite el cambio, commitea y deshazlo con `git revert HEAD`. Mira `git log --oneline`: ahora hay dos commits.

---

## ▶️ Cómo ejecutar este módulo

- **Setup por UI (genera `.auth/user.ui.json`):** desde `proyecto/`, `pnpm test:setup-ui`
- **Setup por API (genera `.auth/user.api.json`):** `pnpm test:setup-api`
- **Comando del módulo:** `pnpm m7` (project `chromium`; `setup-api` arranca solo por `dependencies`)
- **Badge UI:** `pnpm exec playwright test --project=chromium-ui-badge`
- **Todo (los 4 projects):** `pnpm test`
- **UI Mode de Playwright:** `pnpm test:pw-ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Solo el reto:** `pnpm exec playwright test tests/reto.spec.ts --headed --project=chromium`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** variables de entorno con `$env:VAR="x"; pnpm m7` (no `VAR=x pnpm m7`)

---

## Outcome esperado

- [ ] `.auth/` está en `.gitignore` **antes** del primer `pnpm test:setup-ui` / `pnpm test:setup-api`.
- [ ] `.auth/user.ui.json` y `.auth/user.api.json` se crean al correr cada setup.
- [ ] Puedes nombrar las **cinco claves** de `localStorage` que el SPA escribe y el setup API reproduce, y explicar por qué `omnipizza-auth` es la imprescindible.
- [ ] Puedes explicar cuándo usarías el setup por UI y cuándo el de API (acoplamiento y mantenimiento, no solo velocidad).
- [ ] El test de `ejemplo.spec.ts` arranca **ya autenticado**: `page.goto("/catalog")` sin login.
- [ ] Entiendes por qué `storageState` va **en cada project**, no en el `use:` raíz.
- [ ] Sabes que `dependencies` declara el orden y hace visible el setup en el reporte.
- [ ] Resolviste el login negativo con `locked_out_user` (alerta `Sorry, this user has been locked out.` en la UI, 403 en la API) renunciando al badge con `test.use({ storageState: { cookies: [], origins: [] } })`.
- [ ] Creaste el segundo usuario (`performance_glitch_user`) con su propio badge por UI y por API, y lo verificaste por su **username**.
- [ ] Sabes qué comando usar para deshacer un cambio según dónde esté (`restore`, `reset`, `revert`, `reflog`) y sacar `.auth/` del índice con `git rm --cached`.

---

## ¿Qué viene en M08?

Hasta aquí manejaste la sesión **en tu máquina** (login por UI o API → badge → `dependencies`). En **M08 (CI & debugging)** llevas todo esto a CI/CD: los setups corren en el pipeline, sobre varios browsers en paralelo, con traces descargables para depurar lo que falle. Lo que construiste en M07 — setups declarativos, badges por project, `.auth/` fuera de Git — es justo lo que hace que ese pipeline sea reproducible.
