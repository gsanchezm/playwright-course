# m06-setup — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 06**
(setup project + `storageState` + `dependencies`) sobre **OmniPizza**. El "por qué"
vive en [`../../modulo-06-setup/README.md`](../../modulo-06-setup/README.md).

## Qué suma M06 sobre M05

- `tests/setup/auth.setup.ts` — el **setup project**: un solo test que hace login
  **por UI** (igual que M01) y guarda la sesión en `.auth/user.json` (el "badge").
- **Config del runner (primer cambio real de orquestación desde M01):** 2 projects —
  `setup` corre primero y crea el badge; `chromium` lo hereda vía
  `storageState: ".auth/user.json"` + `dependencies: ["setup"]` y arranca ya
  autenticado. `.auth/` se genera al correr (está en `.gitignore`).

> **Un solo browser a propósito.** Aquí NO hay firefox/webkit: la matriz
> cross-browser vive en **M08 · CI**. Este módulo se enfoca en UN concepto:
> login una vez → badge → dependencies lo heredan.

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck
pnpm test:setup     # solo el setup project → genera .auth/user.json
pnpm m6             # setup corre primero por dependencies, luego el ejemplo autenticado
pnpm report
```

> **Cold start de Render.** El setup hace login real por UI; el primer request del
> día tarda 30-40s (el setup ya sube su timeout a 90s). Si falla con `TimeoutError`,
> vuelve a correr.
