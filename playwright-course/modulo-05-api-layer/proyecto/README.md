# m05-api-layer — proyecto autocontenido

Snapshot **runnable** de `playwright_architecture` **al terminar el Módulo 05**
(capa de servicios / API testing) sobre **OmniPizza**. El "por qué" vive en
[`../../modulo-05-api-layer/README.md`](../../modulo-05-api-layer/README.md).

## Qué suma M05 sobre M04

- `services/` — capa de servicios (`BaseService` + `AuthService`, `PizzaService`,
  `OrderService`): prueban la API **sin navegador**, creando su propio contexto
  autenticado vía `AuthService`.
- `tests/api/` — specs de API puros (`auth.spec.ts`, `pizzas.spec.ts`).
- Los specs de `modulo-05-api-layer/` consumen los servicios + datos tipados.
- **Config del runner:** nace el project **`api`** — sin `storageState`, sin
  `dependencies`, corriendo contra `API_URL` (backend) en vez de `BASE_URL`.

> **Enfoque del snapshot.** M05 es la lección de **API**, así que este proyecto trae
> solo el project `api` y las capas que la API necesita (`services`, `types`, `data`,
> `helpers`). La matriz UI de M04 no forma parte de esta lección.

## Cómo correr

```bash
pnpm install
cp .env.example .env
pnpm typecheck
pnpm m5              # corre modulo-05 en el project api (sin browser)
pnpm test:api       # toda la suite de API
pnpm report
```

> **No requiere navegadores** para la suite de API (`pnpm install:browsers` es
> opcional). **Cold start de Render:** el backend en free tier despierta en 30-40s;
> si el primer request falla, vuelve a correr.
