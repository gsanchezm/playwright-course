# M03 · Guía del módulo: Data-driven testing

> 🎁 **Proyecto de referencia.** En el repo del curso, este módulo incluye una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json`, independiente del resto del curso). Úsalo como **solución de referencia**: ábrelo aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de esta guía construyen ese mismo proyecto pieza por pieza; `proyecto/` es el "ya resuelto".

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** `types/omnipizza.d.ts` + `data/users.json` + `data/markets.json`. El smoke de M02 se parametriza con un **bucle `for...of` que registra un `test()` por mercado** contra los 5 mercados.

---

## 🏗️ Arquitectura al terminar este módulo

Aparecen **dos carpetas nuevas**: `data/` (los datasets) y `types/` (los contratos que validan esos datasets). El JSON deja de ser "string suelto" y pasa a ser **dato tipado**.

```
playwright-course/
├── modulo-02-locators/            ← (sin cambios)
├── modulo-03-data-driven/         ← 🆕 ESTE MÓDULO
│   ├── README.md
│   └── proyecto/                  ← proyecto autocontenido y ejecutable
│       ├── data/                  ← 🆕 datasets de prueba
│       │   ├── markets.json       ← 🆕 MX / US / CH / JP / SA (code, fullName, country, currency)
│       │   └── users.json         ← 🆕 5 personas: standard_user, locked_out_user, problem_user, performance_glitch_user, error_user
│       ├── types/                 ← 🆕 contratos del dominio
│       │   ├── index.ts           ← 🆕 barrel: re-exporta lo de omnipizza
│       │   └── omnipizza.d.ts     ← 🆕 User, Market, Pizza, Currency, CountryCode
│       ├── playwright.config.ts   ← igual que M02 (un solo project ui-anon)
│       ├── tsconfig.json          ← include AMPLIADO para ver types/
│       ├── .env.example, .gitignore
│       └── tests/
│           ├── ejemplo.spec.ts    ← 🆕 for...of por mercado + lookup map
│           └── reto.spec.ts       ← 🆕 añadir 6º mercado (CA) sin tocar el spec
└── …
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
| `pages/` | M04 | Page Object Model (matar la duplicación) |
| `fixtures/`, `helpers/` | M05 | Custom fixtures + aislamiento de datos por worker |
| `tests/setup/`, `.auth/` | M06 | Setup project + `storageState` (login una vez) |
| `services/`, `tests/api/` | M07 | API testing |
| `.github/workflows/` (uso real) | M08 | CI/CD |

---

## Analogía de apertura

Un tester manual siempre trae consigo una **hoja de datos de prueba** (usuarios, ambientes, mercados). En este módulo construimos esa hoja como **JSON tipado** y la conectamos al TC con un **bucle `for...of`** que **registra un `test()` por cada fila de datos** — un mismo caso de prueba ejecutado con N sets distintos, como una matriz de regresión.

> ⚠️ **Ojo con `test.each()`:** si vienes de Jest o Vitest, ahí existe `test.each()` para parametrizar. **Playwright NO lo tiene.** En Playwright parametrizas con un `for` normal de JavaScript que recorre el array y llama a `test()` adentro — cada vuelta del bucle **registra** un caso independiente. No es magia del runner: es un `for` y un `test()`.

---

## ¿Qué aprenderás?

1. **`interface` como contrato:** User, Market, Pizza — fallan en compile-time si el JSON no cumple.
2. **Union / literal types** (`"MX" | "US" | …`) para acotar los valores legales de un campo.
3. **`import type`** — traer sólo la forma, no el código.
4. **Data-driven con `for...of` + `test()`** — registrar N casos desde un array de datos (el patrón que en Jest/Vitest harías con `test.each`, aquí es un `for`).
5. **Iterar locators** con `.all()` + `for...of` para recorrer listas reales (las pizzas del catálogo, dentro de cada test parametrizado).
6. **Utility types** (`Partial<Record<Currency, string>>`) + **guard clause** para validar la currency por mercado sin `if/else` anidados.

