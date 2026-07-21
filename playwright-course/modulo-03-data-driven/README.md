# Módulo 03 — Data-driven testing

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** `types/omnipizza.d.ts` + `data/users.json` + `data/markets.json`. El smoke de M02 se parametriza con un **bucle `for...of` que registra un `test()` por mercado** contra los 5 mercados.

---

> 🎁 **Proyecto de referencia — [`proyecto/`](proyecto/).** Este módulo trae una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado final de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del resto del curso). Es la **solución de referencia** para comparar: entra en ella y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Este README enseña el **porqué** de cada pieza y apunta al `proyecto/` para correrlo. Detalles en [`proyecto/README.md`](proyecto/README.md).

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
│       │   └── omnipizza.d.ts     ← 🆕 User, Market, Currency, CountryCode
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
| `interface Pizza/LoginResponse/PizzasResponse/OrderPayload/Order/ApiError` | M07 | contratos de request/response — `types/omnipizza.d.ts` **se amplía** ahí, no aquí |
| `.github/workflows/` (uso real) | M08 | CI/CD |

> 💡 **Para el facilitador:** abre `types/omnipizza.d.ts` y `data/markets.json` lado a lado y dibuja la flecha con el dedo: **el `.d.ts` describe lo que `.json` debe contener**. Si rompes el contrato (typo, campo faltante), TS lo detecta antes de correr.

---

## Analogía de apertura

Un tester manual siempre trae consigo una **hoja de datos de prueba** (usuarios, ambientes, mercados). En este módulo construimos esa hoja como **JSON tipado** y la conectamos al TC con un **bucle `for...of`** que **registra un `test()` por cada fila de datos** — un mismo caso de prueba ejecutado con N sets distintos, como una matriz de regresión.

> ⚠️ **Ojo con `test.each()`:** si vienes de Jest o Vitest, ahí existe `test.each()` para parametrizar. **Playwright NO lo tiene.** En Playwright parametrizas con un `for` normal de JavaScript que recorre el array y llama a `test()` adentro — cada vuelta del bucle **registra** un caso independiente. No es magia del runner: es un `for` y un `test()`.

---

## ¿Qué aprenderás?

1. **`interface` como contrato:** User, Market — fallan en compile-time si el JSON no cumple.
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

**Regla del curso (coherente con "siente el dolor primero"):** no agregues `.env.qa` / `.env.staging` hasta que tengas un **segundo ambiente real**. Antes de eso es arquitectura especulativa. **Para M03 NO toques tu config** — sigue idéntico a M02. Lo que viene a continuación es **ilustrativo y opcional**: enseña *cómo se vería* la implementación el día que la necesites, para que la semilla no quede en el aire.

### Implementación real (opcional — sólo cuando exista un 2º ambiente)

El truco es cargar `dotenv` **dos veces**: primero el `.env` base (defaults), luego el `.env.<ambiente>` con `override: true` para que **gane** sobre los defaults. La selección del ambiente sale de una variable `TEST_ENV` (con default `"qa"`):

