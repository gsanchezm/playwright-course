# Módulo 02 — Locators + Data tipada

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** `types/omnipizza.d.ts` + `data/users.json` + `data/markets.json`. El smoke de M01 se parametriza con `test.each()` contra los 4 mercados.

---

## 🏗️ Arquitectura al terminar este módulo

Aparecen **dos carpetas nuevas**: `data/` (los datasets) y `types/` (los contratos que validan esos datasets). El JSON deja de ser "string suelto" y pasa a ser **dato tipado**.

```
playwright-course/
├── data/                          ← 🆕 datasets de prueba
│   ├── markets.json               ← 🆕 MX / US / CH / JP (code, fullName, currency)
│   └── users.json                 ← 🆕 standard_user, admin_user, ...
├── types/                         ← 🆕 contratos del dominio
│   ├── index.ts                   ← 🆕 barrel: re-exporta lo de omnipizza
│   └── omnipizza.d.ts             ← 🆕 User, Market, Pizza, Currency, CountryCode
├── modulo-01-smoke-feo/           ← (sin cambios)
├── modulo-02-locators-data/       ← 🆕 ESTE MÓDULO
│   ├── README.md
│   ├── ejemplo.spec.ts            ← 🆕 test.each por mercado + lookup map
│   └── reto.spec.ts               ← 🆕 añadir 5º mercado (CA) sin tocar el spec
├── .env, .env.example, .gitignore
├── package.json, tsconfig.json
└── playwright.config.ts
```

**Flujo del dato** (cómo viaja del JSON al test):

```
data/markets.json  ──┐
                     ├─► import marketsJson  ──► as Market[]  ──► for (const market of markets) test(...)
types/omnipizza.d.ts ┘     (raw JSON)             (tipo seguro)        (data-driven loop)
```

**Qué NO existe todavía:**

| Carpeta | Llega en | Para qué |
|---|---|---|
| `pages/` | M03 | Page Object Model (matar la duplicación) |
| `tests/setup/`, `fixtures/`, `helpers/` | M04 | Setup project + fixtures |
| `services/`, `tests/api/` | M05 | API testing |
| `.github/workflows/` | M06 | CI/CD |

> 💡 **Para el facilitador:** abre `types/omnipizza.d.ts` y `data/markets.json` lado a lado y dibuja la flecha con el dedo: **el `.d.ts` describe lo que `.json` debe contener**. Si rompes el contrato (typo, campo faltante), TS lo detecta antes de correr.

---

## Analogía de apertura

Un tester manual siempre trae consigo una **hoja de datos de prueba** (usuarios, ambientes, mercados). En este módulo construimos esa hoja como **JSON tipado** y la conectamos al TC con `test.each()` — un mismo caso ejecutado con N sets de datos distintos, como una matriz de regresión.

---

## ¿Qué aprenderás?

1. **Jerarquía de locators** con criterios de cuándo bajar nivel.
2. **Filtros y combinadores:** `.filter()`, `.nth()`, `locator.all()`.
3. **Iterar locators** con `for...of` para recorrer listas reales (pizzas del catálogo).
4. **`interface` como contrato:** User, Market, Pizza — fallan en compile-time si el JSON no cumple.
5. **`test.each<T>()`** para data-driven.
6. **`import type`** — traer sólo la forma, no el código.

---

## Jerarquía de locators (regla del curso)

Escríbelo como escribirías un **bug report bien hecho**:

| Prioridad | Locator | Cuándo usarlo | Ejemplo |
|---|---|---|---|
| 1️⃣ | `getByRole` | Casi siempre. Es accesible y semántico. | `page.getByRole('button', { name: 'Pagar' })` |
| 2️⃣ | `getByLabel` / `getByText` | Formularios y contenido visible. | `page.getByLabel('Email')` |
| 3️⃣ | `getByTestId` | Cuando el DOM no coopera y el dev cooperó. | `page.getByTestId('pizza-card-123')` |
| 4️⃣ | CSS selectors | Cuando los testids son dinámicos o no existen. | `page.locator('[data-testid^="pizza-card-"]')` |
| 5️⃣ | XPath | Último recurso. Frágil. | `page.locator('//button[@data-ready]')` |

