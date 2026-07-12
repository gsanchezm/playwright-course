# Módulo 04 — Refactor a POM (OOP incremental)

**Duración estimada:** 80-105 min (incluye Git JIT — branches, conexión a GitHub y conflictos, tejidos en el flujo del refactor)
**Pieza que suma al framework:** `pages/BasePage.ts` + `LoginPage.ts` + `CatalogPage.ts` + `CheckoutPage.ts`. El spec data-driven de M03 se refactoriza y se nota cuánto se limpia.

---

> 🎁 **Proyecto de referencia — [`proyecto/`](proyecto/).** Este módulo trae una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado final de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del resto del curso). Es la **solución de referencia** para comparar: ábrela aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de este README siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto". Detalles en [`proyecto/README.md`](proyecto/README.md).

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
| `fixtures/`, `helpers/` | M05 | Inyectar el Page Object + datos únicos por test |
| `tests/setup/`, `.auth/` | M06 | Eliminar el login UI de cada test (badge heredado) |
| `services/`, `tests/api/` | M07 | API testing |
| `.github/workflows/` | M08 | CI/CD |

> 💡 **Para el facilitador:** después de presentar la jerarquía, abre `pages/LoginPage.ts` y muestra que **todos los `get` son `private`**. Eso significa que el test NO puede acceder al locator directamente — debe ir por la acción pública (`loginInMarket`). Ése es el corazón del POM.

---

## 🔥 Ritual de apertura — "reactivar el dolor"

**Antes de tocar ninguna clase**, haz este ejercicio:

1. Abre `modulo-03-data-driven/proyecto/tests/ejemplo.spec.ts`.
2. Marca con resaltador (o copia a un archivo aparte) **cada línea que se repite** entre el bucle de mercados: login, selección de mercado, validación de URL.
3. **Cuenta las líneas duplicadas.** Anota el número.
4. Completa: *"Si añado un tercer flujo (checkout), voy a duplicar ____ líneas más."*

Sólo **después** de ese ejercicio abrimos `BasePage.ts`. El patrón se gana — no se impone.

> 💡 **Para el facilitador:** **no te saltes el ritual**. El POM se justifica por contraste — si los alumnos no sienten primero la duplicación, leen el POM como "abstracción innecesaria" y lo abandonan en su trabajo real.

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

> **Cómo leer esta sección:** cada paso grande se parte en **micro-pasos** `N.M` con la tripleta **Qué hago / Por qué / Cómo verifico**. Cada micro-paso dice qué archivo se crea/edita y en qué orden, para que la `🏗️ Arquitectura` de arriba se construya pieza por pieza. Los recuadros `🔷 TypeScript` aparecen la **primera vez** que un concepto del lenguaje entra en juego y enlazan al curso de TS.

---

### Paso 0 — Pre-requisitos y rama de trabajo

**0.1 — Verifica que la base (M03) queda en verde**
- **Qué hago:** entro al proyecto de este módulo y preparo el entorno: `cd proyecto`, `pnpm install`, `cp .env.example .env`, `pnpm typecheck`.
- **Por qué:** M04 refactoriza a POM el spec data-driven que armaste en M03. Si la data tipada (`types/`, `data/`) y los locators jerárquicos no funcionan, el refactor parte de una base rota y no sabrás si un fallo es del POM o heredado.
- **Cómo verifico:** `pnpm typecheck` termina sin errores; `ls types/` y `ls data/` (un comando por carpeta) muestran ambas carpetas.

**0.2 — Aísla el refactor en una rama de feature**
- **Qué hago:** antes de tocar una sola clase, creo una rama dedicada:
  ```bash
  git switch main
  git pull            # sólo si ya tienes remoto configurado
  git switch -c feature/m04-pom
  ```
- **Por qué:** el refactor toca **varios archivos a la vez** (`BasePage`, `LoginPage`, `CatalogPage`, `CheckoutPage`, `index.ts`, el spec). Si sale mal, descartas la rama y `main` queda intacto. Esta es la diferencia entre "experimentar con red" y "experimentar sobre la rama que demuestras en clase".
- **Cómo verifico:** `git status` dice `On branch feature/m04-pom`; `git branch` la muestra con el asterisco.

> 💡 **Para el facilitador:** repite en voz alta los nombres de los Page Objects que vamos a usar — `LoginPage`, `CatalogPage`, `CheckoutPage` — y enséñales que viven en `pages/`. Lo van a oír cien veces en los próximos 90 minutos.

> 🌿 **Git JIT — por qué una rama aquí**
> El refactor cruza varios archivos a la vez; aislarlo en `feature/m04-pom` protege `main`. Más abajo, al cerrar el módulo (Paso 10), harás el merge a `main` y verás un conflicto a propósito.

**0.3 — Crea el repo en GitHub y conéctalo**
- **Qué hago:** creo el repositorio remoto en github.com y conecto mi repo local con él.
  1. En github.com, botón **New repository** (verde, arriba a la derecha o en `github.com/new`).
  2. Lo nombro `omnipizza-playwright`, lo dejo **Public** (o Private, da igual para el curso).
  3. **NO** marco "Add a README", "Add .gitignore" ni licencia — el repo local **ya tiene** esos archivos y un commit inicial.
  4. **Create repository.** GitHub te muestra la pantalla "…or push an existing repository from the command line": de ahí copias la URL (HTTPS o SSH).
  5. Conecto el remoto y subo `main` + la rama de feature:
  ```bash
  git remote add origin <url-que-copiaste>
  git remote -v                        # confirma que quedó (fetch + push)
  git push -u origin main              # sube main y deja upstream
  git push -u origin feature/m04-pom   # sube tu rama de trabajo
  ```
