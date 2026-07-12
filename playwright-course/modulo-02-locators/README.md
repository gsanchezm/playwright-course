# Módulo 02 — Locators

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** la **disciplina de la jerarquía de locators** aplicada al smoke de M01 — `getByRole` donde la app coopera, `getByTestId`/CSS donde no — más una **chuleta viva** (`test.skip`) con los selectores REALES de OmniPizza verificados contra el DOM. El smoke sigue siendo de **un** mercado; parametrizarlo por los 4 mercados llega en M03.

---

> 🎁 **Proyecto de referencia — [`proyecto/`](proyecto/).** Este módulo trae una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado final de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del resto del curso). Es la **solución de referencia** para comparar: entra en ella y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Este README enseña el **porqué** de cada locator y apunta al `proyecto/` para correrlo. Detalles en [`proyecto/README.md`](proyecto/README.md).

## 🏗️ Arquitectura al terminar este módulo

M02 **no añade carpetas nuevas**: añade **criterio**. El mismo smoke de M01 ahora elige cada locator por el nivel correcto de la jerarquía, y aparece una **chuleta de referencia** (`test.skip`, no se ejecuta) con un selector real por cada nivel.

```
playwright-course/
├── modulo-01-smoke-feo/           ← (sin cambios)
├── modulo-02-locators/            ← 🆕 ESTE MÓDULO
│   ├── README.md
│   └── proyecto/                  ← proyecto autocontenido y ejecutable
│       ├── package.json           ← scripts (pnpm test, pnpm m2, typecheck…)
│       ├── playwright.config.ts   ← idéntico a M01 (un solo project ui-anon)
│       ├── tsconfig.json          ← include mínimo (aún SIN types/)
│       ├── .env.example, .gitignore
│       └── tests/
│           ├── ejemplo.spec.ts    ← 🆕 smoke de 1 mercado (MX) + chuleta de locators (2 test.skip)
│           └── reto.spec.ts       ← 🆕 localizar 3 elementos del catálogo con el nivel correcto
└── …
```

**Qué NO existe todavía:**

| Carpeta | Llega en | Para qué |
|---|---|---|
| `data/`, `types/` | M03 | Datos tipados (mercados, usuarios) → parametrizar el smoke |
| `pages/` | M04 | Page Object Model (matar la duplicación de login) |
| `fixtures/`, `helpers/` | M05 | Custom fixtures + aislamiento de datos por worker |
| `tests/setup/`, `.auth/` | M06 | Setup project + `storageState` (login una vez, hereda sesión) |
| `services/`, `tests/api/` | M07 | Capa de servicios para API testing |
| `.github/workflows/` (uso real) | M08 | CI/CD en GitHub Actions |

> 💡 **Para el facilitador:** deja claro desde el inicio que M02 **no crea archivos de datos** (eso es M03). Su producto es una **habilidad**: mirar un elemento y saber en qué nivel de la jerarquía vive. La prueba en vivo es Codegen (más abajo): revela la calidad del DOM elemento por elemento.

---

## Analogía de apertura

Cuando un tester manual reporta un bug, no dice *"el botón de allá arriba a la derecha"*: dice *"el botón **Pagar**"*. Nombra el elemento por lo que **es** (su rol) y por lo que **dice** (su nombre accesible) — la forma más estable y menos ambigua de señalarlo. En este módulo escribes tus locators con esa misma disciplina: **empiezas por `getByRole`** (cómo "ve" la página un lector de pantalla) y sólo **bajas de nivel** cuando la app, mal instrumentada, te obliga.

OmniPizza es el caso perfecto para aprenderlo: su **catálogo** es un paraíso de `getByRole` y su **login** un pantano que te empuja a `getByTestId`. Misma app, dos niveles de jerarquía distintos según qué cooperó — y reconocer cuál usar es una habilidad real de QA, no una derrota.

---

## ¿Qué aprenderás?

1. **Jerarquía de locators** con criterios de cuándo bajar nivel — y por qué `getByRole` es preferencia, no ley (caso real: el login de OmniPizza).
2. **Filtros y combinadores:** `.filter({ hasText })`, `.nth()`, `.first()`, `.and()`, `.or()`, `getByRole(...).filter(...)` y **scoping** dentro de una card para botones icon-only.
3. **`getByText` vs `getByRole`:** leer/aseverar texto visible vs accionar el elemento (escribir/clic).
4. **Iterar locators** con `.all()` + `for...of` para recorrer listas reales (las pizzas del catálogo).
5. **Codegen** (`pnpm exec playwright codegen`) como herramienta para **descubrir** locators role-first — y por qué el humano **endurece** lo que genera.

