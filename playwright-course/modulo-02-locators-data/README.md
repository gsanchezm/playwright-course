# Módulo 02 — Locators + Data tipada

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** `types/omnipizza.d.ts` + `data/users.json` + `data/markets.json`. El smoke de M01 se parametriza con un **bucle `for...of` que registra un `test()` por mercado** contra los 4 mercados.

---

> 🎁 **Proyecto de referencia — [`proyecto/`](proyecto/).** Este módulo trae una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado final de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del monorepo del curso). Es la **solución de referencia** para comparar: ábrela aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de este README siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto". Detalles en [`proyecto/README.md`](proyecto/README.md).

## 🏗️ Arquitectura al terminar este módulo

Aparecen **dos carpetas nuevas**: `data/` (los datasets) y `types/` (los contratos que validan esos datasets). El JSON deja de ser "string suelto" y pasa a ser **dato tipado**.

```
playwright-course/
├── data/                          ← 🆕 datasets de prueba
│   ├── markets.json               ← 🆕 MX / US / CH / JP (code, fullName, currency)
│   └── users.json                 ← 🆕 5 personas reales: standard_user, locked_out_user, problem_user, performance_glitch_user, error_user
├── types/                         ← 🆕 contratos del dominio
│   ├── index.ts                   ← 🆕 barrel: re-exporta lo de omnipizza
│   └── omnipizza.d.ts             ← 🆕 User, Market, Pizza, Currency, CountryCode
├── modulo-01-smoke-feo/           ← (sin cambios)
├── modulo-02-locators-data/       ← 🆕 ESTE MÓDULO
│   ├── README.md
│   ├── ejemplo.spec.ts            ← 🆕 for...of por mercado + lookup map
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

Un tester manual siempre trae consigo una **hoja de datos de prueba** (usuarios, ambientes, mercados). En este módulo construimos esa hoja como **JSON tipado** y la conectamos al TC con un **bucle `for...of`** que **registra un `test()` por cada fila de datos** — un mismo caso de prueba ejecutado con N sets distintos, como una matriz de regresión.

> ⚠️ **Ojo con `test.each()`:** si vienes de Jest o Vitest, ahí existe `test.each()` para parametrizar. **Playwright NO lo tiene.** En Playwright parametrizas con un `for` normal de JavaScript que recorre el array y llama a `test()` adentro — cada vuelta del bucle **registra** un caso independiente. No es magia del runner: es un `for` y un `test()`.

---

## ¿Qué aprenderás?

1. **Jerarquía de locators** con criterios de cuándo bajar nivel — y por qué `getByRole` es preferencia, no ley (caso real: el login de OmniPizza).
2. **Filtros y combinadores:** `.filter({ hasText })`, `.nth()`, `.first()`, `.and()`, `.or()`, `getByRole(...).filter(...)` y **scoping** dentro de una card para botones icon-only.
3. **Codegen** (`pnpm exec playwright codegen`) como herramienta para **descubrir** locators role-first.
4. **Iterar locators** con `for...of` para recorrer listas reales (pizzas del catálogo).
5. **`interface` como contrato:** User, Market, Pizza — fallan en compile-time si el JSON no cumple.
6. **Data-driven con `for...of` + `test()`** — registrar N casos desde un array de datos (el patrón que en Jest/Vitest harías con `test.each`, aquí es un `for`).
7. **`import type`** — traer sólo la forma, no el código.

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

Esta es la lección que ningún tutorial de juguete te da: **la misma app puede ser un paraíso de `getByRole` en una pantalla y un pantano en otra.** OmniPizza lo demuestra. (Todos estos selectores están verificados contra el DOM real y viven como chuleta ejecutable en el `test.skip` de `ejemplo.spec.ts`, Paso 8.)

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

Un `getByRole("heading", { level: 3 })` en el catálogo matchea **todas** las pizzas — eso es un *locator de muchos*. Para actuar sobre uno necesitas **estrechar**. Playwright te da un puñado de métodos encadenables que convierten un locator amplio en uno preciso, **sin** bajar a CSS frágil. Son la herramienta que mantiene a `getByRole` vivo incluso en listas repetidas. Todos están como chuleta ejecutable en el `test.skip` del catálogo (Paso 8).

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

## Conceptos JIT

| Concepto | Analogía QA |
|---|---|
| `interface User` | Contrato Swagger: un User DEBE tener username, password, role |
| `for (const market of markets) { test(...) }` | Matriz de regresión: 1 TC × 4 mercados = 4 ejecuciones (un `test()` registrado por vuelta) |
| `import type { User }` | Sólo traigo la forma, no el código |
| `locator.all()` | Obtener el array de locators — como pedir todas las filas de una tabla |
| `.filter({ hasText: 'Spicy' })` | Filtrar por componente en Jira |
| `.nth(0)` / `.first()` | La primera fila de resultados |
| `.and()` / `.or()` | "el botón que ADEMÁS es X" / "el saludo en ES O en EN" (fallback) |
| `card.getByRole('button')` | Scoping: buscar dentro de un contenedor, no en toda la página |
| `getByText` vs `getByRole` | Leer/aseverar texto visible vs accionar el elemento (escribir/clic) |
| `Record<K, V>` | Matriz de datos esperados: TODAS las celdas obligatorias |
| `Partial<T>` | Filtro de búsqueda: cada campo es opcional |
| Guard clause / fast return | Salir temprano en vez de anidar `if/else` |

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

**Regla del curso (coherente con "siente el dolor primero"):** no agregues `.env.qa` / `.env.staging` hasta que tengas un **segundo ambiente real**. Antes de eso es arquitectura especulativa. **Para M02 NO toques tu config** — sigue idéntico a M01. Lo que viene a continuación es **ilustrativo y opcional**: enseña *cómo se vería* la implementación el día que la necesites, para que la semilla no quede en el aire.

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
$env:TEST_ENV="staging"; pnpm m2     # corre M02 contra .env.staging
pnpm m2                               # sin TEST_ENV → usa el default "qa"
```