- **Por qué:** hasta ahora todo vive **solo en tu laptop**. Conectar `origin` es lo que convierte tu repo local en algo compartible: respaldas el trabajo, y a partir de M06 podrás abrir Pull Requests para code review. Lo hacemos **una sola vez** por repo; los módulos siguientes asumen que `origin` ya existe. El `-u` (`--set-upstream`) vincula tu rama local con su gemela remota, así los siguientes `git push` / `git pull` ya no necesitan argumentos.
- **Cómo verifico:** recargo el repo en github.com y abro el **selector de ramas** (el dropdown que dice "main"): aparecen **`main`** y **`feature/m04-pom`**. En la terminal, `git remote -v` lista `origin` y `git status` dice `Your branch is up to date with 'origin/feature/m04-pom'`.

> 🌿 **Git JIT — local vs remoto, ¿cuándo eliges HTTPS o SSH?**
> Al crear el repo, GitHub te ofrece dos URLs para `origin`. No cambian el contenido — sólo **cómo te autentica** cada push:
>
> | | HTTPS | SSH |
> |---|---|---|
> | URL | `https://github.com/tu-usuario/omnipizza-playwright.git` | `git@github.com:tu-usuario/omnipizza-playwright.git` |
> | Autenticación | **PAT** (Personal Access Token) en vez de contraseña | Par de llaves SSH (`ssh-keygen`) registrado en GitHub |
> | Setup inicial | Cero (pegas el token la 1ª vez; el OS lo cachea) | Generar llave + subir la pública a GitHub Settings → SSH keys |
> | Recomendado para | Empezar rápido | Quien ya tiene llaves o pushea a diario |
>
> Elige una y úsala consistente. Si te equivocas, `git remote set-url origin <otra-url>` la cambia sin perder nada.

> ⚠️ **Gotchas al conectar el remoto**
> - **Autenticación:** con HTTPS, GitHub **ya no acepta tu contraseña** en el push — pide un **PAT** (Settings → Developer settings → Personal access tokens). Con SSH, el error `Permission denied (publickey)` significa que tu llave no está registrada.
> - **Repo no-vacío:** si marcaste README/.gitignore al crearlo, el primer `git push` falla con `! [rejected] ... (fetch first)` porque el remoto tiene un commit que tu local no. Por eso lo creamos **vacío**. (Si ya te pasó: `git pull origin main --allow-unrelated-histories`, resuelves y vuelves a pushear.)
> - **`-u` sólo la primera vez:** el `-u` es para el push **inicial** de cada rama. Después, `git push` a secas ya sabe a dónde ir.

---

### Paso 1 — Dependencias requeridas

**1.1 — Confirma que no hace falta instalar nada**
- **Qué hago:** ejecuto `pnpm list @playwright/test dotenv typescript @types/node`.
- **Por qué:** **M04 no añade paquetes npm nuevos.** Las clases TS se compilan con el `typescript` que ya tienes desde M01. El incremental de este módulo es de arquitectura de código, no de dependencias.
- **Cómo verifico:** las 4 dependencias aparecen listadas. Si falta alguna: `pnpm install` (si `package.json` ya las lista) o `pnpm add -D @playwright/test dotenv typescript @types/node`.

---

### Paso 2 — Reactivar el dolor (el ritual)

**2.1 — Marca y cuenta la duplicación de M03**
- **Qué hago:** ejecuto el **Ritual de apertura** de arriba: abro `modulo-03-data-driven/proyecto/tests/ejemplo.spec.ts` y marco con resaltador cada línea repetida entre mercados (login, selección de mercado, validación de URL). Cuento las líneas duplicadas y anoto el número.
- **Por qué:** el POM se justifica **por contraste**. Si no sientes primero la duplicación, vas a leer el POM como "abstracción innecesaria" y lo abandonarás en tu trabajo real. Este es el spine pedagógico del curso: smoke feo → dolor → refactor.
- **Cómo verifico:** tienes un número anotado y completaste la frase *"Si añado un tercer flujo (checkout), voy a duplicar ____ líneas más."*

> 💡 **Para el facilitador:** **no te saltes el ritual.** Es lo que convierte el POM en una solución a un dolor real y no en teoría de OOP.

---

### Paso 3 — Crear `pages/BasePage.ts` (la clase base)

**3.1 — Crea la carpeta `pages/` y el archivo base**
- **Qué hago:** creo la carpeta y abro el primer archivo en VS Code (se crea en disco al guardarlo):
  ```bash
  mkdir pages
  code pages/BasePage.ts
  ```
- **Por qué:** `BasePage` va **primero** porque todos los demás Pages la van a `extends`. Si no existe, `LoginPage extends BasePage` ni siquiera compila. Construimos de la raíz de la jerarquía hacia abajo.
- **Cómo verifico:** tras guardar el archivo en VS Code, `ls pages/` muestra `BasePage.ts`.

