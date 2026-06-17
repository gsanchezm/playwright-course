# Plan v3.1 — Curso Playwright sobre arquitectura incremental

> **Versión:** v3.1 — incorpora correcciones post-review de Technical Architect, PhD en Educación, y Test Automation Architect.
> **Cambios vs v3:** patrón `auth.setup.ts` (project con `dependencies`) en vez de `globalSetup` con UI login; `abstract` removido de M03 (se defiere íntegro a M05); sección de **data isolation** para `fullyParallel`; `.env` + secretos desde M01; analogías de `abstract class` / `readonly` / `protected` reescritas; `page.route()` añadido en M04; CI con matrix real por browser; tiempos de M04 ajustados.

---

## Principio rector

El framework es la **spine** del curso. Cada módulo **añade una capa** al framework y trae consigo los conceptos de TypeScript y Playwright que esa capa requiere, **just-in-time** (JIT). Nada de bloques teóricos sueltos: la OOP entra cuando el test feo duele, la clase abstracta entra cuando hay varios servicios que comparten comportamiento, y así sucesivamente.

**Duración objetivo:** 4.5 – 6 horas repartidas en 6 módulos secuenciales.

**Hilo conductor:** OmniPizza (frontend + backend live en Render).

---

## Decisiones de diseño (y su "por qué")

| Decisión | Por qué |
|---|---|
| 6 módulos de ~45-65 min | Encaja en 4.5-6 h reales con margen para preguntas. Más módulos diluyen; menos, saturan. |
| Orden: smoke feo → dolor → POM | Sin el dolor el alumno no internaliza por qué existe POM. Enseñar el patrón antes del problema lo convierte en dogma. |
| POM y rutas reales (`LoginPage`, `CatalogPage`, `CheckoutPage`) | Reflejan la app OmniPizza real; no abstraemos a nombres genéricos porque el alumno pierde el anclaje. |
| Agents/MCP fuera del core | Commit `58d61c2` ya removió `modulo-11-ia/` (Copilot, MCP, prompts, aserciones asistidas). El curso base debe funcionar sin suscripciones a AI; MCP va como apéndice. |
| TypeScript aplicado, no impuesto | Interfaces/clases/abstract aparecen cuando el problema lo pide. Forzarlos da código artificial. |
| Tuplas **fuera** del data-driven | Las tuplas pierden nombres de campo → ilegibilidad. Usamos `interface` para `test.each()`. |
| `abstract` **sólo en M05**, no en M03 | M03 ya introduce `class`, `extends`, `super`, `private`, `protected`, `public`, `readonly` — son 7 conceptos. Añadir `abstract` sin explicación (ni con nota "lo verás en M05") deja un hueco activo en memoria de trabajo. En M05 hay 2+ servicios que justifican la abstracción y ya no compite con el refactor. |
| `auth.setup.ts` como project con `dependencies` (no `globalSetup`) | Patrón 2026 de Playwright: un proyecto `setup` con `testMatch: /.*\.setup\.ts/` que hace **login vía API** (rápido, determinista) y escribe `storageState`. Los demás projects declaran `dependencies: ['setup']`. Evita el UI-login lento/frágil y no colisiona con otros fixtures. |
| `storageState` **por project**, no global en `use:` | Poner `use: { storageState }` a nivel top del config autentica **todo** — incluida la suite `tests/api/` y casos anónimos / negativos. Lo aplicamos por project (`ui-authenticated`), y el project `api` lo omite. |
| Data isolation con `workerInfo.workerIndex` + timestamp | `fullyParallel: true` + shards + usuarios compartidos = data collisions que `retries` enmascara. Cada test que crea data usa un identificador único (`user+{workerIndex}-{Date.now()}@...`). |
| `.env` + `dotenv` desde M01 | `BASE_URL`, credenciales y secrets de CI son realidad de día 1 en un trabajo de QA. `.env.example` se commitea; `.env` va en `.gitignore`. En CI se usan `secrets.*`. |
| Trace Viewer protagónico en M06 | Es la herramienta que convierte a un alumno en tester autónomo. Relegarla a nota al pie es desperdiciarla. |
| Matrix de browsers en CI *real* | O se implementa con `projects` por browser + `matrix.project` en el workflow, o se quita la promesa. Optamos por implementarla. |
| Desarrollo en rama `feature/v3-arquitectura-incremental` | Permite PR revisable. Limpieza destructiva nunca va sobre `main`. |
| Reto por módulo | Patrón ya probado en el curso de TypeScript. La práctica activa fija mejor que la lectura. |

---

## Glosario de analogías (terminología QA → concepto Playwright/TS)

Este glosario es la **regla de oro pedagógica** del curso. Cada vez que se introduzca un término nuevo se usa la analogía correspondiente para anclarlo al mundo que el alumno ya conoce (testing manual).

