# Módulo 03 — Refactor a POM (OOP incremental)

**Duración estimada:** 80-105 min (incluye dos *Git breaks* — branches y conflictos)
**Pieza que suma al framework:** `pages/BasePage.ts` + `LoginPage.ts` + `CatalogPage.ts` + `CheckoutPage.ts`. El spec de M02 se refactoriza y se nota cuánto se limpia.

---

## 🏗️ Arquitectura al terminar este módulo

Aparece la carpeta **`pages/`** con el Page Object Model. Las clases `extends BasePage` para reutilizar helpers (testid, waitForUrl, etc.) sin duplicar código.

```
playwright-course/
├── data/                          ← (M02)
├── pages/                         ← 🆕 Page Object Model
│   ├── BasePage.ts                ← 🆕 clase normal, helpers compartidos
│   ├── LoginPage.ts               ← 🆕 extends BasePage, maneja "/"
│   ├── CatalogPage.ts             ← 🆕 extends BasePage, maneja /catalog
│   ├── CheckoutPage.ts            ← 🆕 extends BasePage, maneja /checkout
│   └── index.ts                   ← 🆕 barrel export
├── types/                         ← (M02)
├── modulo-01-smoke-feo/           ← (sin cambios — el "antes")
├── modulo-02-locators-data/       ← (sin cambios — el "menos antes")
├── modulo-03-pom/                 ← 🆕 ESTE MÓDULO
│   ├── README.md
│   ├── ejemplo.spec.ts            ← 🆕 specs limpios usando los Page Objects
│   └── reto.spec.ts               ← 🆕 E2E checkout completo con CheckoutPage
└── ...
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
                                   inline de M02)
                       }
```

**Qué NO existe todavía:**

| Carpeta | Llega en | Para qué |
|---|---|---|
| `tests/setup/`, `fixtures/`, `helpers/`, `.auth/` | M04 | Eliminar el login UI de cada test |
| `services/`, `tests/api/` | M05 | API testing |
| `.github/workflows/` | M06 | CI/CD |

> 💡 **Para el facilitador:** después de presentar la jerarquía, abre `pages/LoginPage.ts` y muestra que **todos los `get` son `private`**. Eso significa que el test NO puede acceder al locator directamente — debe ir por la acción pública (`loginInMarket`). Ése es el corazón del POM.

---

## 🔥 Ritual de apertura — "reactivar el dolor"

**Antes de tocar ninguna clase**, haz este ejercicio:

1. Abre `modulo-02-locators-data/ejemplo.spec.ts`.
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

> **⚠️ Nota sobre `abstract`:** en este módulo `BasePage` es una clase **normal**, no abstracta. La palabra `abstract` aparecerá por primera vez en M05 cuando tengamos varios servicios que realmente la justifiquen. Por ahora la convención es humana: **no instancies `BasePage` directamente — extiéndela**.

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

```bash
# Estando en playwright-course/
pnpm m2            # debe pasar los 4 mercados en verde
pnpm typecheck     # debe pasar limpio
ls types/ data/    # ambas carpetas existen (vienen de M02)
```

Si M02 no corre, vuelve al módulo anterior. Este módulo asume que la data tipada y los locators jerárquicos ya están internalizados.

> 💡 **Para el facilitador:** repite en voz alta los nombres de los Page Objects que vamos a usar — `LoginPage`, `CatalogPage`, `CheckoutPage` — y enséñales que viven en `pages/`. Lo van a oír cien veces en los próximos 90 minutos.

---

### Paso 1 — Dependencias requeridas

**M03 no añade paquetes npm nuevos.** Las clases TS se compilan con el `typescript` que ya tienes.

```bash
pnpm list @playwright/test dotenv typescript @types/node 2>/dev/null
# Si las 4 aparecen, listo. Si no, ejecuta:
#   pnpm install            (si package.json ya las lista)
#   pnpm add -D @playwright/test dotenv typescript @types/node  (si no)
```

---

### Paso 2 — Crear `pages/` (el Page Object Model)

```bash
mkdir -p pages
touch pages/BasePage.ts pages/LoginPage.ts pages/CatalogPage.ts pages/CheckoutPage.ts pages/index.ts
```