**3.2 — Escribe la clase y su constructor**
- **Qué hago:** escribo `pages/BasePage.ts` como **clase normal** (NO abstract — eso llega en M07):
  ```ts
  import type { Page, Locator } from "@playwright/test";

  export class BasePage {
    // `protected` → visible sólo para clases hijas, no para los tests.
    // `readonly` → el Page se amarra a una pestaña y no salta a otra.
    constructor(protected readonly page: Page) {}

    // Helper viewport-aware: añade "-desktop" (≥768px) o "-responsive".
    protected tid(base: string): Locator {
      const size = this.page.viewportSize();
      const suffix = size && size.width < 768 ? "-responsive" : "-desktop";
      return this.page.getByTestId(`${base}${suffix}`);
    }

    protected async waitForUrl(pattern: RegExp, timeout = 15_000): Promise<void> {
      await this.page.waitForURL(pattern, { timeout });
    }

    async screenshot(name: string): Promise<void> {
      await this.page.screenshot({ path: `test-results/${name}.png` });
    }
  }
  ```
- **Por qué:** `tid()` resuelve el sufijo de viewport en **un solo lugar**: las hijas no duplican esa lógica. `waitForUrl` centraliza la espera "paciente" (sin `sleep`). Que `tid` y `waitForUrl` sean `protected` los hace herramientas internas: las ven las hijas, no los tests.
- **Cómo verifico:** `pnpm exec tsc --noEmit` no marca errores en `BasePage.ts`; el editor no subraya en rojo.

> 🔷 **TypeScript — `class`**
> Una `class` es una plantilla que agrupa datos (propiedades) y comportamiento (métodos). En QA es tu "mapa de pantalla": `BasePage` define lo que **toda** pantalla comparte.
> 📚 Lo viste en [TS · M05 — Clases](../../typescript-qa-course/modulo-05-classes/). Aquí lo aplicas para crear el cimiento del Page Object Model.

> 🔷 **TypeScript — constructor shorthand (`protected readonly page: Page`)**
> Poner un modificador (`protected`/`readonly`/`private`/`public`) en un parámetro del constructor **declara y asigna** la propiedad en una sola línea — TS lo llama *parameter property*: equivale a `this.page = page` más la declaración del campo, sin cuerpo en el constructor. Sin el modificador, el parámetro sería una variable local que se pierde al terminar el constructor (gotcha clásico). La alternativa obvia — declarar el campo arriba y asignarlo a mano (`private page: Page; constructor(page: Page) { this.page = page }`) — son tres líneas y dos lugares donde olvidar el `readonly`; la parameter property lo hace en una y deja el contrato explícito. Ese `page` lo provee el fixture de Playwright cada vez que el test hace `new LoginPage(page)`.
> **Qué pasa si lo cambias:** sin `protected`, los tests podrían tocar `loginPage.page` directamente — rompes la encapsulación. Sin `readonly`, alguien puede reasignar `this.page` a otra pestaña a mitad del TC (la clase de bug "¿por qué el assert corrió en la pestaña equivocada?").
> 📚 Lo viste en [TS · M05 — Clases](../../typescript-qa-course/modulo-05-classes/). Aquí lo usas para inyectar la pestaña `page` de Playwright en cada Page Object.

> 🔷 **TypeScript — modificadores `private` / `protected` / `public`**
> `public` (default) → visible para todos, incluido el test. `private` → sólo dentro de la misma clase. `protected` → la misma clase y sus hijas, **pero no** los tests. El gotcha: si olvidas el modificador, TS asume `public` y rompes la encapsulación sin darte cuenta.
> Aquí `tid()` es `protected` — el punto medio exacto — para que `LoginPage` lo herede pero el spec no pueda construir locators a mano. **Qué pasa si lo cambias:** con `private`, las clases que `extends BasePage` dejan de compilar (no ven el helper heredado); con `public`, el spec puede llamar `loginPage.tid("x")` y los locators inline vuelven al test — se erosiona la encapsulación que da sentido al POM.
> 📚 Lo viste en [TS · M05 — Clases](../../typescript-qa-course/modulo-05-classes/).

> 🔷 **TypeScript — return type `Promise<void>`**
> Una función `async` siempre devuelve una `Promise`. `Promise<void>` significa "es asíncrona pero no resuelve ningún valor útil — sólo señala cuándo terminó". El gotcha: si olvidas `await` al llamarla, el test sigue antes de que la acción termine (flaky garantizado).
> 📚 Lo viste en [TS · M03 — Funciones](../../typescript-qa-course/modulo-03-functions/). Aquí casi todos los métodos de acción (`goto`, `loginAs`…) devuelven `Promise<void>`.

---

### Paso 4 — Crear `pages/LoginPage.ts` (la primera clase concreta)

**4.1 — Crea el archivo y extiende `BasePage`**
- **Qué hago:** creo `pages/LoginPage.ts` en VS Code (`code pages/LoginPage.ts`) y declaro `export class LoginPage extends BasePage`.
- **Por qué:** `extends` es **herencia**: `LoginPage` recibe gratis `page`, `tid()` y `waitForUrl()` de `BasePage`. No copio esos helpers — los reutilizo. Ese es el punto de tener una base.
- **Cómo verifico:** el editor autocompleta `this.tid(...)` dentro de `LoginPage` sin importarlo (viene heredado).

> 🔷 **TypeScript — `extends` y `super`**
> `class Hija extends Padre` hereda propiedades y métodos del padre. Si la hija define su propio `constructor`, debe llamar `super(...)` para inicializar la parte del padre **antes** de usar `this`. Aquí `LoginPage` **no** declara constructor propio, así que TS usa el de `BasePage` automáticamente — por eso no ves `super()` explícito.
> 📚 Lo viste en [TS · M05 — Clases](../../typescript-qa-course/modulo-05-classes/). Aquí cada Page `extends BasePage` para reutilizar los helpers comunes.