---

## Conceptos JIT

| Concepto | Analogía QA |
|---|---|
| `interface User` | Contrato Swagger: un User DEBE tener username, password, role |
| union / literal types (`"MX" \| "US"`) | Lista cerrada de valores legales (como un enum de negocio) |
| `for (const market of markets) { test(...) }` | Matriz de regresión: 1 TC × 5 mercados = 5 ejecuciones (un `test()` registrado por vuelta) |
| `import type { User }` | Sólo traigo la forma, no el código |
| `locator.all()` | Obtener el array de locators — como pedir todas las filas de una tabla |
| `Record<K, V>` | Matriz de datos esperados: TODAS las celdas obligatorias |
| `Partial<T>` | Filtro de búsqueda: cada campo es opcional |
| Guard clause / fast return | Salir temprano en vez de anidar `if/else` |

---

## 🧩 Utility types: `Partial<Record<Currency, string>>` desglosado

En `ejemplo.spec.ts` aparece esta declaración:

```ts
const currencySymbol: Partial<Record<Currency, string>> = {
  MXN: "$",
  JPY: "￥",
};
```

> 🔍 **Nota — el yen es full-width `￥` (U+FFE5), no el `¥` half-width (U+00A5).** OmniPizza renderiza el yen japonés vía `Intl.NumberFormat('ja-JP')`, que usa la forma ancha. Si copias el half-width `¥`, la aserción `toContainText` no encuentra el símbolo y el test de JP falla. Por eso el mapa usa `￥` a propósito.

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
  JPY: "￥",
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

**Analogía QA:** es la **matriz de datos esperados** del test plan. Las dimensiones (las 5 currencies de este ejemplo) están cerradas; `Record` te obliga a llenar **cada celda**.

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
  JPY: "￥",
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

---

## 🌱 Semilla conceptual: ¿y si hubiera más de un ambiente? (múltiples `.env`)

Hasta ahora el curso usa **un solo `.env`** (lo creaste en M01) cargado con `import "dotenv/config"` en `playwright.config.ts`. De ahí salen `BASE_URL`, `API_URL`, `TEST_USER_*` y `DEFAULT_COUNTRY`. **Para M03 esto sobra** — no toques nada. Pero conviene plantar la semilla de una pregunta que aparece en proyectos reales:

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

Esa última regla es la clave de M08: **en CI no usas archivos `.env`** — GitHub Actions inyecta las variables directo vía `secrets.*` (ya lo anota tu `.env.example`), y como mandan sobre cualquier archivo, los secrets de CI ganan.

| Situación | ¿Múltiples `.env`? | Por qué |
|---|---|---|
| Un solo ambiente (M01–M07) | ❌ No | Un `.env` + defaults en el config sobra. Complejidad sin beneficio. |
| 2+ ambientes reales (QA / staging / prod) | ✅ Sí | Cada uno tiene URLs y credenciales distintas. |
| CI/CD | ⚠️ No con archivos | Se inyectan vía `secrets.*`, no con `.env`. |

**Regla del curso (coherente con "siente el dolor primero"):** no agregues `.env.qa` / `.env.staging` hasta que tengas un **segundo ambiente real** — no lo necesitas hasta entonces. Antes de eso es arquitectura especulativa. **Para M03 NO toques tu config** — sigue idéntico a M02. Lo que viene a continuación es **ilustrativo y opcional**: enseña *cómo se vería* la implementación el día que la necesites, para que la semilla no quede en el aire.

### Implementación real (opcional — sólo cuando exista un 2º ambiente)

El truco es cargar `dotenv` **dos veces**: primero el `.env` base (defaults), luego el `.env.<ambiente>` con `override: true` para que **gane** sobre los defaults. La selección del ambiente sale de una variable `TEST_ENV` (con default `"qa"`):

