# AGENTS.md — Contrato de arquitectura del harness OmniPizza

Este documento es el **contrato** que cualquier IA (o persona) debe leer **antes**
de generar una slice. La fundación ya existe; tú sólo agregas features siguiendo
estas reglas al pie de la letra. En una corrida real, lee tambien `TEST_PLAN.md`
para saber que casos UI/API implementar. Si dudas entre dos diseños, elige el que
respete este contrato.

---

## 1. Stack

- **Playwright Test + TypeScript** (`tsconfig`: `module=commonjs`, `target=ES2022`,
  `strict`, `resolveJsonModule`, `types: ["node","@playwright/test"]`).
- Identificadores en **inglés**; comentarios en **español** (convención del curso).
- Imports con **rutas relativas**. Tipos de dominio desde `shared/types`.
  Datos desde `shared/data/*.json`.

---

## 2. Árbol de carpetas

```
test-ia-harness/
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── .env.example
├── AGENTS.md                  ← este archivo
├── README.md
└── src/
    ├── core/                  ← infraestructura transversal (no es de negocio)
    │   ├── env.ts             ← Singleton de configuración
    │   ├── BasePage.ts        ← Template Method (POM)
    │   ├── BaseService.ts     ← Template Method (API) + createAuthedContext()
    │   ├── reporter.ts        ← Observer (Reporter de Playwright)
    │   └── auth/
    │       └── LoginStrategy.ts  ← Strategy (UI vs API)
    ├── shared/
    │   ├── types.ts           ← contratos de dominio
    │   ├── fixtures.ts        ← Dependency Injection (test extendido)
    │   └── data/
    │       ├── users.json
    │       └── markets.json
    └── features/              ← slices verticales (una carpeta por feature)
        ├── auth/
        │   ├── auth.page.ts   ├── auth.flow.ts   ├── auth.service.ts
        │   ├── auth.factory.ts (UserFactory)
        │   └── auth.spec.ts
        ├── catalog/
        │   ├── catalog.page.ts ├── catalog.flow.ts ├── catalog.service.ts
        │   └── *.spec.ts
        ├── cart/
        │   ├── cart.page.ts   ├── cart.flow.ts          (UI-only: sin service/factory)
        │   └── *.spec.ts
        └── checkout/
            ├── checkout.page.ts ├── checkout.flow.ts ├── checkout.service.ts
            ├── OrderBuilder.ts   ├── factories (UserFactory, ShippingCustomerFactory)
            └── *.spec.ts
```

---

## 2.1 Ejecución: paralelo + cross-browser + responsive

`playwright.config.ts` corre `fullyParallel: true` (cada archivo en su worker; los
tests del archivo también en paralelo). La UI se prueba en **cinco projects** y la
API en uno solo, sin navegador:

| Project | Device | Sirve para |
|---|---|---|
| `ui-chromium` | Desktop Chrome | Loop rápido de desarrollo (default de `test:ui`). |
| `ui-firefox` | Desktop Firefox | Motor Gecko. |
| `ui-webkit` | Desktop Safari | Motor WebKit. |
| `ui-mobile-chrome` | Pixel 5 | Viewport <768px → rama **`-responsive`** de `tid()`. |
| `ui-mobile-safari` | iPhone 13 | Responsive + WebKit móvil. |
| `api` | — (sin browser) | Sólo los `*.api.spec.ts` (`testMatch`). |

Scripts: `test:ui` (chromium), `test:cross` (los 5 UI), `test:firefox`,
`test:webkit`, `test:mobile` (los 2 móviles), `test:api`, `test:smoke`
(`@smoke` en chromium por velocidad). Los projects móviles ejercitan los testids
`-responsive`; un locator que sólo resuelve `-desktop` fallará ahí — eso es la red
de seguridad responsive, no un bug del test.

---

## 3. Patrón → casa (cada patrón vive EXACTAMENTE una vez)

| Patrón                | Dónde vive                          | Archivo |
|-----------------------|-------------------------------------|---------|
| **POM**               | Page Objects                        | `*.page.ts` |
| **Service / Adapter** | Clientes de API                     | `*.service.ts` |
| **Template Method**   | Bases reutilizables                 | `core/BasePage.ts`, `core/BaseService.ts` |
| **Factory**           | Construcción de datos por entidad   | `UserFactory`, `ShippingCustomerFactory` |
| **Builder**           | Armado paso a paso del pedido       | checkout `OrderBuilder` |
| **Facade**            | Orquestación multi-paso             | `*.flow.ts` |
| **Singleton**         | Configuración única e inmutable     | `core/env.ts` |
| **Observer**          | Reacción al ciclo de vida           | `core/reporter.ts` |
| **Strategy**          | Login intercambiable                | `core/auth/LoginStrategy.ts` |
| **Dependency Injection** | Provisión de objetos a los tests | `shared/fixtures.ts` |

