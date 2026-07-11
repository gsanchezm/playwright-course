# m03-data-driven — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 03**
(data-driven testing) sobre **OmniPizza**. Referencia de forma esperada del
módulo, lista para clonar y correr aislada. El "por qué" vive en
[`../../modulo-03-data-driven/README.md`](../../modulo-03-data-driven/README.md).

## Qué suma M03 sobre M02

- `data/` — `markets.json` + `users.json` (los 4 mercados MX/US/CH/JP y los usuarios).
- `types/` — contratos tipados (`Market`, `User`, `Currency`…) para consumir esos JSON.
- `tests/ejemplo.spec.ts` — parametriza el smoke por mercado con un bucle `for...of`
  que **registra un `test()` por dato** (data-driven), consumiendo datos tipados.
- `tests/reto.spec.ts` — añadir un 5º mercado (CA) sin tocar el spec.
- **Config del runner: sin cambios vs M02** (un solo project anónimo `ui-anon`). El
  incremental de M03 es de datos, no del runner. El único ajuste de infraestructura es
  el `include` de `tsconfig.json` para que TS vea `types/`.

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck
pnpm m3              # corre el smoke parametrizado en el project ui-anon
pnpm test:ui         # UI mode
pnpm report
```

> **Cold start de Render.** Primer request del día 30-40s; si falla con `TimeoutError`,
> vuelve a correr.
