# m04-pom — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 04**
(Page Object Model) sobre **OmniPizza**. El "por qué" vive en
[`../../modulo-04-pom/README.md`](../../modulo-04-pom/README.md).

## Qué suma M04 sobre M03

- `pages/` — Page Objects (`BasePage`, `LoginPage`, `CatalogPage`, `CheckoutPage`,
  `MenuPage` + `index.ts`). Las ~8 líneas de login duplicadas de M01-M03 se vuelven
  `await loginPage.loginInMarket(user, "MX")`.
- Los specs de `modulo-04-pom/` se reescriben como *user stories* instanciando Pages.
- **Config del runner: sin cambios vs M01-M03.** M04 es puro código (arquitectura POM
  en `pages/`), no toca configuración. Sigue con el único project anónimo `ui-anon`.

> **Nota de normalización.** El banner de config del README de M04 muestra
> `ui-chromium`, pero su propio texto y el script `m4` del repo usan **`ui-anon`**
> (el project autenticado nace en M06). Este snapshot usa `ui-anon` por coherencia.

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck
pnpm m4              # corre este módulo en el project ui-anon
pnpm test:ui
pnpm report
```

> **Cold start de Render.** Primer request del día 30-40s; si falla con `TimeoutError`,
> vuelve a correr.