**Esqueleto mínimo** de cada archivo (el alumno los llena durante el módulo):

📄 `pages/BasePage.ts` — clase normal (NO abstract; eso llega en M05):

```ts
import type { Page, Locator } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}

  protected tid(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  async waitForUrl(pattern: RegExp): Promise<void> {
    await this.page.waitForURL(pattern);
  }
}
```

📄 `pages/LoginPage.ts` — primera clase concreta:

```ts
import { BasePage } from "./BasePage";
import type { CountryCode, User } from "../types";

export class LoginPage extends BasePage {
  private get usernameInput() { return this.tid("username-desktop"); }
  private get passwordInput() { return this.tid("password-desktop"); }
  private get signInButton()  { return this.tid("login-button-desktop"); }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async selectMarket(code: CountryCode): Promise<void> {
    await this.tid(`market-${code}`).click();
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
  }
}
```

📄 `pages/index.ts` (barrel — facilita el import en los specs):

```ts
export { BasePage } from "./BasePage";
export { LoginPage } from "./LoginPage";
export { CatalogPage } from "./CatalogPage";
export { CheckoutPage } from "./CheckoutPage";
```

(Los esqueletos completos de `CatalogPage` y `CheckoutPage` los construirás guiado por el ejemplo y el reto.)

---

### Paso 3 — Ajustes a `playwright.config.ts` (estado al terminar M03)

**M03 no requiere cambios al config.** Sigue siendo el mismo de M01/M02.

Solo asegúrate de que `tsconfig.json` incluya `pages/`:

```json
{
  "include": [
    "playwright.config.ts",
    "types/**/*.ts",
    "types/**/*.d.ts",
    "pages/**/*.ts",
    "modulo-*/**/*.ts"
  ]
}
```

Añade `m3` a `package.json`:

```json
"scripts": {
  "m3": "playwright test modulo-03-pom --project=ui-chromium"
}
```

Tu `playwright.config.ts` debe seguir como en M02:

```ts
// playwright.config.ts — Estado en M03 (igual que M01/M02)
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

> 💡 **Punto pedagógico:** M03 es **puro código**, no toca configuración. Eso refuerza el principio del curso: **la arquitectura crece donde el problema lo exige**. Aquí el problema es duplicación → solución POM → archivos en `pages/`.

---

### Paso 4 — Hacer el ritual (5-10 min)

(Ver la sección "Ritual de apertura" arriba.) **No saltes este paso.** Es lo que justifica todo lo demás.

---

### Paso 5 — Lectura guiada de `pages/BasePage.ts`

Abre `pages/BasePage.ts` con el grupo y señala:

- `protected readonly page: Page` — todas las hijas la heredan, los tests no la tocan.
- `protected tid(name: string)` — método helper interno; las hijas lo usan para construir testids consistentes.
- `async waitForUrl(...)` — la espera "paciente" centralizada (sin `sleep`).
- **Por qué no es `abstract`:** porque por sí sola sigue siendo útil para crear hijas. En M05 vas a ver el caso donde `abstract` sí es indispensable.

---

### Paso 6 — Lectura guiada de `pages/LoginPage.ts`

Cosas que el facilitador debe señalar:

- Los **locators son `private get`** — el test no debería poder hacer `loginPage.usernameInput.fill(...)`. Si lo necesitara, es señal de que el Page no expone una acción de alto nivel.
- Las **acciones públicas** se leen como user story:
  - `loginAs(user)`
  - `loginInMarket(user, code)`
  - `selectMarket(code)`
- El método `loginInMarket` **encapsula los 5 pasos** que en M02 estaban inline en cada test.

> 💡 **Para el facilitador:** abre M02 `ejemplo.spec.ts` y M03 `ejemplo.spec.ts` lado a lado. Cuenta las líneas: ~18 por test en M02, ~3 en M03. Ese delta es el argumento del módulo.

---

### Paso 7 — Ejecutar el ejemplo

```bash
# Headless
pnpm m3

