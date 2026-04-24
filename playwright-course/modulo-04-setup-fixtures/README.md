# Módulo 04 — Setup project + Fixtures + Data isolation + `page.route()`

**Duración estimada:** 55-65 min
**Piezas que suma al framework:**
- `tests/setup/auth.setup.ts` — login vía API, persiste `storageState`.
- `fixtures/omnipizza.ts` — fixtures de Page Objects + market/user inyectado.
- `helpers/unique-data.ts` — identificadores únicos para paralelismo seguro.
- `playwright.config.ts` con `projects` que declaran `dependencies: ['setup']`.
- Demostración de `page.route()` para mocking de red.

---

## Analogía de apertura

El tester manual, antes de empezar una sesión, **se registra en recepción** (login vía API), recibe un **badge** (`storageState`) y con él entra a todos los módulos sin volver a autenticarse. Además, si varios testers trabajan en paralelo, **cada uno usa datos propios** (órdenes con su nombre, emails únicos) para que no se pisen.

---

## ¿Qué aprenderás?

1. **`auth.setup.ts` como project con `dependencies`** — el patrón 2026.
2. **Login vía API** (no UI) para sembrar sesión rápida y determinista.
3. **`storageState` por project**, NO global — flujos negativos y API no lo heredan.
4. **Custom fixtures** con `test.extend` para inyectar Page Objects.
5. **Worker vs test fixtures** — cuándo usar cada uno.
6. **Data isolation:** `uniqueEmail(workerInfo)` para `fullyParallel: true`.
7. **`page.route()`** — mocking de red para casos de error deterministas.

---

## Conceptos JIT

| Concepto | Analogía |
|---|---|
| `auth.setup.ts` project | Registro en recepción: se hace 1 vez, el badge vale todo el día |
| `storageState` por project | Badge compartido entre TCs del mismo project |
| `dependencies: ['setup']` | "No ejecutes hasta que setup haya terminado" — precondición declarativa |
| `test.extend` | Adaptador custom del test runner |
| Worker fixture | 1 instancia por worker (ej. `defaultMarket`) |
| Test fixture | 1 instancia por TC (ej. `loginPage`) |
| `workerInfo.workerIndex` | El número del tester paralelo (0, 1, 2…) |
| `uniqueEmail()` | Cada worker genera sus propios folios de orden |
| `page.route('**/api/pizzas', ...)` | Stub en Postman Mock Server: tú decides la respuesta |

---

## Por qué este patrón (y no `globalSetup`)

La v3 **no usa `globalSetup` con login por UI** porque:

| Aspecto | `globalSetup` + UI login | `auth.setup.ts` project + API login |
|---|---|---|
| Velocidad | Lento (navegación completa) | Rápido (1 POST) |
| Determinismo | Flaky (depende del DOM) | Determinista (contrato API) |
| Reutilización | Difícil para múltiples roles | Trivial (un `setup.ts` por rol) |
| Visibilidad en reportes | No aparece como test | Aparece como test en el report |
| Paralelismo | Punto único | Por project con `dependencies` |

---

## Paso a paso

1. Revisa `tests/setup/auth.setup.ts` — el "registro en recepción".
2. Revisa `fixtures/omnipizza.ts` — qué es worker vs test fixture.
3. Revisa `helpers/unique-data.ts` — data isolation.
4. Corre **sólo el setup**:
   ```bash
   pnpm test:setup
   ```
   Verifica que se creó `.auth/user.json`.
5. Corre M04:
   ```bash
   pnpm m4
   ```
6. Cronometra: corre M03 (sin setup project) vs M04 (con setup project) y observa la diferencia.
7. Resuelve el reto.

---

## Comandos útiles

```bash
pnpm test:setup                                  # sólo auth setup
pnpm m4                                          # el módulo
pnpm exec playwright test --list                 # lista sin ejecutar
pnpm exec playwright test --workers=1 --debug    # 1 worker, inspector
```

---

## Outcome esperado

- [ ] `.auth/user.json` se crea al correr setup.
- [ ] Los TCs del project `ui-chromium` arrancan ya autenticados.
- [ ] El project `api` NO hereda cookies de UI.
- [ ] Puedes explicar worker fixture vs test fixture.
- [ ] Sabes generar data única por worker con `uniqueEmail(info)`.
- [ ] Puedes mockear una respuesta con `page.route()`.
