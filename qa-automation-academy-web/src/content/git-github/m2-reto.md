# Reto - Módulo 2: Git Básico

Objetivo: crear desde cero un repo de automatización con estructura realista y documentar los primeros commits con buenos mensajes.

> 💡 Todos estos retos los harás en una carpeta sandbox nueva. No los hagas sobre un proyecto real.

---

## Reto 2.1 — Inicializar tu primer repo de automatización

1. Crea una carpeta sandbox y entra en ella:
   ```bash
   $ mkdir ~/sandbox/qa-playwright-demo
   $ cd ~/sandbox/qa-playwright-demo
   ```
2. Inicializa el repo:
   ```bash
   $ git init
   ```
3. Verifica que Git lo reconoce:
   ```bash
   $ git status
   ```

**✅ Resultado esperado:**
```
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

> ⚠️ Si ves `On branch master` en vez de `main`, vuelve al Reto 1.3 del Módulo 1 y configura `init.defaultBranch=main`.

---

## Reto 2.2 — Crear la estructura básica del framework

Crea los archivos que tendría cualquier repo real de Playwright:

```bash
$ mkdir tests pages
$ touch README.md package.json playwright.config.ts
$ touch pages/LoginPage.ts pages/HomePage.ts
$ touch tests/login.spec.ts tests/checkout.spec.ts
```

Luego ejecuta:

```bash
$ git status
```

**✅ Resultado esperado:** Git debe listar todos esos archivos bajo **Untracked files**.

---

## Reto 2.3 — Crear un `.gitignore` correcto

Antes de hacer tu primer commit, crea un `.gitignore` apropiado para un repo de Playwright. Debe incluir como mínimo:

- `node_modules/`
- `playwright-report/`
- `test-results/`
- `.env`
- `.DS_Store`

**Verificación:** crea un archivo `node_modules/fake.txt` (simulando que ya instalaste dependencias) y un archivo `.env` con un secreto falso:

```bash
$ mkdir node_modules
$ echo "fake" > node_modules/fake.txt
$ echo "API_KEY=super-secret" > .env
$ git status
```

**✅ Resultado esperado:** `node_modules/` y `.env` **NO** deben aparecer en la lista de untracked files. Si aparecen, tu `.gitignore` está mal: revísalo.

---

## Reto 2.4 — Tu primer commit

Haz tu primer commit con **todo el código del framework** (pero sin el `.gitignore` todavía — lo haremos en dos commits separados para practicar).

1. Agrega solo los archivos del framework (no el `.gitignore`):
   ```bash
   $ git add README.md package.json playwright.config.ts pages/ tests/
   $ git status
   ```
2. Verifica que bajo **Changes to be committed** aparezcan los 6 archivos y que `.gitignore` siga en **Untracked files**.
3. Haz el primer commit:
   ```bash
   $ git commit -m "chore: initial framework skeleton"
   ```

**✅ Resultado esperado:**
```
[main (root-commit) xxxxxxx] chore: initial framework skeleton
 6 files changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 README.md
 create mode 100644 package.json
 create mode 100644 pages/HomePage.ts
 create mode 100644 pages/LoginPage.ts
 create mode 100644 playwright.config.ts
 create mode 100644 tests/checkout.spec.ts
 create mode 100644 tests/login.spec.ts
