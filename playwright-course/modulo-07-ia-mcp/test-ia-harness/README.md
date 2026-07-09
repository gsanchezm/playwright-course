# test-ia-harness

Harness E2E **portable** (Playwright + TypeScript) sobre la app **OmniPizza**.
Es la **referencia de forma esperada** del Modulo 07: un framework limpio que
Claude Code puede generar en una carpeta externa siguiendo los prompts del modulo.
En una corrida real tambien debe existir `TEST_PLAN.md`: se crea antes de las
slices y documenta los casos UI/API que despues implementa la IA.

## Qué incluye la fundación

- `src/core/` — infraestructura transversal: `env` (Singleton), `BasePage` y
  `BaseService` (Template Method), `reporter` (Observer), `auth/LoginStrategy`
  (Strategy).
- `src/shared/` — `types` (contratos de dominio), `fixtures` (Dependency
  Injection) y `data/` (`users.json`, `markets.json`).
- `src/features/` — donde viven las **slices verticales** (auth, catalog, cart,
  checkout). Las genera Claude Code (u otro agente de IA) siguiendo `AGENTS.md`.

> Lee **`AGENTS.md`** antes de generar cualquier slice: define el árbol, la tabla
> patrón→casa, los nombres de export fijos y las reglas de locators/API.
> Lee tambien **`TEST_PLAN.md`** en el harness generado: ahi viven los escenarios
> y endpoints confirmados para no repetirlos en cada prompt.

## Cómo correr

```bash
# 1. Instalar dependencias y navegadores
pnpm install
pnpm install:browsers

# 2. Configurar entorno (copia y ajusta)
cp .env.example .env

# 3. Chequeo de tipos (sin ejecutar tests)
pnpm typecheck

# 4. Ejecutar tests
pnpm test            # toda la suite
pnpm test:ui         # solo project ui-chromium
pnpm test:api        # solo project api (*.api.spec.ts)
pnpm test:smoke      # pruebas marcadas @smoke
pnpm test:headed     # UI con browser visible
pnpm report          # abrir el ultimo reporte HTML
```

> `pnpm typecheck` solo pasa "verde" una vez que existen las slices de
> `src/features/` (los fixtures las importan por sus nombres fijos). La fundación
> en sí (core/ y shared/) es consistente de forma aislada.

## Anclado a testids verificados

Todos los locators usan **`getByTestId` / `getByRole`** anclados a los testids
**verificados** de OmniPizza (ver `AGENTS.md`, sección 6). Sin CSS profundo, sin
XPath y sin `waitForTimeout`: sólo assertions web-first.
