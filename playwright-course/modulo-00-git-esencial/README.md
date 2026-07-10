# Módulo 00 — Git esencial para automatizadores

**Duración estimada:** 30-45 min
**Pieza que suma al framework:** habilidad mínima de Git para versionar tu suite — `config`, `init`, `status`, `add`, `commit`, `.gitignore`, `log`. Lo justo para empezar M01 sin miedo.

> ⚠️ **¿Ya manejas Git con fluidez?** Salta a M01. Este módulo es la **versión condensada** de lo esencial. Para profundización (rebase interactivo, workflows de equipo, tags, aliases) ver el [curso completo](../../git-github-course/).

---

## 🏗️ Arquitectura al terminar este módulo

Este módulo **no agrega código de tests** al framework — pero sí **nace el proyecto real**: aquí creas `playwright-course` (el MISMO repo que M01 llenará con `pnpm create playwright`) y le das **disciplina de versionado**. El "antes y después" se ve en el repo:

```
ANTES (sin Git, sin proyecto)       DESPUÉS (playwright-course con Git habit)
─────────────────────────           ───────────────────────────────────────────────
proyecto-suelto/                    playwright-course/
├── tests_v1/                       ├── .git/                  ← 🆕 historial completo
├── tests_v2/                       ├── .gitignore             ← 🆕 mínimo (.env, node_modules/)
├── tests_FINAL/                    ├── login.spec.ts          ← 1 versión, N commits
└── tests_NO_TOCAR/                 └── .env                   ← presente, NO versionado
```

> 🎯 En **M01** entrarás a esta misma carpeta y correrás `pnpm create playwright` — el installer la poblará (`tests/`, `playwright.config.ts`, su propio `.gitignore`) **encima de este historial**, sin perder tus commits de M00.

**Qué entrega este módulo al resto del curso:**

| Habilidad | Cuándo se usa después |
|---|---|
| `git config --global` (identidad) | Siempre — todos los commits firmados |
| `git init` + `status`/`add`/`commit` | M01 en adelante: versionas cada cambio |
| `.gitignore` mínimo (`.env`, `node_modules/`) | M01 lo consolida (el installer trae el suyo + añades `.env`/`.auth/`) |
| `git log --oneline` | M03 y M04 para revisar historia antes de mergear |

**Lo que llega *just-in-time* después** (no se trata en M00):

| Habilidad | Llega en | Por qué |
|---|---|---|
| Branches (`switch -c`, merge) | M03 | El refactor a POM toca varios archivos a la vez |
| Resolución de conflictos | M03 | Dos personas editan `LoginPage.ts` |
| Push, remotos, PRs | M04 | Necesitas que un compañero revise tus fixtures |
| Deshacer cambios (`restore`, `reset`, `revert`) | M04 | `auth.setup.ts` puede romper todo |
| Secrets en GitHub (`gh secret`) | M06 | CI necesita credenciales sin filtrarlas al repo |

> 💡 **Para el facilitador:** este módulo es **el único que no toca el árbol del framework** — su producto es la disciplina del alumno. Mide el éxito al ver `git log --oneline` con commits limpios y semánticos al final del curso.

---

## Analogía de apertura

Tu suite de tests es código vivo: **siempre va a cambiar**. Sin Git eres un tester manual sin control de versiones de tus casos de prueba — un día borras un step, otro día sobreescribes una regresión, y nadie sabe quién rompió qué.

> 🎯 **Imagen mental:** piensa en Git como la **caja negra de un avión**. No detiene los errores, pero **graba cada movimiento del piloto** (tú) sobre el código. Cuando algo se cae, puedes rebobinar al instante exacto, ver qué cambió y volver al estado anterior — sin perder lo que sí servía. Sin caja negra, el equipo de QA queda discutiendo "yo creo que fue Juan ayer" mientras la suite está rota en producción.

Git es la **bitácora obligatoria** del automatizador: cada commit es una grabación con marca de tiempo, autor y descripción de qué cambió.

---

## Glosario rápido

Antes de empezar, fija estos 6 términos. Vas a leerlos en cada bloque del módulo:

| Término | En 1 línea | Analogía QA |
|---|---|---|
| **Repositorio (repo)** | Carpeta + su historial completo de cambios | Carpeta de evidencias de QA, pero con cada versión guardada automáticamente |
| **Commit** | Una "foto" de tu proyecto en un momento dado, con mensaje y autor | Un *test report* firmado: dice qué se ejecutó, quién lo ejecutó y cuándo |
| **Working directory** | Lo que ves en tu editor *ahora* | Bugs que estás detectando en este momento — aún no decides si van al reporte |
| **Staging area** | "Sala de espera" de lo que entrará al próximo commit | Bugs ya validados que sí van al reporte final, pero aún no lo envías |
| **Hash** | ID único de 40 caracteres (`a1b2c3d…`) por commit | Número de ticket en Jira: irrepetible, sirve para señalar exactamente "este" |
| **Branch (rama)** | Línea de trabajo paralela sobre el mismo repo | Ambiente de QA aislado: pruebas algo sin tocar el ambiente principal |

> 💡 Branches se trabajan a fondo en M03/M04 — por ahora basta con saber que existen.

---

## ¿Qué aprenderás?

1. **`git config --global`** — firmar tus commits con identidad real.
2. **Los 3 estados de Git** — working / staging / repository.
3. **`git init` y el ciclo `status → add → commit`** — el 90% del día.
4. **`.gitignore` específico de Playwright** — qué nunca debe entrar al repo.
5. **`git log` básico** — leer la historia de la suite.

Branches, push, Pull Requests y deshacer cambios entran *just-in-time* en M03 y M04, cuando el problema los pide.

---

## Contenido

| # | Archivo | Tema |
|---|---|---|
| 1 | [`01-config-y-3-estados.md`](./01-config-y-3-estados.md) | Configuración inicial + los 3 estados |
| 2 | [`02-init-add-commit.md`](./02-init-add-commit.md) | Inicializar repo, registrar cambios |
| 3 | [`03-gitignore-playwright.md`](./03-gitignore-playwright.md) | `.gitignore` listo para este curso |
| 4 | [`04-log-basico.md`](./04-log-basico.md) | Ver el historial |
| 5 | [`reto.md`](./reto.md) | Práctica activa |

---

## Outcome esperado

- [ ] `git config --list --global` muestra tu nombre y correo.
- [ ] Puedes explicar working dir / staging / repository.
- [ ] Hiciste el primer commit real del proyecto `playwright-course`.
- [ ] Tu `.gitignore` mínimo excluye `node_modules/` y `.env` (el definitivo se completa en M01).
- [ ] Sabes leer un diff: líneas `-`/`+` y el encabezado de hunk `@@ -a,b +c,d @@`.
- [ ] Puedes leer `git log --oneline` y entender qué pasó.

---

> 📚 **Profundización opcional:** [Curso completo Git/GitHub](../../git-github-course/) — historia de Git, snapshots vs deltas, glosario, workflows de equipo, rebase interactivo, tags, aliases, branch protection.
