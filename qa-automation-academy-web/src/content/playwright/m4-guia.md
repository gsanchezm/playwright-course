# M04 · Guía del módulo: Refactor a POM (OOP incremental)

> 🎁 **Proyecto de referencia.** En el repo del curso, este módulo incluye una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json`, independiente del monorepo). Úsalo como **solución de referencia**: ábrelo aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de esta guía siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto".

**Duración estimada:** 80-105 min (incluye dos *Git breaks* — branches y conflictos)
**Pieza que suma al framework:** `pages/BasePage.ts` + `LoginPage.ts` + `CatalogPage.ts` + `CheckoutPage.ts`. El spec de M03 se refactoriza y se nota cuánto se limpia.

---

## 🏗️ Arquitectura al terminar este módulo

Aparece la carpeta **`pages/`** con el Page Object Model. Las clases `extends BasePage` para reutilizar helpers (testid, waitForUrl, etc.) sin duplicar código.

```
playwright-course/
├── modulo-03-data-driven/         ← (sin cambios)
├── modulo-04-pom/                 ← 🆕 ESTE MÓDULO
│   ├── README.md
│   └── proyecto/                  ← proyecto autocontenido y ejecutable
│       ├── data/                  ← (M03) datasets tipados
│       ├── types/                 ← (M03) contratos del dominio
│       ├── pages/                 ← 🆕 Page Object Model
│       │   ├── BasePage.ts        ← 🆕 clase normal, helpers compartidos
│       │   ├── LoginPage.ts       ← 🆕 extends BasePage, maneja "/"
│       │   ├── CatalogPage.ts     ← 🆕 extends BasePage, maneja /catalog
│       │   ├── CheckoutPage.ts    ← 🆕 extends BasePage, maneja /checkout
│       │   └── index.ts           ← 🆕 barrel export
│       ├── playwright.config.ts   ← igual que M03 (un solo project ui-anon)
│       ├── tsconfig.json          ← include AMPLIADO para ver pages/
│       ├── .env.example, .gitignore
│       └── tests/
│           ├── ejemplo.spec.ts    ← 🆕 specs limpios usando los Page Objects
│           └── reto.spec.ts       ← 🆕 E2E checkout completo con CheckoutPage
└── …
```

**Jerarquía de clases** (cómo se relacionan los Pages):

```
                BasePage
              (clase normal,
               helpers comunes)
                   ▲
        ┌──────────┼──────────┬─────────────┐
        │          │          │             │
   LoginPage   CatalogPage  CheckoutPage   (futuras)
    "/"        /catalog     /checkout
```

**Flujo del dato en el spec** (cómo se compone un test):

```
data/markets.json ──► const markets = marketsJson as Market[]
                                          │
                                          ▼
                       for (const market of markets) {
                         const loginPage = new LoginPage(page)
                         await loginPage.loginInMarket(user, market.code)
                                                ▲
                                                │
                                  (encapsula los 5 pasos
                                   inline de M03)
                       }