| Concepto | Analogía QA |
|---|---|
| `test()` | Caso de prueba (TC-001) del test plan |
| `describe()` | Suite / sección del test plan ("Login", "Checkout") |
| `expect(...).toXxx()` | Resultado esperado documentado en el TC |
| `beforeAll` / `afterAll` | Precondiciones / postcondiciones a nivel suite |
| `beforeEach` / `afterEach` | Precondiciones / postcondiciones por TC |
| Locator | Dirección de un bug report ("el botón azul a la derecha del carrito") |
| `getByRole` | Localizar por el **rol ARIA** — cómo lo ve un lector de pantalla (accesibilidad) |
| `getByTestId` | Stickers que el developer pega en los elementos para que QA los encuentre siempre |
| Auto-waiting | La paciencia del tester manual: espera a que cargue antes de hacer click, no lo hace a ciegas |
| `tags` (`@smoke`, `@regression`) | Etiquetas de severidad / tipo de prueba en el test management tool |
| `test.each()` | Matriz de datos: un mismo TC ejecutado con 5 sets de datos distintos |
| Fixture | Ambiente de prueba preparado: usuario logueado, data sembrada, mercado configurado |
| `page.route()` | Mock de backend: interceptas una llamada y devuelves la respuesta que tú decides (como un stub en Postman Mock Server) |
| `storageState` | La credencial / badge del tester ya timbrada — no repites el ingreso al edificio cada mañana |
| `auth.setup.ts` project | El proceso de **registro en recepción**: se hace una sola vez al llegar; todos los TCs posteriores entran con el badge ya emitido |
| `Page` (clase) | Page Object Model: el mapa de los elementos y acciones de una pantalla |
| `BasePage` | Plantilla genérica que todo Page hereda: "toda pantalla tiene header, toast, y helper de testid" |
| `extends` / `super` | Herencia de la BasePage — reutilizas lo que ya existe en lugar de copiarlo |
| `private` (locators) | Documentación interna del Page: los demás equipos nunca la consultan directamente |
| `public` (acciones de negocio) | La interfaz del POM: `loginAs(user)`, `addToCart(pizza)` |
| `protected` | Herramientas del equipo QA interno: las ve tu equipo (clases hijas), no el cliente final (el test) |
| `readonly page: Page` | Tu pestaña del navegador: el Page Object se amarra a esa y no salta a otra a mitad del TC (evita errores absurdos) |
| `interface` | Contrato tipo Swagger / SRS: "un User tiene email, password, role" |
| `abstract class` | **Formato obligatorio de reporte de bug**: no se puede entregar en blanco — cada persona debe rellenar las secciones requeridas (los métodos abstractos) antes de que cuente como reporte válido |
| `APIRequestContext` | Postman embebido en el test: disparas HTTP y validas response |
| `Promise<T>` | "Te devuelvo el resultado cuando esté listo, no bloquees al tester" |
| Trace Viewer | Caja negra de un avión: reconstruye cada click, request y screenshot del TC fallido |
| `retries` | Re-ejecutar un test flaky automáticamente antes de reportarlo roto |
| `fullyParallel` | Varios testers corriendo la misma suite a la vez, cada uno en su worker |
| `workerInfo.workerIndex` | El número de identificación del tester paralelo (worker 0, 1, 2…) — lo usamos para generar data única por worker |
| `shards` | Repartir 200 TCs entre 4 máquinas → 50 TCs cada una, en paralelo |
| `projects` (en config) | Ambientes del test plan: Chrome Desktop, Mobile Safari, Firefox — misma suite, múltiples runners |
| `dependencies` (en projects) | "Este project no corre hasta que el de `setup` haya terminado" — precondiciones declarativas |
| `.env` / `.env.example` | El `.env` es la libreta personal del tester con passwords y URLs (no se comparte). El `.env.example` es la plantilla vacía que sí se versiona |
| GitHub Actions | Jenkins / servidor de CI: ejecuta la suite automáticamente al hacer push |
| `secrets.*` en Actions | La caja fuerte del equipo: credenciales disponibles sólo durante la corrida del pipeline |

---

## Estructura target del repo

```
playwright-course/
├── playwright.config.ts
├── .env.example                      ← plantilla de secretos (versionada)
├── .env                              ← secrets locales (gitignored)
├── .auth/                            ← storageState por rol (gitignored)
│   ├── user.json
│   └── admin.json
├── tests/
│   ├── setup/
│   │   └── auth.setup.ts             ← login vía API, persiste storageState (M04)
│   ├── smoke/                        ← @smoke
│   ├── regression/                   ← @regression
│   └── api/                          ← API pura (M05)
├── types/
│   ├── index.ts
│   └── omnipizza.d.ts                ← User, Market, OrderPayload, …
├── data/
│   ├── users.json
│   └── markets.json
├── helpers/
│   └── unique-data.ts                ← genera identificadores únicos por worker (M04)
├── services/                         ← API Layer (M05)
│   ├── BaseService.ts                ← abstract (sólo introducido aquí)
│   ├── AuthService.ts
│   └── OrderService.ts
├── pages/                            ← UI Layer POM (M03)
│   ├── BasePage.ts                   ← clase normal (NO abstracta en M03)
│   ├── LoginPage.ts
│   ├── CatalogPage.ts
│   └── CheckoutPage.ts
├── fixtures/                         ← Custom fixtures (M04)
│   └── omnipizza.ts                  ← market fixture, adminPage, etc.
├── .github/workflows/
│   └── playwright.yml                ← M06 (matrix por browser)
└── modulo-0X-*/                      ← 6 módulos secuenciales + retos
```

---

## Los 6 módulos

---

### M01 — Setup + primer smoke "feo" (45-60 min)

**Analogía:** el alumno escribe su primer caso de prueba automatizado **tal y como lo haría un tester manual copiando pasos en una hoja de Excel**: un bloque largo, sin reutilización, todo inline. El objetivo es que **sienta la duplicación** al escribir el segundo y tercer caso, porque eso es lo que justificará los módulos siguientes.

**Pieza que suma al framework:** `tests/smoke.spec.ts` plano + `.env.example` + `.env` ignorado.

**Conceptos JIT (con analogía):**
- **`playwright.config.ts`**: el "archivo de configuración del test runner" — como el `setup.cfg` de una suite en Jenkins.
- **`test()` y `expect()`**: TC + resultado esperado.
- **Auto-waiting**: Playwright es como un tester manual con paciencia; no hace click hasta que el elemento está listo. Nunca uses `sleep()` (equivale a que un tester mire el reloj de pared).
- **`getByRole` vs `getByTestId`**: dos formas de localizar — la primera como un lector de pantalla, la segunda por stickers que el dev pegó.
- **Secretos y entornos desde día 1:** `.env` (libreta personal del tester) + `.env.example` (plantilla versionada) + `dotenv`. Esto se siente como detalle pero previene mañas graves después.
- **Backend dormido de Render:** el entorno está en free tier; el primer request tarda 30-40s. Solución en este módulo: `beforeAll` de warmup con timeout generoso. En M04 lo mejoraremos con el `setup` project.

**Paso a paso de implementación:**

1. **Crear la rama de trabajo** (si no se hizo antes):
   ```bash
   git checkout -b feature/v3-arquitectura-incremental
   ```
2. **Instalar dependencias:**
   ```bash
   cd playwright-course
   pnpm install
   pnpm add -D dotenv
   pnpm exec playwright install chromium
   ```
3. **Crear `.env.example`** (versionado) y `.env` (gitignored):
   ```bash
   # .env.example
   BASE_URL=https://omnipizza-frontend.onrender.com
   API_URL=https://omnipizza-backend.onrender.com
   TEST_USER_EMAIL=customer1@omnipizza.test
   TEST_USER_PASSWORD=changeme
   ```
   ```bash
   cp .env.example .env
   echo ".env" >> .gitignore
   echo ".auth/" >> .gitignore
   ```