```ts
// playwright.config.ts — patrón base + override (NO lo apliques hasta tener staging real)
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

> 🪟 **No usamos `cross-env`.** En PowerShell la sintaxis nativa `$env:VAR="x"; comando` ya hace el trabajo; `cross-env` añade una dependencia que el curso evita. (La sintaxis bash `TEST_ENV=staging pnpm m3` **falla** en PowerShell — ver `▶️ Cómo ejecutar`.)

**Reconciliación con M08:** este patrón es el mismo que verás en M08 (CI), pero allí deja de ser opcional: el pipeline de CI corre contra varios ambientes y, además, **no usa archivos `.env`** — GitHub Actions inyecta las variables vía `secrets.*` directo en `process.env` (que, como viste arriba, mandan sobre cualquier archivo). En M03 esto es una semilla; en M08 es necesidad operativa.

> 💡 **Para el facilitador:** lanza la pregunta *"¿qué tocarías para correr el mismo smoke contra staging?"* y deja que el grupo lo razone. La respuesta NO es "duplicar specs" — es "cambiar de qué archivo sale `BASE_URL`". Fíjate que `playwright.config.ts` **ya está listo**: `baseURL: process.env.BASE_URL ?? ...` no cambiaría ni una línea con el patrón de arriba. Eso refuerza el mismo principio del módulo: **el dato vive fuera del código; el código solo lo consume.**

---

## Paso a paso

> **Cómo leer esta sección.** Cada paso grande se parte en **micro-pasos `N.M`** con la tripleta **Qué hago / Por qué / Cómo verifico**. Sigue el orden: los archivos se crean en la secuencia exacta en que el flujo los necesita. El "Cómo verifico" siempre es algo **ejecutable u observable** (un comando, una señal en el editor, un verde en el reporte).

### Paso 0 — Pre-requisitos

**0.1 — Confirma la base y entra al proyecto de M03**
- **Qué hago:** entro al proyecto autocontenido de este módulo y preparo el entorno.
  ```bash
  cd proyecto
  pnpm install
  pnpm install:browsers
  cp .env.example .env
  ```
- **Por qué:** M03 **no** vuelve a montar dotenv ni el primer login contra OmniPizza; asume esa base (M01) y la disciplina de locators (M02). El incremental de M03 es el **dato tipado**.
- **Cómo verifico:** `pnpm typecheck` termina en verde y `ls .env` no da "No such file".

> 💡 **Para el facilitador:** este módulo asume que `dotenv`, `.env` y la primera ejecución contra OmniPizza ya están resueltos. Si alguien todavía no tiene `.env`, mándalo al **Paso 1 y 2 de M01** antes de continuar.

---

### Paso 1 — Dependencias requeridas

**1.1 — Verifica que no falta nada (M03 no añade paquetes)**
- **Qué hago:** listo los paquetes que M03 reutiliza de los módulos anteriores.
  ```bash
  pnpm list @playwright/test dotenv typescript @types/node
  ```
- **Por qué:** **M03 no instala dependencias nuevas.** El incremental de este módulo es **datos tipados**, no herramientas. Confirmar evita "instalar por las dudas".
- **Cómo verifico:** los 4 paquetes aparecen con versión. Si falta alguno, corre `pnpm install`.

---

### Paso 2 — Crear `types/` y `data/` (carpetas nuevas)

Este paso construye las **dos carpetas nuevas** de la arquitectura. Orden: primero los contratos (`types/`), luego los datos (`data/`) que esos contratos validan.

**2.1 — Crea las carpetas y los archivos vacíos**
- **Qué hago:** creo `types/` y `data/`, y abro cada archivo nuevo en VS Code (se crea en disco al guardarlo).
  ```bash
  mkdir types
  mkdir data
  code types/omnipizza.d.ts
  code types/index.ts
  code data/markets.json
  code data/users.json
  ```
- **Por qué:** separar **contrato** (`types/`) de **dato** (`data/`) es la decisión central del módulo: el `.d.ts` describe la forma; el `.json` la rellena. Quien los mezcla pierde la red de seguridad de TS.
- **Cómo verifico:** las 4 pestañas quedan abiertas en VS Code; tras guardarlas, `ls types` y `ls data` muestran los 4 archivos.

**2.2 — Escribe el contrato del dominio (`types/omnipizza.d.ts`)**
- **Qué hago:** defino los union types y las `interface` del dominio.
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
  ```
- **Por qué:** una `interface` es el **contrato** que el JSON debe cumplir; los **union types** acotan los valores legales (un `code` solo puede ser uno de esos 4, un `role` solo puede ser `"customer"`). Juntos, atrapan typos en compile-time en vez de en runtime.
- **Cómo verifico:** el editor no subraya en rojo el archivo; los `export` aparecen en el autocompletado al importar desde otro archivo.

> 🔷 **TypeScript — `interface`**
> Una `interface` describe la **forma** de un objeto (qué campos tiene y de qué tipo), sin generar código en runtime: es puro contrato de compilación. La alternativa obvia —no tipar nada y confiar en el JSON— te deja descubrir el campo faltante recién cuando el test revienta.
> 📚 Lo viste en [TS · M06 — interfaces](../../typescript-qa-course/modulo-06-interfaces/). Aquí lo aplicas a `User` y `Market`: el contrato que valida `data/*.json`.