```

**Qué NO existe todavía:**

| Carpeta | Llega en | Para qué |
|---|---|---|
| `fixtures/`, `helpers/` | M05 | Custom fixtures + aislamiento de datos por worker |
| `tests/setup/`, `.auth/` | M06 | Setup project + storageState (eliminar el login UI de cada test) |
| `services/`, `tests/api/` | M07 | API testing |
| `.github/workflows/` | M08 | CI/CD |

---

## 🔥 Ritual de apertura — "reactivar el dolor"

**Antes de tocar ninguna clase**, haz este ejercicio:

1. Abre `modulo-03-data-driven/proyecto/tests/ejemplo.spec.ts`.
2. Marca con resaltador (o copia a un archivo aparte) **cada línea que se repite** entre el bucle de mercados: login, selección de mercado, validación de URL.
3. **Cuenta las líneas duplicadas.** Anota el número.
4. Completa: *"Si añado un tercer flujo (checkout), voy a duplicar ____ líneas más."*

Sólo **después** de ese ejercicio abrimos `BasePage.ts`. El patrón se gana — no se impone.

---

## Analogía

¿Recuerdas el dolor? Cada test nuevo repetía los mismos locators. El **Page Object Model** es la solución: crear un **mapa reutilizable** de cada pantalla, como un tester manual mantiene un documento *"así se llega al módulo de login"*. El código pasa de script a **libro de recetas**: `await loginPage.loginInMarket(user, 'MX')` se lee como user story, no como instrucción técnica.

---

## Conceptos JIT

| Concepto | Analogía QA |
|---|---|
| `class BasePage` | Plantilla genérica: toda pantalla tiene helpers comunes |
| `extends BasePage` | Herencia: no copio, reutilizo |
| `super(page)` | Pasar el `page` al constructor del padre |
| `private get loginButton()` | Documentación interna del Page — el test nunca la toca |
| `public async loginAs(user)` | Acción de negocio — la interfaz pública del POM |
| `protected tid()` | Herramienta del equipo QA interno: la ven las hijas, no el cliente (test) |
| `readonly page: Page` | Tu pestaña del navegador: no cambia a mitad del TC |

> **⚠️ Nota sobre `abstract`:** en este módulo `BasePage` es una clase **normal**, no abstracta. La palabra `abstract` aparecerá por primera vez en M07 cuando tengamos varios servicios que realmente la justifiquen. Por ahora la convención es humana: **no instancies `BasePage` directamente — extiéndela**.

---

## Arquitectura del POM en el framework

```
pages/
├── BasePage.ts        ← clase normal, helpers compartidos (tid, waitForUrl, screenshot)
├── LoginPage.ts       ← extiende BasePage, maneja /
├── CatalogPage.ts     ← extiende BasePage, maneja /catalog
└── CheckoutPage.ts    ← extiende BasePage, maneja /checkout (lo usas en el reto)
```

---

## Paso a paso

### Paso 0 — Pre-requisitos

Entra al `proyecto/` autocontenido de este módulo y prepara el entorno:

```bash
cd proyecto
pnpm install
cp .env.example .env
pnpm typecheck     # debe pasar limpio
ls types/          # existe (data tipada, viene de M03)
ls data/           # existe (markets/users, viene de M03)
```

Este módulo refactoriza a POM el spec data-driven de M03. Si `pnpm typecheck` no pasa limpio, el refactor parte de una base rota y no sabrás si un fallo es del POM o heredado.

---

### Paso 1 — Dependencias requeridas

**M04 no añade paquetes npm nuevos.** Las clases TS se compilan con el `typescript` que ya tienes.

```bash
pnpm list @playwright/test dotenv typescript @types/node
# Si las 4 aparecen, listo. Si no, ejecuta:
#   pnpm install            (si package.json ya las lista)
#   pnpm add -D @playwright/test dotenv typescript @types/node  (si no)
```

---

### Paso 2 — Crear `pages/` (el Page Object Model)

Crea la carpeta y abre cada archivo en VS Code (se crean en disco al guardarlos):

```bash
mkdir pages
code pages/BasePage.ts
code pages/LoginPage.ts
code pages/CatalogPage.ts
code pages/CheckoutPage.ts
code pages/index.ts
```

**Contenido de cada archivo** (escríbelo ahora; en los Pasos 5 y 6 lo releemos línea por línea):

📄 `pages/BasePage.ts` — clase normal (NO abstract; eso llega en M07):

```ts
import type { Page, Locator } from "@playwright/test";

export class BasePage {
  // `protected` → visible sólo para clases hijas, no para los tests.
  // `readonly` → el Page se amarra a una pestaña y no salta a otra.
  constructor(protected readonly page: Page) {}

  // Helper viewport-aware: OmniPizza añade "-desktop" (≥768px)
  // o "-responsive" (<768px) a sus testids. Se resuelve aquí,
  // en un solo lugar, para que las hijas no dupliquen la lógica.
  protected tid(base: string): Locator {
    const size = this.page.viewportSize();
    const suffix = size && size.width < 768 ? "-responsive" : "-desktop";
    return this.page.getByTestId(`${base}${suffix}`);
  }

  // Espera "paciente" centralizada (sin sleep), con timeout configurable.
  protected async waitForUrl(pattern: RegExp, timeout = 15_000): Promise<void> {
    await this.page.waitForURL(pattern, { timeout });
  }