**4.2 — Declara los locators como `private get` y las acciones públicas**
- **Qué hago:** escribo el cuerpo de `LoginPage`:
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
    private get errorMessage(): Locator   { return this.page.getByTestId("login-error"); }
    private marketFlag(code: CountryCode): Locator {
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
  }
  ```
- **Por qué:** los locators son **`private get`** — propiedades calculadas: cada acceso reevalúa `this.tid(...)` — para que el test no pueda hacer `loginPage.usernameInput.fill(...)` y saltarse la acción de negocio. La alternativa obvia — escribir `this.page.getByTestId("username-desktop")` inline en cada método que lo use — reparte el locator por toda la clase; el getter lo centraliza: si el testid cambia, tocas **una línea**. Que sean `get` (no campos asignados en el constructor) los resuelve **perezosamente**: `tid()` consulta el `viewportSize()` en el momento del uso, no al construir el Page; si los asignaras en el constructor (`this.usernameInput = this.tid(...)`), congelarías el viewport al instante de `new LoginPage(page)`. `loginInMarket` encapsula los 5 pasos que en M03 estaban inline en cada test (los mismos que marcaste en el ritual). Las testids base (`"username"`, `"password"`, `"login-button"`) usan `tid()`, que les añade el sufijo `-desktop`/`-responsive`. Las banderas de mercado usan testid plano `market-XX` (sin sufijo de viewport) — por eso `marketFlag` va con `page.getByTestId` directo y no con `tid()`.
- **Cómo verifico:** `pnpm exec tsc --noEmit` sigue limpio; si intentas escribir `new LoginPage(page).usernameInput` en el spec, el editor lo subraya en rojo ("propiedad privada").

> 🔍 **Detalle que parece obvio — `readonly path = "/"`**
> **Qué es:** una propiedad de instancia de solo lectura en `LoginPage` (`"/"`) y `CatalogPage` (`"/catalog"`). En `LoginPage`, el método `goto()` la usa: `await this.page.goto(this.path)`. (En `CatalogPage` documenta qué pantalla mapea la clase — a `/catalog` se llega navegando tras el login, no con un `goto` directo.)
> **Por qué así (y no la alternativa obvia):** la alternativa es hardcodear la ruta dentro de cada método (`goto("/")`). Con `readonly path` la ruta vive en **un solo lugar** por Page y queda visible como "esta clase mapea esta pantalla". `readonly` comunica que la pantalla de una Page no cambia en tiempo de ejecución.
> **Qué pasa si lo cambias:** si quitas `readonly`, el compilador deja de protegerte ante una reasignación accidental (`this.path = ...`) que mandaría el `goto` a una pantalla equivocada. Si la inlineas en cada método, repites el string y pierdes el único punto de cambio.

> 🔍 **Detalle que parece obvio — `await this.page.goto(this.path)`**
> **Qué es:** navegación dentro del método del Page. El `this.` apunta a la instancia: `this.page` es la pestaña que inyectó el constructor y `this.path` la ruta de esta pantalla.
> **Por qué así (y no la alternativa obvia):** el método es `async` y lleva `await` porque `goto` devuelve una `Promise` (el gotcha de olvidarlo lo viste en el recuadro 🔷 `Promise<void>` del Paso 3). Y se usa `this.page` — no un `page` global ni un parámetro — porque cada Page se amarra a la pestaña que recibió: un solo test puede instanciar `LoginPage`, `CatalogPage` y `CheckoutPage` compartiendo la **misma** pestaña (exactamente lo que hace `reto.spec.ts` al construir los 3 Pages con el mismo `page`).
> **Qué pasa si lo cambias:** sin `await`, la navegación queda "en el aire" y los locators siguientes corren sobre la página vieja. Sin `async`, ni siquiera puedes usar `await` adentro. Y si reemplazas `this.page` por una referencia externa, rompes el aislamiento por instancia y vuelves al estilo script de M01.

> 💡 **Para el facilitador:** justo aquí, intenta en vivo escribir `loginPage.usernameInput.fill(...)` en el spec y muestra el subrayado rojo. Sentir que el compilador **bloquea** el atajo es más convincente que decir "los locators son privados".

---

### Paso 5 — Crear `pages/CatalogPage.ts` y `pages/CheckoutPage.ts`

**5.1 — Construye `CatalogPage` (catálogo `/catalog`)**
- **Qué hago:** creo `pages/CatalogPage.ts` en VS Code (`code pages/CatalogPage.ts`), también `extends BasePage`, con su `readonly path = "/catalog"` (el mismo patrón de ruta en un solo lugar que viste en el 🔍 de `LoginPage`), sus locators privados (`pizza-card-*`, `add-to-cart-*`, `nav-cart-count`) y acciones (`waitForCatalog`, `addFirstPizza`, `getPizzaNames`, `expectLoaded`, `expectHasPizzas`, `expectCartCount`).
- **Por qué:** las cards de pizza tienen testids **dinámicos**, así que el locator usa el prefijo `[data-testid^="pizza-card-"]` (selector legítimo, no inventado). Cada pizza es un `h3`; `getPizzaNames()` los lee con `getByRole("heading")`. Estos son los selectores OmniPizza verificados — no hay rol `list`/`listitem`.
- **Cómo verifico:** `pnpm exec tsc --noEmit` limpio; `CatalogPage` exporta también el tipo `Category` para los filtros.

**5.2 — Construye `CheckoutPage` (checkout `/checkout`)**
- **Qué hago:** creo `pages/CheckoutPage.ts` en VS Code (`code pages/CheckoutPage.ts`), `extends BasePage`, con los inputs del form (`checkout-fullname`, `checkout-phone`, `checkout-address`, `checkout-zip`), `place-order`, `order-total`, el flujo de confirmación en 2 pasos (`confirm-order-modal` → `confirm-order-yes` → `screen-order-success` con `order-id`), y los métodos `fillWithMarket`, `placeOrder`, `checkoutWith`, `expectLoaded`, `expectConfirmation`, `expectTotalContains`.
- **Por qué:** `CheckoutPage` es la pantalla que usarás en el **reto**. Sus métodos ya están listos para que el reto se enfoque en **orquestar** el flujo E2E, no en escribir locators. `fillWithMarket(market)` rellena los 4 campos con datos coherentes por mercado.
- **Cómo verifico:** `pnpm exec tsc --noEmit` limpio; los métodos públicos aparecen al autocompletar `checkoutPage.` en el spec.

**5.3 — Crea el barrel `pages/index.ts`**
- **Qué hago:** creo `pages/index.ts` en VS Code (`code pages/index.ts`) para reexportar las 4 clases (y el tipo `Category`):
  ```ts
  export { BasePage } from "./BasePage";
  export { LoginPage } from "./LoginPage";
  export { CatalogPage, type Category } from "./CatalogPage";
  export { CheckoutPage } from "./CheckoutPage";
  ```
- **Por qué:** el barrel deja que el spec importe con una sola línea — `import { LoginPage, CatalogPage } from "../pages"` — en vez de un import por archivo. Mantiene los specs limpios y desacopla el spec de la ubicación física de cada clase.
- **Cómo verifico:** desde un spec, `import { LoginPage, CatalogPage, CheckoutPage } from "../pages"` resuelve sin error.

---

### Paso 6 — Versiona el POM antes de tocar el spec

**6.1 — Commitea los Page Objects por pasos**
- **Qué hago:** desde la rama `feature/m04-pom`, hago commits incrementales:
  ```bash
  git add pages/BasePage.ts
  git commit -m "refactor(m04): add BasePage with shared helpers"

  git add pages/LoginPage.ts pages/CatalogPage.ts pages/CheckoutPage.ts pages/index.ts
  git commit -m "refactor(m04): extract Login, Catalog and Checkout Page Objects"
  ```
- **Por qué:** commits pequeños y descriptivos hacen el `git log --graph` legible y te dan puntos de retorno. Si el spec refactorizado sale mal, vuelves al commit donde los Pages ya estaban bien sin perderlos.
- **Cómo verifico:** `git log --oneline -2` muestra ambos commits en orden.

> 🌿 **Git JIT — convención de mensajes de commit**
> El prefijo `refactor(m04):` es la convención del curso (igual que `feat(mXX):`). "Refactor" comunica que **cambias estructura sin cambiar comportamiento**: los mismos 5 tests deben seguir pasando tras el commit.

---

### Paso 7 — Verificar `tsconfig.json` y `package.json`

**7.1 — Confirma que `tsconfig.json` incluye `pages/`**
- **Qué hago:** abro `tsconfig.json` y verifico que `"pages/**/*.ts"` esté en `include`.
- **Por qué:** si TS no compila `pages/`, los errores de tipo en tus clases pasan inadvertidos y `pnpm typecheck` te da un falso verde.
- **Cómo verifico:** el `include` contiene `"pages/**/*.ts"` (ya está en el `tsconfig.json` de este `proyecto/`, junto con `playwright.config.ts`, `types/` y `tests/`).

**7.2 — Confirma el script `m4` en `package.json`**
- **Qué hago:** verifico que exista `"m4": "playwright test --project=ui-anon"`.
- **Por qué:** es el atajo del módulo. Sin él, tendrías que escribir el comando completo cada vez.
- **Cómo verifico:** `pnpm m4` arranca el runner sobre este proyecto.

> **📐 Config — cambios vs M03**
> ```diff
> # playwright.config.ts — SIN CAMBIOS vs M01-M03
> # (M04 refactoriza los tests a Page Object Model; el runner corre igual)
> ```
> **Se mantiene:** todo (dotenv, baseURL, timeouts, el único project **anónimo** `ui-anon`). **Entra:** nada en el config — el incremental de M04 es de **arquitectura de código** (clases POM en `pages/`), no del runner. El próximo cambio real al config llega en **M06** (ahí nacen el setup project y el `ui-chromium` autenticado).

Tu `playwright.config.ts` sigue idéntico a M03:

```ts
// playwright.config.ts — Estado en M04 (igual que M01-M03)
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