---

## Conceptos JIT

| Concepto | Analogía QA |
|---|---|
| `getByRole('button', { name })` | Localizar como un lector de pantalla: por rol + nombre accesible |
| `getByTestId('login-button-desktop')` | El sticker que el dev puso, cuando el DOM no coopera |
| `getByText` vs `getByRole` | Leer/aseverar texto visible vs accionar el elemento (escribir/clic) |
| `locator.all()` | Obtener el array de locators — como pedir todas las filas de una tabla |
| `.filter({ hasText: 'Spicy' })` | Filtrar por componente en Jira |
| `.nth(0)` / `.first()` | La primera fila de resultados |
| `.and()` / `.or()` | "el botón que ADEMÁS es X" / "el saludo en ES O en EN" (fallback) |
| `card.getByRole('button')` | Scoping: buscar dentro de un contenedor, no en toda la página |
| CSS con prefijo `[data-testid^="…"]` | Testids dinámicos: el nivel 4 legítimo |

---

## Jerarquía de locators (regla del curso)

Escríbelo como escribirías un **bug report bien hecho**:

| Prioridad | Locator | Cuándo usarlo | Ejemplo |
|---|---|---|---|
| 1️⃣ | `getByRole` | **Preferencia por defecto.** Accesible y semántico. | `page.getByRole('button', { name: 'Pagar' })` |
| 2️⃣ | `getByLabel` / `getByText` / `getByPlaceholder` | Formularios y contenido visible. | `page.getByLabel('Email')` |
| 3️⃣ | `getByTestId` | Cuando el DOM no coopera y el dev cooperó. | `page.getByTestId('login-button-desktop')` |
| 4️⃣ | CSS selectors | Cuando los testids son dinámicos o no existen. | `page.locator('[data-testid^="pizza-card-"]')` |
| 5️⃣ | XPath | Último recurso. Frágil. | `page.locator('//button[@data-ready]')` |

**`getByRole` es una PREFERENCIA, no una ley.** La regla dice "empieza por `getByRole` y baja de nivel sólo cuando algo te obliga". El "algo que te obliga" no es raro: una app **mal instrumentada** (sin labels, con inputs anónimos, con botones icon-only) te empuja al nivel 2/3 — y reconocer cuándo pasa es una habilidad real de QA, no una derrota. Lo verás en vivo más abajo: el **catálogo** de OmniPizza está bien instrumentado y vives en `getByRole`; el **login** no lo está y bajas a `getByTestId` sin culpa.

**CSS y XPath no están prohibidos.** Están al final porque son frágiles, no porque sean inválidos. En OmniPizza usamos CSS con prefijo (`[data-testid^="pizza-card-"]`) para los testids dinámicos — es legítimo.

---

## getByRole en OmniPizza: dónde SÍ y dónde NO

Esta es la lección que ningún tutorial de juguete te da: **la misma app puede ser un paraíso de `getByRole` en una pantalla y un pantano en otra.** OmniPizza lo demuestra. (Todos estos selectores están verificados contra el DOM real y viven como chuleta ejecutable en el bloque `test.describe("Reference — locator hierarchy")` de `ejemplo.spec.ts` — los dos `test.skip`.)

### ✅ Catálogo (`/catalog`) — bien instrumentado, `getByRole` manda

| Elemento | Locator role-first | Por qué funciona |
|---|---|---|
| Nombre de pizza | `getByRole("heading", { name: "Pepperoni", level: 3 })` | Cada pizza es un `<h3>` con texto visible = nombre accesible |
| Filtro de categoría | `getByRole("button", { name: "Populares" })` | Botón con texto → rol `button` + nombre accesible |
| Enlace de menú | `getByRole("link", { name: "Catálogo" })` | `<a>` con texto → rol `link` |
| Buscador | `getByRole("textbox", { name: "Busca tu pizza favorita..." })` | `<input>` cuyo nombre accesible sale del **placeholder** (sí matchea aquí) |

### ❌ Login — mal instrumentado, `getByRole` en los inputs FALLA