  // Screenshot con nombre semántico para debug.
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}
```

> 🔷 **TypeScript — `class`**
> Una `class` es una plantilla que agrupa datos (propiedades) y comportamiento (métodos). En QA es tu "mapa de pantalla": `BasePage` define lo que **toda** pantalla comparte.
> 📚 Lo viste en [TS · M05 — Clases](/docs/typescript/m5-base-page). Aquí lo aplicas para crear el cimiento del Page Object Model.

> 🔷 **TypeScript — constructor shorthand (`protected readonly page: Page`)**
> Poner un modificador (`protected`/`readonly`/`private`/`public`) en un parámetro del constructor **declara y asigna** la propiedad en una sola línea — TS lo llama *parameter property*. Sin el modificador, el parámetro sería una variable local que se pierde al terminar el constructor (gotcha clásico). El desglose completo (la alternativa manual y qué pasa si lo cambias) lo lees en el 🔍 del constructor, en el Paso 5.
> 📚 Lo viste en [TS · M05 — Clases](/docs/typescript/m5-base-page). Aquí lo usas para inyectar la pestaña `page` de Playwright en cada Page Object.

> 🔷 **TypeScript — modificadores `private` / `protected` / `public`**
> `public` (default) → visible para todos, incluido el test. `private` → sólo dentro de la misma clase. `protected` → la misma clase y sus hijas, **pero no** los tests. El gotcha: si olvidas el modificador, TS asume `public` y rompes la encapsulación sin darte cuenta. (Por qué `tid()` es justo `protected` — y qué pasa si lo cambias — lo lees en el 🔍 de `tid`, en el Paso 5.)
> 📚 Lo viste en [TS · M05 — Clases](/docs/typescript/m5-base-page).

> 🔷 **TypeScript — return type `Promise<void>`**
> Una función `async` siempre devuelve una `Promise`. `Promise<void>` significa "es asíncrona pero no resuelve ningún valor útil — sólo señala cuándo terminó". El gotcha de olvidar el `await` al llamarla (el test sigue antes de que la acción termine — flaky garantizado) lo ves aplicado en el 🔍 de `goto`, en el Paso 6.
> 📚 Lo viste en [TS · M03 — Funciones](/docs/typescript/m3-void-functions). Aquí casi todos los métodos de acción (`goto`, `loginAs`…) devuelven `Promise<void>`.

📄 `pages/LoginPage.ts` — primera clase concreta:

```ts
import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import type { CountryCode, User } from "../types";

export class LoginPage extends BasePage {
  readonly path = "/";

  // --- Locators privados: documentación interna del Page ---
  private get usernameInput(): Locator { return this.tid("username"); }
  private get passwordInput(): Locator { return this.tid("password"); }
  private get signInButton(): Locator  { return this.tid("login-button"); }
  private get errorMessage(): Locator  { return this.page.getByTestId("login-error"); }
  private marketFlag(code: CountryCode): Locator {
    // Testid plano "market-XX" (sin sufijo de viewport) → getByTestId directo.
    return this.page.getByTestId(`market-${code}`);
  }

  // --- Acciones públicas: la interfaz del POM ---
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async selectMarket(code: CountryCode): Promise<void> {
    await this.marketFlag(code).click();
  }