```ts
// @file playwright.config.ts
// patrón base + override (NO lo apliques hasta tener staging real)
import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

// 1) Defaults compartidos (TEST_USER_*, DEFAULT_COUNTRY).
dotenv.config({ path: ".env" });

// 2) Overrides del ambiente seleccionado — GANAN sobre el base.
//    TEST_ENV elige el archivo; default "qa" si no la defines.
const env = process.env.TEST_ENV ?? "qa";
dotenv.config({ path: `.env.${env}`, override: true });

export default defineConfig({
  use: { baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com" },
  // ...resto igual que M01
});
```

> ⚠️ **`override: true` es la línea clave.** Sin él, `dotenv` **no** pisa una variable que ya esté definida (el primer `.config` gana y el segundo se ignora). Con `override: true` inviertes la regla para el archivo de ambiente: el `.env.staging` machaca al `.env` base. Las variables que ya viven en `process.env` (shell / CI) siguen mandando sobre ambos archivos — por eso en CI los `secrets.*` ganan sin tocar este código.

**Cómo eliges el ambiente (convención del curso: PowerShell):**

```powershell
# Windows / PowerShell — define la variable en la MISMA línea, separada por ';'
$env:TEST_ENV="staging"; pnpm m3     # corre M03 contra .env.staging
pnpm m3                               # sin TEST_ENV → usa el default "qa"
```

> 🪟 **No usamos `cross-env`.** En PowerShell la sintaxis nativa `$env:VAR="x"; comando` ya hace el trabajo; `cross-env` añade una dependencia que el curso evita. (La sintaxis bash `TEST_ENV=staging pnpm m3` **falla** en PowerShell.)

**Reconciliación con M08:** este mismo patrón reaparece en M08 (CI), pero allí deja de ser opcional: el pipeline de CI corre contra varios ambientes y, además, **no usa archivos `.env`** — GitHub Actions inyecta las variables vía `secrets.*` directo en `process.env` (que, como viste arriba, mandan sobre cualquier archivo). En M03 esto es una semilla; en M08 es necesidad operativa.

---

## Paso a paso

### Paso 0 — Pre-requisitos

Entra al **proyecto autocontenido de este módulo** y prepara el entorno:

```bash
cd proyecto
pnpm install
pnpm install:browsers
cp .env.example .env
```

Verifica que la base quede lista antes de seguir:

```bash
pnpm typecheck     # termina en verde (los tipos cuadran)
ls .env            # debe existir (dotenv lo necesita)
```

M03 **no** vuelve a montar dotenv ni el primer login contra OmniPizza; asume esa base (M01) y la disciplina de locators (M02). El incremental de M03 es el **dato tipado**.

---

### Paso 1 — Dependencias requeridas

**M03 no añade paquetes npm nuevos.** Solo necesitas lo de M01 (`@playwright/test`, `dotenv`, `typescript`, `@types/node`).

Verifica:

```bash
pnpm list @playwright/test dotenv typescript @types/node
```

Si te falta alguno, vuelve al **Paso 1 de M01** (o ejecuta `pnpm install` si `package.json` ya los lista).

---

### Paso 2 — Crear `types/` y `data/` (carpetas nuevas)

Este paso construye las **dos carpetas nuevas** de la arquitectura. Orden: primero los contratos (`types/`), luego los datos (`data/`) que esos contratos validan.

```bash
mkdir types
mkdir data
code types/omnipizza.d.ts
code types/index.ts
code data/markets.json
code data/users.json
```

**Contenido mínimo** de cada archivo:

📄 `types/omnipizza.d.ts`:

