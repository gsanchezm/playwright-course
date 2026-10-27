# m07-setup — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 07**
(setup project + `storageState` + `dependencies`, con login por UI **y** por API) sobre **OmniPizza**. El "por qué"
vive en [`../README.md`](../README.md).

## Qué suma M07 sobre M06

- `tests/setup/auth.ui.setup.ts` — setup **por UI**: un solo test que hace login con el
  `LoginPage` y guarda la sesión en `.auth/user.ui.json`.
- `tests/setup/auth.api.setup.ts` — setup **por API**: login con el `AuthService` de M06,
  siembra en `localStorage` las mismas claves que escribe el SPA y guarda `.auth/user.api.json`.
- `tests/setup/auth.paths.ts` — rutas de los badges (incluye las `GLITCH_*` del reto).
- **Config del runner (primer cambio real de orquestación):** 4 projects —
  `setup-ui` y `setup-api` crean un badge cada uno; `chromium` hereda el de la API
  (`storageState: ".auth/user.api.json"` + `dependencies: ["setup-api"]`) y `chromium-ui-badge`
  hereda el de la UI (`".auth/user.ui.json"` + `dependencies: ["setup-ui"]`).
  `.auth/` se genera al correr (está en `.gitignore`).

> **Un solo browser a propósito.** Aquí NO hay firefox/webkit: la matriz
> cross-browser vive en **M08 · CI**. Este módulo se enfoca en UN concepto:
> login una vez (UI o API) → badge → dependencies lo heredan.

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck
pnpm test:setup-ui      # solo el setup por UI  → genera .auth/user.ui.json
pnpm test:setup-api     # solo el setup por API → genera .auth/user.api.json
pnpm m7                 # project chromium: setup-api corre primero, luego los tests autenticados
pnpm exec playwright test --project=chromium-ui-badge   # badge UI (setup-ui primero)
pnpm report
```

> **Cold start de Render.** Los setups hacen login real; el primer request del
> día tarda 30-40s (el de UI sube su timeout a 90s; el de API tiene hasta 180s y además calienta el backend
> antes de usar `AuthService`). Si falla con `TimeoutError`, vuelve a correr.