### Paso 8 — Refactorizar el spec y ejecutarlo

**8.1 — Reescribe `ejemplo.spec.ts` usando los Page Objects**
- **Qué hago:** edito `tests/ejemplo.spec.ts` (dentro de `proyecto/`) para que el bucle de mercados instancie los Pages y llame a sus acciones:
  ```ts
  import { test } from "@playwright/test";
  import { LoginPage, CatalogPage } from "../pages";
  import type { Market, User } from "../types";
  import marketsJson from "../data/markets.json";
  import usersJson from "../data/users.json";

  const markets = marketsJson as Market[];
  const users = usersJson as User[];
  const standardUser = users.find((u) => u.username === "standard_user")!;

  test.describe("POM — login + catalog per market (M04)", () => {
    for (const market of markets) {
      test(`TC-${market.code} — clean flow in ${market.country} @smoke`, async ({ page }) => {
        const loginPage = new LoginPage(page);
        const catalogPage = new CatalogPage(page);

        await loginPage.loginInMarket(standardUser, market.code);
        await catalogPage.expectLoaded();
        await catalogPage.expectHasPizzas();
      });
    }
  });
  ```
- **Por qué:** el spec ahora se lee como **user story**, no como instrucción técnica: `loginInMarket(user, code)` reemplaza el bloque de ~5 líneas inline de M03. Nota que el bucle es un `for...of` sobre `markets` con un `test()` adentro — **no** existe ningún `test.each()` en Playwright; esto es un `for` clásico.
- **Cómo verifico:** `pnpm m4` corre los **mismos 5 tests** que M03 (uno por mercado) en verde.