  async loginAs(user: User): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.signInButton.click();
  }

  async loginInMarket(user: User, code: CountryCode): Promise<void> {
    await this.goto();
    await this.selectMarket(code);
    await this.loginAs(user);
    await this.waitForUrl(/\/catalog/);
  }

  // --- Assertions de estado ---
  async expectLoaded(): Promise<void> {
    await expect(this.signInButton).toBeVisible();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
```

> 🔷 **TypeScript — `extends` y `super`**
> `class Hija extends Padre` hereda propiedades y métodos del padre. Si la hija define su propio `constructor`, debe llamar `super(...)` para inicializar la parte del padre **antes** de usar `this`. Aquí `LoginPage` **no** declara constructor propio, así que TS usa el de `BasePage` automáticamente — por eso no ves `super()` explícito.
> 📚 Lo viste en [TS · M05 — Clases](/docs/typescript/m5-login-page). Aquí cada Page `extends BasePage` para reutilizar los helpers comunes.

Fíjate en dos detalles: los getters pasan el testid **base** (`"username"`, no `"username-desktop"`) — el sufijo de viewport lo añade el `tid()` heredado de `BasePage`. Y las banderas de mercado son la excepción: su testid es plano (`market-MX`, sin sufijo), por eso `marketFlag` usa `page.getByTestId` directo y no `tid()`.

📄 `pages/index.ts` (barrel — facilita el import en los specs):

```ts
export { BasePage } from "./BasePage";
export { LoginPage } from "./LoginPage";
export { CatalogPage, type Category } from "./CatalogPage";
export { CheckoutPage } from "./CheckoutPage";
```

(`CatalogPage` exporta también el tipo `Category` — los filtros del catálogo —, y el barrel lo re-exporta para que los specs lo importen desde `../pages`.)

(Los esqueletos completos de `CatalogPage` y `CheckoutPage` los construirás guiado por el ejemplo y el reto.)

---

### Paso 3 — Ajustes a `playwright.config.ts` (estado al terminar M04)

> **📐 Config — cambios vs M03**
> ```diff
> # playwright.config.ts — SIN CAMBIOS vs M01/M02/M03
> # (M04 refactoriza los tests a Page Object Model; el runner corre igual)
> ```
> **Se mantiene:** todo (dotenv, baseURL, timeouts, project `ui-anon`). **Entra:** nada en el config — el incremental de M04 es de **arquitectura de código** (clases POM en `pages/`), no del runner. El próximo cambio real al config llega en **M06**.

**M04 no requiere cambios al config.** Sigue siendo el mismo de M01/M02/M03.

Solo asegúrate de que `tsconfig.json` incluya `pages/`:

```json
{
  "include": [
    "playwright.config.ts",
    "types/**/*.ts",
    "types/**/*.d.ts",
    "pages/**/*.ts",
    "tests/**/*.ts"
  ]
}
```

Añade `m4` a `package.json`:

```json
"scripts": {
  "m4": "playwright test --project=ui-anon"
}
```

Tu `playwright.config.ts` debe seguir como en M03:

```ts
// playwright.config.ts — Estado en M04 (igual que M01/M02/M03)
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

> 💡 **Punto pedagógico:** M04 es **puro código**, no toca configuración. Eso refuerza el principio del curso: **la arquitectura crece donde el problema lo exige**. Aquí el problema es duplicación → solución POM → archivos en `pages/`.

---

### Paso 4 — Hacer el ritual (5-10 min)

(Ver la sección "Ritual de apertura" arriba.) **No saltes este paso.** Es lo que justifica todo lo demás.

---

### Paso 5 — Lectura guiada de `pages/BasePage.ts`

Abre `pages/BasePage.ts` y observa:

- `protected readonly page: Page` — todas las hijas la heredan, los tests no la tocan.
- `protected tid(base: string)` — método helper interno; las hijas lo usan para construir testids consistentes.
- `async waitForUrl(...)` — la espera "paciente" centralizada (sin `sleep`).
- **Por qué no es `abstract`:** porque por sí sola sigue siendo útil para crear hijas. En M07 vas a ver el caso donde `abstract` sí es indispensable.

> 🔍 **Detalle que parece obvio — `constructor(protected readonly page: Page) {}`**
> **Qué es:** una *parameter property* de TypeScript. Esa única línea **declara** la propiedad `page`, la marca `protected readonly` y la **asigna** (`this.page = page`) automáticamente — no hay cuerpo en el constructor. El `page` lo provee el fixture de Playwright cada vez que el test hace `new LoginPage(page)`.
> **Por qué así (y no la alternativa obvia):** la alternativa obvia es declarar el campo arriba y asignarlo a mano: `private page: Page; constructor(page: Page) { this.page = page }`. Eso son tres líneas y dos lugares donde olvidar el `readonly`. La parameter property lo hace en una y deja el contrato explícito.
> **Qué pasa si lo cambias:** si quitas `protected`, el campo se vuelve `public` por defecto y los tests podrían tocar `loginPage.page` directamente — rompes la encapsulación. Si quitas `readonly`, alguien puede reasignar `this.page` a otra pestaña a mitad del TC (la clase de bug "¿por qué el assert corrió en la pestaña equivocada?").

> 🔍 **Detalle que parece obvio — `protected tid(base: string): Locator`**
> **Qué es:** el helper que añade el sufijo de viewport (`-desktop` / `-responsive`) al testid. Es `protected`, junto con `waitForUrl`.
> **Por qué así (y no la alternativa obvia):** `protected` lo hace visible para las clases hijas (`LoginPage`, `CatalogPage`...) pero **no** para los tests. La alternativa `public` lo dejaría disponible en el spec (`loginPage.tid("x")`), reabriendo la puerta a locators inline desde el test. La alternativa `private` lo escondería incluso de las hijas y `LoginPage` no podría usarlo. `protected` es el punto medio exacto: herramienta del equipo QA interno, invisible para el cliente (test).
> **Qué pasa si lo cambias:** con `private`, las clases que `extends BasePage` dejan de compilar (no ven el helper heredado). Con `public`, los specs vuelven a poder construir locators a mano y se erosiona la encapsulación que da sentido al POM.

---

### Paso 6 — Lectura guiada de `pages/LoginPage.ts`

Cosas a observar:

- Los **locators son `private get`** — el test no debería poder hacer `loginPage.usernameInput.fill(...)`. Si lo necesitara, es señal de que el Page no expone una acción de alto nivel.
- Las **acciones públicas** se leen como user story:
  - `loginAs(user)`
  - `loginInMarket(user, code)`
  - `selectMarket(code)`
- El método `loginInMarket` **encapsula los 5 pasos** que en M03 estaban inline en cada test.

> 🔍 **Detalle que parece obvio — `readonly path = "/"`**
> **Qué es:** una propiedad de instancia de solo lectura en `LoginPage` (`"/"`) y `CatalogPage` (`"/catalog"`). En `LoginPage`, el método `goto()` la usa: `await this.page.goto(this.path)`. (En `CatalogPage` documenta qué pantalla mapea la clase — a `/catalog` se llega navegando tras el login, no con un `goto` directo.)
> **Por qué así (y no la alternativa obvia):** la alternativa es hardcodear la ruta dentro de cada método (`goto("/")`). Con `readonly path` la ruta vive en **un solo lugar** por Page y queda visible como "esta clase mapea esta pantalla". `readonly` comunica que la pantalla de una Page no cambia en tiempo de ejecución.
> **Qué pasa si lo cambias:** si quitas `readonly`, el compilador deja de protegerte ante una reasignación accidental (`this.path = ...`) que mandaría el `goto` a una pantalla equivocada. Si la inlineas en cada método, repites el string y pierdes el único punto de cambio.

> 🔍 **Detalle que parece obvio — `private get usernameInput(): Locator`**
> **Qué es:** los locators se exponen como **getters `private`** (propiedades calculadas), no como variables inline dentro de cada método. Cada acceso reevalúa `this.tid("username")`.
> **Por qué así (y no la alternativa obvia):** la alternativa obvia es escribir `this.page.getByTestId("username-desktop")` inline en cada método que lo use. El getter centraliza el locator: si cambia el testid, tocas **una línea**. Y al ser `get` (no campo asignado en el constructor) el `Locator` se resuelve perezosamente — importa porque `tid()` consulta el `viewportSize()` en el momento del uso, no en el de la construcción del Page.
> **Qué pasa si lo cambias:** si lo declaras como campo en el constructor (`this.usernameInput = this.tid(...)`) congelas el viewport al instante de `new LoginPage(page)`. Si lo haces `public`, el test recupera el atajo `loginPage.usernameInput.fill(...)` que el primer bullet de arriba te dijo que es mala señal — exactamente lo que el POM busca impedir.

> 🔍 **Detalle que parece obvio — `await this.page.goto(this.path)`**
> **Qué es:** navegación dentro del método del Page. El `this.` apunta a la instancia del Page; `this.page` es la pestaña inyectada por el constructor; `this.path` es la ruta de esa pantalla.
> **Por qué así (y no la alternativa obvia):** el método es `async` y se hace `await` porque `goto` devuelve una `Promise` — sin `await`, el test seguiría a la siguiente acción antes de que la página cargara (flaky garantizado). Se usa `this.page` (no un `page` global ni un parámetro) porque cada Page se amarra a la pestaña que recibió: así un solo test puede instanciar `LoginPage`, `CatalogPage` y `CheckoutPage` compartiendo la **misma** pestaña — exactamente lo que hace `reto.spec.ts` al construir los 3 Pages con el mismo `page`.
> **Qué pasa si lo cambias:** si quitas el `await`, la navegación queda "en el aire" y los locators siguientes corren sobre la página vieja. Si quitas `async`, ni siquiera puedes usar `await` adentro. Si reemplazas `this.page` por una referencia externa, rompes el aislamiento por instancia y vuelves al estilo script de M01.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** `pnpm m4`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@smoke"`) o por archivo (`pnpm exec playwright test tests/reto.spec.ts --headed --project=ui-anon`)
- **Verificar tipos (herencia POM):** `pnpm typecheck` — ojo: la herencia introduce errores sutiles
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** variables de entorno con `$env:VAR="x"; pnpm m4` (no `VAR=x pnpm m4`, sintaxis bash que falla en PowerShell)

---

## Outcome esperado

- [ ] Hiciste el ritual y anotaste el número de líneas duplicadas en M03.
- [ ] Puedes explicar qué significa `private` / `protected` / `public` en este contexto.
- [ ] Entiendes por qué `readonly page: Page` evita bugs.
- [ ] Sabes extender `BasePage` para crear un Page nuevo.
- [ ] **Puedes contar las líneas eliminadas** vs M03.
- [ ] Completaste el reto E2E con `CheckoutPage`.
- [ ] Sabes que `abstract` llega en M07 — no lo introdujimos aquí.

---

## 🌿 Git break — Refactoriza en una rama (no en `main`)

Vas a tocar varios archivos a la vez (`BasePage`, `LoginPage`, `CatalogPage`, `CheckoutPage`). Esto es **el momento perfecto** para una rama dedicada: si el refactor sale mal, descartas la rama y `main` queda intacto.

### El flujo

```bash
# 1. Asegúrate de estar en main al día
$ git switch main
$ git pull            # sólo si ya tienes remoto configurado

# 2. Crea tu rama de feature
$ git switch -c feature/m04-pom

# 3. Trabaja, commitea por pasos
$ git add pages/BasePage.ts
$ git commit -m "refactor: add BasePage with shared helpers"

$ git add pages/LoginPage.ts pages/CatalogPage.ts
$ git commit -m "refactor: extract Login and Catalog Page Objects"

# 4. Cuando el refactor está listo, vuelve a main y mergea
$ git switch main
$ git merge feature/m04-pom

# 5. Borra la rama ya mergeada
$ git branch -d feature/m04-pom
```

### Convención de nombres de rama

| Prefijo | Uso |
|---|---|
| `feature/` | Nueva capacidad (POM, fixture, test) |
| `fix/` | Arreglar un test flaky o bug del framework |
| `chore/` | Upgrade de dependencias, limpieza |
| `refactor/` | Reestructurar sin cambiar comportamiento |

### Fast-forward vs merge commit

Cuando `main` no tiene commits nuevos desde que creaste tu rama, Git hace **fast-forward** (avanza el puntero, sin commit extra). Si `main` avanzó (porque alguien más mergeó), Git crea un **merge commit** con dos padres. Ambos están bien — sólo es bueno saber qué estás viendo cuando lees `git log --graph`.

---

## ⚔️ Git break — Resolver un conflicto

Imagina que tú estás en `feature/m04-pom` y cambiaste el locator del input de email en `LoginPage`:

```typescript
// Tu cambio
get emailInput() { return this.page.getByLabel('Correo'); }
```

Mientras tanto, una compañera ya mergeó otro cambio al mismo método en `main`:

```typescript
// El cambio en main que llegó primero
get emailInput() { return this.page.getByRole('textbox', { name: 'Email' }); }
```

Cuando intentas mergear, Git no puede decidir y te avisa:

```bash
$ git switch main
$ git merge feature/m04-pom
Auto-merging pages/LoginPage.ts
CONFLICT (content): Merge conflict in pages/LoginPage.ts
Automatic merge failed; fix conflicts and then commit the result.
```

### Cómo se ve el archivo en conflicto

```typescript
export class LoginPage extends BasePage {
<<<<<<< HEAD
  get emailInput() { return this.page.getByRole('textbox', { name: 'Email' }); }
=======
  get emailInput() { return this.page.getByLabel('Correo'); }
>>>>>>> feature/m04-pom
}
```

- `<<<<<<< HEAD` = lo que está en `main` ahora.
- `=======` = separador.
- `>>>>>>> feature/m04-pom` = lo que trae tu rama.

### Cómo lo resuelves

1. Decide manualmente cuál se queda (o combinas ambos).
2. **Borra los marcadores** (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Marca el archivo como resuelto y termina el merge:

```bash
$ git add pages/LoginPage.ts
$ git commit                # abre el editor con el mensaje pre-escrito; guarda y cierra
```

### Si te arrepientes

```bash
$ git merge --abort
```

Esto regresa el repo al estado previo, como si el merge nunca hubiera pasado.

> 💡 **VS Code** tiene botones inline **Accept Current**, **Accept Incoming**, **Accept Both** sobre cada bloque en conflicto. Úsalos para evitar errores manuales.

---

> 📚 **Profundización opcional:** [Conceptos de ramas](../../git-github-course/modulo-04-ramas-y-merge/01-ramas-conceptos.md) · [Flujo feature-branch detallado](../../git-github-course/modulo-04-ramas-y-merge/03-flujo-feature-branch.md) · [Tipos de merge](../../git-github-course/modulo-04-ramas-y-merge/04-merge.md) · [Conflictos avanzados](../../git-github-course/modulo-04-ramas-y-merge/05-conflictos.md) · [Workflows de equipo y rebase](../../git-github-course/modulo-05-workflows-rebase/)
