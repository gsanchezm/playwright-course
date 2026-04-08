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

- **`ejemplo.md`** — Explicación del concepto con comandos reales, salidas de consola y analogías del mundo del testing. Es como el "slide deck" del instructor.
- **`reto.md`** — Ejercicios prácticos que tú (o tu equipo) deben resolver en una terminal real. Incluye el resultado esperado para que puedas autoevaluarte.

---

## Requisitos

- Una terminal (Terminal.app en macOS, Windows Terminal en Windows, cualquiera en Linux).
- Git instalado (se cubre en el [Módulo 1](./modulo-01-introduccion-git/)).
- Una cuenta gratuita de [GitHub](https://github.com) (se cubre en el [Módulo 6](./modulo-06-github/)).
- Un editor de código (VS Code recomendado).
- Opcional pero recomendado: el repo del curso de TypeScript clonado para usarlo como "repo de pruebas".

---

## Cómo estudiar este curso

1. Lee `ejemplo.md` de un módulo completo antes de tocar la terminal.
2. Reproduce los comandos del `ejemplo.md` en una carpeta de prueba (por ejemplo, `~/sandbox/qa-automation-demo`).
3. Haz los ejercicios de `reto.md` sin mirar las soluciones.
4. Compara tu resultado con la "salida esperada" de cada reto.
5. Pasa al siguiente módulo solo cuando puedas reproducir los retos sin ver las notas.

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