**Importante:** CSS y XPath **no están prohibidos**. Están al final porque son frágiles, no porque sean inválidos. En OmniPizza usamos CSS con prefijo (`[data-testid^="pizza-card-"]`) para los testids dinámicos — es legítimo.

---

## Conceptos JIT

| Concepto | Analogía QA |
|---|---|
| `interface User` | Contrato Swagger: un User DEBE tener username, password, role |
| `test.each<Market>(markets)('...', ...)` | Matriz de regresión: 1 TC × 4 mercados = 4 ejecuciones |
| `import type { User }` | Sólo traigo la forma, no el código |
| `locator.all()` | Obtener el array de locators — como pedir todas las filas de una tabla |
| `.filter({ hasText: 'Spicy' })` | Filtrar por componente en Jira |
| `.nth(0)` | La primera fila de resultados |
| `Record<K, V>` | Matriz de datos esperados: TODAS las celdas obligatorias |
| `Partial<T>` | Filtro de búsqueda: cada campo es opcional |
| Guard clause / fast return | Salir temprano en vez de anidar `if/else` |

---

## 🧩 Utility types: `Partial<Record<Currency, string>>` desglosado

En `ejemplo.spec.ts` aparece esta declaración:

```ts
const currencySymbol: Partial<Record<Currency, string>> = {
  MXN: "$",
  JPY: "¥",
};
```

Se lee **de adentro hacia afuera**. Son dos *utility types* anidados.

### 1. `Record<K, V>` — "objeto cuyas llaves son `K` y los valores son `V`"

Forma corta de declarar un diccionario/mapa donde las llaves están acotadas a un union type.

```ts
type Currency = "MXN" | "USD" | "CHF" | "JPY" | "CAD";

// Esto:
const symbols: Record<Currency, string> = {
  MXN: "$",
  USD: "$",
  CHF: "Fr",
  JPY: "¥",
  CAD: "$",
};

// Es equivalente a:
const symbols: {
  MXN: string;
  USD: string;
  CHF: string;
  JPY: string;
  CAD: string;
} = { /* ... */ };
```

**Para qué sirve:** el compilador exige que las llaves sean **exactamente** los valores del union. Si escribes `MNX` (typo) o se te olvida `USD`, TypeScript falla.

**Analogía QA:** es la **matriz de datos esperados** del test plan. Las dimensiones (las 5 currencies del negocio) están cerradas; `Record` te obliga a llenar **cada celda**.

### 2. `Partial<T>` — "haz que todas las propiedades de `T` sean opcionales"

```ts
interface User {
  username: string;
  password: string;
  role: string;
}

// Partial<User> es equivalente a:
interface PartialUser {
  username?: string;
  password?: string;
  role?: string;
}
```

**Para qué sirve:** cuando un objeto puede tener **solo algunas** de las llaves definidas en `T`, no todas.

**Analogía QA:** es el **filtro de búsqueda** de un formulario: el contrato dice "estos son los campos posibles", pero el usuario llena solo los que le interesan.

### 3. Juntos: `Partial<Record<Currency, string>>`

- **`Record<Currency, string>`** → "todas las currencies deben tener un símbolo".
- **`Partial<...>`** envolviéndolo → "pero cada una es opcional; puedo definir solo las que me interesan".

```ts
const currencySymbol: Partial<Record<Currency, string>> = {
  MXN: "$",
  JPY: "¥",
  // USD, CHF, CAD se quedan SIN entrada — y TypeScript no se queja.
};
```

Si hubiera sido `Record<Currency, string>` (sin `Partial`), TS habría exigido las 5 entradas y se habría quejado de las que faltan.

Al leer el mapa:

```ts
const symbol = currencySymbol[market.currency]; // tipo: string | undefined
```

Fíjate que **el tipo inferido es `string | undefined`** — precisamente por el `Partial`. Esa `| undefined` es lo que **justifica la guard clause** que viene justo después:

