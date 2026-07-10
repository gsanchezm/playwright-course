# m04-setup-fixtures — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 04**
(setup project + custom fixtures + multi-browser) sobre **OmniPizza**. El "por qué"
vive en [`../../modulo-04-setup-fixtures/README.md`](../../modulo-04-setup-fixtures/README.md).

## Qué suma M04 sobre M03

- `tests/setup/auth.setup.ts` — el **setup project**: loguea una vez y persiste la
  sesión en `.auth/user.json` (storageState).
- `fixtures/omnipizza.ts` — fixtures custom (Dependency Injection de Page Objects +
  página ya autenticada).
- `helpers/unique-data.ts` — datos únicos por test (emails, ids).
- **Config del runner (primer cambio real desde M01):** nace la constante
  `STORAGE_STATE`, el project `setup` (corre primero) y los projects **`ui-chromium`
  / `ui-firefox` / `ui-webkit`** que `dependencies: ["setup"]` + heredan el
  `storageState`. `.auth/` se genera al correr (está en `.gitignore`).

> **Enfoque del snapshot.** En el mono-repo del curso, M04 también mantiene un project
> `ui-anon` para M01-M03. Este snapshot está **enfocado en M04**, así que solo trae
> `setup` + los `ui-*` autenticados.

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck
pnpm m4              # setup corre primero, luego modulo-04 autenticado en ui-chromium
pnpm test:cross     # chromium + firefox + webkit
pnpm test:setup     # solo el setup project (regenera .auth/user.json)
pnpm report
```

> **Cold start de Render.** El setup hace login real; primer request del día 30-40s.
> Si falla con `TimeoutError`, vuelve a correr.