4. **Crear `playwright.config.ts` mínimo** con `baseURL: process.env.BASE_URL`, `import 'dotenv/config'`, timeout generoso, y un `projects` con sólo `chromium`.
5. **Crear `modulo-01-smoke-feo/ejemplo.spec.ts`** con:
   - Un `describe("Smoke OmniPizza")`.
   - Un `beforeAll` que hace un `page.goto('/')` de warmup.
   - Un `test('login exitoso con usuario válido')` con locators inline.
   - Un `test('catálogo muestra al menos 1 pizza')` que repite parte de los pasos.
6. **Ejecutar y verificar verde:**
   ```bash
   pnpm exec playwright test modulo-01-smoke-feo --headed
   ```
7. **Crear `modulo-01-smoke-feo/reto.spec.ts`** como plantilla con TODOs en español.
8. **Commit de cierre:**
   ```bash
   git add modulo-01-smoke-feo playwright.config.ts .env.example .gitignore package.json
   git commit -m "feat(m01): smoke feo + dotenv — siembra el dolor de duplicación"
   ```

**TypeScript aplicado:** tipos básicos, string literals, imports, `process.env` tipado.

**Outcome del alumno:** tiene un test verde contra OmniPizza live y **siente la duplicación** cuando escribe el segundo y tercer caso. Además ya maneja `.env` como un profesional.

**Reto:** escribir un smoke adicional que toque catálogo con duplicación a la vista (para que en M02-M03 aprecie el refactor).

**Comandos útiles del módulo:**
```bash
pnpm exec playwright test modulo-01-smoke-feo            # correr el módulo
pnpm exec playwright test --ui                           # UI mode
pnpm exec playwright test --debug                        # inspector paso a paso
```

---

### M02 — Locators + Data tipada (45-60 min)

**Analogía:** el tester manual que siempre trae consigo una **hoja de datos de prueba** (usuarios, ambientes, mercados). En este módulo construimos esa hoja como **JSON tipado** y la conectamos al TC con `test.each()` — un mismo caso ejecutado con N sets de datos distintos, como una matriz de regresión.

**Pieza que suma al framework:** `types/omnipizza.d.ts` + `data/users.json` + `data/markets.json`. El smoke de M01 se parametriza con `test.each()`.

**Conceptos JIT (con analogía):**
- **Jerarquía de locators** con criterios de cuándo bajar nivel:
  - `getByRole` > `getByLabel` / `getByText` > `getByTestId` > CSS > XPath.
  - **Analogía:** como escribir un bug report bien hecho. Primero por rol ("el botón 'Enviar'"), luego por label ("el campo 'email'"), luego por sticker del dev (`data-testid`), luego por selector CSS crudo, y sólo en último caso por ruta XPath completa.
  - CSS/XPath **no están prohibidos**; están al final porque son frágiles.
- **Filtros:** `.filter()`, `.nth()`, `locator.all()` — refinar la búsqueda dentro de una lista (como filtrar en Jira por componente y severidad).
- **`for...of` sobre locators** — iterar filas de una tabla de resultados.
- **`interface User` / `interface Market`** — contratos tipo Swagger. Si el JSON no los cumple, TypeScript grita antes de ejecutar.
- **`import type`** — "sólo necesito la forma, no el código" (evita bundling innecesario).
- **`if/else` dinámico** — sólo donde el negocio lo pide (ej. moneda "MXN" si mercado es "MX").

**Paso a paso de implementación:**

1. **Crear `types/omnipizza.d.ts`:**
   ```typescript
   export interface User {
     email: string;
     password: string;
     role: "customer" | "admin";
   }
   export interface Market {
     code: "MX" | "US" | "CH" | "JP";
     currency: "MXN" | "USD" | "CHF" | "JPY";
     taxRate: number;
   }
   ```
2. **Crear `data/users.json` y `data/markets.json`** con datos reales de OmniPizza.
3. **Crear `modulo-02-locators-data/ejemplo.spec.ts`**:
   - Importar `users` y `markets` tipados (con `import type { User, Market }`).
   - Usar `test.each<Market>(markets)` para correr el smoke contra los 4 mercados.
   - Usar `getByRole` donde sea posible; demostrar `getByTestId` en un caso específico; enseñar cuándo *sí* usar CSS.
4. **Ejecutar y verificar:**
   ```bash
   pnpm exec playwright test modulo-02-locators-data
   ```
5. **Crear `modulo-02-locators-data/reto.spec.ts`** con TODOs: añadir 5º mercado sin tocar el spec.
6. **Commit de cierre:**
   ```bash
   git add types data modulo-02-locators-data
   git commit -m "feat(m02): data-driven con JSON tipado — 1 test, 4 mercados"
   ```

**TypeScript aplicado:** `interface`, arrays tipados (`User[]`, `Market[]`), `import type`, condicionales de negocio.

**Outcome del alumno:** un solo test corre contra los 4 mercados consumiendo JSON tipado.

**Reto:** añadir el 5º mercado al JSON y que el test lo recoja sin tocar código del spec.

**Comandos útiles del módulo:**
```bash
pnpm exec playwright test modulo-02-locators-data
npx tsc --noEmit                                         # verifica tipos sin compilar
pnpm exec playwright test --grep "@smoke"                # filtrar por tag
```

---

### M03 — Refactor a POM (OOP incremental) (50-60 min)

**Analogía:** ¿recuerdas el dolor de M01-M02? Cada TC nuevo repetía los mismos locators. El **Page Object Model** es la solución: crear un **mapa reutilizable** de cada pantalla, igual que un tester manual mantiene un documento "así se llega al módulo de login". El código pasa de script a **libro de recetas**: `await loginPage.loginAs(user)` se lee como user story, no como instrucción técnica.

**Pieza que suma al framework:** `pages/BasePage.ts` (clase normal) + `LoginPage.ts` + `CatalogPage.ts` + `CheckoutPage.ts`. El test de M02 se refactoriza y se nota cuánto se limpia.

**Ritual de apertura — "reactivar el dolor":**
Antes de escribir una sola línea de clase, el instructor pide al alumno:
1. Abrir el spec de M01/M02 que ya escribió.
2. **Marcar con resaltador** (o copiar a un archivo aparte) cada línea que se repite entre tests: locators de login, pasos de setup, asserts de header.
3. Contar cuántas líneas son.
4. Escribir en una línea: *"Si añado un tercer smoke, voy a duplicar X líneas más"*.

Sólo **después** de ese ejercicio empieza el refactor. El patrón se gana; no se impone.

