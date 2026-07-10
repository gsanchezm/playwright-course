# m02-locators-data — proyecto autocontenido

Snapshot **runnable** de `playwright_architecture` **al terminar el Módulo 02**
(locators + data-driven) sobre **OmniPizza**. Referencia de forma esperada del
módulo, lista para clonar y correr aislada. El "por qué" vive en
[`../../modulo-02-locators-data/README.md`](../../modulo-02-locators-data/README.md).

## Qué suma M02 sobre M01

- `data/` — `markets.json` + `users.json` (los 4 mercados MX/US/CH/JP y los usuarios).
- `types/` — contratos tipados (`Market`, `User`, `Currency`…) para consumir esos JSON.
- Los specs de `modulo-02-locators-data/` parametrizan el smoke por mercado con
  `getByRole` / `getByTestId` y datos tipados.
- **Config del runner: sin cambios vs M01** (un solo project anónimo `ui-anon`). El
  incremental de M02 es de datos, no del runner. El único ajuste de infraestructura es
  el `include` de `tsconfig.json` para que TS vea `types/`.

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck
pnpm m2              # corre modulo-02 en el project ui-anon
pnpm test:ui         # UI mode
pnpm report
```

> **Cold start de Render.** Primer request del día 30-40s; si falla con `TimeoutError`,
> vuelve a correr.