```ts
if (!symbol) return; // ← fast return: nada que validar para esta currency
await expect(page.locator("body")).toContainText(symbol);
```

TS te **obliga** a manejar el caso "no hay entrada para esta currency". El `Partial` no es decoración — está empujándote hacia la buena práctica del fast return.

### Comparativa rápida

| Tipo | Significado | Llaves que faltan |
|---|---|---|
| `Record<Currency, string>` | Todas las currencies tienen símbolo | ❌ error de compilación |
| `Partial<Record<Currency, string>>` | Algunas currencies tienen símbolo | ✅ permitido, valor = `undefined` |
| `{ [k in Currency]?: string }` | Idéntico al anterior, sintaxis larga | ✅ permitido |

Las dos últimas son equivalentes; `Partial<Record<...>>` es la forma **idiomática y más legible**.

### ¿Cuándo elegir cada uno en este curso?

- Si el dato **debe** tener todas las llaves (la matriz de regresión completa) → `Record<K, V>`.
- Si el dato **podría** tener un subconjunto (un mapa opcional, un override parcial, una config con defaults) → `Partial<Record<K, V>>`.

En nuestro caso, **no todas las currencies tienen un símbolo único conocido** (USD, CHF y CAD usan `$` o `Fr` y la validación visual sería ambigua), así que es legítimo dejarlas fuera del mapa — `Partial` lo permite, y el `if (!symbol) return;` cierra el caso elegante.

> 💡 **Para el facilitador:** este es un buen momento para hacer la pregunta inversa: *"¿qué pasa si cambio `Partial<Record<...>>` a `Record<...>` en el spec?"*. Respuesta: TS rompe la compilación pidiendo las 3 entradas faltantes (`USD`, `CHF`, `CAD`). Eso demuestra **en vivo** que `Partial` no es decorativo.

---

## 🌱 Semilla conceptual: ¿y si hubiera más de un ambiente? (múltiples `.env`)

Hasta ahora el curso usa **un solo `.env`** (lo creaste en M01) cargado con `import "dotenv/config"` en `playwright.config.ts`. De ahí salen `BASE_URL`, `API_URL`, `TEST_USER_*` y `DEFAULT_COUNTRY`. **Para M02 esto sobra** — no toques nada. Pero conviene plantar la semilla de una pregunta que aparece en proyectos reales:

> *"¿Y si OmniPizza tuviera un ambiente de **staging** además del de QA? ¿Mantengo dos `.env` y los intercambio a mano?"*

**Analogía QA:** es la diferencia entre tener **una sola hoja de datos de prueba** y tener **una pestaña por ambiente** en el mismo Excel. El TC es idéntico; lo que cambia son URLs y credenciales según dónde lo ejecutes.

El patrón se llama **base + override**: un `.env` con los defaults compartidos y un `.env.<ambiente>` que gana encima.

```
.env             ← defaults compartidos (TEST_USER_*, DEFAULT_COUNTRY)
.env.qa          ← overrides de QA      (BASE_URL, API_URL)
.env.staging     ← overrides de staging (BASE_URL, API_URL)
.env.example     ← plantilla versionada (la ÚNICA que se commitea)
```

Orden de prioridad (quién gana, de menor a mayor):

```
.env (defaults)  <  .env.<ambiente>  <  variables ya en process.env (CI / shell)
```

Esa última regla es la clave de M06: **en CI no usas archivos `.env`** — GitHub Actions inyecta las variables directo vía `secrets.*` (ya lo anota tu `.env.example`), y como mandan sobre cualquier archivo, los secrets de CI ganan.

| Situación | ¿Múltiples `.env`? | Por qué |
|---|---|---|
| Un solo ambiente (M01–M05) | ❌ No | Un `.env` + defaults en el config sobra. Complejidad sin beneficio. |
| 2+ ambientes reales (QA / staging / prod) | ✅ Sí | Cada uno tiene URLs y credenciales distintas. |
| CI/CD | ⚠️ No con archivos | Se inyectan vía `secrets.*`, no con `.env`. |