**Conceptos JIT (con analogía):**
- **`class` en TypeScript** — el molde para fabricar Page Objects.
- **Constructor con `readonly page: Page`** — tu pestaña del navegador. El Page Object se amarra a esa pestaña y no salta a otra a mitad del TC. **Por qué importa:** evita el bug clásico "¿por qué el assert se ejecutó en la pestaña equivocada?".
- **`extends` / `super`** — toda pantalla hereda de `BasePage`: header común, toast handler, helper `tid()`. No copiamos, heredamos.
- **Modificadores de acceso:**
  - `private` locators → documentación interna del Page; el test nunca los toca directamente.
  - `public` acciones de negocio → `loginAs()`, `addToCart()`, `checkout()`.
  - `protected` helpers → `tid(id)` son herramientas del equipo QA interno: las ve tu equipo (clases hijas), no el cliente final (el test).
- **Por qué `tid()` como helper:** todo el curso usa `getByTestId` como segundo nivel de locator. En vez de escribir `this.page.getByTestId('...')` 50 veces, lo encapsulamos en `BasePage.tid('...')`.

> **Nota explícita al alumno:** `BasePage` en este módulo es una clase **normal**, no abstracta. "Clase abstracta" es un concepto distinto que veremos en M05 cuando tengamos varios servicios con el mismo problema. Aquí la convención es humana: **no instancies `BasePage` directamente — extiéndela**.

**Paso a paso de implementación:**

1. **Ritual de reactivar el dolor** (ver arriba).
2. **Crear `pages/BasePage.ts`** como **clase normal** (sin `abstract`):
   ```typescript
   import type { Page, Locator } from "@playwright/test";
   export class BasePage {
     constructor(protected readonly page: Page) {}
     protected tid(id: string): Locator {
       return this.page.getByTestId(id);
     }
   }
   ```
3. **Crear `pages/LoginPage.ts`** extendiendo `BasePage`:
   - Locators privados: `emailInput`, `passwordInput`, `submitButton` (vía `tid()` o `getByRole`).
   - Método público `loginAs(user: User): Promise<void>`.
4. **Crear `pages/CatalogPage.ts`** con método `getVisiblePizzas(): Promise<string[]>`.
5. **Refactorizar el spec de M02** para usar `LoginPage` y `CatalogPage` — mostrar el antes/después (diff visible en pantalla, contar líneas eliminadas).
6. **Verificar verde:**
   ```bash
   pnpm exec playwright test modulo-03-pom
   ```
7. **Crear reto: `CheckoutPage`** como ejercicio.
8. **Commit de cierre:**
   ```bash
   git add pages modulo-03-pom
   git commit -m "feat(m03): POM con BasePage + 3 páginas — tests leen como user stories"
   ```

**TypeScript aplicado:** clases, herencia (`extends`/`super`), modificadores de acceso (`private`/`protected`/`public`), `readonly`.

**Outcome del alumno:** los tests leen como user stories (`await loginPage.loginAs(user)`), no como scripts de bajo nivel. El alumno puede contar exactamente cuántas líneas eliminó.

**Reto:** implementar `CheckoutPage` siguiendo el patrón de `LoginPage` y `CatalogPage`.

**Comandos útiles del módulo:**
```bash
pnpm exec playwright test modulo-03-pom
npx tsc --noEmit                                         # detecta errores de herencia
pnpm exec playwright test --reporter=list                # output compacto
```

---

### M04 — Setup project + Fixtures + Data isolation (55-65 min)

**Analogía:** el tester manual, antes de empezar una sesión, **se registra en recepción** (login vía API), recibe un **badge** (`storageState`) y con él entra a todos los módulos sin volver a autenticarse. Además, si varios testers trabajan en paralelo, cada uno usa **data propia** (órdenes con su nombre, emails únicos) para que no se pisen.

**Pieza que suma al framework:** `tests/setup/auth.setup.ts` + `helpers/unique-data.ts` + `fixtures/omnipizza.ts` + `playwright.config.ts` con `projects` que declaran `dependencies: ['setup']`.

**Conceptos JIT (con analogía):**
- **`auth.setup.ts` como project:** el patrón moderno de Playwright. Un project llamado `setup` con `testMatch: /.*\.setup\.ts/` corre **antes** de todos los demás (gracias a `dependencies: ['setup']`). Adentro se hace login **vía API** (`APIRequestContext`) y se persiste el `storageState`.
  - **Por qué API y no UI:** más rápido (1 POST vs navegación completa), más determinista (sin flakiness de UI), reusable en M05.
- **`storageState` por project, NO global:**
  - Config: cada project que necesita sesión declara `use: { storageState: '.auth/user.json' }`.
  - El project `api` **omite** `storageState` — no debe heredar cookies de UI.
  - El project `anonymous` (para tests de login negativo) también lo omite.
- **Custom fixtures** con `test.extend<...>` — extender el objeto `test` con capacidades nuevas (ej. `adminPage`, `marketContext`).
- **Worker fixtures vs test fixtures:**
  - Worker fixture = se crea una vez por worker. Ej: contexto de mercado.
  - Test fixture = se crea una vez por TC. Ej: `page` vanilla.
- **Data isolation para `fullyParallel`:**
  - Sin esto: worker 1 crea la orden con email `test@x.com`, worker 2 crea otra con el mismo email → colisión → flakiness.
  - Con esto: `uniqueEmail(workerInfo)` → `customer+w0-1714000000000@omnipizza.test`.
  - **Analogía:** cada tester paralelo lleva su propio libro de pedidos; nunca comparten folios.
- **`page.route()` — mocking de red:**
  - Para probar caminos de error (5xx, empty state, slow network) sin depender de que el backend real los simule.
  - **Analogía:** stub en Postman Mock Server. Tú decides la respuesta.
  - **Uso:** `await page.route('**/api/orders', route => route.fulfill({ status: 500 }))`.
- **Pain-point Render:** el `auth.setup.ts` también sirve de warmup (el login API despierta al backend). Ya no necesitamos el `beforeAll` de warmup en M01.

**Paso a paso de implementación:**

1. **Crear `tests/setup/auth.setup.ts`:**
   ```typescript
   import { test as setup, expect, request } from "@playwright/test";
   import "dotenv/config";

   const authFile = ".auth/user.json";

   setup("authenticate as customer", async () => {
     const api = await request.newContext({ baseURL: process.env.API_URL });
     const res = await api.post("/auth/login", {
       data: {
         email: process.env.TEST_USER_EMAIL,
         password: process.env.TEST_USER_PASSWORD,
       },
     });
     expect(res.ok()).toBeTruthy();
     const { token } = await res.json();
     // persistir token/cookies como storageState
     await api.storageState({ path: authFile });
     await api.dispose();
   });
   ```