> 🔷 **TypeScript — union / literal types (`"MX" | "US" | …`)**
> Un *literal type* es un valor concreto usado como tipo; un *union* los encadena con `|`. `CountryCode = "MX" | "US" | "CH" | "JP" | "SA"` significa "solo estos 5 strings son válidos" — más estricto que `string`, que aceptaría `"MNX"` o `""` sin chistar.
> 📚 Lo viste en [TS · M04 — objects & types](../../typescript-qa-course/modulo-04-objects-types/). Aquí lo aplicas a `code` y `currency`: si añades un mercado con un código fuera del union, TS lo rechaza antes de correr.

**2.3 — Crea el barrel (`types/index.ts`)**
- **Qué hago:** re-exporto todo el dominio desde un único punto de entrada.
  ```ts
  export * from "./omnipizza";
  ```
- **Por qué:** el barrel permite imports cortos y estables (`from "../types"` en vez de `from "../types/omnipizza"`). Si mañana parto el dominio en varios `.d.ts`, los specs no cambian un solo import.
- **Cómo verifico:** desde un spec, `import type { Market } from "../types"` autocompleta `Market`.

**2.4 — Rellena los datasets (`data/markets.json`, `data/users.json`)**
- **Qué hago:** escribo los 5 mercados y los usuarios.
  ```json
  // data/markets.json — fullName es la PERSONA representante del mercado; country es el país
  [
    { "code": "MX", "fullName": "Juan Pérez",  "country": "México",        "currency": "MXN" },
    { "code": "US", "fullName": "John Doe",    "country": "United States", "currency": "USD" },
    { "code": "CH", "fullName": "Hans Müller", "country": "Switzerland",   "currency": "CHF" },
    { "code": "JP", "fullName": "Taro Yamada", "country": "Japan",         "currency": "JPY" },
    { "code": "SA", "fullName": "Abdullah Al-Rashid", "country": "Saudi Arabia", "currency": "SAR" }
  ]
  ```
  ```json
  // data/users.json — las 5 personas reales de OmniPizza (todas role "customer")
  [
    { "username": "standard_user",            "password": "pizza123", "role": "customer", "description": "Usuario estándar para flujos happy path" },
    { "username": "locked_out_user",          "password": "pizza123", "role": "customer", "description": "Usuario bloqueado — el login falla con 'Invalid credentials' (útil para login negativo)" },
    { "username": "problem_user",             "password": "pizza123", "role": "customer", "description": "Usuario que autentica pero con bugs visuales intencionales" },
    { "username": "performance_glitch_user",  "password": "pizza123", "role": "customer", "description": "Usuario que autentica pero tarda 3-6× más en cargar — prueba de timeouts" },
    { "username": "error_user",               "password": "pizza123", "role": "customer", "description": "Usuario que autentica pero dispara errores en acciones específicas" }
  ]
  ```
- **Por qué:** el dato vive **fuera del código**. Mañana QA puede agregar un mercado tocando solo el JSON; el spec ni se entera. **No hay rol admin en OmniPizza:** las 5 personas comparten `role: "customer"` y se diferencian por **comportamiento de login** (estilo SauceDemo), no por privilegios. Las credenciales (`standard_user` / `pizza123`) son las verificadas; el smoke de M03 usa `standard_user` (el único que llega limpio a `/catalog`).
- **Cómo verifico:** `cat data/markets.json` muestra 5 entradas; el JSON es válido (sin comas colgantes ni comillas faltantes).

**2.5 — Verifica el tipado ANTES de seguir**
- **Qué hago:** corro el chequeo de tipos del proyecto.
  ```bash
  pnpm exec tsc --noEmit
  # Sin output = los tipos del .d.ts cuadran con lo que el código consume.
  ```
- **Por qué:** este es el "verde" que prueba que contrato y consumo encajan. Validarlo aquí evita arrastrar un error de tipos hasta la ejecución del test.
- **Cómo verifico:** el comando termina sin output ni código de error.

> 💡 **Para el facilitador:** si el alumno escribe `"code": "MNX"` y el spec lo consume como `Market[]` "estrechado" (no con `as`), `tsc --noEmit` falla con `Type '"MNX"' is not assignable to type 'CountryCode'`. Provoca el typo a propósito para mostrar el error en vivo (con el `as Market[]` actual el cast lo enmascara — buen momento para explicar la diferencia entre *assertion* y *validación*; está desglosada en el recuadro 🔷 de arrays tipados del Paso 7).