---

## 4. Composición VARIABLE por slice (a propósito — KISS/YAGNI)

No todas las slices tienen las mismas piezas. Agrega sólo lo que la feature gana:

| Slice     | page | flow | service | factory / builder        |
|-----------|:----:|:----:|:-------:|--------------------------|
| auth      |  ✓   |  ✓   |   ✓     | `UserFactory`            |
| catalog   |  ✓   |  ✓   |   ✓     | —                        |
| cart      |  ✓   |  ✓   |   —     | — (UI-only, la más simple) |
| checkout  |  ✓   |  ✓   |   ✓     | `ShippingCustomerFactory` + `OrderBuilder` (la más rica) |

---

## 5. Contrato de NOMBRES de export (FIJO — los fixtures dependen de ellos)

No renombres. `shared/fixtures.ts` y `core/auth/LoginStrategy.ts` importan estos
nombres exactos:

- **auth**: `AuthPage`, `AuthFlow`, `AuthService`
- **catalog**: `CatalogPage`, `CatalogFlow`, `CatalogService`
- **cart**: `CartPage`, `CartFlow`
- **checkout**: `CheckoutPage`, `CheckoutFlow`, `CheckoutService`, `OrderBuilder`
- **factories** (por entidad): `UserFactory`, `ShippingCustomerFactory`

Archivos por convención: Page = `*.page.ts`, Service = `*.service.ts`,
Flow = `*.flow.ts`. Cada `*.page.ts` extiende `core/BasePage`; cada `*.service.ts`
extiende `core/BaseService` con `static async create(...)` y `protected basePath()`.

### 5.1 Interfaz pública que cada slice DEBE exponer

`shared/fixtures.ts` y `core/auth/LoginStrategy.ts` ya consumen estas firmas. Si tu
slice no las cumple, la fundación no compila. (No son las únicas que tu Page/Flow
puede tener — son el **mínimo** del contrato.)

- **Todo `*.page.ts` y `*.flow.ts`**: `constructor(page: Page)` (un único parámetro
  `page`). Los Page extienden `BasePage` (que ya define ese constructor); los Flow
  reciben `page` y construyen por dentro los Pages/Services que orquestan.
- **`AuthPage`** (lo usa `UiLoginStrategy`): debe exponer
  `loginInMarket(user: User, country: CountryCode): Promise<void>` — hace
  goto + seleccionar mercado + login y espera `/catalog`.
- **`AuthService`** (lo usa `ApiLoginStrategy`): `static async create(baseURL: string)`,
  `login(user: User): Promise<LoginResponse>` y `dispose(): Promise<void>`
  (heredado de `BaseService`). Ver §7.

---

## 6. Reglas de LOCATORS (no negociables)

- **SÓLO** `getByTestId` / `getByRole`. **Nada** de CSS profundo, **nada** de XPath.
  Los testids dinámicos (`[data-testid^="pizza-card-"]`) son la única excepción
  con `page.locator`, porque el prefijo es un testid.
- Usa el helper `tid(base)` de `BasePage`: añade `-desktop` (viewport ≥768px) o
  `-responsive` (<768px). Algunos testids **no** llevan sufijo (`login-error`,
  `market-<code>`, `nav-cart-count`, `zip-code`, `order-total`): para esos usa
  `page.getByTestId(...)` directo.
- **NUNCA** `waitForTimeout`. Usa assertions web-first (`expect(...).toBeVisible()`),
  `locator.waitFor()` o `page.waitForURL()`.

Testids verificados (resumen): login → `username`, `password`, `login-button`
(rol botón "Sign In"), `login-error`, `market-<code>`; catalog → `pizza-card-*`,
`add-to-cart-*`, `confirm-add-to-cart`, `category-<c>`, `nav-cart-count`
(condicional, ausente con carrito vacío), `search-pizza`, nombre de pizza =
`card.getByRole("heading").first()`; cart → `cart-sidebar`, `cart-item-*`,
`cart-total-value`, `cart-checkout-btn`; checkout → `full-name`, `phone`,
`address`, `zip-code` (sin sufijo), `place-order-btn`, `order-total` (sin sufijo),
`order-item-*`. La pantalla de confirmación post-orden **no** está verificada:
no afirmes nada duro sobre ella.

