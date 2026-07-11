# m02-locators — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 02**
(locators) sobre **OmniPizza**. Referencia de forma esperada del módulo, lista para
clonar y correr aislada. El "por qué" vive en
[`../../modulo-02-locators/README.md`](../../modulo-02-locators/README.md).

## Qué practica M02 sobre M01

- **Jerarquía de locators** aplicada a conciencia: `getByRole` donde OmniPizza
  coopera (el botón "Sign In", los headings del catálogo) y `getByTestId` donde no
  (inputs sin `<label>`, banderas icon-only), con CSS de prefijo para los testids
  dinámicos de las cards.
- `tests/ejemplo.spec.ts` — el smoke de login + catálogo de **un** mercado (MX
  hardcoded), **seguido** de la chuleta viva `Reference — locator hierarchy` (dos
  `test.skip` con selectores REALES de cada nivel de la jerarquía).
- `tests/reto.spec.ts` — reto de locators: localizar 3 elementos del catálogo con el
  nivel correcto (role → filtro → CSS + scoping).
- **Config del runner: sin cambios vs M01** (un solo project anónimo `ui-anon`). M02
  practica locators; **no** añade `data/` ni `types/` (eso nace en M03 data-driven).

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck
pnpm m2              # corre el smoke en el project ui-anon
pnpm test:ui         # UI mode
pnpm report
```

> **Cold start de Render.** Primer request del día 30-40s; si falla con `TimeoutError`,
> vuelve a correr.