---

### Paso 3 — Config y scripts (estado al terminar M03)

> **📐 Config — cambios vs M02**
> ```diff
> # playwright.config.ts — SIN CAMBIOS vs M02
> # (M03 añade DATOS tipados, no configuración del runner)
> ```
> **Se mantiene:** todo (dotenv, baseURL, timeouts, un solo project `ui-anon`). **Entra:** nada en el config — el incremental de M03 vive en `data/` y `types/`, no en `playwright.config.ts`. El único ajuste relacionado es el `include` de `tsconfig.json`, que **crece** para que TS vea `types/`.

**3.1 — Amplía el `include` de `tsconfig.json` para que vea `types/`**
- **Qué hago:** abro `tsconfig.json` y confirmo que `include` contemple los archivos de `types/`.
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
- **Por qué:** sin estas entradas, TS no "ve" el `.d.ts` y los imports `import type { Market } from "../types"` fallan. Es el único ajuste de infraestructura que M03 necesita (en M02 el `include` sólo tenía `playwright.config.ts` + `tests/`).
- **Cómo verifico:** `pnpm exec tsc --noEmit` sigue en verde y el editor resuelve el import sin marcarlo en rojo.

**3.2 — Confirma que `playwright.config.ts` NO cambia respecto a M02**
- **Qué hago:** comparo mi config con el estado de M02 (no debe haber diferencias).
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
- **Por qué:** M03 añade **datos**, no configuración del runner. Si tu config difiere de M02, algo se coló de otro módulo. (Sigue siendo un solo project **anónimo** `ui-anon`: M03 también es login por UI. El project autenticado con `storageState` llega con el setup de M06.)
- **Cómo verifico:** un diff mental contra M02 da cero cambios; `pnpm test` arranca sin errores de config.

**3.3 — El script `m3` del proyecto**
- **Qué hago:** reviso el atajo del módulo en `package.json`.
  ```json
  "scripts": {
    "m3": "playwright test --project=ui-anon"
  }
  ```
- **Por qué:** `pnpm m3` es azúcar sintáctica dentro del proyecto — equivale a `pnpm exec playwright test --project=ui-anon`. `pnpm test` corre exactamente lo mismo (el único project es `ui-anon`).
- **Cómo verifico:** `pnpm m3 --list` lista los tests del módulo sin error de "script not found".

---

### Paso 4 — Inspeccionar el contrato (`types/omnipizza.d.ts`)

**4.1 — Lee el `.d.ts` como contrato, no como código**
- **Qué hago:** abro `types/omnipizza.d.ts` y reviso `interface User` e `interface Market`.
- **Por qué:** fijar la idea **contrato vs implementación**: el `.d.ts` dice qué campos y tipos debe tener cada objeto; el JSON es la implementación que los rellena. Si el JSON pone un número donde el contrato pide `string`, TS falla en compile-time.
- **Cómo verifico:** puedo señalar, campo por campo, qué entrada del JSON corresponde a cada propiedad de la interface.

> 💡 **Para el facilitador:** abre `types/omnipizza.d.ts` y `data/users.json` lado a lado y muestra el mapeo campo a campo. Pregunta inversa: *"si `username` fuera un número, ¿cuándo se entera el equipo?"* — respuesta: en compile-time, no en producción.

---

### Paso 5 — Inspeccionar la data (`data/markets.json` y `data/users.json`)

**5.1 — Lee los datasets y conéctalos al union type**
- **Qué hago:** imprimo ambos JSON y los confronto con los union types del `.d.ts`.
  ```bash
  cat data/markets.json
  cat data/users.json
  ```