| Elemento | Lo que parece obvio | Lo que pasa | Lo que SÍ funciona |
|---|---|---|---|
| Input usuario | `getByRole("textbox", { name: "Username" })` | ❌ no matchea — "Username" es texto visible (un `<div>`), no el nombre accesible | `getByTestId("username-desktop")` |
| | `getByLabel("Username")` | ❌ no hay `<label for>` ni `aria-label` | (o `getByPlaceholder("standard_user")`) |
| Input password | `getByLabel("Password")` | ❌ mismo problema | `getByTestId("password-desktop")` |
| Botón de login | — | ✅ **"Sign In" SÍ tiene rol** | `getByRole("button", { name: "Sign In" })` |
| Bandera de mercado | `getByRole("button", { name: "México" })` | ❌ el nombre accesible es el **emoji** 🇲🇽, no el país | `getByTestId("market-MX")` |
| Add-to-cart (catálogo) | `getByRole("button", { name: "Agregar" })` | ❌ es **icon-only** sin texto → sin nombre accesible | scope en la card → `card.getByRole("button")` |

**La moraleja:** el nombre accesible de un input mal etiquetado **es su placeholder, no el texto que ves al lado.** `getByRole("textbox", { name: "Username" })` y `getByLabel("Username")` fallan porque "Username" es un `<div>` decorativo, no un `<label for>`. Por eso el login del ejemplo usa `getByTestId(...)`: no es pereza, es la respuesta correcta a un DOM que no coopera. El botón **"Sign In"**, en cambio, sí expone su rol — así que ahí SÍ usamos `getByRole`. **Misma pantalla, dos niveles de jerarquía distintos, según qué cooperó.**

> 💡 **Para el facilitador:** abre el catálogo con `pnpm exec playwright codegen <url>` (ver sección Codegen abajo) y haz clic en una pizza: Codegen genera `getByRole("heading", { name: "Pepperoni" })`. Luego haz clic en el input de usuario del login: Codegen NO genera `getByRole` — cae a `getByTestId` o un CSS. Esa diferencia, en vivo, prueba que la calidad del locator depende de cómo el dev instrumentó el DOM, no de tu disciplina.

---

## Combinadores y filtros: del "muchos elementos" a "exactamente este"

Un `getByRole("heading", { level: 3 })` en el catálogo matchea **todas** las pizzas — eso es un *locator de muchos*. Para actuar sobre uno necesitas **estrechar**. Playwright te da un puñado de métodos encadenables que convierten un locator amplio en uno preciso, **sin** bajar a CSS frágil. Son la herramienta que mantiene a `getByRole` vivo incluso en listas repetidas. Todos están como chuleta ejecutable en el **Bloque B** del `test.describe("Reference — locator hierarchy")` de `ejemplo.spec.ts`.

| Método | Qué hace | Ejemplo OmniPizza |
|---|---|---|
| `.first()` | El **primer** match (perezoso, sin `await`). | `pizzaCards.first()` → la primera tarjeta |
| `.nth(i)` | El match en **índice `i`** (base 0). | `pizzaCards.nth(2)` → la tercera tarjeta |
| `.filter({ hasText })` | Sólo los que **contienen** ese texto. | `pizzaCards.filter({ hasText: "Pepperoni" })` |
| `getByRole(...).filter(...)` | Estrecha un locator de role por texto. | `getByRole("heading", { level: 3 }).filter({ hasText: "Quesos" })` → "Cuatro Quesos" |
| `.filter({ has })` | Sólo los que **contienen otro locator** dentro. | `card.filter({ has: page.getByText("Vegetariana") })` |
| `.and(otro)` | Cumple **ambas** condiciones a la vez. | `getByRole("button").and(page.getByTestId("market-MX"))` |
| `.or(otro)` | Cumple **una u otra** (fallback resiliente). | `getByText("Bienvenido").or(getByText("Welcome"))` |

**`.and()` y `.or()` reciben otro locator, no un string.** `.or()` es el truco para **UIs que cambian de idioma o estado**: "espera el saludo en español *o* en inglés, lo que aparezca primero". `.and()` exige que el mismo elemento satisfaga dos locators — útil para desambiguar (`el button que ADEMÁS tiene este testid`).

### Scoping: cómo localizar un botón icon-only dentro de su card

El **add-to-cart** de cada pizza es un botón **sin texto** (sólo un ícono). `page.getByRole("button", { name: "Agregar" })` falla: no tiene nombre accesible. La solución correcta **no** es bajar a un CSS gigante — es **acotar el contexto**: primero localizas la card de *esa* pizza, y dentro de ella pides el botón. El scope reduce "todos los botones de la página" a "el único botón de esta card".