2. **Actualizar `playwright.config.ts`** con projects encadenados:
   ```typescript
   projects: [
     { name: "setup", testMatch: /.*\.setup\.ts/ },
     {
       name: "ui-chromium",
       testDir: "tests",
       testIgnore: [/.*\.setup\.ts/, /api\/.*/],
       use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
       dependencies: ["setup"],
     },
     {
       name: "api",
       testDir: "tests/api",
       use: { baseURL: process.env.API_URL },
       // NO storageState aquí
     },
   ]
   ```
3. **Crear `helpers/unique-data.ts`:**
   ```typescript
   import type { TestInfo } from "@playwright/test";
   export function uniqueEmail(info: TestInfo, prefix = "customer"): string {
     return `${prefix}+w${info.workerIndex}-${Date.now()}@omnipizza.test`;
   }
   ```
4. **Crear `fixtures/omnipizza.ts`** con fixtures extra (ej. `adminPage`, `marketContext`) — el `page` autenticado ya lo provee el `storageState` del project.
5. **Demostrar `page.route()`** con un test que mockea error del catálogo:
   ```typescript
   await page.route("**/api/pizzas", route => route.fulfill({ status: 500 }));
   // assert: el UI muestra el estado de error
   ```
6. **Cronometrar antes/después** — correr la suite de M03 vs la misma suite con `setup` project: mostrar la diferencia en segundos.
7. **Reto:** fixture `adminPage` con `.auth/admin.json` (otro `auth.setup.ts` para admin).
8. **Commit de cierre:**
   ```bash
   git add tests/setup helpers fixtures playwright.config.ts modulo-04-setup-fixtures
   git commit -m "feat(m04): setup project + storageState por-project + data isolation + route mock"
   ```

**TypeScript aplicado:** funciones tipadas, `TestInfo`, callbacks, inferencia de `test.extend`. (**Sin genéricos explícitos** — se deja inferencia para reducir carga.)

**Outcome del alumno:** los tests dejan de hacer login por UI en cada spec. El tiempo de suite baja notoriamente. El alumno entiende cómo generar data única en paralelo y cómo mockear con `page.route()`.

**Reto:** añadir un `admin.setup.ts` que genere `.auth/admin.json` y un project `ui-admin-chromium` que lo consuma.

**Comandos útiles del módulo:**
```bash
pnpm exec playwright test --project=setup                # sólo setup
pnpm exec playwright test --project=ui-chromium          # UI (depende de setup)
pnpm exec playwright test --list                         # lista sin ejecutar
pnpm exec playwright test --workers=1                    # forzar 1 worker para depurar
```

---

### M05 — API Layer: N-layered completo (50-60 min)

**Analogía:** hasta ahora el framework "entra por la puerta principal" (UI). Pero los servidores aceptan llamadas directas al backend (API). Probar por API es **como abrir Postman dentro del test**: más rápido, más estable, y valida contratos sin pintar píxeles. Aquí aparece la **clase abstracta** — un **formato obligatorio de reporte de bug** que cada servicio concreto (`AuthService`, `OrderService`, `PizzaService`) **debe** rellenar antes de contar como servicio válido.

**Pieza que suma al framework:** `services/BaseService.ts` (abstract) + `AuthService.ts` + `OrderService.ts` + suite `tests/api/`.

**Conceptos JIT (con analogía):**
- **Pirámide de testing:** muchos tests rápidos en API, pocos (y caros) por UI. Explica por qué invertimos en API layer.
- **`APIRequestContext`** y `request.newContext()` — el "Postman embebido" de Playwright.
- **Autenticación vía header Bearer** — se construye una sola vez en un factory y se reusa entre servicios.
- **Clase abstracta en serio (primera aparición):**
  - **Analogía:** `BaseService` es el formato corporativo de reporte de bug: tiene secciones obligatorias (`basePath()`) que cada servicio concreto debe rellenar. Si un servicio no las implementa, TypeScript se niega a compilarlo — como el sistema de tickets rechaza un reporte sin severidad.
  - Ventaja real: evita copiar el manejo de `baseURL`, headers y lifecycle en cada servicio.
- **Factory con auth:**
  ```typescript
  export abstract class BaseService {
    protected constructor(
      protected readonly api: APIRequestContext,
      protected readonly baseURL: string,
    ) {}
    protected abstract basePath(): string;
    protected url(path = ""): string { return `${this.baseURL}${this.basePath()}${path}`; }
    async dispose() { await this.api.dispose(); }
  }

  export class AuthService extends BaseService {
    protected basePath() { return "/auth"; }
    static async create(apiURL: string): Promise<AuthService> {
      const api = await request.newContext({ baseURL: apiURL });
      return new AuthService(api, apiURL);
    }
    async login(user: User): Promise<{ token: string }> { /* ... */ }
  }

  export class OrderService extends BaseService {
    protected basePath() { return "/orders"; }
    static async create(apiURL: string, token: string): Promise<OrderService> {
      const api = await request.newContext({
        baseURL: apiURL,
        extraHTTPHeaders: { Authorization: `Bearer ${token}` },
      });
      return new OrderService(api, apiURL);
    }
  }
  ```
- **Los `tests/api/` consumen los mismos `types/`** que los specs de UI → **DRY real**: un solo `User`, un solo `OrderPayload`.
- **Data isolation** (reusa de M04): cada orden creada usa `uniqueEmail(testInfo)` para evitar colisiones entre workers.

**Paso a paso de implementación:**

1. **Crear `services/BaseService.ts`** con `abstract class`, `abstract basePath()`, método `dispose()`.
2. **Crear `services/AuthService.ts`:**
   - `basePath()` → `/auth`.
   - Factory `create(apiURL)`.
   - Método `login(user: User): Promise<{ token: string }>`.
3. **Crear `services/OrderService.ts`:**
   - `basePath()` → `/orders`.
   - Factory `create(apiURL, token)` con `extraHTTPHeaders` Bearer.
   - Método `create(payload: OrderPayload): Promise<Order>`.
