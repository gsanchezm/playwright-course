# m06-api-layer — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 06**
(capa de servicios / API testing) sobre **OmniPizza**. El "por qué" vive en
[`../README.md`](../README.md).

## Qué suma M06 sobre M05

- `services/` — capa de servicios (`BaseService` + `AuthService`, `PizzaService`,
  `OrderService`): prueban la API **sin navegador**, creando su propio contexto
  autenticado vía `AuthService`.
- `tests/api/` — specs de API puros (`auth.spec.ts`, `pizzas.spec.ts`, `orders.spec.ts`), cada uno con su
  gemela en `with-fixtures/` (Paso 9 bis: mismo comportamiento, hooks vs. fixtures).
- `tests/ejemplo.spec.ts` y `tests/reto.spec.ts` son de **API** (flujo login → pizzas →
  orden y el reto `OrderService.getById`); consumen los servicios + datos tipados.
- `tests/ui/` — la UI, con **login por fixture** (`loginPage`), como en M05:
  `ejemplo.spec.ts` es el mismo flujo login → pizzas → orden por UI (contraparte del
  ejemplo de API). El login negativo de `locked_out_user` vive en M07.
- **Config del runner:** dos projects independientes — `chromium` (UI, `tests/ui/`,
  contra `BASE_URL`) y el nuevo **`api`** (contra `API_URL`, el backend). Ninguno usa
  `storageState` ni `dependencies`.

> **M06 SUMA, no reemplaza.** `pages/` y `fixtures/` de M04-M05 siguen aquí sin
> cambios; la capa de API corre AL LADO de la de UI, en su propio project. No hay
> `tests/setup/` ni `.auth/`: el badge (`storageState`) llega en M07.

## Cómo correr

```bash
pnpm install
cp .env.example .env
pnpm typecheck
pnpm m6              # corre este módulo en el project api (sin browser)
pnpm test:api        # toda la suite de API (mismo project)
pnpm test:ui         # solo la UI (project chromium, login por fixture)
pnpm test:pw-ui      # UI Mode de Playwright (explorador interactivo)
pnpm test:pw-api     # UI Mode de Playwright, solo el project api
pnpm report
```

> **La suite de API no requiere navegadores** (`pnpm exec playwright install chromium`
> sí hace falta para `test:ui`). **Cold start de Render:** el backend en free tier
> despierta en 30-40s; si el primer request falla, vuelve a correr.