```ts
// 1) Acota a la card de la pizza que te interesa (filter por su <h3>)
const card = page
  .locator('[data-testid^="pizza-card-"]')
  .filter({ hasText: "Pepperoni" });

// 2) Dentro de ESE scope, el botón ya es inequívoco
await card.getByRole("button").click();          // el add-to-cart de Pepperoni
// (o por testid si el dev lo puso): card.getByTestId("add-to-cart")
```

**Por qué importa:** `card.getByRole("button")` **encadena** el segundo locator dentro del primero — Playwright busca el botón *sólo* en el subárbol de la card, no en todo el `<body>`. Es el patrón que rescata `getByRole` cuando hay N elementos idénticos repetidos: no desambiguas por un selector más feo, desambiguas por **contexto**.

### `getByText` vs `getByRole`: leer texto vs accionar un elemento

Es el error conceptual #1 del módulo. Ambos "encuentran texto", pero sirven para cosas distintas:

| | `getByText("Username")` | `getByRole("textbox", { name: "..." })` |
|---|---|---|
| **Devuelve** | El **nodo que contiene** ese texto (aquí, un `<div>` decorativo) | El **input** sobre el que vas a escribir |
| **Sirve para** | **Aserciones** de contenido visible (`expect(...).toBeVisible()`) | **Acciones** (`.fill()`, `.click()`) |
| **En el login** | ✅ encuentra el `<div>` "Username"… pero `.fill()` ahí no escribe nada | ❌ falla por el nombre accesible (ver tabla arriba) → usa `getByTestId` |

Regla mental: **todos los `getBy*` te devuelven el ELEMENTO, no su texto.** Usa `getByText` para *verificar que algo se ve*; usa `getByRole`/`getByTestId` para *interactuar*. Si intentas `.fill()` sobre un `getByText`, escribes sobre un `<div>` y el test no hace lo que crees.

> 🔷 **TypeScript — encadenamiento de métodos (fluent API)**
> `page.locator(...).filter(...).getByRole(...)` es una **cadena fluida**: cada método devuelve otro `Locator`, así que puedes seguir encadenando. TS te da autocompletado en cada eslabón porque conoce el tipo de retorno (`Locator`) en todo momento. Si un método devolviera `Promise<Locator>` (como `.all()`), la cadena se cortaría hasta que hagas `await`.
> 📚 Es la misma idea de métodos que retornan `this`/un tipo encadenable que viste en [TS · M05 — classes](../../typescript-qa-course/modulo-05-classes/). Aquí lo aplicas para estrechar locators sin variables intermedias.

---

## 🎥 Codegen: deja que Playwright DESCUBRA los locators por ti

Hasta aquí escribiste los locators a mano leyendo la chuleta. Pero existe una herramienta que **graba tus clics y genera el código de los locators automáticamente**, respetando la jerarquía (role-first). Se llama **Codegen** y es, en la práctica, **el inspector de elementos del mundo Playwright**: tú interactúas con la página real, y Playwright te escribe el locator que usaría — empezando por `getByRole`, bajando de nivel sólo cuando el DOM no coopera (exactamente la regla de este módulo).

> 📚 Doc oficial: https://playwright.dev/docs/codegen

**Cómo se relaciona con la jerarquía:** Codegen aplica internamente la misma prioridad que enseñamos (`getByRole` → `getByLabel`/`getByText` → `getByTestId` → CSS). Por eso, cuando grabas en el **catálogo** de OmniPizza, te genera `getByRole("heading", { name: "Pepperoni" })`; pero cuando grabas en el **login** (mal instrumentado), te genera `getByTestId("username-desktop")` o un CSS — porque ahí no hay rol ni label que ofrecer. **Codegen es un buen espejo de la calidad del DOM.**

> ⚠️ **Advertencia (por qué el humano endurece lo que Codegen genera):** Codegen es un punto de partida, **no** la última palabra. En DOMs sucios genera locators **frágiles** — `nth-child` posicionales, textos que cambian con el idioma, o un `getByText` sobre un `<div>` decorativo en vez del input real. **Tu trabajo:** tomar lo grabado y *endurecerlo* — preferir un testid estable a un `nth-child`, acotar con scoping (`card.getByRole(...)`) en vez de un selector global, y borrar los pasos de ruido (clics accidentales). Codegen descubre; el humano decide.

**C.1 — Graba una sesión contra OmniPizza**
- **Qué hago:** abro Codegen apuntando a la URL del frontend.
  ```bash
  pnpm exec playwright codegen https://omnipizza-frontend.onrender.com
  ```
  Se abre un navegador + la ventana **Playwright Inspector**. Hago login (clic en bandera → usuario → password → "Sign In") y luego clic en una pizza del catálogo.
