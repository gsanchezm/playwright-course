# m03-pom — proyecto autocontenido

Snapshot **runnable** de `playwright_architecture` **al terminar el Módulo 03**
(Page Object Model) sobre **OmniPizza**. El "por qué" vive en
[`../../modulo-03-pom/README.md`](../../modulo-03-pom/README.md).

## Qué suma M03 sobre M02

- `pages/` — Page Objects (`BasePage`, `LoginPage`, `CatalogPage`, `CheckoutPage`,
  `MenuPage` + `index.ts`). Las ~8 líneas de login duplicadas de M01/M02 se vuelven
  `await loginPage.loginInMarket(user, "MX")`.
- Los specs de `modulo-03-pom/` se reescriben como *user stories* instanciando Pages.
- **Config del runner: sin cambios vs M01/M02.** M03 es puro código (arquitectura POM
  en `pages/`), no toca configuración. Sigue con el único project anónimo `ui-anon`.

> **Nota de normalización.** El banner de config del README de M03 muestra
> `ui-chromium`, pero su propio texto y el script `m3` del repo usan **`ui-anon`**
> (el project autenticado nace en M04). Este snapshot usa `ui-anon` por coherencia.

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck
pnpm m3              # corre modulo-03 en el project ui-anon
pnpm test:ui
pnpm report
```

> **Cold start de Render.** Primer request del día 30-40s; si falla con `TimeoutError`,
> vuelve a correr.