> 🪟 **No usamos `cross-env`.** En PowerShell la sintaxis nativa `$env:VAR="x"; comando` ya hace el trabajo; `cross-env` añade una dependencia que el curso evita. (La sintaxis bash `TEST_ENV=staging pnpm m2` **falla** en PowerShell — ver `▶️ Cómo ejecutar`.)

**Reconciliación con M06:** este patrón es el mismo que verás en M06, pero allí deja de ser opcional: el pipeline de CI corre contra varios ambientes y, además, **no usa archivos `.env`** — GitHub Actions inyecta las variables vía `secrets.*` directo en `process.env` (que, como viste arriba, mandan sobre cualquier archivo). En M02 esto es una semilla; en M06 es necesidad operativa.

> 💡 **Para el facilitador:** lanza la pregunta *"¿qué tocarías para correr el mismo smoke contra staging?"* y deja que el grupo lo razone. La respuesta NO es "duplicar specs" — es "cambiar de qué archivo sale `BASE_URL`". Fíjate que `playwright.config.ts` **ya está listo**: `baseURL: process.env.BASE_URL ?? ...` no cambiaría ni una línea con el patrón de arriba. Eso refuerza el mismo principio del módulo: **el dato vive fuera del código; el código solo lo consume.**

---

## Paso a paso

> **Cómo leer esta sección.** Cada paso grande se parte en **micro-pasos `N.M`** con la tripleta **Qué hago / Por qué / Cómo verifico**. Sigue el orden: los archivos se crean en la secuencia exacta en que el flujo los necesita. El "Cómo verifico" siempre es algo **ejecutable u observable** (un comando, una señal en el editor, un verde en el reporte).

### Paso 0 — Pre-requisitos

**0.1 — Confirma que M01 quedó funcional**
- **Qué hago:** desde `playwright-course/`, corro el smoke de M01 y verifico que existan `.env` y `node_modules`.
  ```bash
  pnpm m1            # debe pasar TC-001 y TC-002 en verde
  ls .env            # debe existir (dotenv lo necesita)
  ls node_modules    # debe existir (pnpm install corrió)
  ```
- **Por qué:** M02 **no** vuelve a montar dotenv ni el primer login contra OmniPizza; asume esa base. Si arrancas roto, vas a confundir un fallo de M01 con un fallo de tipado de M02.
- **Cómo verifico:** los 2 TCs de M01 quedan en verde y los dos `ls` no dan "No such file".

> 💡 **Para el facilitador:** este módulo asume que `dotenv`, `.env` y la primera ejecución contra OmniPizza ya están resueltos. Si alguien todavía no tiene `.env`, mándalo al **Paso 1 y 2 de M01** antes de continuar.