- **Por qué:** ver cómo Playwright traduce cada acción a un locator role-first me enseña a "pensar en roles" sin memorizar la API. Es la forma más rápida de **descubrir** el locator correcto de un elemento que no conozco.
- **Cómo verifico:** el panel del Inspector va mostrando líneas como `await page.getByTestId('username-desktop').fill('standard_user')` y `await page.getByRole('heading', { name: 'Pepperoni' }).click()` a medida que actúo.

**C.2 — Copia, endurece y descarta el ruido**
- **Qué hago:** copio del Inspector sólo los locators que necesito, reemplazo los frágiles (un `nth-child` por un testid; un `getByText` decorativo por el input real) y aplico scoping donde haya repetición.
- **Por qué:** el código grabado incluye pasos accidentales y a veces selectores posicionales que se romperán cuando cambie el orden de las pizzas. Endurecerlo es lo que separa un script grabado de un test mantenible.
- **Cómo verifico:** el locator final usa el nivel más alto posible de la jerarquía (role > testid > CSS) y sobrevive si reordeno la lista o cambio el idioma de la UI.

> 💡 **Para el facilitador:** Codegen es también el mejor antídoto contra la parálisis ("¿qué locator uso?"). Reto en vivo: pide al grupo que adivine qué locator generará Codegen para el botón add-to-cart (icon-only). Spoiler: como no tiene nombre accesible, Codegen cae a un CSS/posicional — y ahí enseñas a **endurecerlo** con scoping `card.getByRole("button")`. Codegen expone el problema; el humano aporta el patrón.

---

## Paso a paso

> **Cómo leer esta sección.** Cada paso grande se parte en **micro-pasos `N.M`** con la tripleta **Qué hago / Por qué / Cómo verifico**. El "Cómo verifico" siempre es algo **ejecutable u observable** (un comando, una señal en el editor, un verde en el reporte). Todos los comandos se corren **desde `proyecto/`** (el proyecto autocontenido de este módulo).

### Paso 0 — Pre-requisitos

**0.1 — Confirma M01 y entra al proyecto de M02**
- **Qué hago:** entro al proyecto autocontenido de este módulo y preparo el entorno.
  ```bash
  cd proyecto
  pnpm install
  pnpm install:browsers
  cp .env.example .env
  ```
- **Por qué:** M02 **no** vuelve a montar dotenv ni el primer login contra OmniPizza; asume esa base de M01. El `proyecto/` de este módulo ya trae el estado resuelto para que lo corras y compares.
- **Cómo verifico:** `pnpm typecheck` termina en verde y `ls .env` no da "No such file".

> 💡 **Para el facilitador:** este módulo asume que `dotenv`, `.env` y la primera ejecución contra OmniPizza ya están resueltos (M01). Si alguien no tiene `.env`, mándalo a los **Pasos 2-4 de M01** antes de continuar.

---

### Paso 1 — Dependencias (M02 no añade paquetes)

**1.1 — Verifica que no falta nada**
- **Qué hago:** listo los paquetes que M02 reutiliza de M01.
  ```bash
  pnpm list @playwright/test dotenv typescript @types/node
  ```
- **Por qué:** **M02 no instala dependencias nuevas.** El incremental de este módulo es **criterio de locators**, no herramientas. Confirmar evita "instalar por las dudas".
- **Cómo verifico:** los 4 paquetes aparecen con versión. Si falta alguno, corre `pnpm install`.

---

### Paso 2 — Config y scripts (estado al terminar M02)

> **📐 Config — cambios vs M01**
> ```diff
> # playwright.config.ts — SIN CAMBIOS vs M01
> # (M02 practica locators; no toca la configuración del runner)
> ```
> **Se mantiene:** todo (dotenv, baseURL, timeouts, un solo project `ui-anon`). **Entra:** nada en el config. El único detalle es que el `tsconfig.json` de este proyecto usa un `include` **mínimo** (`playwright.config.ts` + `tests/`): todavía **no** hay carpeta `types/` que incluir — eso nace en M03.

**2.1 — Confirma que `playwright.config.ts` NO cambia respecto a M01**
- **Qué hago:** comparo el config del proyecto con el estado final de M01 (no debe haber diferencias).
  ```ts
  // playwright.config.ts — Estado en M02 (igual que M01)
  import { defineConfig, devices } from "@playwright/test";
  import "dotenv/config";

  export default defineConfig({
    testDir: ".",
    testMatch: [/tests\/.*\.spec\.ts/],
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
      { name: "ui-anon", use: { ...devices["Desktop Chrome"] } },
    ],
  });
  ```