```ts
// Union types acotados — el corazón del tipado fuerte de este curso.
export type CountryCode = "MX" | "US" | "CH" | "JP" | "SA";
export type Currency = "MXN" | "USD" | "CHF" | "JPY" | "SAR";

// OmniPizza sólo expone usuarios "customer". Las 5 personas
// (standard / locked_out / problem / performance_glitch / error)
// se distinguen por COMPORTAMIENTO de login, no por privilegios.
// NO existe un rol admin en la app.
export type Role = "customer";

export interface Market {
  code: CountryCode;
  fullName: string;
  country: string;
  currency: Currency;
}

export interface User {
  username: string;
  password: string;
  role: Role;
  description?: string;
}

export interface Pizza {
  id: string | number;
  name: string;
  currency: Currency;
  price: number;
}
```

> 🔷 **TypeScript — `interface`**
> Una `interface` describe la **forma** de un objeto (qué campos tiene y de qué tipo), sin generar código en runtime: es puro contrato de compilación. La alternativa obvia —no tipar nada y confiar en el JSON— te deja descubrir el campo faltante recién cuando el test revienta.
> 📚 Lo viste en [TS · M06 — interfaces](/docs/typescript/m6-api-response). Aquí lo aplicas a `User`, `Market` y `Pizza`: el contrato que valida `data/*.json`.

> 🔷 **TypeScript — union / literal types (`"MX" | "US" | …`)**
> Un *literal type* es un valor concreto usado como tipo; un *union* los encadena con `|`. `CountryCode = "MX" | "US" | "CH" | "JP" | "SA"` significa "solo estos 5 strings son válidos" — más estricto que `string`, que aceptaría `"MNX"` o `""` sin chistar.
> 📚 Lo viste en [TS · M04 — objects & types](/docs/typescript/m4-union-types). Aquí lo aplicas a `code` y `currency`: si añades un mercado con un código fuera del union, TS lo rechaza antes de correr.

📄 `types/index.ts` (barrel — re-exporta para imports cortos):

```ts
export * from "./omnipizza";
```

📄 `data/markets.json`:

```json
[
  { "code": "MX", "fullName": "Juan Pérez",  "country": "México",        "currency": "MXN" },
  { "code": "US", "fullName": "John Smith",  "country": "United States", "currency": "USD" },
  { "code": "CH", "fullName": "Hans Müller", "country": "Switzerland",   "currency": "CHF" },
  { "code": "JP", "fullName": "Yuki Tanaka", "country": "Japan",         "currency": "JPY" },
  { "code": "SA", "fullName": "Abdullah Al-Rashid", "country": "Saudi Arabia", "currency": "SAR" }
]
```

📄 `data/users.json` (las 5 personas reales de OmniPizza, todas `role: "customer"`):

```json
[
  { "username": "standard_user",            "password": "pizza123", "role": "customer", "description": "Usuario estándar para flujos happy path" },
  { "username": "locked_out_user",          "password": "pizza123", "role": "customer", "description": "Usuario bloqueado — el login falla con 'Invalid credentials' (útil para login negativo)" },
  { "username": "problem_user",             "password": "pizza123", "role": "customer", "description": "Usuario que autentica pero con bugs visuales intencionales" },
  { "username": "performance_glitch_user",  "password": "pizza123", "role": "customer", "description": "Usuario que autentica pero tarda 3-6× más en cargar — prueba de timeouts" },
  { "username": "error_user",               "password": "pizza123", "role": "customer", "description": "Usuario que autentica pero dispara errores en acciones específicas" }
]
```

**No hay rol admin en OmniPizza:** las 5 personas comparten `role: "customer"` y se diferencian por **comportamiento de login** (estilo SauceDemo), no por privilegios. El smoke de M03 usa `standard_user` (el único que llega limpio a `/catalog`).

**Verifica el tipado** ANTES de seguir:

```bash
pnpm exec tsc --noEmit
# Sin output = los tipos del .d.ts cuadran con el JSON.
```

---

### Paso 3 — Config y scripts (estado al terminar M03)

