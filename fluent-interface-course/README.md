# Fluent Interface Course

Proyecto **mínimo y self-contained** que contiene el "código que corre" del curso de
**Fluent Interface** con Playwright. Es el ejemplo ejecutable que acompaña a las lecciones:
un Page Object Model (POM) evolucionado a un **Fluent Interface encadenable** sobre la misma
app desplegada **OmniPizza**.

## ¿Qué es?

Un POM donde las acciones **no se ejecutan al llamarlas**: se **encolan** y devuelven `this`,
así puedes escribir un flujo entero en una sola expresión que se lee como una frase:

```ts
await loginPage
  .goto()
  .withUsername(user.username)
  .withPassword(user.password)
  .andMarket("MX")
  .login();
```

El Page es _awaitable_ (implementa `then`): el `await` final **drena la cola en orden**.
Las **queries** (que devuelven datos) terminan la cadena devolviendo el valor.

> Regla de oro: **SIEMPRE haz `await` de la cadena.**

## Estructura

```
fluent-interface-course/
├── pages/                     # Page Objects (Fluent Interface)
│   ├── BasePage.ts            # núcleo encadenable: step() / then() / query()
│   ├── LoginPage.ts
│   ├── CatalogPage.ts
│   ├── CheckoutPage.ts
│   └── index.ts               # barrel: re-exporta los 4 Pages
├── data/
│   ├── users.json             # usuarios de prueba (standard_user, etc.)
│   └── markets.json           # 4 mercados (MX, US, CH, JP)
├── types/
│   ├── omnipizza.d.ts         # contratos (User, Market, ...)
│   └── index.ts
├── fixtures/
│   └── omnipizza.ts           # fixtures opcionales (page objects + data)
├── tests/
│   ├── fluent-ejemplo.spec.ts # ejemplo RESUELTO (todo en verde)
│   └── fluent-reto.spec.ts    # reto con // TODO para el alumno
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── .gitignore
```

## Requisitos

- **Node.js 20+** (LTS).
- **pnpm** (gestor de paquetes de este proyecto).
- Conexión a internet: los tests corren contra OmniPizza desplegado en Render.

## Instalación

```bash
pnpm install
pnpm exec playwright install chromium
```

> El primer arranque de OmniPizza en Render (free tier) puede tardar por _cold start_;
> por eso los timeouts del config son generosos.

## Cómo correr

```bash
# Toda la suite (project ui-chromium)
pnpm test

# Solo el ejemplo resuelto (debe quedar todo en verde)
pnpm test tests/fluent-ejemplo.spec.ts

# El reto (incompleto: trae // TODO para que lo completes)
pnpm test tests/fluent-reto.spec.ts

# Con navegador visible
pnpm test:headed

# Ver el reporte HTML del último run
pnpm report
```

Otros scripts útiles:

```bash
pnpm typecheck          # tsc --noEmit (verifica tipos e imports)
pnpm install-browsers   # playwright install chromium
```

## Configuración

El `baseURL` se toma de la variable de entorno `BASE_URL` y cae por defecto a
`https://omnipizza-frontend.onrender.com`. Para apuntar a otro despliegue, copia
`.env.example` a `.env` y ajústalo:

```bash
cp .env.example .env
# edita BASE_URL si lo necesitas
```

Este proyecto se loguea **por UI** dentro de la cadena fluida (`loginInMarket` hace
`goto("/")` + `selectMarket` + `loginAs`), así que **no** hay `setup` project ni
`storageState`: cada test arranca anónimo.

## Relación con el curso de Playwright

Este repo es el corte "fluido" del POM que se construye en el curso base de Playwright
(módulo 03 — POM). Mismas pantallas, misma app **OmniPizza**, mismos datos de prueba; aquí
el POM está **evolucionado a un Fluent Interface encadenable** para enseñar ese patrón de
forma aislada y ejecutable. Es self-contained: **no depende** del proyecto base — todos los
imports son locales.

> Nota didáctica: el Fluent Interface encadenable es un patrón **avanzado** y poco idiomático
> en Playwright (lo normal es un `await` por acción). Se enseña aquí como ejercicio de diseño;
> en un proyecto real elige el estilo que mejor lea tu equipo.