- **Por qué:** M02 añade **criterio**, no configuración del runner. Sigue siendo un solo project **anónimo** `ui-anon` (M01-M03 son login por UI). El project autenticado (con `storageState` + setup) nace en **M06**.
- **Cómo verifico:** un diff mental contra M01 da cero cambios; `pnpm test` arranca sin errores de config.

**2.2 — Confirma el `include` mínimo de `tsconfig.json`**
- **Qué hago:** abro `tsconfig.json` y verifico que `include` sólo contemple el config y los tests.
  ```json
  {
    "include": [
      "playwright.config.ts",
      "tests/**/*.ts"
    ]
  }
  ```
- **Por qué:** M02 no tiene `types/` todavía, así que el `include` no la menciona. En M03, cuando aparezcan `types/` y `data/`, este `include` crecerá para que TS "vea" los contratos.
- **Cómo verifico:** `pnpm typecheck` en verde.

**2.3 — El script `m2` del proyecto**
- **Qué hago:** reviso el atajo del módulo en `package.json`.
  ```json
  "scripts": {
    "m2": "playwright test --project=ui-anon"
  }
  ```
- **Por qué:** `pnpm m2` es azúcar sintáctica dentro del proyecto — equivale a `pnpm exec playwright test --project=ui-anon`. `pnpm test` corre exactamente lo mismo (el único project es `ui-anon`).
- **Cómo verifico:** `pnpm m2 --list` lista los tests sin error de "script not found".

---

### Paso 3 — Leer el smoke de un mercado aplicando la jerarquía

El `ejemplo.spec.ts` es el **mismo** smoke de M01 (login + catálogo, un mercado MX hardcoded), pero cada locator elegido a conciencia por su nivel.

**3.1 — Identifica el nivel de cada locator en el login**
- **Qué hago:** abro `tests/ejemplo.spec.ts` y leo el bloque de login, fijándome en **por qué** cada línea usa el locator que usa.
  ```ts
  await page.goto("/");
  await page.getByTestId("market-MX").click();                 // testid: bandera icon-only (nombre accesible = emoji)
  await page.getByTestId("username-desktop").fill(USERNAME);    // testid: input SIN <label> ni aria-label
  await page.getByTestId("password-desktop").fill(PASSWORD);    // testid: mismo caso
  await page.getByRole("button", { name: "Sign In" }).click();  // role: el botón SÍ expone su rol → nivel 1
  await expect(page).toHaveURL(/\/catalog/);
  ```
- **Por qué:** el login de OmniPizza es el ejemplo canónico de "misma pantalla, dos niveles": los inputs y la bandera **obligan** a `getByTestId`, pero el botón "Sign In" **sí** coopera con `getByRole`. Elegir el nivel correcto por elemento es toda la lección de M02.
- **Cómo verifico:** puedo explicar, línea por línea, por qué cada locator NO subió ni bajó de nivel de más.

> 🔍 **Detalle que parece obvio — `getByRole("button", { name: "Sign In" })` (y no `getByTestId`)**
> **Qué es:** para el botón de login sí usamos `getByRole` (nivel 1), aunque para los inputs de arriba bajamos a `getByTestId` (nivel 3). No es incoherencia: es la jerarquía aplicada elemento por elemento.
> **Por qué así (y no la alternativa obvia):** el botón expone un **rol accesible** (`button`) con un **nombre accesible** legible ("Sign In"), así que el nivel más alto de la jerarquía funciona. Los inputs no tienen `<label>` ni `aria-label`, así que `getByRole("textbox", { name: "Username" })` **no matchea nada** — su nombre accesible saldría del placeholder, no del `<div>` "Username" de al lado.
> **Qué pasa si lo cambias:** si fuerzas `getByRole` en los inputs, el test falla por "no encontró el elemento". Si bajas el botón a `getByTestId("login-button-desktop")` funciona, pero desperdicias un locator role-first perfectamente bueno (y más resiliente al cambio de idioma/copy).

**3.2 — Localiza las pizzas del catálogo**
- **Qué hago:** leo el bloque del catálogo.
  ```ts
  const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
  await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
  expect(await pizzaCards.count()).toBeGreaterThan(0);
  ```
