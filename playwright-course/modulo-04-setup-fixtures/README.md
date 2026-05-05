# Módulo 04 — Setup project + Fixtures + Data isolation + `page.route()`

**Duración estimada:** 85-110 min (incluye dos *Git breaks* — push/PR y deshacer cambios)
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

---

## ☁️ Git break — Sube tu trabajo a GitHub y abre un PR

Hasta ahora todos tus commits viven sólo en tu máquina. Para que un compañero los revise, los necesitas en **GitHub**.

### Por primera vez: conectar tu repo a GitHub

1. En github.com, click **New repository** → nombre (`qa-playwright-curso`), **Private** o **Public**, **sin** README inicial (ya tienes uno).
2. GitHub te muestra los comandos. Los importantes son:

```bash
$ git remote add origin git@github.com:tu-usuario/qa-playwright-curso.git
$ git remote -v                                  # verifica que quedó
origin  git@github.com:tu-usuario/qa-playwright-curso.git (fetch)
origin  git@github.com:tu-usuario/qa-playwright-curso.git (push)
$ git push -u origin main                        # primer push de main
```

El flag `-u` vincula tu rama local con la remota; las próximas veces basta con `git push`.

### El flujo diario: rama → push → PR → review → merge

Asumiendo que ya estás en la rama `feature/m04-fixtures`:

```bash
# 1. Sube tu rama por primera vez
$ git push -u origin feature/m04-fixtures

# 2. Abre el PR (vía web o con gh CLI)
$ gh pr create --base main --head feature/m04-fixtures \
    --title "feat(m04): setup project + fixtures" \
    --body "Agrega auth.setup.ts, fixtures de POM y data isolation"

# 3. Si te piden cambios en el review, los aplicas y vuelves a pushear
$ # (editas)
$ git add fixtures/omnipizza.ts
$ git commit -m "review: address comments on fixtures"
$ git push                                       # ya no necesita -u

# 4. Cuando tenga aprobaciones suficientes, mergeas desde la web (o con gh)
$ gh pr merge --squash --delete-branch
```

### Estrategias de merge en GitHub

| Opción | Qué hace | Cuándo usar |
|---|---|---|
| **Merge commit** | Preserva todos tus commits + uno extra de merge | Equipos que valoran el historial detallado |
| **Squash and merge** | Aplana toda la rama en **un solo commit** | Default seguro: historial limpio sin esfuerzo |
| **Rebase and merge** | Aplica tus commits sobre `main` sin merge commit | Equipos que rebasean estrictamente |

Para empezar, **squash and merge** es la opción más fácil. Tu PR queda como un único commit en `main`, con título y descripción del PR.

---

## 🔙 Git break — Cuando algo se rompe

Los fixtures con `.auth/`, `page.route()` y `storageState` son frágiles. Vas a romper cosas. Esta es la tabla decisión:

| Situación | Comando |
|---|---|
| Modifiqué un archivo y quiero descartar los cambios | `git restore <archivo>` |
| Agregué algo al staging y no quería | `git restore --staged <archivo>` |
| Olvidé un archivo en el último commit local | `git add <archivo>` + `git commit --amend --no-edit` |
| Quiero deshacer el último commit local conservando los cambios | `git reset --soft HEAD~1` |
| El commit ya está pusheado y quiero deshacerlo | `git revert <hash>` |
| Hice `reset --hard` y me arrepentí | `git reflog` + `git reset --hard <hash-original>` |

### Caso típico: el `auth.setup.ts` que rompió todo

```bash
$ git log --oneline
a1b2c3d (HEAD -> feature/m04-fixtures) test: try mock for failed login
7f8e9d0 feat(m04): add auth.setup.ts                ← este rompió todo
3e4f5a6 chore: initial m04
```

Si el commit `7f8e9d0` aún **no está pusheado**:

```bash
$ git reset --soft HEAD~2     # deshace los dos últimos, deja los cambios en staging
```

Si **ya está pusheado** (otros pueden haberlo descargado):

```bash
$ git revert 7f8e9d0          # crea un nuevo commit que deshace 7f8e9d0
$ git push
```

`revert` es **siempre seguro** en repos compartidos porque no reescribe el historial.

> ⚠️ **Regla de oro:** **nunca** uses `--amend`, `reset --hard` o `rebase` en commits que **ya pusheaste**. Reescribir historial publicado rompe el repo de tus compañeros.

---

> 📚 **Profundización opcional:** [Cuenta de GitHub + SSH](../../git-github-course/modulo-06-github/01-configuracion-cuenta.md) · [Crear y subir un repo](../../git-github-course/modulo-06-github/02-crear-subir-repo.md) · [PRs detallados (fork, plantilla, review)](../../git-github-course/modulo-06-github/03-pull-requests.md) · [Manual completo de undo](../../git-github-course/modulo-03-undo-remotos-tags/01-deshacer-cambios.md) · [Trabajar con remotos](../../git-github-course/modulo-03-undo-remotos-tags/02-remotos.md)