**Regla del curso (coherente con "siente el dolor primero"):** no agregues `.env.qa` / `.env.staging` hasta que tengas un **segundo ambiente real**. Antes de eso es arquitectura especulativa. La implementación completa (carga por `TEST_ENV`, `override: true`, scripts y el detalle de Windows/PowerShell con `cross-env`) **se ve en M06**, donde el multi-entorno deja de ser hipótesis y se vuelve necesidad.

> 💡 **Para el facilitador:** lanza la pregunta *"¿qué tocarías para correr el mismo smoke contra staging?"* y deja que el grupo lo razone. La respuesta NO es "duplicar specs" — es "cambiar de qué archivo sale `BASE_URL`". Fíjate que `playwright.config.ts` **ya está listo**: `baseURL: process.env.BASE_URL ?? ...` no cambiaría ni una línea. Eso refuerza el mismo principio del módulo: **el dato vive fuera del código; el código solo lo consume.**

---

## Paso a paso

### Paso 0 — Pre-requisitos

Antes de empezar verifica que **M01 quedó funcional**:

```bash
# Estando en playwright-course/
pnpm m1            # debe pasar TC-001 y TC-002 en verde
ls .env            # debe existir (dotenv lo necesita)
ls node_modules    # debe existir (pnpm install corrió)
```

Si M01 no corre, vuelve al módulo anterior — no avances sin esa base.

> 💡 **Para el facilitador:** este módulo asume que `dotenv`, `.env` y la primera ejecución contra OmniPizza ya están resueltos. Si alguien todavía no tiene `.env`, mándalo al **Paso 1 y 2 de M01** antes de continuar.

---

### Paso 1 — Dependencias requeridas

**M02 no añade paquetes npm nuevos.** Solo necesitas lo de M01 (`@playwright/test`, `dotenv`, `typescript`, `@types/node`).

Verifica:

```bash
pnpm list @playwright/test dotenv typescript @types/node 2>/dev/null
```

Si te falta alguno, vuelve al **Paso 1 de M01** (o ejecuta `pnpm install` si `package.json` ya los lista).

---

### Paso 2 — Crear `types/` y `data/` (carpetas nuevas)

```bash
mkdir -p types data
touch types/omnipizza.d.ts types/index.ts
touch data/markets.json data/users.json
```

**Contenido mínimo** de cada archivo:

📄 `types/omnipizza.d.ts`:

```ts
// Union types acotados — el corazón del tipado fuerte de este curso.
export type CountryCode = "MX" | "US" | "CH" | "JP";
export type Currency = "MXN" | "USD" | "CHF" | "JPY";

export interface Market {
  code: CountryCode;
  fullName: string;
  currency: Currency;
}

export interface User {
  username: string;
  password: string;
  role: "standard" | "admin";
}

export interface Pizza {
  id: string | number;
  name: string;
  currency: Currency;
  price: number;
}
```

📄 `types/index.ts` (barrel — re-exporta para imports cortos):

```ts
export * from "./omnipizza";
```

📄 `data/markets.json`:

```json
[
  { "code": "MX", "fullName": "Mexico",        "currency": "MXN" },
  { "code": "US", "fullName": "United States", "currency": "USD" },
  { "code": "CH", "fullName": "Switzerland",   "currency": "CHF" },
  { "code": "JP", "fullName": "Japan",         "currency": "JPY" }
]
```

📄 `data/users.json`:

```json
[
  { "username": "standard_user", "password": "pizza123", "role": "standard" },
  { "username": "admin_user",    "password": "pizza123", "role": "admin" }
]
```

**Verifica el tipado** ANTES de seguir:

```bash
pnpm exec tsc --noEmit
# Sin output = los tipos del .d.ts cuadran con el JSON.
```

> 💡 **Para el facilitador:** si el alumno escribe `"code": "MNX"` por error, `tsc --noEmit` falla con `Type '"MNX"' is not assignable to type 'CountryCode'`. Demuéstralo provocando el typo a propósito y mostrando el error.

---

### Paso 3 — Ajustes a `playwright.config.ts` (estado al terminar M02)