- **Por qué:** las cards tienen testids **dinámicos** (`pizza-card-123`, `pizza-card-456`…), así que un `getByTestId` con id fijo sería frágil. Bajar al nivel 4 (CSS con prefijo `^=`) es la herramienta correcta, no deuda técnica.
- **Cómo verifico:** puedo explicar por qué aquí el CSS es legítimo y en el login no lo sería (en el login sí hay testids estables).

> 🔍 **Detalle que parece obvio — `await expect(page).toHaveURL(/\/catalog/)`**
> **Qué es:** el argumento entre `/.../` es una **expresión regular** (regex), **no** un string, y eso es deliberado. Un regex hace *match parcial*: la aserción pasa si la URL **contiene** `/catalog` en cualquier parte.
> **Por qué así (y no la alternativa obvia):** OmniPizza puede añadir cosas a la URL —querystring (`?locale=`), el locale dentro del path (`/mx/catalog`) o un slash final— y el regex tolera todo eso. El `\/` escapa la barra `/` porque en un literal regex de JS la `/` es el **delimitador** que abre y cierra la expresión.
> **Qué pasa si lo cambias:** si pones el string `"/catalog"`, Playwright lo **resuelve contra `baseURL`** y compara por **IGUALDAD exacta**. Como la URL real es algo como `https://.../catalog?...`, nunca será literalmente `https://.../catalog` y el test **truena** con un timeout de aserción.

> 🔍 **Detalle que parece obvio — `page.locator('[data-testid^="pizza-card-"]')`**
> **Qué es:** un CSS selector con el operador de atributo `^=`, que significa **"el atributo empieza con"**. Matchea cualquier elemento cuyo `data-testid` arranque con `pizza-card-`.
> **Por qué así (y no la alternativa obvia):** los testids completos son dinámicos (`pizza-card-123`, `pizza-card-456`…), así que un `getByTestId("pizza-card-123")` con id fijo sólo encontraría una pizza concreta (frágil) o ninguna.
> **Qué pasa si lo cambias:** si usas `=` en vez de `^=` (`[data-testid="pizza-card-"]`), exiges igualdad exacta y no matcheas **ninguna** tarjeta.

---

### Paso 4 — Ejecutar el smoke

**4.1 — Corre el smoke de un mercado**
- **Qué hago:** ejecuto el módulo, idealmente en UI mode la primera vez.
  ```bash
  pnpm test         # headless — el smoke de 1 mercado
  pnpm test:ui      # UI mode — RECOMENDADO la 1ª vez
  ```
- **Por qué:** ver el login + catálogo pasar en verde con los locators bien elegidos cierra el concepto de la jerarquía. Los dos bloques `test.skip` de referencia **no se ejecutan** — aparecen como *skipped* en el reporte.
- **Cómo verifico:** la terminal muestra **1 test verde** (`TC-001`) y **2 skipped** (los bloques de referencia). La 1ª corrida puede tardar ~30-40s por el cold start de Render.

---

### Paso 5 — Practica combinadores, filtros y scoping

**5.1 — Del "muchos" al "uno" sin bajar a CSS frágil**
- **Qué hago:** con el catálogo abierto (en UI mode o en Codegen), practico las técnicas de la sección **Combinadores y filtros** de arriba y del **Bloque B** del `test.skip`: `.first()`, `.nth(2)`, `.filter({ hasText: "Pepperoni" })`, y el **scoping** `card.getByRole("button")`.
- **Por qué:** un `getByRole("heading", { level: 3 })` matchea **todas** las pizzas — un *locator de muchos*. Estrechar por texto o por contexto (scoping) es lo que mantiene `getByRole` vivo en listas repetidas, sin caer a un `nth-child` posicional.
- **Cómo verifico:** puedo tomar "todas las pizzas" y llegar a "exactamente Pepperoni" usando sólo `role` + `.filter`, y llegar a su botón add-to-cart acotando por la card.

---

### Paso 6 — Catálogo de locators (lectura, no ejecución)

**6.1 — Escanea la chuleta de locators**
- **Qué hago:** leo el `test.describe("Reference — locator hierarchy", …)` con sus dos `test.skip` al final de `ejemplo.spec.ts`.
- **Por qué:** **no se ejecuta** (`test.skip`) — es una **referencia viva** de cada nivel de la jerarquía con selectores REALES de OmniPizza (`getByRole({ name: "Sign In" })`, `getByPlaceholder("standard_user")`, `getByTestId("login-button-desktop")`, `getByAltText("Pepperoni")`, `[data-testid^="pizza-card-"]`). Vas a copiar de aquí para el reto.
- **Cómo verifico:** identifico al menos un ejemplo por cada nivel (role → label/placeholder/text → testid → CSS → XPath).

