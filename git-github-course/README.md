# Curso de Git y GitHub para Automatizadores QA

Curso express de **Git y GitHub** orientado a ingenieros de QA que están migrando hacia la automatización. Todos los ejemplos, analogías y ejercicios están enfocados en el día a día de un **automatizador** (alguien que mantiene un repo de tests con Playwright, Cypress, Selenium, etc.) y de un **equipo de automatización** (varios ingenieros colaborando en el mismo framework de pruebas).

> Este curso es complementario al [curso de TypeScript para QA](../typescript-qa-course/) y al curso de Playwright (próximamente).

---

## ¿Para quién es este curso?

- Automatizadores QA junior o mid que ya escriben tests pero nunca trabajaron con Git en serio.
- Testers manuales que están migrando hacia la automatización y necesitan versionar su código.
- Equipos de QA que quieren estandarizar un flujo de trabajo con ramas, PRs y revisiones de código.

## ¿Qué aprenderás?

- Por qué un control de versiones es tan importante como el propio framework de pruebas.
- Cómo inicializar, clonar y mantener un repo con tests de automatización.
- Cómo deshacer errores sin romper el trabajo de tus compañeros.
- Cómo trabajar con ramas, merges y rebases en un equipo de QA.
- Cómo colaborar en GitHub: forks, Pull Requests, revisiones, protección de ramas.

---

## Estructura del curso

| # | Carpeta | Tema | Duración aprox. |
|---|---------|------|-----------------|
| 1 | [modulo-01-introduccion-git](./modulo-01-introduccion-git/) | ¿Qué es Git? Instalación y primera configuración | 45 min |
| 2 | [modulo-02-git-basico](./modulo-02-git-basico/) | Primer repo de automatización: init, add, commit, log | 1.5 h |
| 3 | [modulo-03-undo-remotos-tags](./modulo-03-undo-remotos-tags/) | Deshacer cambios, trabajar con remotos, tags y aliases | 1.5 h |
| 4 | [modulo-04-ramas-y-merge](./modulo-04-ramas-y-merge/) | Ramas, merge, resolución de conflictos | 1.5 h |
| 5 | [modulo-05-workflows-rebase](./modulo-05-workflows-rebase/) | Workflows de equipo y rebase | 1.5 h |
| 6 | [modulo-06-github](./modulo-06-github/) | GitHub: cuenta, contribuir y mantener un proyecto | 1.5 h |

**Duración total estimada:** ~8 horas de práctica activa.

---

## Cada módulo contiene

- **Archivos `NN-<subtema>.md`** — La parte teórica/explicativa del módulo, dividida en archivos cortos (uno por subtema) para poder leer o consultar un tema específico sin abrir un documento gigante. Incluyen comandos reales, salidas de consola y analogías del mundo del testing. Los lees en orden numérico (`01-…`, `02-…`, …).
- **`reto.md`** — Ejercicios prácticos que tú (o tu equipo) deben resolver en una terminal real. Incluye el resultado esperado para que puedas autoevaluarte.

### Contenido detallado por módulo

<details>
<summary><strong>Módulo 1 — Introducción a Git</strong></summary>

- [`01-que-es-vcs.md`](./modulo-01-introduccion-git/01-que-es-vcs.md) — ¿Qué es un Sistema de Control de Versiones?
- [`02-historia-de-git.md`](./modulo-01-introduccion-git/02-historia-de-git.md) — Breve historia de Git.
- [`03-que-es-git.md`](./modulo-01-introduccion-git/03-que-es-git.md) — Snapshots y los 3 estados.
- [`04-linea-de-comandos.md`](./modulo-01-introduccion-git/04-linea-de-comandos.md) — Por qué usaremos la CLI.
- [`05-instalacion.md`](./modulo-01-introduccion-git/05-instalacion.md) — Instalación en macOS / Windows / Linux.
- [`06-primera-configuracion.md`](./modulo-01-introduccion-git/06-primera-configuracion.md) — First-Time Setup (`user.name`, `user.email`, editor…).
- [`07-pedir-ayuda.md`](./modulo-01-introduccion-git/07-pedir-ayuda.md) — `git help` y recursos oficiales.
- [`08-glosario.md`](./modulo-01-introduccion-git/08-glosario.md) — Glosario mínimo.
</details>

<details>
<summary><strong>Módulo 2 — Git Básico</strong></summary>

- [`01-obtener-repositorio.md`](./modulo-02-git-basico/01-obtener-repositorio.md) — `git init` vs `git clone`.
- [`02-registrar-cambios.md`](./modulo-02-git-basico/02-registrar-cambios.md) — `status`, `add`, `commit`, `diff`, `.gitignore`.
- [`03-historial-log.md`](./modulo-02-git-basico/03-historial-log.md) — Ver el historial con `git log`.
- [`04-casos-reales.md`](./modulo-02-git-basico/04-casos-reales.md) — Casos del día a día.
</details>

