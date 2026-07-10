# 🚩 Reto — Módulo 0

## Objetivo

Hacer el **primer commit real del proyecto del curso**. Este reto **NO es un sandbox desechable**: aquí inicializas `playwright-course` — el MISMO repo que en M01 llenarás con `pnpm create playwright`. Al terminar, tu framework ya tendrá historial Git desde su línea cero.

> 🎯 Practicas el ciclo completo (`config → init → status → add → commit → diff → log`) sobre el proyecto real. El commit que hagas aquí seguirá vivo al final del curso.

## Setup

```bash
$ mkdir playwright-course && cd playwright-course
```

Este es el directorio raíz de tu framework para todo el curso. Si ya lo creaste en la sección 2, solo entra con `cd playwright-course`.

> 🪟 **PowerShell:** usa `;` en vez de `&&` → `mkdir playwright-course; cd playwright-course`.

## Pasos

1. **Configura tu identidad** (si aún no lo hiciste):
   ```bash
   $ git config --global user.name "Tu Nombre"
   $ git config --global user.email "tu@correo.com"
   ```

2. **Inicializa el repo:**
   ```bash
   $ git init
   Initialized empty Git repository in .../playwright-course/.git/
   ```

3. **Crea un `.gitignore` mínimo ANTES de cualquier otro archivo** (el de la sección **`.gitignore` para Playwright** → 3.1). Créalo desde VS Code:
   ```bash
   $ code .gitignore
   ```
   Pega este contenido y guarda:
   ```gitignore
   node_modules/
   .env
   .env.local
   ```
   El `.gitignore` debe existir **antes** de generar archivos prohibidos. Si commiteas un secreto primero y lo ignoras después, ya quedó en el historial. (El definitivo se consolida en M01 con el installer — aquí basta el mínimo.)

4. **Crea un archivo de prueba** (simula un test):
   ```bash
   $ echo "test('login funciona', () => {});" > login.spec.ts
   ```
   En M01 este archivo será reemplazado por la estructura real del installer.

   > 🪟 **PowerShell:** `echo` escribe en UTF-16; mejor crea los archivos desde VS Code o usa `Set-Content -Encoding utf8 login.spec.ts "test('login funciona', () => {});"`.

5. **Crea un archivo que NO debe entrar al repo** (simula un secreto):
   ```bash
   $ echo "API_TOKEN=supersecreto" > .env
   ```

6. **Corre `git status`.** Verifica que:
   - ✅ `.gitignore` y `login.spec.ts` aparecen como untracked.
   - ✅ **`.env` NO aparece** (porque `.gitignore` lo excluye).

7. **Haz tu primer commit real:**
   ```bash
   $ git add .gitignore login.spec.ts
   $ git commit -m "chore: bootstrap playwright-course with gitignore and first test"
   ```
   Fíjate que haces `add` por nombre (NO `git add .`) — así controlas que el `.env` no se cuele aunque el `.gitignore` fallara. Este es el commit raíz (`root-commit`) de tu proyecto.

8. **Modifica el test:** abre el archivo en VS Code con `code login.spec.ts` y añade esta línea al final:
   ```ts
   test('logout funciona', () => {});
   ```
   Generas un cambio sobre un archivo ya trackeado: `git status` lo muestra como `modified` (no como `new file`).

9. **Mira el diff** y haz un segundo commit:
   ```bash
   $ git diff
   $ git add login.spec.ts
   $ git commit -m "test: add logout case"
   ```
   `git diff` (working ↔ staging) te deja **revisar** el cambio antes de hacerlo stage — el hábito que evita commitear basura. Verás una línea `+` con el nuevo `logout`.

10. **Revisa la historia:**
    ```bash
    $ git log --oneline
    ```

## Resultado esperado

Tu `git log --oneline` debe verse así:

```
b4d5e6f (HEAD -> main) test: add logout case
a1b2c3d chore: bootstrap playwright-course with gitignore and first test
```

Y `git status` debe decir:

```
On branch main
nothing to commit, working tree clean
```

> ✅ Conserva esta carpeta `playwright-course`. En **M01** entrarás a ella y correrás `pnpm create playwright` — el installer poblará el proyecto **encima de este historial**, sin perder estos dos commits.

## Bonus

- Con `git config --list --global` confirma que tu nombre y correo están bien.
- Modifica `login.spec.ts` y, antes de commitear, sácalo del staging con `git restore --staged login.spec.ts`. Vuelve a hacer `git status` para ver el cambio de estado (de *staged* a *modified*).
- Corre `git diff --staged` justo después de un `git add` y compáralo con `git diff`: así internalizas las variantes de la sección 2.5.

---

> 📚 **Si quieres más práctica con Git** (escenarios de equipo, conflictos, rebase): el reto del **módulo 2 del curso completo** tiene 12 pasos adicionales.