4. **Crear `tests/api/auth.spec.ts`** y `tests/api/orders.spec.ts` consumiendo los servicios.
5. **Usar `uniqueEmail`** en los tests de orders para evitar colisiones.
6. **Ejecutar suite API:**
   ```bash
   pnpm exec playwright test --project=api
   ```
7. **Reto:** `PizzaService.getByMarket(market: Market): Promise<Pizza[]>`.
8. **Commit de cierre:**
   ```bash
   git add services tests/api playwright.config.ts modulo-05-api-layer
   git commit -m "feat(m05): API layer con BaseService abstracta + factory auth"
   ```

**TypeScript aplicado:** `abstract class`, métodos abstractos, factory pattern, `Promise<T>`, tipado de respuestas de API, unión de tipos para errores (`Order | ApiError`).

**Outcome del alumno:** suite de API pura independiente de UI. Los mismos contratos tipados alimentan ambos mundos. Primera vez que ve `abstract` — aquí ya tiene todo el contexto para que le haga sentido.

**Reto:** añadir `PizzaService` con un método `getByMarket(market: Market): Promise<Pizza[]>`.

**Comandos útiles del módulo:**
```bash
pnpm exec playwright test --project=api                  # sólo API
pnpm exec playwright test --project=ui-chromium          # sólo UI
pnpm exec playwright test --grep "@smoke"                  # tags
```

---

### M06 — CI/CD + Debugging con Trace Viewer (40-50 min)

**Analogía:** ya tenemos un framework completo, pero corre sólo en la laptop del alumno. Lo que necesitamos ahora es que **un robot lo ejecute cada vez que alguien hace push** — eso es CI/CD. Y cuando un test falle, necesitamos la **caja negra del avión**: `Trace Viewer` reconstruye paso a paso qué hizo el test, con screenshots, red y consola, para encontrar el bug sin reproducirlo a mano.

**Pieza que suma al framework:** `.github/workflows/playwright.yml` con **matrix real por browser** + reports + traces como artefactos.

**Conceptos JIT (con analogía):**
- **`fullyParallel: true`** — varios testers haciendo el mismo trabajo a la vez, cada uno en su worker independiente. **Precondición:** data isolation (ya resuelta en M04).
- **`shards`** — repartir 200 TCs entre 4 máquinas CI: `--shard=1/4`, `--shard=2/4`, etc.
- **`retries` en CI (2) vs local (0)** — los tests flakies en CI se reintentan para no bloquear un PR por un timeout raro, pero en local no, para que el alumno vea la flakiness tal cual.
- **Trace Viewer protagónico:**
  - Configurar `trace: 'retain-on-failure'` en config.
  - Leer una traza: timeline, DOM snapshot por paso, network waterfall, console logs.
  - **Analogía:** caja negra. Aterrizaje fallido → se reconstruye todo sin repetir el vuelo.
- **HTML reporter + JUnit reporter** — el primero para humanos, el segundo para que GitHub Actions lo ingiera.
- **`secrets.*` en GitHub Actions:** las credenciales que en local viven en `.env` se inyectan en el pipeline vía `secrets.BASE_URL`, `secrets.TEST_USER_EMAIL`, etc. Nunca en plaintext.
- **GitHub Actions con matrix real por browser:**
  - `projects` por browser (`ui-chromium`, `ui-firefox`, `ui-webkit`).
  - `matrix.project` en el workflow fan-out a las 3 browsers.
  - Subida de artefactos: `playwright-report/` **y** `test-results/` (trazas y screenshots).
  - Badge de estado en README.

**Paso a paso de implementación:**

1. **Actualizar `playwright.config.ts`** (finalizando projects multi-browser):
   ```typescript
   fullyParallel: true,
   retries: process.env.CI ? 2 : 0,
   reporter: [["html"], ["junit", { outputFile: "results.xml" }]],
   use: { trace: "retain-on-failure", screenshot: "only-on-failure" },
   projects: [
     { name: "setup", testMatch: /.*\.setup\.ts/ },
     { name: "ui-chromium", use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" }, dependencies: ["setup"] },
     { name: "ui-firefox",  use: { ...devices["Desktop Firefox"], storageState: ".auth/user.json" }, dependencies: ["setup"] },
     { name: "ui-webkit",   use: { ...devices["Desktop Safari"],  storageState: ".auth/user.json" }, dependencies: ["setup"] },
     { name: "api", testDir: "tests/api", use: { baseURL: process.env.API_URL } },
   ],
   ```
2. **Crear `.github/workflows/playwright.yml`:**
   ```yaml
   name: Playwright Tests
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       strategy:
         fail-fast: false
         matrix:
           project: [ui-chromium, ui-firefox, ui-webkit, api]
           shard: [1, 2]
       env:
         BASE_URL: ${{ secrets.BASE_URL }}
         API_URL: ${{ secrets.API_URL }}
         TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
         TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 24 }
         - run: npm i -g pnpm && pnpm i
         - run: pnpm exec playwright install --with-deps
         - run: pnpm exec playwright test --project=${{ matrix.project }} --shard=${{ matrix.shard }}/2
         - uses: actions/upload-artifact@v4
           if: always()
           with:
             name: playwright-report-${{ matrix.project }}-${{ matrix.shard }}
             path: playwright-report
         - uses: actions/upload-artifact@v4
           if: always()
           with:
             name: playwright-traces-${{ matrix.project }}-${{ matrix.shard }}
             path: test-results
   ```
3. **Configurar secrets en el repo:**
   ```bash
   gh secret set BASE_URL
   gh secret set API_URL
   gh secret set TEST_USER_EMAIL
   gh secret set TEST_USER_PASSWORD
   ```
4. **Probar Trace Viewer localmente:**
   ```bash
   pnpm exec playwright test modulo-01-smoke-feo --trace=on
   pnpm exec playwright show-trace test-results/.../trace.zip
   ```
5. **Reto:** workflow programado con cron diario para `@smoke`.
6. **Push y observar el pipeline:**
   ```bash
   git add .github playwright.config.ts modulo-06-ci-debugging
   git commit -m "feat(m06): CI con matrix real por browser + traces como artefactos"
   git push -u origin feature/v3-arquitectura-incremental
   ```
7. **Abrir el PR:**
   ```bash
   gh pr create --title "feat: curso Playwright v3 — arquitectura incremental" \
                --body-file .github/PR_TEMPLATE.md
   ```

**TypeScript aplicado:** tipado de `PlaywrightTestConfig`, `projects[]`.

