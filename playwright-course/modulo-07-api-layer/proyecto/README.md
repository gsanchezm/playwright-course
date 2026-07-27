# m07-api-layer — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 07**
(capa de servicios / API testing) sobre **OmniPizza**. El "por qué" vive en
[`../../modulo-07-api-layer/README.md`](../../modulo-07-api-layer/README.md).

## Qué suma M07 sobre M06

- `services/` — capa de servicios (`BaseService` + `AuthService`, `PizzaService`,
  `OrderService`): prueban la API **sin navegador**, creando su propio contexto
  autenticado vía `AuthService`.
- `tests/api/` — specs de API puros (`auth.spec.ts`, `pizzas.spec.ts`).
- Los specs de `modulo-07-api-layer/` consumen los servicios + datos tipados.
- **Config del runner:** nace el project **`api`** — sin `storageState`, sin
  `dependencies`, corriendo contra `API_URL` (backend) en vez de `BASE_URL`.

> **M07 SUMA, no reemplaza.** `pages/`, `fixtures/`, `tests/setup/` y los projects
> `setup`+`chromium` de M04-M06 siguen aquí sin cambios (los tests heredados viven
> en `tests/ui/`) — la capa de API corre AL LADO de la de UI, en su propio project.

## Cómo correr

```bash
pnpm install
cp .env.example .env
pnpm typecheck
pnpm m7              # corre este módulo en el project api (sin browser)
pnpm test:api        # toda la suite de API
pnpm test:setup      # solo el setup de UI (genera .auth/user.json)
pnpm test:ui-smoke   # solo la capa de UI heredada (M04-M06)
pnpm report
```

> **La suite de API no requiere navegadores** (`pnpm install:browsers` sí hace
> falta para `test:ui-smoke`). **Cold start de Render:** el backend en free tier
> despierta en 30-40s; si el primer request falla, vuelve a correr.
