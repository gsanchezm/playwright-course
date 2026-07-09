# 🚩 Reto M07 · Genera un AI Test Harness

**Dirige a Claude Code para generar un framework E2E completo — vertical-slice, en paralelo y cross-browser — sin escribir código de producción a mano.**

## Objetivo

Generar un AI Test Harness verde para OmniPizza usando **solo prompts** + Playwright MCP. Tu trabajo es **dirigir, verificar y corregir**, no teclear el framework. Al final mides el límite real de tu stack de IA hoy.

## 🧰 Pre-requisitos

- [ ] Node ≥ 20, `pnpm` ≥ 9, **Claude Code** con sesión, git. `gh` es opcional (solo para el push final).
- [ ] Un cliente con **Playwright MCP** conectado (`claude mcp list` muestra `✓ connected`).
- [ ] OmniPizza despierto (Render free tier): UI `https://omnipizza-frontend.onrender.com`, API `https://omnipizza-backend.onrender.com`. La primera carga tarda 30-40s.

> ⚠️ El harness debe vivir en una **carpeta externa vacía**, fuera del repo del curso y separado del SUT. No se permite editar a mano el código generado, salvo que documentes por qué Claude Code no pudo corregirlo tras 3 intentos.

---

## Pasos

### Paso 1 — Setup y ambiente (prompts 00 → 01)

Pega `prompts/00-create-setup-scripts.md`, corre el script sobre una carpeta externa, entra con `claude` y pega `prompts/01-bootstrap-environment.md`.

✅ **Cómo verificar:** `claude mcp list` responde `✓ connected` y la IA confirma versiones reales navegando una página con MCP (no de memoria).

### Paso 2 — Fundación paralela + cross-browser (prompt 02)

Pega `prompts/02-master-architect.md`. Crea `AGENTS.md`, `package.json`, `playwright.config.ts`, `tsconfig.json`, `src/core/` y `src/shared/` — **sin features todavía**.

✅ **Cómo verificar:** `pnpm install && pnpm typecheck` pasa, y `playwright.config.ts` corre `fullyParallel` con **6 projects**: `ui-chromium`, `ui-firefox`, `ui-webkit`, `ui-mobile-chrome` (Pixel 5), `ui-mobile-safari` (iPhone 13) y `api`. Compruébalo:

```bash
$ pnpm exec playwright test --list | grep -oE '\[(ui-[a-z-]+|api)\]' | sort -u
```

### Paso 3 — Plan de pruebas con evidencia (prompt 03)

Pega `prompts/03-test-plan.md`. La IA navega OmniPizza con MCP y escribe `TEST_PLAN.md` con matriz UI/API y slices propuestas.

✅ **Cómo verificar:** `TEST_PLAN.md` existe, tiene casos `ui` y `api`, marca como *bloqueado* lo que no pudo confirmar, y exige `MenuPage` si detectó navegación compartida.

### Paso 4 — Slices verticales (prompt 04)

Genera cada slice del plan con `prompts/04-slice-generator.md` (una por vez). Verifica en el loop rápido:

```bash
$ pnpm exec playwright test src/features/<slice> --project=ui-chromium
```

✅ **Cómo verificar:** los archivos caen en `src/features/<slice>/` con specs **co-localizados**. Si aparece cualquier carpeta de capa (`src/pages`, `src/services`, `src/tests/ui`…), **rechaza la salida** y pide que la mueva a la slice. Si la IA generó locators sin navegar con MCP, recházala.

### Paso 5 — DI, CI y matriz completa (prompts 05 → 06)

Pega `prompts/05-fixtures-di.md` y `prompts/06-ci-scripts.md`. Luego corre la suite entera en paralelo y la matriz cross-browser:

```bash
$ pnpm test:api
$ pnpm test:cross     # chromium + firefox + webkit + Pixel 5 + iPhone 13
```

✅ **Cómo verificar:** la suite corre en paralelo; el workflow tiene dos jobs (`test` chromium en push/PR + `cross-browser` opt-in). Si un test pasa en `ui-chromium` pero falla en `ui-mobile-*`, ese es un bug **responsive** real (testid `-responsive`), no del test — anótalo.

### Paso 6 — Healer y cierre (prompt 07, y 08 opcional)

Pega `prompts/07-healer-review.md` con los outputs reales. Opcional: `prompts/08-git-github-pr.md` para commit + repo + push a `main` y ver el CI en verde.

✅ **Cómo verificar:** suite verde o diagnóstico claro tras máximo 3 iteraciones. Si publicaste, el job `test` del CI sale verde.

### Paso 7 — Bonus: skill reutilizable (prompts 09 → 10)

Pega `prompts/09-create-reusable-skill.md` y luego `10-use-skill-to-bootstrap-harness.md` con otro `UI_URL`/`API_URL`/`TARGET_DIR`.

✅ **Cómo verificar:** existe `skills/ai-test-harness-builder/` y con la skill preparaste un **segundo** ambiente con menos instrucciones. Revisa que su `workflow.md` describa `src/features/<slice>/` y **no** carpetas de capa.

---

## ✅ Entregables

- [ ] Carpeta externa con el harness generado y versionado.
- [ ] Estructura **vertical-slice** (`src/features/<slice>/` co-localizado); **cero** carpetas de capa.
- [ ] `playwright.config.ts` con `fullyParallel` + matriz cross-browser + responsive (6 projects) verificada con `--list`.
- [ ] `pnpm typecheck` verde; ≥1 spec UI y ≥1 spec API (o bloqueo API documentado).
- [ ] `pnpm test:cross` ejecutado, con nota de qué agregó cada motor/viewport.
- [ ] Reflexión breve: qué hizo bien Claude Code, qué corregiste, cuántas iteraciones tomó.

## Bonus

- Repite el reto apuntando a **otro SUT** (cambia solo `--ui-url`/`--api-url`): mide si los prompts se mantienen genéricos.
- Corre `prompts/12-multirepo-project-design.md` o `13-monorepo-project-design.md` si tienes el código fuente del SUT, para un `TEST_PLAN.md` más preciso.

## 📝 Preguntas de reflexión

1. ¿Por qué el project `api` usa `testMatch` y los de UI `testIgnore`, en vez de una sola regla? *(Pista: las specs de API no deben abrir un browser.)*
2. Si tuvieras que quitar un project para acelerar CI, ¿cuál y por qué? *(Pista: piensa en cobertura de motor vs. tiempo.)*
3. ¿Qué gana `fullyParallel: true` y qué riesgo introduce si tus tests comparten estado? *(Pista: aislamiento entre workers.)*

---

> 📚 **Profundización opcional:**
> - Agrega un tercer viewport (tablet) al `playwright.config.ts` y observa si algún testid necesita una tercera rama en `tid()`.
> - Escribe tu propio MCP server que exponga tu sistema interno (Jira, TestRail) para que la IA lea casos manuales y los convierta a slices.