**Outcome del alumno:** el framework corre en GitHub Actions contra el deploy live, con **3 browsers en paralelo**, reportes y trazas navegables y descargables desde el PR.

**Reto:** configurar un segundo workflow programado (cron) que corra `@smoke` cada mañana.

**Comandos útiles del módulo:**
```bash
pnpm exec playwright test --trace=on                     # activar traza en todos
pnpm exec playwright show-trace trace.zip                # abrir Trace Viewer
pnpm exec playwright show-report                         # ver último HTML report
gh secret list                                           # verificar secrets
gh run list --workflow=playwright.yml                    # ver corridas del CI
gh run view <run-id> --log                               # ver logs de una corrida
gh run download <run-id>                                 # descargar artefactos
gh pr checks                                             # status de checks del PR
```

---

## Apéndices opcionales (fuera de las 4-6 h)

### A1 — Codegen como atajo

**Analogía:** grabar macros de Excel — útil para prototipar, malo para mantener.

- `pnpm exec playwright codegen https://omnipizza-frontend.onrender.com` — abre navegador y genera código conforme el usuario interactúa.
- Cuándo vale: exploración inicial de una feature nueva, descubrir selectores.
- Cuándo NO vale: código final. Codegen ignora tu POM y genera selectores frágiles.

### A2 — Playwright MCP + agentes AI

- MCP Server: exposición del DOM por árbol de accesibilidad.
- Demostración de agentes (Claude / Cursor) escribiendo specs que respeten el POM existente.
- **Por qué lo movimos a apéndice:** es cherry-on-top, no core. Depende de stack propietario (Claude Code, Cursor) que el alumno puede no tener.
- **Referencia histórica:** el commit `58d61c2` removió `modulo-11-ia/` con 4 lecciones (`01-copilot-para-tests.md`, `02-mcp-playwright.md`, `03-prompts-para-qa.md`, `04-aserciones-asistidas.md`) — se pueden recuperar de la historia de git si se quiere revivir este apéndice.

---

## Plan de ejecución paso a paso (con comandos)

### Fase 1 — Setup (5 min)

```bash
cd /Users/gilbertosanchez/Documents/Repos/typescript
git status
git pull origin main
git checkout -b feature/v3-arquitectura-incremental
```

### Fase 2 — Inventario de reciclaje (15-30 min)

Antes de borrar nada, identificar qué snippets/ejemplos de los módulos actuales se rescatan a qué módulo nuevo. Sugerencia: crear un archivo temporal `INVENTORY.md` (no commiteado) o abrir los `ejemplo.spec.ts` existentes y copiar lo valioso a un scratchpad.

**Mapeo sugerido:**

| Módulo viejo | Se recicla en |
|---|---|
| `modulo-01-vision-general` | M01 (setup) |
| `modulo-02-anotaciones` | M01 (hooks básicos) |
| `modulo-03-ejecuciones` | M01 + M06 (comandos de ejecución + CI) |
| `modulo-04-localizadores` | M02 (íntegro) |
| `modulo-05-parametrizacion` | M02 (data-driven) |
| `modulo-06-codegen` | Apéndice A1 |
| `modulo-07-reports` | M06 |
| `modulo-08-repositorios` | M06 (GitHub Actions) |
| `modulo-09-api-testing` | M05 |
| `modulo-10-pom` | M03 |

### Fase 3 — Limpieza destructiva (2 min)

```bash
cd playwright-course
rm -rf modulo-01-vision-general modulo-02-anotaciones modulo-03-ejecuciones \
       modulo-04-localizadores modulo-05-parametrizacion modulo-06-codegen \
       modulo-07-reports modulo-08-repositorios modulo-09-api-testing modulo-10-pom
rm -rf test-results playwright-report
git add -A
git commit -m "chore: remove legacy 10-module structure before v3 rewrite"
```

> **Reversibilidad:** esta limpieza **sólo** va en la rama nueva. `main` queda intacto. Si algo sale mal, `git checkout main` y la estructura antigua está allí.

### Fase 4 — Reescritura de `README.md` (10 min)

Actualizar la tabla de módulos (10 → 6), la narrativa y los comandos de ejecución. Mencionar `.env.example` y el project `setup`.

```bash
git add README.md
git commit -m "docs: rewrite README for v3 6-module incremental flow"
```

### Fase 5 — Arquitectura base + `.env` (10 min)

```bash
mkdir -p types data services pages fixtures helpers \
         tests/setup tests/smoke tests/regression tests/api \
         .github/workflows

# Scaffold de tipos y datos (M02 llena los detalles)
touch types/index.ts types/omnipizza.d.ts data/users.json data/markets.json

# .env.example versionado, .env y .auth/ gitignored
cat > .env.example <<'EOF'
BASE_URL=https://omnipizza-frontend.onrender.com
API_URL=https://omnipizza-backend.onrender.com
TEST_USER_EMAIL=customer1@omnipizza.test
TEST_USER_PASSWORD=changeme
EOF
cp .env.example .env
echo ".env" >> .gitignore
echo ".auth/" >> .gitignore

pnpm add -D dotenv

git add types data helpers .env.example .gitignore package.json pnpm-lock.yaml
git commit -m "chore: scaffold types/data/helpers + .env template"
```

### Fase 6 — Las 6 carpetas nuevas (2 min)

```bash
mkdir -p modulo-01-smoke-feo \
         modulo-02-locators-data \
         modulo-03-pom \
         modulo-04-setup-fixtures \
         modulo-05-api-layer \
         modulo-06-ci-debugging
```

### Fase 7 — Redacción e implementación por módulo

Seguir el **paso a paso de implementación** detallado en cada módulo. **Commit por módulo** (no megacommits) para que el PR sea revisable.

Orden recomendado:
1. M01 → commit.
2. M02 → commit.
3. M03 → commit.
4. M04 (incluye `tests/setup/auth.setup.ts` y `helpers/unique-data.ts`) → commit.
5. M05 → commit.
6. M06 (incluye `.github/workflows/playwright.yml` y `gh secret set`) → commit.

### Fase 8 — Ajustes globales finales (15 min)

