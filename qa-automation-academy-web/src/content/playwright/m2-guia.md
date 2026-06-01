# M02 · Guía del módulo: Locators + Data tipada

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

---

## Paso a paso (setup)

### Paso 0 — Pre-requisitos

Antes de empezar verifica que **M01 quedó funcional**:

```bash
# Estando en playwright-course/
pnpm m1            # debe pasar TC-001 y TC-002 en verde
ls .env            # debe existir (dotenv lo necesita)
ls node_modules    # debe existir (pnpm install corrió)
```

Si M01 no corre, vuelve al módulo anterior — no avances sin esa base.

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

Pregúntate: *"si el JSON tuviera un campo `username` con un número en vez de string, ¿qué pasaría?"* — respuesta: **TypeScript falla en compile-time**, antes de correr el test.

---

### Paso 5 — Inspeccionar la data (`data/markets.json` y `data/users.json`)

```bash
cat data/markets.json
cat data/users.json
```

Cosas a observar:

- `markets.json` tiene **4 entradas**: MX, US, CH, JP. Cada una con `code`, `fullName`, `currency`.
- `users.json` tiene varios usuarios. Vamos a usar `standard_user`.
- Los valores de `code` y `currency` están restringidos por **union types** en `types/omnipizza.d.ts` (`"MX" | "US" | "CH" | "JP"`). Si añades `"CA"` sin ampliar el union, TS rechaza el cambio.

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