**8.2 — Ejecuta el ejemplo en UI mode**
- **Qué hago:** corro `pnpm m4` (headless) y `pnpm test:ui` (recomendado la primera vez).
- **Por qué:** UI mode te deja ver el flujo limpio paso a paso y confirmar que el comportamiento no cambió — solo la estructura.
- **Cómo verifico:** el HTML report / la lista muestran 5 verdes (más el segundo `describe` "using granular actions"). Ese segundo bloque demuestra que el POM **no obliga** a usar siempre el método de alto nivel: puedes encadenar `goto / selectMarket / loginAs` cuando un TC necesite control fino.

**8.3 — Comparativa antes/después**
- **Qué hago:** abro M03 y M04 lado a lado y respondo: (1) si `username` cambia de testid, ¿cuántos archivos toco? (2) ¿dónde viviría un "logout"? (3) ¿por qué los locators son `private`?
- **Por qué:** el delta de líneas (~18/test en M03 → ~3/test en M04) y "1 línea vs 5 tests" ante un cambio de testid **son** el argumento del módulo.
- **Cómo verifico:** puedes contestar: (1) **1 línea** en `LoginPage.ts` vs 5 tests; (2) método público en `CatalogPage` (o un `LogoutPage` si crece); (3) para que el test no dependa del DOM interno — encapsulación.

---

### Paso 9 — Resolver el reto (CheckoutPage)

**9.1 — Completa el E2E del reto**
- **Qué hago:** abro `tests/reto.spec.ts` (dentro de `proyecto/`) y completo el flujo E2E **login → catálogo → addToCart → checkout → confirmación**, parametrizado por mercado, usando los métodos públicos de `CheckoutPage` ya disponibles:
  - `fillWithMarket(market)` — rellena el form.
  - `placeOrder()` — submit.
  - `checkoutWith(market)` — atajo: fill + placeOrder.
  - `expectLoaded()` / `expectConfirmation()` / `expectTotalContains(symbol)`.
- **Por qué:** el reto te hace **orquestar** Pages sin escribir locators inline (la única línea inline esperada es la del `nav-checkout-desktop`). Es donde compruebas que internalizaste la "regla de oro": si necesitas un locator que no existe, lo añades al Page, no al spec.
- **Cómo verifico:** los 5 tests del reto terminan en verde (`Reto-MX`, `Reto-US`, `Reto-CH`, `Reto-JP`, `Reto-SA` — Saudi Arabia). Cada `TODO` del reto trae su propio formato **Qué hacer / Pista / Cómo verificar** — resuélvelos tú; el README no los resuelve por ti.

**9.2 — Commitea el refactor del spec en `feature/m04-pom`**
- **Qué hago:** desde la rama `feature/m04-pom`, commiteo los dos specs refactorizados (el ejemplo del Paso 8.1 y el reto del 9.1):
  ```bash
  git add tests/ejemplo.spec.ts tests/reto.spec.ts
  git commit -m "feat(m04): refactor specs to use Page Object Model"
  ```
- **Por qué:** el entregable estrella del módulo (los specs refactorizados) queda **commiteado en la rama del módulo antes de cambiar de rama**. Esto deja el árbol de trabajo **limpio** para la práctica de sincronización del Paso 9.5: vas a saltar entre ramas (`hotfix/locator`, `feature/extra-test`) y, con todo commiteado, esos saltos son seguros. Es la regla de oro de Git que este módulo enseña: **commitea antes de cambiar de rama**, nunca arrastres cambios sin commitear de una rama a otra.
- **Cómo verifico:** `git status` dice `On branch feature/m04-pom` y `nothing to commit, working tree clean`; `git log --oneline -1` muestra el commit del refactor de specs.

---

### Paso 9.5 — Sincronizar ramas en ambos sentidos (GitHub ⇄ local)

Ya conectaste `origin` en el Paso 0.3. Ahora practica el ida-y-vuelta: una rama nace en GitHub y baja a tu local; otra nace local y sube a GitHub. En equipo esto pasa todo el tiempo — un compañero crea una rama desde la web, o tú abres una desde tu máquina.

