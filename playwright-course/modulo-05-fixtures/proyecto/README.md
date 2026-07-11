# m05-fixtures — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 05**
(custom fixtures + data isolation + `page.route()`) sobre **OmniPizza**. El "por qué"
vive en [`../../modulo-05-fixtures/README.md`](../../modulo-05-fixtures/README.md).

## Qué suma M05 sobre M04

- `fixtures/omnipizza.ts` — fixtures custom (Dependency Injection de Page Objects +
  usuario/mercado inyectados). En el test ya no escribes `new LoginPage(page)`.
- `helpers/unique-data.ts` — datos únicos por worker (emails, ids) para `fullyParallel`.
- Demo de `page.route()` — mocking de red (error 500, estado vacío, latencia simulada).
- **Config del runner: sin cambios de orquestación.** Un único project `chromium`
  anónimo. Los tests hacen login por UI (encapsulado en el POM). El setup project +
  `storageState` + `dependencies` llegan en **M06**; multi-browser en **M08**.

> **Enfoque del snapshot.** M05 corre SIN sesión heredada: los fixtures inyectan Page
> Objects sobre un login por UI normal. El badge (`storageState`) que elimina ese login
> es justo lo que estrena M06.

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck
pnpm m5              # corre los specs en el project chromium
pnpm test:ui
pnpm report
```

> **Cold start de Render.** El login por UI hace un request real; el primer del día
> tarda 30-40s. Si falla con `TimeoutError`, vuelve a correr.