> **📐 Config — cambios vs M01**
> ```diff
> # playwright.config.ts — SIN CAMBIOS vs M01
> # (M02 añade DATOS tipados, no configuración del runner)
> ```
> **Se mantiene:** todo (dotenv, baseURL, timeouts, project `ui-chromium`). **Entra:** nada en el config — el incremental de M02 vive en `data/` y `types/`, no en `playwright.config.ts`. El único ajuste relacionado es el `include` de `tsconfig.json` para que vea `types/`.

**M02 no requiere cambios al config** — sigue el mismo de M01. Solo asegúrate de que `tsconfig.json` incluya los archivos nuevos.

Abre tu `tsconfig.json` y verifica que la sección `include` contemple `types/`:

```json
{
  "include": [
    "playwright.config.ts",
    "types/**/*.ts",
    "types/**/*.d.ts",
    "modulo-*/**/*.ts"
  ]
}
```

Si te faltan las entradas de `types/`, **añádelas** — sin ellas, los imports `import type { Market } from "../types"` van a fallar.

Tu `playwright.config.ts` debe seguir viéndose como al final de M01:

```ts
// playwright.config.ts — Estado en M02 (igual que M01)
import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: ".",
  testMatch: [/modulo-.*\/.*\.spec\.ts/],
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
    { name: "ui-chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

Y añade el script `m2` a `package.json`:

```json
"scripts": {
  "m1": "playwright test modulo-01-smoke-feo --project=ui-chromium",
  "m2": "playwright test modulo-02-locators-data --project=ui-chromium"
}
```

---

### Paso 4 — Inspeccionar el contrato (`types/omnipizza.d.ts`)

Abre `types/omnipizza.d.ts` en el editor. Vas a ver `interface User`, `interface Market` y `interface Pizza`. Estos son los **contratos** que el JSON debe cumplir.

Pregunta al grupo: *"si el JSON tuviera un campo `username` con un número en vez de string, ¿qué pasaría?"* — respuesta: **TypeScript falla en compile-time**, antes de correr el test.

> 💡 **Para el facilitador:** abre `types/omnipizza.d.ts` y `data/users.json` lado a lado y muestra el mapeo campo a campo. Esto fija la idea de "contrato vs implementación".

---

### Paso 5 — Inspeccionar la data (`data/markets.json` y `data/users.json`)

```bash
cat data/markets.json
cat data/users.json
```

Cosas que el facilitador debe señalar:

- `markets.json` tiene **4 entradas**: MX, US, CH, JP. Cada una con `code`, `fullName`, `currency`.
- `users.json` tiene varios usuarios. Vamos a usar `standard_user`.
- Los valores de `code` y `currency` están restringidos por **union types** en `types/omnipizza.d.ts` (`"MX" | "US" | "CH" | "JP"`). Si añades `"CA"` sin ampliar el union, TS rechaza el cambio.

---

### Paso 6 — Ejecutar el ejemplo

```bash
# Headless — el smoke parametrizado, 4 mercados de un solo TC
pnpm m2