> **Analogía QA:** tu repo **local** es tu estación de trabajo; **`origin`** (GitHub) es el **ambiente compartido del equipo**. Una rama remota es como un build que alguien dejó en el ambiente compartido: no está en tu máquina hasta que la **traes** (`fetch` + `switch`). Y una rama tuya no existe para el equipo hasta que la **publicas** (`push -u`).

**9.5.1 — GitHub → local: traer una rama creada en la web**
- **Qué hago:** simulo que un compañero (o yo desde otra máquina) creó una rama en GitHub, y la bajo a mi local.
  1. En github.com, abro el **selector de ramas**, escribo `hotfix/locator` y clic en **Create branch: hotfix/locator from 'main'**.
  2. En mi terminal local, la traigo y me cambio a ella:
  ```bash
  git fetch origin                # entera a tu local de las ramas nuevas del remoto
  git switch hotfix/locator       # crea la rama local rastreando origin/hotfix/locator
  ```
- **Por qué:** `git fetch` **no** modifica tus ramas — sólo actualiza tu copia del estado del remoto (`origin/*`). El `git switch hotfix/locator` es la magia: cuando el nombre coincide con una rama remota, Git crea la local **con tracking automático** (equivale al viejo `git checkout -b hotfix/locator --track origin/hotfix/locator`). Así un `git pull` futuro sobre esa rama ya sabe de dónde jalar.
- **Cómo verifico:** `git branch -vv` muestra la rama local con su upstream entre corchetes:
  ```
  * hotfix/locator  a1b2c3d [origin/hotfix/locator] ...
  ```
  Ese `[origin/hotfix/locator]` es la prueba de que está siguiendo a la remota.

**9.5.2 — local → GitHub: publicar una rama que nació en tu máquina**
- **Qué hago:** creo una rama local y la subo a `origin` para que el equipo la vea.
  ```bash
  git switch -c feature/extra-test    # rama nueva, sólo local por ahora
  git push -u origin feature/extra-test
  ```
- **Por qué:** la rama existió **sólo en tu disco** hasta el `push`. El `-u` (igual que en el Paso 0.3) la vincula con su gemela remota en su primer viaje; después basta `git push`.
- **Cómo verifico:** recargo github.com y abro el selector de ramas: `feature/extra-test` aparece. `git branch -vv` ahora la muestra con `[origin/feature/extra-test]`.

**Resumen — los dos sentidos:**

| Sentido | Nació en | Cómo lo sincronizas | Cómo verificas |
|---|---|---|---|
| **GitHub → local** | la web de GitHub | `git fetch origin` + `git switch <rama>` | `git branch -vv` muestra `[origin/<rama>]` |
| **local → GitHub** | tu máquina (`git switch -c`) | `git push -u origin <rama>` | aparece en el selector de ramas de github.com |

> 💡 **Para el facilitador:** estas dos ramas (`hotfix/locator`, `feature/extra-test`) son **sólo para practicar la sincronización** — no las mergees ni las uses para el refactor. La rama del módulo sigue siendo `feature/m04-pom` (con los Page Objects **y** los specs ya commiteados desde los Pasos 6.1 y 9.2), que mergeas a `main` en el Paso 10. Como ya commiteaste todo antes de este paso, saltar entre ramas aquí es seguro: no arrastras cambios sin commitear. Si quieres dejar el repo limpio después, bórralas con `git branch -d` (local) y `git push origin --delete <rama>` (remoto).

> 📚 **Profundización opcional Git:** [Trabajar con remotos](../../git-github-course/modulo-03-undo-remotos-tags/02-remotos.md) · [Crear y subir un repo](../../git-github-course/modulo-06-github/02-crear-subir-repo.md)

---

### Paso 10 — Cerrar la rama: merge a `main`

**10.1 — Mergea `feature/m04-pom` a `main`**
- **Qué hago:** confirmo que la rama del módulo trae **todo** commiteado, **sincronizo su gemela remota** y la integro a `main`:
  ```bash
  git log feature/m04-pom --oneline         # confirma: Page Objects (6.1) + specs (9.2) están aquí
  git push origin feature/m04-pom           # sube a origin los commits de la rama (ya tiene upstream del Paso 0.3)
  git switch main
  git merge feature/m04-pom
  git push origin --delete feature/m04-pom  # limpia la rama remota ya integrada
  git branch -d feature/m04-pom             # ...y la local (ahora sí: integrada y en sync con su upstream)
  ```