---

### Paso 1 — Dependencias requeridas

**1.1 — Verifica que no falta nada (M02 no añade paquetes)**
- **Qué hago:** listo los paquetes que M02 reutiliza de M01.
  ```bash
  pnpm list @playwright/test dotenv typescript @types/node
  ```
- **Por qué:** **M02 no instala dependencias nuevas.** El incremental de este módulo es **datos tipados**, no herramientas. Confirmar evita "instalar por las dudas".
- **Cómo verifico:** los 4 paquetes aparecen con versión. Si falta alguno, vuelve al **Paso 1 de M01** o corre `pnpm install`.

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
  export type CountryCode = "MX" | "US" | "CH" | "JP";
  export type Currency = "MXN" | "USD" | "CHF" | "JPY";

  // OmniPizza sólo expone usuarios "customer". Las 5 personas
  // (standard / locked_out / problem / performance_glitch / error)
  // se distinguen por COMPORTAMIENTO de login, no por privilegios.
  // NO existe un rol admin en la app.
  export type Role = "customer";

  export interface Market {
    code: CountryCode;
    fullName: string;
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
- **Por qué:** una `interface` es el **contrato** que el JSON debe cumplir; los **union types** acotan los valores legales (un `code` solo puede ser uno de esos 4, un `role` solo puede ser `"customer"`). Juntos, atrapan typos en compile-time en vez de en runtime.
- **Cómo verifico:** el editor no subraya en rojo el archivo; los `export` aparecen en el autocompletado al importar desde otro archivo.

> 🔷 **TypeScript — `interface`**
> Una `interface` describe la **forma** de un objeto (qué campos tiene y de qué tipo), sin generar código en runtime: es puro contrato de compilación. La alternativa obvia —no tipar nada y confiar en el JSON— te deja descubrir el campo faltante recién cuando el test revienta.
> 📚 Lo viste en [TS · M06 — interfaces](../../typescript-qa-course/modulo-06-interfaces/). Aquí lo aplicas a `User`, `Market` y `Pizza`: el contrato que valida `data/*.json`.

> 🔷 **TypeScript — union / literal types (`"MX" | "US" | …`)**
> Un *literal type* es un valor concreto usado como tipo; un *union* los encadena con `|`. `CountryCode = "MX" | "US" | "CH" | "JP"` significa "solo estos 4 strings son válidos" — más estricto que `string`, que aceptaría `"MNX"` o `""` sin chistar.
> 📚 Lo viste en [TS · M04 — objects & types](../../typescript-qa-course/modulo-04-objects-types/). Aquí lo aplicas a `code` y `currency`: si añades un mercado con un código fuera del union, TS lo rechaza antes de correr.

**2.3 — Crea el barrel (`types/index.ts`)**
- **Qué hago:** re-exporto todo el dominio desde un único punto de entrada.
  ```ts
  export * from "./omnipizza";
  ```
- **Por qué:** el barrel permite imports cortos y estables (`from "../types"` en vez de `from "../types/omnipizza"`). Si mañana parto el dominio en varios `.d.ts`, los specs no cambian un solo import.
- **Cómo verifico:** desde un spec, `import type { Market } from "../types"` autocompleta `Market`.

**2.4 — Rellena los datasets (`data/markets.json`, `data/users.json`)**
- **Qué hago:** escribo los 4 mercados y los usuarios.
  ```json
  // data/markets.json
  [
    { "code": "MX", "fullName": "Mexico",        "currency": "MXN" },
    { "code": "US", "fullName": "United States", "currency": "USD" },
    { "code": "CH", "fullName": "Switzerland",   "currency": "CHF" },
    { "code": "JP", "fullName": "Japan",         "currency": "JPY" }
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
- **Por qué:** el dato vive **fuera del código**. Mañana QA puede agregar un mercado tocando solo el JSON; el spec ni se entera. **No hay rol admin en OmniPizza:** las 5 personas comparten `role: "customer"` y se diferencian por **comportamiento de login** (estilo SauceDemo), no por privilegios. Las credenciales (`standard_user` / `pizza123`) son las verificadas; el smoke de M02 usa `standard_user` (el único que llega limpio a `/catalog`).
- **Cómo verifico:** `cat data/markets.json` muestra 4 entradas; el JSON es válido (sin comas colgantes ni comillas faltantes).

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

### Paso 3 — Config y scripts (estado al terminar M02)

> **📐 Config — cambios vs M01**
> ```diff
> # playwright.config.ts — SIN CAMBIOS vs M01
> # (M02 añade DATOS tipados, no configuración del runner)
> ```
> **Se mantiene:** todo (dotenv, baseURL, timeouts, project `ui-chromium`). **Entra:** nada en el config — el incremental de M02 vive en `data/` y `types/`, no en `playwright.config.ts`. El único ajuste relacionado es el `include` de `tsconfig.json` para que vea `types/`.

**3.1 — Asegura que `tsconfig.json` incluya `types/`**
- **Qué hago:** abro `tsconfig.json` y confirmo que `include` contemple los archivos de `types/`.
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
- **Por qué:** sin estas entradas, TS no "ve" el `.d.ts` y los imports `import type { Market } from "../types"` fallan. Es el único ajuste de infraestructura que M02 necesita.
- **Cómo verifico:** `pnpm exec tsc --noEmit` sigue en verde y el editor resuelve el import sin marcarlo en rojo.

**3.2 — Confirma que `playwright.config.ts` NO cambia respecto a M01**
- **Qué hago:** comparo mi config con el estado final de M01 (no debe haber diferencias).
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
      { name: "ui-anon", use: { ...devices["Desktop Chrome"] } },
    ],
  });
  ```
- **Por qué:** M02 añade **datos**, no configuración del runner. Si tu config difiere de M01, algo se coló de otro módulo. (Sigue siendo un solo project **anónimo** `ui-anon`: M02 también es login por UI. El project autenticado `ui-chromium` llega en M04.)
- **Cómo verifico:** un diff mental contra M01 da cero cambios; `pnpm m2` arranca sin errores de config.

**3.3 — Añade el script `m2` a `package.json`**
- **Qué hago:** agrego el atajo del módulo.
  ```json
  "scripts": {
    "m1": "playwright test modulo-01-smoke-feo --project=ui-anon",
    "m2": "playwright test modulo-02-locators-data --project=ui-anon"
  }
  ```
- **Por qué:** un atajo por módulo mantiene los comandos cortos y consistentes con el resto del curso (`pnpm m1`, `pnpm m2`, …).
- **Cómo verifico:** `pnpm m2 --list` lista los tests del módulo sin error de "script not found".

---

### Paso 4 — Inspeccionar el contrato (`types/omnipizza.d.ts`)

**4.1 — Lee el `.d.ts` como contrato, no como código**
- **Qué hago:** abro `types/omnipizza.d.ts` y reviso `interface User`, `interface Market`, `interface Pizza`.
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
- **Cómo verifico:** `markets.json` tiene 4 entradas (MX/US/CH/JP) con `code`/`fullName`/`currency`; `users.json` lista las 5 personas (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`), todas con `role: "customer"`.

---

### Paso 6 — Ejecutar el ejemplo

**6.1 — Corre el smoke parametrizado**
- **Qué hago:** ejecuto el módulo, idealmente en UI mode la primera vez.
  ```bash
  pnpm m2          # headless — 4 mercados de un solo TC
  pnpm test:ui     # UI mode — RECOMENDADO la 1ª vez
  ```
- **Por qué:** ver con tus ojos que **un solo `test()` se registró 4 veces** (uno por mercado) cierra el concepto data-driven. No son 4 tests copy/pasteados: es un `for` que llamó a `test()` cuatro veces.
- **Cómo verifico:** la terminal muestra **4 tests** verdes — `TC-MX`, `TC-US`, `TC-CH`, `TC-JP` (suelen tardar ~30-40s la 1ª vez por el cold start de Render). En UI mode los 4 cuelgan del mismo describe.

> 💡 **Para el facilitador:** tras la primera corrida abre `pnpm exec playwright show-report` y muestra los 4 títulos distintos generados por el mismo `test()`. Recalca: **Playwright NO tiene `test.each()`** — esos 4 casos los registró un `for` de JavaScript.

---

### Paso 7 — Lectura guiada del `for...of` data-driven

**7.1 — Identifica las 4 piezas del patrón en `ejemplo.spec.ts`**
- **Qué hago:** abro `ejemplo.spec.ts` y localizo, en este orden: (1) los imports tipados, (2) el bucle, (3) el título dinámico, (4) la validación por mercado y el CSS selector.
  ```ts
  import type { Market, User, Currency } from "../types";
  import marketsJson from "../data/markets.json";

  const markets = marketsJson as Market[];

  for (const market of markets) {
    test(`TC-${market.code} — login + catálogo en mercado ${market.code} @smoke`, async ({ page }) => {
      // ...login, navegación al catálogo, validación de currency...
      const symbol = currencySymbol[market.currency];
      if (!symbol) return; // guard clause / fast return
      await expect(page.locator("body")).toContainText(symbol);
    });
  }
  ```
- **Por qué:** el `for...of` recorre el array y **registra** un `test()` por elemento (no un test que itera por dentro). El título lleva `${market.code}` porque Playwright exige títulos únicos dentro del mismo describe. El CSS `[data-testid^="pizza-card-"]` baja al nivel 4 de la jerarquía a propósito: los testids son dinámicos.
- **Cómo verifico:** puedo explicar en voz alta por qué hay 4 tests y no 1; por qué el título cambia en cada vuelta; y por qué `toHaveURL` usa regex y no string.

> 🔍 **Detalle que parece obvio — `await expect(page).toHaveURL(/\/catalog/)`**
> **Qué es:** (en el bloque de navegación al catálogo) el argumento entre `/.../` es una **expresión regular** (regex), **no** un string, y eso es deliberado. Un regex hace *match parcial*: la aserción pasa si la URL **contiene/matchea** `/catalog` en cualquier parte. Un string, en cambio, exige que la URL sea **exactamente** ese valor.
> **Por qué así (y no la alternativa obvia):** OmniPizza puede añadir cosas a la URL del catálogo —querystring (`?locale=`), ids, el locale dentro del path (`/mx/catalog`) o un slash final— y el regex tolera todo eso. El `\/` escapa la barra `/` porque en un literal regex de JS la `/` es el **delimitador** que abre y cierra la expresión; sin escaparla, el motor creería que el regex terminó ahí.
> **Qué pasa si lo cambias:** si pones el string `"/catalog"`, Playwright lo **resuelve contra `baseURL` con `new URL("/catalog", baseURL)`** y compara por **IGUALDAD exacta** de la URL resultante. Como la URL real es algo como `https://.../catalog?...` (o `/mx/catalog`), nunca será literalmente `https://.../catalog` y el test **truena** con un timeout de aserción. Por eso aquí el regex (parcial, robusto) gana al string (igualdad, frágil).

> 🔍 **Detalle que parece obvio — `` test(`TC-${market.code} — login + catálogo en mercado ${market.code} @smoke`, ...) ``**
> **Qué es:** el título del test es un *template string* que interpola `market.code` en cada vuelta del `for...of` — eso garantiza `TC-MX`, `TC-US`, `TC-CH`, `TC-JP`: nombres distintos y legibles en el reporte (la regla de títulos únicos ya la viste en el "Por qué").
> **Por qué así (y no la alternativa obvia):** además, el tag `@smoke` va **embebido en el título** a propósito: es lo que permite filtrar con `--grep @smoke` (el atajo `pnpm test:smoke`).
> **Qué pasa si lo cambias:** si pones un título fijo (`"TC catálogo"`) para los 4, tendrás títulos duplicados — confusos en el reporte y difíciles de aislar con `--grep` o `-g "TC-MX"`. Si quitas `@smoke`, el caso deja de aparecer en `pnpm test:smoke`.

> 🔍 **Detalle que parece obvio — `page.locator('[data-testid^="pizza-card-"]')`**
> **Qué es:** un CSS selector con el operador de atributo `^=`, que significa **"el atributo empieza con"**. Aquí matchea cualquier elemento cuyo `data-testid` arranque con `pizza-card-`.
> **Por qué así (y no la alternativa obvia):** los testids completos son dinámicos (`pizza-card-123`, `pizza-card-456`...), así que un `getByTestId("pizza-card-123")` con id fijo solo encontraría una pizza concreta (frágil) o ninguna. Bajar al nivel 4 es legítimo justamente por eso (ver la tabla de jerarquía arriba) — no es deuda técnica: es la herramienta correcta para testids variables.
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

### Paso 8 — Catálogo de locators (lectura, no ejecución)

**8.1 — Escanea la chuleta de locators**
- **Qué hago:** leo el `test.describe("Referencia — jerarquía de locators", …)` con sus dos `test.skip` al final de `ejemplo.spec.ts`.
- **Por qué:** **no se ejecuta** (`test.skip`) — es una **referencia viva** de cada nivel de la jerarquía con selectores REALES de OmniPizza (`getByRole({ name: "Sign In" })`, `getByPlaceholder("standard_user")`, `getByTestId("login-button-desktop")`, `getByAltText("Pepperoni")`, `[data-testid^="pizza-card-"]`). Vas a copiar de aquí para el reto.
- **Cómo verifico:** identifico al menos un ejemplo por cada nivel (role → label/placeholder/text → testid → CSS → XPath).

---

### Paso 9 — Resolver el reto (TODOs propios — no se resuelve aquí)

**9.1 — Añade el 5º mercado SIN tocar el spec**
- **Qué hago:** abro `reto.spec.ts` y, **sin editar el spec**, toco solo dos archivos: añado Canadá al JSON y amplío los union types.
  ```json
  // data/markets.json — añadir al final del array
  { "code": "CA", "fullName": "Canada", "currency": "CAD" }
  ```
  ```ts
  // types/omnipizza.d.ts — ampliar ambos union
  export type CountryCode = "MX" | "US" | "CH" | "JP" | "CA";
  export type Currency    = "MXN" | "USD" | "CHF" | "JPY" | "CAD";
  ```
- **Por qué:** es la prueba de fuego del data-driven: si la parametrización está bien hecha, un mercado nuevo aparece como un test extra **sin escribir ni una línea de spec**. Los TODOs (`TODO 1..4`) del reto siguen siendo tuyos — el README **no** los resuelve.
- **Cómo verifico:**
  ```bash
  pnpm typecheck                                                   # verde tras ampliar los union
  pnpm exec playwright test modulo-02-locators-data/reto.spec.ts --list   # debe listar 5 tests
  ```

> 💡 **Para el facilitador:** si `typecheck` se queja con `Type '"CA"' is not assignable to type 'CountryCode'`, es señal de que aún no ampliaron el `.d.ts`. Ese error es la lección: el union type es la red de seguridad.

---

### Paso 10 — Versiona tu trabajo (Git JIT)

**10.1 — Commitea el incremento de M02**
- **Qué hago:** agrego solo lo que cambió en este módulo y lo commiteo con un mensaje convencional.
  ```bash
  git add types data modulo-02-locators-data
  git commit -m "feat(m02): data-driven con JSON tipado"
  ```
- **Por qué:** M02 introduce dos carpetas reusables (`types/`, `data/`) más el spec del módulo. Versionarlas en un commit atómico deja un punto de retorno limpio **antes** de que M03 empiece a refactorizar hacia POM. (Aquí Git es JIT: commit al cerrar; las ramas y el push llegan en M03/M04, cuando el flujo los pida.)
- **Cómo verifico:**
  ```bash
  git log --oneline -1        # muestra el commit feat(m02) recién creado
  git status                  # working tree limpio para lo que tocaste
  ```

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** `pnpm m2`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@smoke"`) o por archivo (`pnpm exec playwright test modulo-02-locators-data/reto.spec.ts`)
- **Verificar tipos:** `pnpm typecheck`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm m2` (no `VAR=x pnpm m2`, sintaxis bash que falla en PowerShell)

---

## Outcome esperado

- [ ] Entiendes la jerarquía de locators y **por qué** `getByRole` es preferencia, no ley (caso login de OmniPizza).
- [ ] Sabes estrechar un locator con `.filter`/`.nth`/`.first`/`.and`/`.or` y hacer **scoping** (`card.getByRole("button")`) para botones icon-only.
- [ ] Distingues `getByText` (leer/aseverar) de `getByRole`/`getByTestId` (accionar).
- [ ] Sabes usar `pnpm exec playwright codegen <url>` para **descubrir** locators y **endurecer** lo que genera.
- [ ] Puedes leer `markets.json` y explicar cómo el test lo consume.
- [ ] Sabes añadir un 5º mercado **sin tocar el spec**.
- [ ] `pnpm typecheck` queda en verde tras ampliar los union types.
- [ ] Reconoces cuándo un CSS selector es legítimo (testids dinámicos) y por qué `toHaveURL` usa regex.
