# M02 · Guía del módulo: Locators

> 🎁 **Proyecto de referencia.** En el repo del curso, este módulo incluye una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del resto del curso). Úsalo como **solución de referencia**: ábrelo aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de esta guía siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto".

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** la **disciplina de la jerarquía de locators** aplicada al smoke de M01 — `getByRole` donde la app coopera, `getByTestId`/CSS donde no — más una **chuleta viva** (`test.skip`) con los selectores REALES de OmniPizza verificados contra el DOM. El smoke sigue siendo de **un** mercado; parametrizarlo por los 4 mercados llega en M03.

---

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

**`getByRole` es una PREFERENCIA, no una ley.** La regla dice "empieza por `getByRole` y baja de nivel sólo cuando algo te obliga". El "algo que te obliga" no es raro: una app **mal instrumentada** (sin labels, con inputs anónimos, con botones icon-only) te empuja al nivel 2/3 — y reconocer cuándo pasa es una habilidad real de QA, no una derrota. Lo verás abajo: el **catálogo** de OmniPizza está bien instrumentado y vives en `getByRole`; el **login** no lo está y bajas a `getByTestId` sin culpa.

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

---

## 🎥 Codegen: deja que Playwright DESCUBRA los locators por ti

Hasta aquí escribiste los locators a mano leyendo la chuleta. Pero existe una herramienta que **graba tus clics y genera el código de los locators automáticamente**, respetando la jerarquía (role-first). Se llama **Codegen** y es, en la práctica, **el inspector de elementos del mundo Playwright**: tú interactúas con la página real, y Playwright te escribe el locator que usaría — empezando por `getByRole`, bajando de nivel sólo cuando el DOM no coopera (exactamente la regla de este módulo).

> 📚 Doc oficial: https://playwright.dev/docs/codegen

Abres Codegen apuntando a la URL del frontend:

```bash
pnpm exec playwright codegen https://omnipizza-frontend.onrender.com
```

Se abre un navegador + la ventana **Playwright Inspector**. A medida que actúas (login: clic en bandera → usuario → password → "Sign In", luego clic en una pizza), el panel del Inspector va escribiendo líneas como `await page.getByTestId('username-desktop').fill('standard_user')` y `await page.getByRole('heading', { name: 'Pepperoni' }).click()`.

**Cómo se relaciona con la jerarquía:** Codegen aplica internamente la misma prioridad que enseñamos (`getByRole` → `getByLabel`/`getByText` → `getByTestId` → CSS). Por eso, cuando grabas en el **catálogo** de OmniPizza, te genera `getByRole("heading", { name: "Pepperoni" })`; pero cuando grabas en el **login** (mal instrumentado), te genera `getByTestId("username-desktop")` o un CSS — porque ahí no hay rol ni label que ofrecer. **Codegen es un buen espejo de la calidad del DOM.**

> ⚠️ **Advertencia — Codegen es un punto de partida, no la última palabra.** En DOMs sucios genera locators **frágiles** — `nth-child` posicionales, textos que cambian con el idioma, o un `getByText` sobre un `<div>` decorativo en vez del input real. Tu trabajo es *endurecer* lo grabado: preferir un testid estable a un `nth-child`, acotar con scoping (`card.getByRole(...)`) en vez de un selector global, y borrar los pasos de ruido (clics accidentales). Codegen descubre; el humano decide.

---

## Paso a paso (setup)

### Paso 0 — Pre-requisitos

Entra al proyecto autocontenido de este módulo y prepara el entorno (todos los comandos se corren **desde `proyecto/`**):

```bash
cd proyecto
pnpm install
pnpm install:browsers
cp .env.example .env
```

Verifica que `pnpm typecheck` termina en verde y que `.env` existe. M02 **no** vuelve a montar dotenv ni el primer login contra OmniPizza; asume esa base conceptual de M01. El incremental de este módulo es **criterio de locators**, no herramientas.

---

### Paso 1 — Dependencias requeridas

**M02 no añade paquetes npm nuevos.** Solo necesitas lo de M01 (`@playwright/test`, `dotenv`, `typescript`, `@types/node`).

Verifica:

```bash
pnpm list @playwright/test dotenv typescript @types/node
```

Si te falta alguno, vuelve al **Paso 1 de M01** (o ejecuta `pnpm install` si `package.json` ya los lista).

---

### Paso 2 — Config y scripts (estado al terminar M02)

> **📐 Config — cambios vs M01**
> ```diff
> # playwright.config.ts — SIN CAMBIOS vs M01
> # (M02 practica locators; no toca la configuración del runner)
> ```
> **Se mantiene:** todo (dotenv, baseURL, timeouts, project `ui-anon`). **Entra:** nada en el config — el incremental de M02 es **criterio de locators**, no configuración del runner. Todavía **no** hay carpeta `types/` que incluir en `tsconfig.json` — eso nace en M03.

**M02 no requiere cambios al config** — sigue el mismo de M01.

El `tsconfig.json` de este proyecto usa un `include` **mínimo** (sin `types/` todavía — eso nace en M03):

```json
{
  "include": [
    "playwright.config.ts",
    "tests/**/*.ts"
  ]
}
```

Tu `playwright.config.ts` debe seguir viéndose como al final de M01:

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

El proyecto ya define el atajo `m2` en `package.json`:

```json
"scripts": {
  "m2": "playwright test --project=ui-anon"
}
```

`pnpm m2` es azúcar sintáctica dentro del proyecto: equivale a `pnpm exec playwright test --project=ui-anon` (y `pnpm test` corre exactamente lo mismo, porque el único project es `ui-anon`). Sigue siendo un solo project **anónimo** `ui-anon` (M01-M03 son login por UI); el project autenticado con `storageState` nace en **M06**.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** `pnpm m2`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@smoke"`) o por archivo (`pnpm exec playwright test tests/reto.spec.ts`)
- **Descubrir locators:** `pnpm exec playwright codegen https://omnipizza-frontend.onrender.com`
- **Verificar tipos:** `pnpm typecheck`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm m2` (no `VAR=x pnpm m2`, sintaxis bash que falla en PowerShell)

---

## Outcome esperado

- [ ] Entiendes la jerarquía de locators y **por qué** `getByRole` es preferencia, no ley (caso login de OmniPizza).
- [ ] Sabes estrechar un locator con `.filter`/`.nth`/`.first`/`.and`/`.or` y hacer **scoping** (`card.getByRole("button")`) para botones icon-only.
- [ ] Distingues `getByText` (leer/aseverar) de `getByRole`/`getByTestId` (accionar).
- [ ] Sabes usar `pnpm exec playwright codegen <url>` para **descubrir** locators y **endurecer** lo que genera.
- [ ] Reconoces cuándo un CSS selector es legítimo (testids dinámicos) y por qué `toHaveURL` usa regex.
- [ ] El smoke de un mercado (`ejemplo.spec.ts`) corre en verde; los dos bloques de referencia quedan **skipped**.
- [ ] Completaste el reto localizando 3 elementos del catálogo con el nivel correcto de la jerarquía.