- **Por qué:** entender que los valores de `code` y `currency` **no son libres**: están acotados por el union (`"MX" | "US" | "CH" | "JP"`). Si añades `"CA"` sin ampliar el union, TS rechaza el cambio — exactamente el mecanismo que protege el reto.
- **Cómo verifico:** `markets.json` tiene 5 entradas (MX/US/CH/JP/SA) con `code`/`fullName`/`country`/`currency`; `users.json` lista las 5 personas (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`), todas con `role: "customer"`.

---

### Paso 6 — Ejecutar el ejemplo

**6.1 — Corre el smoke parametrizado**
- **Qué hago:** ejecuto el módulo, idealmente en UI mode la primera vez.
  ```bash
  pnpm test        # headless — 5 mercados de un solo TC
  pnpm test:ui     # UI mode — RECOMENDADO la 1ª vez
  ```
- **Por qué:** ver con tus ojos que **un solo `test()` se registró 5 veces** (uno por mercado) cierra el concepto data-driven. No son 5 tests copy/pasteados: es un `for` que llamó a `test()` cinco veces.
- **Cómo verifico:** la terminal muestra **5 tests** verdes — `TC-MX`, `TC-US`, `TC-CH`, `TC-JP`, `TC-SA` (suelen tardar ~30-40s la 1ª vez por el cold start de Render). En UI mode los 5 cuelgan del mismo describe.

> 💡 **Para el facilitador:** tras la primera corrida abre `pnpm exec playwright show-report` y muestra los 5 títulos distintos generados por el mismo `test()`. Recalca: **Playwright NO tiene `test.each()`** — esos 5 casos los registró un `for` de JavaScript.

---

### Paso 7 — Lectura guiada del `for...of` data-driven

**7.1 — Identifica las 4 piezas del patrón en `ejemplo.spec.ts`**
- **Qué hago:** abro `ejemplo.spec.ts` y localizo, en este orden: (1) los imports tipados, (2) el bucle, (3) el título dinámico, (4) la validación por mercado y el CSS selector.
  ```ts
  import type { Market, User, Currency } from "../types";
  import marketsJson from "../data/markets.json";

  const markets = marketsJson as Market[];

  for (const market of markets) {
    test(`TC-${market.code} — login + catalog in market ${market.code} @smoke`, async ({ page }) => {
      // ...login, navegación al catálogo, validación de currency...
      const symbol = currencySymbol[market.currency];
      if (!symbol) return; // guard clause / fast return
      await expect(page.locator("body")).toContainText(symbol);
    });
  }
  ```
- **Por qué:** el `for...of` recorre el array y **registra** un `test()` por elemento (no un test que itera por dentro). El título lleva `${market.code}` porque Playwright exige títulos únicos dentro del mismo describe. El CSS `[data-testid^="pizza-card-"]` baja al nivel 4 de la jerarquía a propósito: los testids son dinámicos.
- **Cómo verifico:** puedo explicar en voz alta por qué hay 5 tests y no 1; por qué el título cambia en cada vuelta; y por qué `toHaveURL` usa regex y no string.

> 🔍 **Detalle que parece obvio — `await expect(page).toHaveURL(/\/catalog/)`**
> **Qué es:** (en el bloque de navegación al catálogo) el argumento entre `/.../` es una **expresión regular** (regex), **no** un string, y eso es deliberado. Un regex hace *match parcial*: la aserción pasa si la URL **contiene/matchea** `/catalog` en cualquier parte. Un string, en cambio, exige que la URL sea **exactamente** ese valor.
> **Por qué así (y no la alternativa obvia):** OmniPizza puede añadir cosas a la URL del catálogo —querystring (`?locale=`), ids, el locale dentro del path (`/mx/catalog`) o un slash final— y el regex tolera todo eso. El `\/` escapa la barra `/` porque en un literal regex de JS la `/` es el **delimitador** que abre y cierra la expresión; sin escaparla, el motor creería que el regex terminó ahí.
> **Qué pasa si lo cambias:** si pones el string `"/catalog"`, Playwright lo **resuelve contra `baseURL` con `new URL("/catalog", baseURL)`** y compara por **IGUALDAD exacta** de la URL resultante. Como la URL real es algo como `https://.../catalog?...` (o `/mx/catalog`), nunca será literalmente `https://.../catalog` y el test **truena** con un timeout de aserción. Por eso aquí el regex (parcial, robusto) gana al string (igualdad, frágil).

> 🔍 **Detalle que parece obvio — `` test(`TC-${market.code} — login + catalog in market ${market.code} @smoke`, ...) ``**
> **Qué es:** el título del test es un *template string* que interpola `market.code` en cada vuelta del `for...of` — eso garantiza `TC-MX`, `TC-US`, `TC-CH`, `TC-JP`, `TC-SA`: nombres distintos y legibles en el reporte (la regla de títulos únicos ya la viste en el "Por qué").
> **Por qué así (y no la alternativa obvia):** además, el tag `@smoke` va **embebido en el título** a propósito: es lo que permite filtrar con `--grep @smoke` (el atajo `pnpm test:smoke`).
> **Qué pasa si lo cambias:** si pones un título fijo (`"TC catálogo"`) para los 5, tendrás títulos duplicados — confusos en el reporte y difíciles de aislar con `--grep` o `-g "TC-MX"`. Si quitas `@smoke`, el caso deja de aparecer en `pnpm test:smoke`.

> 🔍 **Detalle que parece obvio — `page.locator('[data-testid^="pizza-card-"]')`**
> **Qué es:** un CSS selector con el operador de atributo `^=`, que significa **"el atributo empieza con"**. Aquí matchea cualquier elemento cuyo `data-testid` arranque con `pizza-card-`.
> **Por qué así (y no la alternativa obvia):** los testids completos son dinámicos (`pizza-card-123`, `pizza-card-456`...), así que un `getByTestId("pizza-card-123")` con id fijo solo encontraría una pizza concreta (frágil) o ninguna. Bajar al nivel 4 es legítimo justamente por eso (la jerarquía de locators la viste en M02) — no es deuda técnica: es la herramienta correcta para testids variables.
> **Qué pasa si lo cambias:** si usas `=` en vez de `^=` (`[data-testid="pizza-card-"]`), exiges igualdad exacta y no matcheas **ninguna** tarjeta.

> 🔍 **Detalle que parece obvio — `const allCards = await pizzaCards.all()`**
> **Qué es:** `.all()` devuelve `Promise<Locator[]>` — **materializa** la lista: consulta el DOM *ahora* y te entrega un array fijo de locators. Por eso lleva `await`.
> **Por qué así (y no la alternativa obvia):** comparado con `pizzaCards.first()`, que **no** necesita `await` porque devuelve un `Locator` perezoso (lazy) — un puntero que recién resuelve el DOM cuando lo usas en una acción o aserción. `.all()` rompe esa pereza a propósito: necesitas el array concreto para iterarlo y contar (`allCards.length`).
> **Qué pasa si lo cambias:** si omites el `await`, `allCards` queda como una `Promise`, no como array; `allCards.length` da `undefined` y el `for...of` no itera nada (o falla). Si en cambio creías que `.first()` necesita `await` y lo agregas, no rompe pero es ruido — el locator es perezoso por diseño.

> 🔷 **TypeScript — `import type`**
> `import type { Market }` trae **solo la forma** (el tipo), no código ejecutable: el compilador la borra del bundle final. La alternativa `import { Market }` (sin `type`) también compila, pero arrastra una dependencia de valor innecesaria y puede crear ciclos de import en proyectos grandes.
> 📚 Lo viste en [TS · M06 — interfaces](../../typescript-qa-course/modulo-06-interfaces/). Aquí lo aplicas a `Market`, `User` y `Currency`: contratos que solo existen en compile-time.

> 🔷 **TypeScript — arrays tipados (`Market[]` / `User[]`)**
> `Type[]` significa "array cuyos elementos son `Type`". `marketsJson as Market[]` le dice a TS "trata este JSON como una lista de `Market`", lo que te da autocompletado de `market.code`/`market.currency` dentro del `for...of` — importar un `.json` a secas te da un tipo inferido amplio (y a veces `any`, según la config). Si quitas el `as Market[]`, vuelves a ese tipo inferido (o `any`) y pierdes el autocompletado y el chequeo.
> ⚠️ **Ojo: `as` es una *type assertion*, no una validación.** Es una promesa que haces tú; en runtime **nadie** revisa que el JSON realmente cumpla el contrato — un JSON con datos basura compilaría igual. El contrato real lo defiende `types/omnipizza.d.ts` vía `tsc`, no este cast.
> 📚 Lo viste en [TS · M02 — types](../../typescript-qa-course/modulo-02-types/). Aquí lo aplicas al array que alimenta el bucle data-driven.

> 🔷 **TypeScript — `for...of` para iterar**
> `for (const x of array)` recorre los **valores** del array (no los índices, que sería `for...in`). En este módulo lo usas en dos niveles: para **registrar** un `test()` por mercado, y dentro del test para **recorrer** las tarjetas de pizza — ahí `for...of` **serializa** los `await`: espera a que termine la aserción de una tarjeta antes de pasar a la siguiente.
> La alternativa "obvia" `allCards.forEach(async …)` **no espera** los `await` internos: `forEach` ignora el valor de retorno del callback, así que las promesas se pierden, el test sigue de largo y las aserciones se disparan en paralelo sin que nadie las espere — un fallo puede explotar **después** de que el test ya terminó (unhandled rejection) y obtienes falsos verdes. Cuando hay `await` dentro, lo correcto es `for...of` (o `Promise.all` si quieres paralelismo controlado).
> 📚 Es construcción base de JavaScript/TypeScript (lo usaste desde [TS · M03 — functions](../../typescript-qa-course/modulo-03-functions/)). Aquí es el motor de la parametrización: un `for` reemplaza al inexistente `test.each()`.

> 🔷 **TypeScript — ternario / guard clause (`if (!symbol) return;`)**
> El *fast return* (o guard clause) sale temprano cuando no hay nada que hacer, en vez de anidar `if/else`. Aquí `const symbol = currencySymbol[market.currency]` es `string | undefined` (por el `Partial`), y TS te **obliga** a manejar el `undefined`: `if (!symbol) return;` cierra el caso y deja el código plano.
> 📚 Lo viste en [TS · M03 — functions](../../typescript-qa-course/modulo-03-functions/) (control de flujo y `return`). Aquí lo aplicas a la validación de currency por mercado.

---

### Paso 8 — Resolver el reto (TODOs propios — no se resuelve aquí)

**8.1 — Añade el 6º mercado (Canadá) SIN tocar el spec**
- **Qué hago:** abro `reto.spec.ts` y, **sin editar el spec**, toco solo dos archivos: añado Canadá al JSON y amplío los union types (SA ya es el 5º mercado del base; tú sumas CA como 6º).
  ```json
  // data/markets.json — añadir al final del array
  // (fullName = PERSONA representante del mercado; country = país)
  { "code": "CA", "fullName": "Emily Tremblay", "country": "Canada", "currency": "CAD" }
  ```
  ```ts
  // types/omnipizza.d.ts — ampliar ambos union (SA ya está; sumas CA)
  export type CountryCode = "MX" | "US" | "CH" | "JP" | "SA" | "CA";
  export type Currency    = "MXN" | "USD" | "CHF" | "JPY" | "SAR" | "CAD";
  ```
- **Por qué:** es la prueba de fuego del data-driven: si la parametrización está bien hecha, un mercado nuevo aparece como un test extra **sin escribir ni una línea de spec**. Los TODOs (`TODO 1..4`) del reto siguen siendo tuyos — el README **no** los resuelve.
- **Cómo verifico:**
  ```bash
  pnpm typecheck                                        # verde tras ampliar los union
  pnpm exec playwright test tests/reto.spec.ts --list   # debe listar 6 tests
  ```

> 💡 **Para el facilitador:** si `typecheck` se queja con `Type '"CA"' is not assignable to type 'CountryCode'`, es señal de que aún no ampliaron el `.d.ts`. Ese error es la lección: el union type es la red de seguridad.

---

### Paso 9 — Versiona tu trabajo (Git JIT)

**9.1 — Commitea el incremento de M03**
- **Qué hago:** agrego solo lo que cambió en este módulo y lo commiteo con un mensaje convencional.
  ```bash
  git add .
  git commit -m "feat(m03): data-driven con JSON tipado"
  ```
- **Por qué:** M03 introduce dos carpetas reusables (`types/`, `data/`) más el spec del módulo. Versionarlas en un commit atómico deja un punto de retorno limpio **antes** de que M04 empiece a refactorizar hacia POM. (Aquí Git es JIT: commit al cerrar; las ramas y el push llegan en M04/M05, cuando el flujo los pida.)
- **Cómo verifico:**
  ```bash
  git log --oneline -1        # muestra el commit feat(m03) recién creado
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

- **Comando del módulo:** `pnpm test` (o `pnpm m3`, el atajo que el proyecto define)
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@smoke"`) o por archivo (`pnpm exec playwright test tests/reto.spec.ts`)
- **Verificar tipos:** `pnpm typecheck`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm test` (no `VAR=x pnpm test`, sintaxis bash que falla en PowerShell)

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