> **📐 Config — cambios vs M02**
> ```diff
> # playwright.config.ts — SIN CAMBIOS vs M02
> # (M03 añade DATOS tipados, no configuración del runner)
> ```
> **Se mantiene:** todo (dotenv, baseURL, timeouts, project `ui-anon`). **Entra:** nada en el config — el incremental de M03 vive en `data/` y `types/`, no en `playwright.config.ts`. El único ajuste relacionado es el `include` de `tsconfig.json`, que **crece** para que TS vea `types/`.

**M03 no requiere cambios al config** — sigue el mismo de M01/M02. Solo asegúrate de que `tsconfig.json` incluya los archivos nuevos.

Abre tu `tsconfig.json` y verifica que la sección `include` contemple `types/`:

```json
{
  "include": [
    "playwright.config.ts",
    "types/**/*.ts",
    "types/**/*.d.ts",
    "tests/**/*.ts"
  ]
}
```

Si te faltan las entradas de `types/`, **añádelas** — sin ellas, los imports `import type { Market } from "../types"` van a fallar. (En M02 el `include` sólo tenía `playwright.config.ts` + `tests/`.)

Tu `playwright.config.ts` debe seguir viéndose como al final de M02:

```ts
// playwright.config.ts — Estado en M03 (igual que M02)
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

El `package.json` de este proyecto trae el atajo `m3` (equivale a `pnpm test`, ya que el único project es `ui-anon`):

```json
"scripts": {
  "m3": "playwright test --project=ui-anon"
}
```

Sigue siendo un solo project **anónimo** `ui-anon`: M03 también es login por UI. El project autenticado con `storageState` llega con el setup de **M06**.

---

### Paso 4 — Inspeccionar el contrato (`types/omnipizza.d.ts`)

Abre `types/omnipizza.d.ts` en el editor. Vas a ver `interface User`, `interface Market` y `interface Pizza`. Estos son los **contratos** que el JSON debe cumplir.

Pregúntate: *"si el JSON tuviera un campo `username` con un número en vez de string, ¿qué pasaría?"* — respuesta: **TypeScript falla en compile-time**, antes de correr el test. El `.d.ts` dice qué campos y tipos debe tener cada objeto; el JSON es la implementación que los rellena.

---

### Paso 5 — Inspeccionar la data (`data/markets.json` y `data/users.json`)

```bash
cat data/markets.json
cat data/users.json
```

Cosas a observar:

- `markets.json` tiene **5 entradas**: MX, US, CH, JP, SA. Cada una con `code`, `fullName`, `country`, `currency`.
- `users.json` lista las **5 personas** de OmniPizza (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`), todas con `role: "customer"`. Vamos a usar `standard_user`.
- Los valores de `code` y `currency` están restringidos por **union types** en `types/omnipizza.d.ts` (`"MX" | "US" | "CH" | "JP"`). Si añades `"CA"` sin ampliar el union, TS rechaza el cambio — exactamente el mecanismo que protege el reto.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** `pnpm m3`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@smoke"`) o por archivo (`pnpm exec playwright test tests/reto.spec.ts`)
- **Verificar tipos:** `pnpm typecheck`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm m3` (no `VAR=x pnpm m3`, sintaxis bash que falla en PowerShell)

---

## Outcome esperado

- [ ] Entiendes una `interface` como **contrato** que el JSON debe cumplir, y los **union / literal types** que acotan los valores legales.
- [ ] Sabes usar `import type` para traer sólo la forma (borrada en runtime).
- [ ] Entiendes el patrón **data-driven**: un `for...of` que **registra** un `test()` por dato (no `test.each()`, que Playwright no tiene).
- [ ] Puedes leer `markets.json` y explicar cómo el test lo consume tipado (`as Market[]`).
- [ ] Entiendes `Partial<Record<Currency, string>>` y por qué justifica la **guard clause** (`if (!symbol) return;`).
- [ ] Sabes añadir otro mercado **sin tocar el spec** (sólo JSON + union types).
- [ ] `pnpm typecheck` queda en verde tras ampliar los union types.
- [ ] Reconoces por qué `toHaveURL` usa regex (match parcial robusto) y no un string.
