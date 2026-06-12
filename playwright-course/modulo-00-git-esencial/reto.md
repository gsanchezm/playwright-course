# Reto — M00 Git esencial

## Objetivo

Hacer el **primer commit real del proyecto del curso**. Este reto **NO es un sandbox desechable**: aquí inicializas `playwright_architecture` — el MISMO repo que en M01 llenarás con `pnpm create playwright`. Al terminar, tu framework ya tendrá historial Git desde su línea cero.

> 🎯 Practicas el ciclo completo (`config → init → status → add → commit → diff → log`) sobre el proyecto real. El commit que hagas aquí seguirá vivo al final del curso.

## Setup

**0.1 — Crear y entrar al proyecto**
- **Qué hago:** `mkdir playwright_architecture && cd playwright_architecture`
- **Por qué:** este es el directorio raíz de tu framework para todo el curso. Si ya lo creaste en la lección 2, solo entra con `cd playwright_architecture`.
- **Cómo verifico:** `pwd` (PowerShell: `Get-Location`) termina en `/playwright_architecture` y la carpeta está vacía.

> 🪟 **PowerShell:** usa `;` en vez de `&&` → `mkdir playwright_architecture; cd playwright_architecture`.

## Pasos

**1.1 — Configura tu identidad** (si aún no lo hiciste en la lección 1)
- **Qué hago:**
  ```bash
  $ git config --global user.name "Tu Nombre"
  $ git config --global user.email "tu@correo.com"
  ```
- **Por qué:** cada commit queda firmado con estos datos. Sin ellos, Git puede negarse a commitear o firmar con datos basura.
- **Cómo verifico:** `git config --list --global` muestra tu `user.name` y `user.email`.

**1.2 — Inicializa el repo**
- **Qué hago:** `git init`
- **Por qué:** crea `.git/` con todo el historial. Es lo que convierte la carpeta en un repositorio.
- **Cómo verifico:**
  ```bash
  $ git init
  Initialized empty Git repository in .../playwright_architecture/.git/
  $ git status
  On branch main

  No commits yet
  ```

**1.3 — Crea un `.gitignore` mínimo ANTES de cualquier otro archivo**
- **Qué hago:** crea el archivo desde VS Code con `code .gitignore` y pega el contenido mínimo de [`03-gitignore-playwright.md`](./03-gitignore-playwright.md) (sección 3.1):
  ```gitignore
  node_modules/
  .env
  .env.local
  ```
- **Por qué:** el `.gitignore` debe existir **antes** de generar archivos prohibidos. Si commiteas un secreto primero y lo ignoras después, ya quedó en el historial. (El `.gitignore` definitivo se consolida en M01 con el installer — aquí basta el mínimo.)
- **Cómo verifico:** `git status` lista `.gitignore` como untracked.

**1.4 — Crea un archivo de prueba** (simula un test)
- **Qué hago:** `echo "test('login funciona', () => {});" > login.spec.ts`
- **Por qué:** necesitas contenido versionable para practicar el ciclo. En M01 este archivo será reemplazado por la estructura real del installer.
- **Cómo verifico:** `git status` ahora lista también `login.spec.ts` como untracked.

> 🪟 **PowerShell:** `echo` escribe en UTF-16; mejor crea los archivos desde VS Code o usa `Set-Content -Encoding utf8 login.spec.ts "test('login funciona', () => {});"`.

**1.5 — Crea un archivo que NO debe entrar al repo** (simula un secreto)
- **Qué hago:** `echo "API_TOKEN=supersecreto" > .env`
- **Por qué:** quieres comprobar que tu `.gitignore` realmente bloquea el `.env`. Este archivo simula credenciales reales que jamás deben subirse.
- **Cómo verifico:** ver paso 1.6.

**1.6 — Corre `git status` y verifica el filtro**
- **Qué hago:** `git status`
- **Por qué:** es la prueba de fuego del `.gitignore`. Lo bueno debe aparecer como untracked; lo prohibido debe ser invisible.
- **Cómo verifico:**
  - ✅ `.gitignore` y `login.spec.ts` aparecen como untracked.
  - ✅ **`.env` NO aparece** (porque `.gitignore` lo excluye).

**1.7 — Haz tu primer commit real**
- **Qué hago:**
  ```bash
  $ git add .gitignore login.spec.ts
  $ git commit -m "chore: bootstrap playwright_architecture with gitignore and first test"
  ```
- **Por qué:** fíjate que haces `add` por nombre (NO `git add .`) — así controlas que el `.env` no se cuele aunque el `.gitignore` fallara. Este es el commit raíz (`root-commit`) de tu proyecto.
- **Cómo verifico:**
  ```bash
  [main (root-commit) a1b2c3d] chore: bootstrap playwright_architecture ...
   2 files changed, 2 insertions(+)
  ```

**1.8 — Modifica el test**
- **Qué hago:** abre el archivo en VS Code con `code login.spec.ts` y añade esta línea al final:
  ```ts
  test('logout funciona', () => {});
  ```
- **Por qué:** generas un cambio sobre un archivo ya trackeado, para practicar el ciclo de actualización (no solo el de archivos nuevos).
- **Cómo verifico:** `git status` muestra `login.spec.ts` como `modified` (no como `new file`).

**1.9 — Mira el diff y haz un segundo commit**
- **Qué hago:**
  ```bash
  $ git diff
  $ git add login.spec.ts
  $ git commit -m "test: add logout case"
  ```
- **Por qué:** `git diff` (working ↔ staging) te deja **revisar** el cambio antes de hacerlo stage — el hábito que evita commitear basura. Verás una línea `+` con el nuevo `logout`.
- **Cómo verifico:** el `git diff` muestra `+test('logout funciona', () => {});`; tras commitear, `git status` dice `working tree clean`.

**1.10 — Revisa la historia**
- **Qué hago:** `git log --oneline`
- **Por qué:** confirmas que tus dos commits quedaron registrados con mensajes semánticos — la bitácora del proyecto empieza limpia.
- **Cómo verifico:** ver "Resultado esperado".

## Resultado esperado

Tu `git log --oneline` debe verse así:

```
b4d5e6f (HEAD -> main) test: add logout case
a1b2c3d chore: bootstrap playwright_architecture with gitignore and first test
```

Y `git status` debe decir:

```
On branch main
nothing to commit, working tree clean
```

> ✅ Conserva esta carpeta `playwright_architecture`. En **M01** entrarás a ella y correrás `pnpm create playwright` — el installer poblará el proyecto **encima de este historial**, sin perder estos dos commits.

## Bonus

- Con `git config --list --global` confirma que tu nombre y correo están bien.
- Modifica `login.spec.ts` y, antes de commitear, sácalo del staging con `git restore --staged login.spec.ts`. Vuelve a hacer `git status` para ver el cambio de estado (de *staged* a *modified*).
- Corre `git diff --staged` justo después de un `git add` y compáralo con `git diff` (debería salir vacío el primero o el segundo según el estado): así internalizas las variantes de la lección 2.5.

---

> 📚 **Si quieres más práctica con Git** (escenarios de equipo, conflictos, rebase): el reto del [módulo 2 del curso completo](../../git-github-course/modulo-02-git-basico/reto.md) tiene 12 pasos adicionales.