---

### Paso 7 — Resolver el reto (TODOs propios — no se resuelve aquí)

**7.1 — Localiza 3 elementos del catálogo con el nivel correcto**
- **Qué hago:** abro `tests/reto.spec.ts` y, tras el login, resuelvo 3 TODOs: (1) el buscador por **rol**, (2) una pizza concreta por **rol + `.filter`**, y (3) las cards por **CSS de prefijo + scoping** al botón add-to-cart. Cada TODO trae **Qué hacer / Pista / Cómo verificar**.
- **Por qué:** es la prueba de fuego de la jerarquía: para cada elemento eliges el nivel MÁS ALTO que funcione. El catálogo bien instrumentado te deja en `getByRole`; sólo las cards (testids dinámicos) te bajan a CSS. Los TODOs siguen siendo tuyos — el README **no** los resuelve.
- **Cómo verifico:**
  ```bash
  pnpm exec playwright test tests/reto.spec.ts --headed --project=ui-anon
  ```
  el test pasa en verde una vez completados los TODOs (y quitado el `placeholder`).

> 💡 **Para el facilitador:** el error clásico del reto es bajar de nivel de más — resolver el buscador con un CSS cuando `getByRole("textbox", …)` funciona perfecto. Pregunta inversa: *"¿por qué las cards SÍ merecen CSS y el buscador NO?"* — respuesta: los testids de las cards son dinámicos; el buscador expone rol + placeholder estables.

---

### Paso 8 — Versiona tu trabajo (Git JIT)

**8.1 — Commitea el incremento de M02**
- **Qué hago:** agrego lo que cambió en este módulo y lo commiteo con un mensaje convencional.
  ```bash
  git add .
  git commit -m "feat(m02): jerarquía de locators + chuleta de referencia"
  ```
- **Por qué:** M02 introduce la disciplina de locators y la chuleta viva del módulo. Versionarla en un commit atómico deja un punto de retorno limpio **antes** de que M03 empiece a parametrizar con datos tipados. (Aquí Git es JIT: commit al cerrar; las ramas y el push llegan cuando el flujo los pida.)
- **Cómo verifico:**
  ```bash
  git log --oneline -1        # muestra el commit feat(m02) recién creado
  git status                  # working tree limpio para lo que tocaste
  ```

---

## ▶️ Cómo ejecutar este módulo

Todos los comandos se corren **desde `proyecto/`** (el proyecto autocontenido de este módulo):

```bash
cd proyecto
pnpm install
cp .env.example .env
```

- **Comando del módulo:** `pnpm test` (o `pnpm m2`, el atajo que el proyecto define)
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@smoke"`) o por archivo (`pnpm exec playwright test tests/reto.spec.ts`)
- **Descubrir locators:** `pnpm exec playwright codegen https://omnipizza-frontend.onrender.com`
- **Verificar tipos:** `pnpm typecheck`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm test` (no `VAR=x pnpm test`, sintaxis bash que falla en PowerShell)

---

## Outcome esperado

- [ ] Entiendes la jerarquía de locators y **por qué** `getByRole` es preferencia, no ley (caso login de OmniPizza).
- [ ] Sabes estrechar un locator con `.filter`/`.nth`/`.first`/`.and`/`.or` y hacer **scoping** (`card.getByRole("button")`) para botones icon-only.
- [ ] Distingues `getByText` (leer/aseverar) de `getByRole`/`getByTestId` (accionar).
- [ ] Sabes usar `pnpm exec playwright codegen <url>` para **descubrir** locators y **endurecer** lo que genera.
- [ ] Reconoces cuándo un CSS selector es legítimo (testids dinámicos) y por qué `toHaveURL` usa regex.
- [ ] El smoke de un mercado (`ejemplo.spec.ts`) corre en verde; los dos bloques de referencia quedan **skipped**.
- [ ] Completaste el reto localizando 3 elementos del catálogo con el nivel correcto de la jerarquía.

---

## ¿Qué viene en M03?

En el próximo módulo vas a **parametrizar** este smoke para que un mismo test corra contra los 4 mercados de OmniPizza (MX/US/CH/JP) consumiendo **JSON tipado** (`data/` + `types/`) con un bucle `for...of` que registra un `test()` por mercado — el patrón **data-driven**. Los locators no cambian; cambia de dónde salen los **datos**.