---

## 7. Reglas de API (services)

- Extienden `BaseService`; exponen `static async create(...)` y `protected basePath()`.
- `AuthService`: basePath `/api/auth`; `create(baseURL)`; `login(user)` → `POST /login`
  `{username,password}` → `LoginResponse {access_token}`.
- Helper `createAuthedContext(baseURL, token, extraHeaders)` (en `BaseService.ts`):
  añade `Authorization: "Bearer "+token`.
- `PizzaService`: basePath `/api/pizzas`; `create(baseURL, token, country)` con header
  `X-Country-Code`; `list()` → `GET ""` → `PizzasResponse.pizzas`.
- `OrderService`: basePath `/api/orders`; `create(baseURL, token, country)` con
  `X-Country-Code`; `createOrder(payload)` → `POST (baseURL + "/api/checkout")`
  → `Order`; `listMine()` → `GET ""`.

---

## 8. Principios

- **SOLID** — SRP: cada clase una responsabilidad (Page = locators, Flow = orquesta,
  Service = HTTP, Factory = datos). OCP/DIP: depende de abstracciones
  (`LoginStrategy`, `BaseService`), no de concreciones.
- **DRY** — una sola casa por patrón; el helper `tid()` no se duplica.
- **KISS / YAGNI** — composición variable: `cart` es UI-only porque no necesita más.
  No agregues service/factory "por si acaso".
- **Vertical slicing** — cada feature es autocontenida bajo `src/features/<feature>/`.

---

## 8.1 Diseño de código y de tests (Clean Code)

Esto es **Clean Code** (prácticas), no *Clean Architecture* por capas. El árbol
`core/ · shared/ · features/` ya es una separación limpia; **no** la reestructures.

- **Nombres con intención; unidades pequeñas (SRP); sin duplicación (DRY); simple
  (KISS/YAGNI).**
- **Guard clauses / early return.** Valida precondiciones y retorna temprano:
  primero los casos borde, luego el camino feliz. Nada de pirámides de `if`.
- **Assertions por test: 1, máximo 2.** Cada test valida **un** comportamiento.
  Las esperas web-first de sincronización (`expect(locator).toBeVisible()` usadas
  para esperar, o métodos nombrados como `expectLoaded()`) **no** cuentan como
  assertion. Si un resultado necesita varias verificaciones relacionadas,
  agrúpalas detrás de un método nombrado del Page/Flow (`expectOrderConfirmed()`).
  Más de 2 assertions sueltas = error de diseño de la prueba: pártela.
  - **Excepción (unit de forma):** un test unitario de un builder/factory verifica
    la forma completa del objeto con **una** aserción de objeto
    (`expect(payload).toEqual({...})`), no con muchos `expect` sueltos.
- **Data-driven testing.** Cuando varios casos difieren **sólo por input**, no
  copies el test: parametrízalo sobre datos tipados de `shared/data/*.json`
  (tipos en `shared/types`), un test por caso:

  ```ts
  for (const c of cases) {
    test(c.name, async ({ /* fixtures */ }) => {
      // ... 1–2 assertions por caso
    });
  }
  ```

- **Specs co-localizados.** Cada spec vive en su slice
  (`features/<slice>/<slice>.spec.ts`, `<slice>.api.spec.ts`). **No** hay una
  carpeta `tests/` separada. Los projects de UI corren todos los `*.spec.ts`
  **excepto** los `*.api.spec.ts` (los excluyen con `testIgnore: /.*\.api\.spec\.ts/`);
  el project `api` corre solo los `*.api.spec.ts`.

---

## 9. Cómo debe usar esto la IA

1. **Lee este archivo entero** y `TEST_PLAN.md` antes de generar una slice.
2. Respeta los **nombres de export** de la sección 5 — los fixtures ya los importan.
3. Reutiliza la fundación: extiende `BasePage`/`BaseService`, lee config de `env`,
   tipos de `shared/types`, datos de `shared/data`.
4. Aplica las **reglas de locators y API** (secciones 6–7) y el **diseño de código
   y tests** (§8.1: guard clauses, 1–2 assertions, data-driven) sin inventar
   testids ni endpoints: usa sólo los verificados.
5. Agrega **sólo** las piezas que la slice gana (sección 4). Menos es más.
6. Verifica con `pnpm typecheck` antes de dar por terminada una slice.
