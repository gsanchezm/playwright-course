# Módulo 01 — Setup + primer smoke "feo"

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** `modulo-01-smoke-feo/ejemplo.spec.ts` plano, sin POM, sin fixtures, sin data-driven. **Todo el dolor es deliberado.**

---

## Analogía de apertura

Vas a escribir tu primer caso de prueba automatizado **como lo haría un tester manual copiando pasos en una hoja de Excel**: todo en un bloque, locators inline, sin reutilización. Cuando escribas el segundo y tercer caso vas a sentir la duplicación en los dedos — **esa sensación es el motor de los 5 módulos siguientes**.

---

## ¿Qué aprenderás?

1. **Setup mínimo:** `playwright.config.ts`, `pnpm test`, UI mode.
2. **`.env` + `dotenv`:** manejar secrets como un profesional desde el día 1.
3. **`test()` y `expect()`** — el TC y el resultado esperado.
4. **Auto-waiting** — Playwright es paciente; no usamos `sleep()`.
5. **`getByRole` vs `getByTestId`** — dos formas de localizar.
6. **Workaround del cold start de Render** — backend en free tier se duerme.

---

## Conceptos JIT (con analogía QA)

| Concepto | Analogía |
|---|---|
| `test('...', async ({ page }) => {...})` | Caso de prueba (TC-001) con sus pasos |
| `expect(locator).toBeVisible()` | Resultado esperado del TC documentado |
| `page.goto('/')` | Abrir el navegador en la URL inicial |
| `getByRole('button', { name: 'Login' })` | Localizar como un lector de pantalla |
| `getByTestId('login-button')` | Localizar por el sticker que el dev puso |
| Auto-waiting | La paciencia del tester: espera a que cargue antes de clickear |
| `.env` / `dotenv` | La libreta personal del tester con URLs y passwords |
| Cold start de Render | El servidor de QA dormido: primer request tarda 30-40s |

---

## Paso a paso

### 1. Revisar `.env`

Antes de ejecutar, verifica que existe `.env` en la raíz del curso (copiado de `.env.example`):

```bash
cat ../.env
```

Si no existe:
```bash
cp ../.env.example ../.env
```

### 2. Ejecutar el ejemplo

```bash
pnpm m1                                          # modo headless
pnpm exec playwright test modulo-01-smoke-feo --headed --project=ui-chromium
pnpm test:ui                                     # UI mode (recomendado para aprender)
```

### 3. Observar el dolor

Abre `ejemplo.spec.ts` y nota:

- **Los locators están duplicados** entre los dos tests.
- **El path del login (`/`)** se repite.
- **El warmup del backend** vive dentro del mismo spec.
- Si añadieras un tercer smoke, duplicarías ~8 líneas más.

Este es el dolor que M03 va a eliminar.

### 4. Resolver el reto

Abre `reto.spec.ts` y completa los TODOs. **Con duplicación a la vista**: no intentes ser elegante — el objetivo es sentir más dolor.

---

## Outcome esperado

- [ ] Tienes un test verde contra OmniPizza live.
- [ ] Entiendes por qué `sleep()` está prohibido.
- [ ] Distingues `getByRole` de `getByTestId`.
- [ ] Tienes `.env` configurado y sabes por qué `.env` NO se commitea.
- [ ] **Puedes señalar con el dedo las líneas duplicadas** del spec.

---

## Comandos útiles del módulo

```bash
pnpm m1                                          # correr M01
pnpm exec playwright test --ui                   # UI mode
pnpm exec playwright test --debug modulo-01-smoke-feo/ejemplo.spec.ts
pnpm exec playwright test --headed --project=ui-chromium
```

---

## ¿Qué viene en M02?

En el próximo módulo vas a **parametrizar** este smoke para que un mismo test corra contra los 4 mercados de OmniPizza (MX/US/CH/JP) consumiendo JSON tipado — primer paso para matar la duplicación.