<details>
<summary><strong>Módulo 3 — Deshacer, Remotos, Tags y Aliases</strong></summary>

- [`01-deshacer-cambios.md`](./modulo-03-undo-remotos-tags/01-deshacer-cambios.md) — `amend`, `restore`, `reset`, `revert`, `reflog`.
- [`02-remotos.md`](./modulo-03-undo-remotos-tags/02-remotos.md) — `fetch`, `pull`, `push`, administración de remotos.
- [`03-tags.md`](./modulo-03-undo-remotos-tags/03-tags.md) — Tags lightweight vs annotated, versionar releases.
- [`04-aliases.md`](./modulo-03-undo-remotos-tags/04-aliases.md) — Atajos personalizados para el día a día.
</details>

<details>
<summary><strong>Módulo 4 — Ramas y Merge</strong></summary>

- [`01-ramas-conceptos.md`](./modulo-04-ramas-y-merge/01-ramas-conceptos.md) — Qué es una rama y por qué son baratas.
- [`02-crear-cambiar-listar.md`](./modulo-04-ramas-y-merge/02-crear-cambiar-listar.md) — `branch`, `switch`, `checkout -b`.
- [`03-flujo-feature-branch.md`](./modulo-04-ramas-y-merge/03-flujo-feature-branch.md) — El flujo diario + convenciones de nombres.
- [`04-merge.md`](./modulo-04-ramas-y-merge/04-merge.md) — Fast-forward y 3-way merge.
- [`05-conflictos.md`](./modulo-04-ramas-y-merge/05-conflictos.md) — Resolver conflictos paso a paso.
- [`06-gestion-ramas.md`](./modulo-04-ramas-y-merge/06-gestion-ramas.md) — Listar, renombrar, limpiar ramas.
</details>

<details>
<summary><strong>Módulo 5 — Workflows y Rebase</strong></summary>

- [`01-workflows.md`](./modulo-05-workflows-rebase/01-workflows.md) — Trunk-based, long-running, Gitflow, integration-manager.
- [`02-ramas-remotas.md`](./modulo-05-workflows-rebase/02-ramas-remotas.md) — Tracking, `--prune`, publicar ramas.
- [`03-rebase.md`](./modulo-05-workflows-rebase/03-rebase.md) — Rebase normal e interactivo (`rebase -i`).
- [`04-merge-vs-rebase.md`](./modulo-05-workflows-rebase/04-merge-vs-rebase.md) — Cuándo usar cada uno.
</details>

<details>
<summary><strong>Módulo 6 — GitHub</strong></summary>

- [`01-configuracion-cuenta.md`](./modulo-06-github/01-configuracion-cuenta.md) — Cuenta, 2FA, SSH vs HTTPS.
- [`02-crear-subir-repo.md`](./modulo-06-github/02-crear-subir-repo.md) — Primer push y subir tags.
- [`03-pull-requests.md`](./modulo-06-github/03-pull-requests.md) — Flujo de PRs, revisión, estrategias de merge.
- [`04-mantener-proyecto.md`](./modulo-06-github/04-mantener-proyecto.md) — Branch protection, labels, releases, CI.
</details>

---

## Requisitos

- Una terminal (Terminal.app en macOS, Windows Terminal en Windows, cualquiera en Linux).
- Git instalado (se cubre en el [Módulo 1](./modulo-01-introduccion-git/)).
- Una cuenta gratuita de [GitHub](https://github.com) (se cubre en el [Módulo 6](./modulo-06-github/)).
- Un editor de código (VS Code recomendado).
- Opcional pero recomendado: el repo del curso de TypeScript clonado para usarlo como "repo de pruebas".

---

## Cómo estudiar este curso

1. Lee **en orden** los archivos numerados (`01-…`, `02-…`, …) del módulo antes de tocar la terminal.
2. Reproduce los comandos de cada subtema en una carpeta de prueba (por ejemplo, `~/sandbox/qa-automation-demo`).
3. Haz los ejercicios de `reto.md` sin mirar las soluciones.
4. Compara tu resultado con la "salida esperada" de cada reto.
5. Pasa al siguiente módulo solo cuando puedas reproducir los retos sin ver las notas.

> 💡 Si solo quieres consultar un tema puntual (por ejemplo, "cómo resolver un conflicto"), abre el archivo específico del módulo correspondiente en vez de leer todo el módulo.

> 💡 **Consejo del instructor:** No te saltes los retos. Git se aprende rompiendo cosas en un repo sandbox, no leyendo documentación.

---

## Convenciones del curso

- **Comandos de terminal** se muestran con el prompt `$` al inicio:
  ```bash
  $ git status
  ```
- **Salidas esperadas** aparecen sin el `$`:
  ```
  On branch main
  nothing to commit, working tree clean
  ```
- **Bloques `⚠️` y `💡`** marcan warnings y tips importantes.
- Los nombres de rama y archivos usan **inglés** (convención estándar en Git).
- Los comentarios explicativos están en **español**.