# UI mode (recomendado para ver el flujo limpio)
pnpm test:ui
```

**Qué esperar:**

- Los **mismos 4 tests** que en M02 (uno por mercado) corren en verde.
- En el spec verás `loginPage.loginInMarket(user, 'MX')` en lugar del bloque de 5 líneas.
- Hay un segundo `describe` ("uso de acciones granulares") que muestra que el POM **no obliga** a usar siempre el método de alto nivel — puedes encadenar `goto / selectMarket / loginAs` cuando un TC necesite control fino.

---

### Paso 8 — Comparativa antes/después (5 min)

Pide al grupo abrir M02 y M03 simultáneamente y responder:

1. ¿Qué pasa si el campo `username-desktop` cambia de testid?
   - En M02: **modificas 4 tests**.
   - En M03: **modificas 1 línea** en `LoginPage.ts`.
2. Si añadieras un nuevo flujo "logout" desde el catálogo, ¿dónde viviría?
   - Respuesta: como método público en `CatalogPage` (o un nuevo `LogoutPage` si fuera más grande).
3. ¿Por qué los locators son `private`?
   - Para que el test **no sepa** cómo está el DOM por dentro. Eso es encapsulación.

---

### Paso 9 — Resolver el reto

Abre `reto.spec.ts`. Tu trabajo es completar un flujo E2E **login → catálogo → addToCart → checkout → confirmación** usando los Page Objects ya construidos.

`CheckoutPage` ya tiene métodos listos (revísalos primero):

- `checkoutWith(market)` — atajo: fill + placeOrder.
- `fillWithMarket(market)` — sólo rellena el form.
- `placeOrder()` — submit.
- `expectLoaded()` / `expectConfirmation()` / `expectTotalContains(symbol)`.

Cada TODO del reto sigue el formato **Qué hacer / Pista / Cómo verificar**.

---

## Comandos útiles

```bash
pnpm m3                                          # corre M03
pnpm typecheck                                   # ojo: la herencia introduce errores sutiles
pnpm exec playwright test --reporter=list        # output compacto
pnpm exec playwright show-report                 # último HTML report
pnpm exec playwright test modulo-03-pom/reto.spec.ts --headed --project=ui-chromium
```

---

## Outcome esperado

- [ ] Hiciste el ritual y anotaste el número de líneas duplicadas en M02.
- [ ] Puedes explicar qué significa `private` / `protected` / `public` en este contexto.
- [ ] Entiendes por qué `readonly page: Page` evita bugs.
- [ ] Sabes extender `BasePage` para crear un Page nuevo.
- [ ] **Puedes contar las líneas eliminadas** vs M02.
- [ ] Completaste el reto E2E con `CheckoutPage`.
- [ ] Sabes que `abstract` llega en M05 — no lo introdujimos aquí.

---

## 🌿 Git break — Refactoriza en una rama (no en `main`)

Vas a tocar varios archivos a la vez (`BasePage`, `LoginPage`, `CatalogPage`, `CheckoutPage`). Esto es **el momento perfecto** para una rama dedicada: si el refactor sale mal, descartas la rama y `main` queda intacto.

### El flujo

```bash
# 1. Asegúrate de estar en main al día
$ git switch main
$ git pull            # sólo si ya tienes remoto configurado

# 2. Crea tu rama de feature
$ git switch -c feature/m03-pom

# 3. Trabaja, commitea por pasos
$ git add pages/BasePage.ts
$ git commit -m "refactor: add BasePage with shared helpers"

$ git add pages/LoginPage.ts pages/CatalogPage.ts
$ git commit -m "refactor: extract Login and Catalog Page Objects"

# 4. Cuando el refactor está listo, vuelve a main y mergea
$ git switch main
$ git merge feature/m03-pom

# 5. Borra la rama ya mergeada
$ git branch -d feature/m03-pom
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

Imagina que tú estás en `feature/m03-pom` y cambiaste el locator del input de email en `LoginPage`:

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
$ git merge feature/m03-pom
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
>>>>>>> feature/m03-pom
}
```

- `<<<<<<< HEAD` = lo que está en `main` ahora.
- `=======` = separador.
- `>>>>>>> feature/m03-pom` = lo que trae tu rama.

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