# UI mode — RECOMENDADO la primera vez
pnpm test:ui
```

**Qué debería pasar:**

- En la terminal verás **4 tests** corriendo, uno por mercado: `TC-MX`, `TC-US`, `TC-CH`, `TC-JP`.
- Todos pasan en verde (suelen tardar ~30-40s la primera vez por el cold start de Render).
- En UI mode, los 4 aparecen como hijos del mismo describe.

> 💡 **Para el facilitador:** después de la primera corrida, abre `pnpm exec playwright show-report` y muéstrale al grupo que **es el mismo `test()` ejecutándose 4 veces** — no son 4 tests copy/pasteados.

---

### Paso 7 — Lectura guiada del `for...of` data-driven

Abre `ejemplo.spec.ts` y haz que el grupo identifique:

1. **El bucle `for (const market of markets)`** — un `test()` por cada elemento del array.
2. El **título dinámico** del test: `` `TC-${market.code} — login + catálogo en mercado ${market.code} @smoke` `` — cada test tiene un nombre único.
3. La **validación condicional por mercado** (símbolo `$` en MX, `¥` en JP) — lógica de negocio data-driven.
4. El **CSS selector legítimo** `[data-testid^="pizza-card-"]` — explica por qué baja al nivel 4 de la jerarquía: los testids son dinámicos.

---

### Paso 8 — Catálogo de locators (lectura, no ejecución)

Al final de `ejemplo.spec.ts` hay un `test.skip("ejemplos de cada nivel", ...)`. **No se ejecuta**, es una **referencia visual** de cada nivel de la jerarquía con código real. Pídeles que lo escaneen — lo van a copiar para el reto.

---

### Paso 9 — Resolver el reto

Abre `reto.spec.ts`. La meta es **añadir un 5º mercado (`CA`, Canadá, `CAD`) sin tocar el spec**. Vas a editar:

1. `data/markets.json` → añadir el nuevo objeto.
2. `types/omnipizza.d.ts` → ampliar el union (`CountryCode` y `Currency`).
3. Completar los TODOs del reto para que la validación de currency sea data-driven (no hardcoded como en el ejemplo).

Cada TODO indica **Qué hacer / Pista / Cómo verificar**.

---

## 🔍 Detalles que parecen obvios pero no lo son

Cosas del `ejemplo.spec.ts` que se leen "de pasada" pero esconden una decisión de diseño. Si las cambias por la alternativa "obvia", el test se rompe o pierdes seguridad de tipos.

### `await expect(page).toHaveURL(/\/catalog/)`

- **Qué es:** el argumento entre `/.../ ` es una **expresión regular** (regex), **no** un string. Un regex hace *match parcial*: la aserción pasa si la URL **contiene/matchea** `/catalog` en cualquier parte. Un string, en cambio, exige que la URL sea **exactamente** ese valor.
- **Por qué así (y no la alternativa obvia):** OmniPizza puede añadir cosas a la URL del catálogo —querystring (`?locale=`), ids, o el locale dentro del path (`/mx/catalog`)—. Con regex toleras todo eso. El `\/` escapa la barra `/` porque en un literal regex de JS la `/` es el **delimitador** que abre y cierra la expresión; sin escaparla, el motor creería que el regex terminó ahí.
- **Qué pasa si lo cambias:** si pones el string `"/catalog"`, la aserción exige **igualdad exacta de toda la URL**. Como la URL real es algo como `https://.../catalog?...`, nunca será literalmente `/catalog` y el test **truena** con un timeout de aserción.

### `marketsJson as Market[]`

- **Qué es:** una *type assertion* — le dices a TypeScript "trata este JSON como `Market[]`". Es una promesa que haces tú; **no** es validación en runtime. Al ejecutar, nadie revisa que el JSON realmente cumpla el contrato.
- **Por qué así (y no la alternativa obvia):** importar un `.json` te da un tipo inferido amplio (y a veces `any`, según la config). El `as Market[]` te devuelve autocompletado y chequeo de `market.code`, `market.currency`, etc. en compile-time, que es donde queremos atrapar los errores.
- **Qué pasa si lo cambias:** si quitas el `as Market[]`, el tipo pasa a ser el inferido del JSON (o `any`) y **pierdes el autocompletado y la seguridad** de `market.code` / `market.currency`. (Ojo: como es assertion, no validación, un JSON con datos basura sí compilaría — el contrato real lo defiende el `.d.ts` vía `tsc`, no este cast.)

### `const allCards = await pizzaCards.all()`

- **Qué es:** `.all()` devuelve `Promise<Locator[]>` — **materializa** la lista: consulta el DOM *ahora* y te entrega un array fijo de locators. Por eso lleva `await`.
- **Por qué así (y no la alternativa obvia):** comparado con `pizzaCards.first()`, que **no** necesita `await` porque devuelve un `Locator` perezoso (lazy) — un puntero que recién resuelve el DOM cuando lo usas en una acción o aserción. `.all()` rompe esa pereza a propósito: necesitas el array concreto para iterarlo y contar (`allCards.length`).
- **Qué pasa si lo cambias:** si omites el `await`, `allCards` queda como una `Promise`, no como array; `allCards.length` da `undefined` y el `for...of` no itera nada (o falla). Si en cambio creías que `.first()` necesita `await` y lo agregas, no rompe pero es ruido — el locator es perezoso por diseño.