1. **`playwright.config.ts`** completo: `import 'dotenv/config'`, `projects` (setup + 3 browsers + api), `reporter`, `retries`, `trace`, `fullyParallel`.
2. **`package.json`** — reemplazar scripts `m1`…`m10` por `m1`…`m6`:
   ```json
   {
     "scripts": {
       "test": "playwright test",
       "test:ui": "playwright test --ui",
       "test:headed": "playwright test --headed",
       "test:debug": "playwright test --debug",
       "test:smoke": "playwright test --grep @smoke",
       "test:regression": "playwright test --grep @regression",
       "test:api": "playwright test --project=api",
       "report": "playwright show-report",
       "m1": "playwright test modulo-01-smoke-feo",
       "m2": "playwright test modulo-02-locators-data",
       "m3": "playwright test modulo-03-pom",
       "m4": "playwright test modulo-04-setup-fixtures",
       "m5": "playwright test modulo-05-api-layer",
       "m6": "playwright test modulo-06-ci-debugging"
     }
   }
   ```
3. **`tsconfig.json`** — `strict: true`, `include: ["**/*.ts", "types/**/*.d.ts"]`.

```bash
git add playwright.config.ts package.json tsconfig.json
git commit -m "chore: align config/scripts with v3 module structure"
```

### Fase 9 — Cheatsheet (20 min)

Crear `playwright-course/cheatsheet.md` siguiendo el patrón del curso de TypeScript.

```bash
git add cheatsheet.md
git commit -m "docs: add Playwright cheatsheet for QA learners"
```

### Fase 10 — Verificación end-to-end (5 min)

```bash
npx tsc --noEmit
pnpm exec playwright test --project=setup   # login API funciona
pnpm test                                    # suite completa verde
pnpm report
```

### Fase 11 — Secrets de CI + push + PR

```bash
# Configurar secrets en GitHub (interactivo)
gh secret set BASE_URL
gh secret set API_URL
gh secret set TEST_USER_EMAIL
gh secret set TEST_USER_PASSWORD

# Push
git push -u origin feature/v3-arquitectura-incremental

# Crear PR
gh pr create \
  --title "feat: Playwright course v3 — arquitectura incremental" \
  --body "$(cat <<'EOF'
## Resumen
Reescritura completa del curso Playwright con estructura incremental de 6 módulos (4.5-6h).

## Cambios principales
- Eliminados 10 módulos anteriores.
- Framework construido capa por capa: smoke feo → locators + data → POM → setup project + fixtures + data isolation → API layer con BaseService abstracta → CI con matrix por browser.
- MCP/Agents movidos a apéndice opcional.
- Patrón moderno de auth: `auth.setup.ts` como project con `dependencies` (no `globalSetup` + UI login).
- `storageState` aplicado por project, no global.
- Data isolation via `workerInfo.workerIndex` + timestamp.
- `.env` + `dotenv` desde M01; `secrets.*` en CI.
- Trace Viewer protagónico en M06.

## Checklist de outcomes
- [ ] M01 — smoke feo verde contra OmniPizza live + `.env` configurado
- [ ] M02 — data-driven contra 4 mercados tipados
- [ ] M03 — POM refactor con `BasePage` normal + 3 páginas (sin `abstract`)
- [ ] M04 — `auth.setup.ts` project + fixtures + data isolation + `page.route()`
- [ ] M05 — suite API pura con `BaseService` abstracta + factory auth
- [ ] M06 — CI con 3 browsers en matrix + traces descargables

## Test plan
- [ ] `pnpm test` verde localmente
- [ ] Workflow de CI verde en este PR (3 browsers × 2 shards + api)
- [ ] `pnpm m1` a `pnpm m6` ejecutables independientemente
EOF
)"
```

### Fase 12 — Seguimiento del PR

```bash
gh pr checks                    # estado de los checks
gh pr view --web                # abrir el PR en el navegador
gh run list --limit 5           # últimas corridas de CI
```

---

## Criterios de aceptación por módulo

Cada módulo cierra con estas tres verificaciones:

- [ ] El alumno puede ejecutar el ejemplo con `pnpm mX` y ver verde.
- [ ] El alumno puede completar el `reto.spec.ts` sin consultar los módulos siguientes.
- [ ] La pieza que suma al framework queda utilizable por los módulos posteriores (no es desechable).

---

## Referencia rápida de comandos

### Playwright
```bash
pnpm test                                          # toda la suite
pnpm exec playwright test <path>                   # archivo/carpeta específica
pnpm exec playwright test --ui                     # UI mode (recomendado para aprender)
pnpm exec playwright test --headed                 # con browser visible
pnpm exec playwright test --debug                  # Playwright Inspector
pnpm exec playwright test --grep "@smoke"            # por tag
pnpm exec playwright test --project=setup          # correr sólo auth setup
pnpm exec playwright test --project=api            # sólo API
pnpm exec playwright test --project=ui-chromium    # sólo UI chromium
pnpm exec playwright test --workers=1              # 1 worker (debug)
pnpm exec playwright test --shard=1/4              # shard en CI
pnpm exec playwright test --trace=on               # forzar traza
pnpm exec playwright show-trace trace.zip          # abrir Trace Viewer
pnpm exec playwright show-report                   # HTML report del último run
pnpm exec playwright codegen <url>                 # grabar spec (apéndice A1)
pnpm exec playwright install chromium              # instalar navegador
npx tsc --noEmit                                   # type-check sin compilar
```

### Git
```bash
git checkout -b feature/v3-arquitectura-incremental   # crear rama
git status                                            # estado
git add <path>                                        # staging
git commit -m "feat(mXX): ..."                        # commit (un módulo = un commit)
git log --oneline -10                                 # últimos 10 commits
git diff main...HEAD                                  # diff de la rama vs main
git push -u origin feature/v3-arquitectura-incremental
```

### GitHub CLI
```bash
gh pr create --title "..." --body "..."            # crear PR
gh pr view --web                                   # abrir PR en navegador
gh pr checks                                       # estado de checks
gh pr status                                       # tus PRs activos
gh secret set <NAME>                               # configurar secret (interactivo)
gh secret list                                     # listar secrets
gh run list --limit 5                              # corridas recientes de CI
gh run view <run-id> --log                         # logs de una corrida
gh run download <run-id>                           # descargar artefactos (traces)
```

### pnpm (desde `playwright-course/`)
```bash
pnpm install                                       # instalar dependencias
pnpm add -D dotenv                                 # añadir dotenv (M01)
pnpm m1                                            # correr módulo 1
pnpm m2                                            # correr módulo 2
...
pnpm test                                          # toda la suite
pnpm test:ui                                       # UI mode
pnpm test:smoke                                    # sólo @smoke
pnpm test:api                                      # sólo API
pnpm report                                        # HTML report
```