```

---

## Reto 2.5 — Segundo commit: agregar el `.gitignore`

```bash
$ git add .gitignore
$ git commit -m "chore: add gitignore for playwright artifacts"
$ git log --oneline
```

**✅ Resultado esperado:** debes ver exactamente 2 commits, el más reciente arriba:
```
yyyyyyy chore: add gitignore for playwright artifacts
xxxxxxx chore: initial framework skeleton
```

---

## Reto 2.6 — Editar, diferenciar y commitear

Simula escribir un test real:

1. Abre `tests/login.spec.ts` en tu editor y pega este contenido:
   ```typescript
   import { test, expect } from '@playwright/test';

   test('user can log in with valid credentials', async ({ page }) => {
     await page.goto('https://qa.myapp.com/login');
     await page.fill('#username', 'admin');
     await page.fill('#password', 'Test1234!');
     await page.click('#login-btn');
     await expect(page).toHaveURL(/.*dashboard/);
   });
   ```
2. Ve el estado y el diff:
   ```bash
   $ git status
   $ git diff
   ```
3. Agrega y commitea con un buen mensaje:
   ```bash
   $ git add tests/login.spec.ts
   $ git commit -m "test: add login happy path"
   ```

**✅ Resultado esperado en `git diff`:** debes ver tus 8 líneas nuevas marcadas con `+` al inicio.

---

## Reto 2.7 — Practica `git commit -a`

1. Modifica `pages/LoginPage.ts` y pon cualquier contenido (por ejemplo, una clase vacía `export class LoginPage {}`).
2. Intenta committearlo SIN hacer `git add` primero, usando `-a`:
   ```bash
   $ git commit -a -m "refactor: scaffold LoginPage class"
   ```

**✅ Resultado esperado:** el commit se crea correctamente. `git log --oneline` ahora muestra 4 commits.

**Pregunta teórica:** si en este mismo momento crearas un archivo nuevo `pages/CheckoutPage.ts`, ¿`git commit -a` lo incluiría? **Respuesta:** no. `-a` solo incluye archivos **ya trackeados** que fueron modificados. Los archivos untracked nuevos siempre requieren un `git add` explícito.

---

## Reto 2.8 — Explorar el historial

Haz al menos 3 ejercicios con `git log` en tu repo sandbox:

1. Mostrar los últimos 5 commits en una línea cada uno.
2. Mostrar los commits cuyo autor seas tú mismo.
3. Mostrar el contenido exacto (`-p`) de los cambios al archivo `tests/login.spec.ts` a lo largo del tiempo.

**✅ Resultado esperado:**
```bash
# 1
$ git log --oneline -5

# 2
$ git log --author="Tu Nombre"

# 3
$ git log -p tests/login.spec.ts
```

---

## Reto 2.9 — Reto en equipo: el flujo de un día normal

Imagina que tu equipo de 3 automatizadores va a trabajar hoy en el repo que acabas de crear. Cada uno tiene una tarea:

- **Tú:** agregar el test de logout (`tests/logout.spec.ts`).
- **Compañera A:** agregar la página de checkout (`pages/CheckoutPage.ts`).
- **Compañero B:** actualizar el `README.md` con instrucciones de instalación.

Simula **solo tu parte** en tu sandbox:

1. Crea `tests/logout.spec.ts` con un test simple.
2. Agrégalo y committealo con un buen mensaje siguiendo las convenciones del módulo.
3. Revisa el log gráfico:
   ```bash
   $ git log --oneline --graph --all
   ```

**✅ Resultado esperado:** tu commit aparece al tope del historial. El resto del trabajo (A y B) lo harías en ramas separadas, que es exactamente lo que veremos en el **Módulo 4**.

---

## Reto 2.10 — Detectar mensajes de commit malos

Lee estos mensajes y marca cuáles son ❌ malos y por qué:

| # | Mensaje | ¿Es bueno? |
|---|---------|-----------|
| 1 | `fix` | ? |
| 2 | `test: add logout scenario on mobile viewport` | ? |
| 3 | `asdf` | ? |
| 4 | `refactor: extract login steps into LoginPage POM` | ? |
| 5 | `WIP` | ? |
| 6 | `cambios del viernes` | ? |
| 7 | `chore: upgrade playwright to 1.47.0` | ? |

**✅ Resultado esperado:**
- ✅ Buenos: 2, 4, 7 (tienen tipo, están en inglés, son descriptivos, en imperativo).
- ❌ Malos: 1 (sin contexto), 3 (incomprensible), 5 (WIP no debe llegar al historial), 6 (sin tipo, sin el qué, habla de "cuándo" en vez del "qué").

---

## ✅ Checklist de salida del Módulo 2

- [ ] Tengo un repo sandbox con al menos 5 commits.
- [ ] Mi `.gitignore` excluye correctamente `node_modules/`, `playwright-report/`, `.env`.
- [ ] Sé diferenciar **working directory**, **staging** y **repository**.
- [ ] Sé usar `git status`, `git diff`, `git add`, `git commit`.
- [ ] Entiendo la diferencia entre `git commit -m` y `git commit -a -m`.
- [ ] Sé al menos 3 formas distintas de usar `git log`.
- [ ] Mis mensajes de commit siguen el formato `<tipo>: <descripción en imperativo>`.

Si marcaste todo ✅, pasa al [Módulo 3: Deshacer, Remotos, Tags y Aliases](../modulo-03-undo-remotos-tags/).