### `page.locator('[data-testid^="pizza-card-"]')`

- **Qué es:** un CSS selector con el operador de atributo `^=`, que significa **"el atributo empieza con"**. Aquí matchea cualquier elemento cuyo `data-testid` arranque con `pizza-card-`.
- **Por qué así (y no la alternativa obvia):** los testids de las pizzas son **dinámicos** (`pizza-card-123`, `pizza-card-456`...), así que no puedes usar `getByTestId("pizza-card-123")` con un id fijo. Bajar al nivel 4 de la jerarquía (CSS) es **legítimo** justamente por eso (ver la tabla de jerarquía arriba). No es deuda técnica: es la herramienta correcta para testids variables.
- **Qué pasa si lo cambias:** si usas `=` en vez de `^=` (`[data-testid="pizza-card-"]`), exiges igualdad exacta y no matcheas **ninguna** tarjeta. Si intentas un `getByTestId` con id fijo, solo encuentras una pizza concreta (frágil) o ninguna.

### `for (const card of allCards) { await expect(card)... }`

- **Qué es:** un bucle `for...of` que recorre el array de locators y hace una aserción `await` por cada tarjeta.
- **Por qué así (y no la alternativa obvia):** `for...of` **serializa** los `await`: espera a que termine la aserción de una tarjeta antes de pasar a la siguiente. La alternativa "obvia" `allCards.forEach(async (card) => { await ... })` **no espera** las promesas — `forEach` ignora el valor de retorno del callback, así que los `await` de adentro se pierden y el test sigue de largo.
- **Qué pasa si lo cambias:** con `forEach`, las aserciones se disparan en paralelo sin que el test las espere; un fallo puede ocurrir **después** de que el test ya terminó (unhandled rejection) y obtienes falsos verdes. `for...of` (o `Promise.all` si quieres paralelismo controlado) es lo correcto cuando hay `await` dentro.

### `` test(`TC-${market.code} — login + catálogo en mercado ${market.code} @smoke`, ...) ``

- **Qué es:** el título del test se construye con un *template string* que interpola `market.code` en cada vuelta del `for...of` sobre `markets`.
- **Por qué así (y no la alternativa obvia):** cada iteración del bucle registra un `test()` distinto, y Playwright **exige títulos únicos** dentro del mismo describe. El `${market.code}` garantiza `TC-MX`, `TC-US`, `TC-CH`, `TC-JP` — nombres distintos y legibles en el reporte. Además, el tag `@smoke` embebido en el título es lo que permite filtrar con `--grep @smoke`.
- **Qué pasa si lo cambias:** si pones un título fijo (`"TC catálogo"`) para los 4, tendrás títulos duplicados — confusos en el reporte y difíciles de aislar con `--grep` o `-g "TC-MX"`. Si quitas `@smoke`, el caso deja de aparecer en `pnpm test:smoke`.

> 💡 **Para el facilitador:** el deep-dive de `Partial<Record<Currency, string>>` (la guard clause `if (!symbol) return;`) ya está más arriba (ver sección de utility types arriba); no lo repitas aquí — enlázalo si alguien pregunta por qué el `currencySymbol` es opcional.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** `pnpm m2`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep @smoke`) o por archivo (`pnpm exec playwright test modulo-02-locators-data/reto.spec.ts`)
- **Verificar tipos:** `pnpm typecheck`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm m2` (no `VAR=x pnpm m2`, sintaxis bash que falla en PowerShell)

---

## Outcome esperado

- [ ] Entiendes la jerarquía de locators y **por qué** no todo es `getByRole`.
- [ ] Puedes leer `markets.json` y explicar cómo el test lo consume.
- [ ] Sabes añadir un 5º mercado **sin tocar el spec**.
- [ ] `pnpm typecheck` queda en verde tras ampliar los union types.
- [ ] Reconoces cuándo un CSS selector es legítimo (testids dinámicos).