- **Por qué:** los Page Objects (Paso 6.1) y los specs refactorizados (Paso 9.2) **ya están commiteados** en `feature/m04-pom`, así que esta no es la primera vez que se versionan: aquí sólo integras. El primer `git push origin feature/m04-pom` sube a `origin` los commits que el Paso 0.3 dejó **sólo** en tu local (en 0.3 pusheaste la rama recién creada; los commits de 6.1 y 9.2 vinieron **después** y nunca se subieron, así que `origin/feature/m04-pom` quedó atrás). Lo escribimos con el nombre explícito de la rama — no un `git push` a secas — porque el Paso 9.5 te dejó parado en `feature/extra-test`, y un `push` pelón subiría **esa** rama, no la del módulo. Por eso `git switch main` puede hacerse desde **cualquier** rama en la que el Paso 9.5 te haya dejado — el merge trae los commits de `feature/m04-pom` sin importar dónde estabas parado, porque vives integrando una rama completa, no arrastrando trabajo a medias. El orden del cierre importa: **primero** borras la rama remota integrada (`git push origin --delete`) y **luego** la local, porque `git branch -d` valida que la rama esté integrada **contra su upstream** (`origin/feature/m04-pom`), no contra `main`. Si borraras la local con el upstream aún atrasado, `-d` fallaría con `the branch 'feature/m04-pom' is not fully merged` aunque el merge a `main` haya sido perfecto; al sincronizar (`push`) y limpiar el remoto antes, `-d` ya no encuentra un upstream desfasado y borra sin protestar.
- **Cómo verifico:** el `git log feature/m04-pom --oneline` muestra **ambos** commits (los Page Objects y el refactor de specs) antes del merge. Tras integrar, `git log --oneline --graph -5` los muestra en `main`. Si `main` no avanzó desde que ramificaste, verás un **fast-forward** (sin commit extra); si avanzó, un **merge commit** con dos padres. Ambos son correctos. El `git branch -d` termina con `Deleted branch feature/m04-pom` (sin el error `not fully merged`), y la rama remota ya no aparece: ni en `git branch -r` ni en el selector de ramas de github.com.

> | Prefijo de rama | Uso |
> |---|---|
> | `feature/` | Nueva capacidad (POM, fixture, test) |
> | `fix/` | Arreglar un test flaky o bug del framework |
> | `chore/` | Upgrade de dependencias, limpieza |
> | `refactor/` | Reestructurar sin cambiar comportamiento |

**10.2 — (Opcional, demostración) Provoca y resuelve un conflicto**
- **Qué hago:** para *practicar* conflictos, simulo dos cambios al mismo método. En la rama cambio un locator de `LoginPage`:
  ```typescript
  // En feature/m04-pom
  get emailInput() { return this.page.getByLabel('Correo'); }
  ```
  y en `main` alguien ya mergeó otra versión del mismo método:
  ```typescript
  // El cambio que llegó primero a main
  get emailInput() { return this.page.getByRole('textbox', { name: 'Email' }); }
  ```
  Al `git merge feature/m04-pom`, Git no puede decidir:
  ```bash
  Auto-merging pages/LoginPage.ts
  CONFLICT (content): Merge conflict in pages/LoginPage.ts
  Automatic merge failed; fix conflicts and then commit the result.
  ```
- **Por qué:** un conflicto NO es un error — es Git pidiéndote que decidas qué cambio gana cuando dos ramas tocaron la misma línea. Verlo a propósito, en un caso controlado, te quita el miedo cuando aparezca de verdad en equipo.
- **Cómo verifico:** el archivo muestra los marcadores `<<<<<<< HEAD` (lo de `main`) `=======` (separador) `>>>>>>> feature/m04-pom` (tu rama). Para resolver: editas a mano, **borras los tres marcadores**, y:
  ```bash
  git add pages/LoginPage.ts
  git commit            # abre el editor con el mensaje pre-escrito; guarda y cierra
  ```
  Si te arrepientes a mitad: `git merge --abort` regresa el repo al estado previo.

> 💡 **VS Code** muestra botones inline **Accept Current**, **Accept Incoming**, **Accept Both** sobre cada bloque en conflicto. Úsalos para evitar borrar mal los marcadores a mano.

> 📚 **Profundización opcional Git:** [Conceptos de ramas](../../git-github-course/modulo-04-ramas-y-merge/01-ramas-conceptos.md) · [Flujo feature-branch detallado](../../git-github-course/modulo-04-ramas-y-merge/03-flujo-feature-branch.md) · [Tipos de merge](../../git-github-course/modulo-04-ramas-y-merge/04-merge.md) · [Conflictos avanzados](../../git-github-course/modulo-04-ramas-y-merge/05-conflictos.md) · [Workflows de equipo y rebase](../../git-github-course/modulo-05-workflows-rebase/)

---

## ▶️ Cómo ejecutar este módulo

Todos los comandos se corren **desde `proyecto/`** (el proyecto autocontenido de este módulo):

```bash
cd proyecto
pnpm install
pnpm install:browsers
cp .env.example .env
```

- **Comando del módulo:** `pnpm m4` (o `pnpm test`, el atajo que el proyecto define)
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
- [ ] Aislaste el refactor en `feature/m04-pom` y lo mergeaste a `main`.
- [ ] Creaste el repo en GitHub (`omnipizza-playwright`, sin archivos iniciales) y conectaste `origin`.
- [ ] Subiste `main` y `feature/m04-pom` con `git push -u` y los ves en el selector de ramas.
- [ ] Sincronizaste una rama en **ambos sentidos** (GitHub → local con `fetch`/`switch`; local → GitHub con `push -u`).

---

## ¿Qué viene en M05?

En M04 el login todavía corre por UI en **cada** test, y cada test instancia sus Page Objects a mano. En **M05 (fixtures)** vas a inyectar esos Page Objects y datos únicos por test vía **fixtures custom** (`test.extend`), matando ese boilerplate. Y en **M06 (setup + auth)** vas a eliminar el login repetido: un `auth.setup.ts` se ejecuta **una sola vez**, guarda el estado de sesión en `.auth/`, y todos los TCs arrancan ya autenticados. Ahí entra el primer cambio real al `playwright.config.ts` desde M01 (un `project` de `setup` con dependencias) y, en Git, el ciclo `push → PR → code review → deshacer` (`git restore` / `git revert`) porque tocar `auth.setup.ts` puede romper toda la suite.
