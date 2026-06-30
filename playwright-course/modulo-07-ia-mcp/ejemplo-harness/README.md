# omnipizza-ai-harness

Harness E2E **portable** (Playwright + TypeScript) sobre la app **OmniPizza**.
Es una **referencia de la forma esperada** del playbook de IA del Módulo 07 (no su
salida literal — ver el playbook): la fundación de un framework limpio que un alumno
(con ayuda de su IA) completa slice por slice.

## Qué incluye la fundación

- `src/core/` — infraestructura transversal: `env` (Singleton), `BasePage` y
  `BaseService` (Template Method), `reporter` (Observer), `auth/LoginStrategy`
  (Strategy).
- `src/shared/` — `types` (contratos de dominio), `fixtures` (Dependency
  Injection) y `data/` (`users.json`, `markets.json`).
- `src/features/` — donde viven las **slices verticales** (auth, catalog, cart,
  checkout). Las genera el alumno/IA siguiendo `AGENTS.md`.

> Lee **`AGENTS.md`** antes de generar cualquier slice: define el árbol, la tabla
> patrón→casa, los nombres de export fijos y las reglas de locators/API.

## Cómo correr

```bash
# 1. Instalar dependencias y navegadores
pnpm install
pnpm exec playwright install

# 2. Configurar entorno (copia y ajusta)
cp .env.example .env

# 3. Chequeo de tipos (sin ejecutar tests)
pnpm typecheck

# 4. Ejecutar tests
pnpm test            # toda la suite
pnpm test:ui         # sólo project ui-chromium
pnpm test:api        # sólo project api (*.api.spec.ts)
pnpm report          # abrir el último reporte HTML
```

> `pnpm typecheck` sólo pasa "verde" una vez que existen las slices de
> `src/features/` (los fixtures las importan por sus nombres fijos). La fundación
> en sí (core/ y shared/) es consistente de forma aislada.

## Anclado a testids verificados

Todos los locators usan **`getByTestId` / `getByRole`** anclados a los testids
**verificados** de OmniPizza (ver `AGENTS.md`, sección 6). Sin CSS profundo, sin
XPath y sin `waitForTimeout`: sólo assertions web-first.
