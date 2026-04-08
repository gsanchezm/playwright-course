# Reto - Módulo 4: Ramas y Merge

Objetivo: trabajar con ramas como si estuvieras en un equipo real de automatización, practicar merges, y resolver conflictos.

> 💡 Continúa en el mismo repo sandbox. Si lo tienes muy desordenado, puedes borrarlo y empezar de cero con los pasos del Módulo 2.

---

## Reto 4.1 — Crear tu primera feature branch

1. Verifica en qué rama estás:
   ```bash
   $ git branch
   ```
2. Crea y cambia a una nueva rama siguiendo las convenciones:
   ```bash
   $ git switch -c feature/add-logout-test
   ```
3. Verifica que estás en la nueva rama:
   ```bash
   $ git branch
   ```

**✅ Resultado esperado:** el asterisco `*` está sobre `feature/add-logout-test`.

---

## Reto 4.2 — Hacer commits en la feature branch

1. Crea el test:
   ```bash
   $ cat > tests/logout.spec.ts << 'EOF'
   import { test, expect } from '@playwright/test';

   test('user can log out', async ({ page }) => {
     await page.goto('https://qa.myapp.com/dashboard');
     await page.click('#logout-btn');
     await expect(page).toHaveURL(/.*login/);
   });
   EOF
   ```
2. Commitealo:
   ```bash
   $ git add tests/logout.spec.ts
   $ git commit -m "test: add logout scenario"
   ```
3. Verifica con `git log --oneline --graph --all` que la rama `feature/add-logout-test` está **1 commit adelante** de `main`.

**✅ Resultado esperado:**
```
* a1b2c3d (HEAD -> feature/add-logout-test) test: add logout scenario
* 7f8e9d0 (main) ... (último commit de main)
```

---

## Reto 4.3 — Fast-forward merge

1. Cambia a `main`:
   ```bash
   $ git switch main
   ```
2. Mergea la feature:
   ```bash
   $ git merge feature/add-logout-test
   ```
3. Observa el mensaje. Debe decir `Fast-forward`.
4. Verifica con `git log --oneline --graph`:
   ```bash
   $ git log --oneline --graph -5
   ```
5. Borra la rama ya mergeada:
   ```bash
   $ git branch -d feature/add-logout-test
   ```

**✅ Resultado esperado:** `main` ahora contiene el commit del logout test. La rama `feature/add-logout-test` ya no existe (`git branch` no la lista).

---

## Reto 4.4 — Forzar un merge commit con `--no-ff`

1. Crea otra feature branch:
   ```bash
   $ git switch -c feature/add-profile-test
   ```
2. Agrega un test y commitealo:
   ```bash
   $ echo "test('profile', () => {});" > tests/profile.spec.ts
   $ git add tests/profile.spec.ts
   $ git commit -m "test: add profile scenario"
   ```
3. Cambia a `main` y mergea con `--no-ff`:
   ```bash
   $ git switch main
   $ git merge --no-ff feature/add-profile-test
   ```
   Git abrirá un editor con el mensaje del merge commit — guarda y cierra.
4. Mira el gráfico:
   ```bash
   $ git log --oneline --graph -5
   ```

**✅ Resultado esperado:** debes ver una "bifurcación" en el gráfico. El merge commit tiene 2 padres (uno de `main` y otro de la feature branch), y se nota visualmente que el trabajo venía de una rama separada:
```
*   b1c2d3e (HEAD -> main) Merge branch 'feature/add-profile-test'
|\
| * a1b2c3d test: add profile scenario
|/
* 7f8e9d0 ...
```

Compáralo con el fast-forward del reto 4.3 — en aquel caso el historial era una línea recta.

---

## Reto 4.5 — Simular a dos automatizadores tocando el mismo archivo

> **Escenario:** tú y tu compañera Ana van a modificar `pages/LoginPage.ts` en ramas separadas. Vamos a provocar un conflicto a propósito.

### Setup

1. Asegúrate de estar en `main` con el archivo base:
   ```bash
   $ git switch main
   $ cat > pages/LoginPage.ts << 'EOF'
   export class LoginPage {
     usernameInput = '#username';
     passwordInput = '#password';
     submitButton = '#login-btn';
   }
   EOF
   $ git add pages/LoginPage.ts
   $ git commit -m "refactor: scaffold LoginPage POM"
   ```

### Parte A: el cambio de Ana (simulado)

2. Crea la rama de Ana y modifica el archivo:
   ```bash
   $ git switch -c feature/ana-remember-me
   $ cat > pages/LoginPage.ts << 'EOF'
   export class LoginPage {
     usernameInput = '#username';
     passwordInput = '#password';
     submitButton = '#login-btn';
     rememberMeCheckbox = '#remember-me';
   }
   EOF
   $ git add pages/LoginPage.ts
   $ git commit -m "test: add rememberMe locator to LoginPage"
   ```
3. Mergea la rama de Ana a main:
   ```bash
   $ git switch main
   $ git merge feature/ana-remember-me
   $ git branch -d feature/ana-remember-me
   ```

### Parte B: tu cambio en paralelo (simulado)

4. Vamos a **simular** que tu rama fue creada ANTES del cambio de Ana. Para eso, vuelve al commit anterior (donde Ana aún no había mergeado):
   ```bash
   $ git log --oneline
   # copia el hash del commit "refactor: scaffold LoginPage POM" (ANTES del merge de Ana)
   $ git switch -c feature/tu-selectors-rename <hash-del-commit-anterior>
   ```
5. Modifica el mismo archivo pero cambiando el selector:
   ```bash
   $ cat > pages/LoginPage.ts << 'EOF'
   export class LoginPage {
     usernameInput = '#email';
     passwordInput = '#password';
     submitButton = '#login-btn';
   }
   EOF
   $ git add pages/LoginPage.ts
   $ git commit -m "refactor: rename usernameInput to email selector"
   ```

### Parte C: el conflicto

6. Ve a main e intenta mergear tu rama:
   ```bash
   $ git switch main
   $ git merge feature/tu-selectors-rename
   ```

**✅ Resultado esperado:**
```
Auto-merging pages/LoginPage.ts
CONFLICT (content): Merge conflict in pages/LoginPage.ts
Automatic merge failed; fix conflicts and then commit the result.
```

---

## Reto 4.6 — Resolver el conflicto del reto anterior

1. Ve el estado:
   ```bash
   $ git status
   ```
   Debe listar `pages/LoginPage.ts` como `both modified`.
2. Abre el archivo. Verás marcadores `<<<<<<<`, `=======`, `>>>>>>>`.
3. Resuélvelo manualmente dejando **ambos cambios** (el rename de `#username` a `#email` Y la nueva línea de `rememberMeCheckbox`):
   ```typescript
   export class LoginPage {
     usernameInput = '#email';
     passwordInput = '#password';
     submitButton = '#login-btn';
     rememberMeCheckbox = '#remember-me';
   }
   ```
4. Marca el conflicto como resuelto:
   ```bash
   $ git add pages/LoginPage.ts
   $ git status
   ```
5. Finaliza el merge:
   ```bash
   $ git commit    # abre el editor, guarda y cierra
   ```
6. Verifica:
   ```bash
   $ git log --oneline --graph -5
   $ cat pages/LoginPage.ts
   ```

**✅ Resultado esperado:** el archivo final contiene los 4 selectores y el historial muestra un merge commit con 2 padres.

---

## Reto 4.7 — Abortar un merge

1. Crea una rama con un cambio que provoque conflicto:
   ```bash
   $ git switch -c experiment/bad-change
   $ echo "VERSION PROBLEMATICA" > pages/LoginPage.ts
   $ git add pages/LoginPage.ts
   $ git commit -m "experiment: wipe LoginPage"
   ```
2. Vuelve a main y mergea:
   ```bash
   $ git switch main
   $ git merge experiment/bad-change
   ```
3. Debería haber conflicto. Antes de resolverlo, **abórtalo**:
   ```bash
   $ git merge --abort
   ```
4. Verifica:
   ```bash
   $ cat pages/LoginPage.ts
   $ git status
   ```

**✅ Resultado esperado:** `pages/LoginPage.ts` vuelve a su contenido original (el que tenía antes de intentar el merge). `git status` dice `nothing to commit, working tree clean`.

5. Opcional: borra la rama experimento:
   ```bash
   $ git branch -D experiment/bad-change
   ```

---

## Reto 4.8 — Gestionar ramas del equipo

Simula ramas de varios compañeros:

```bash
$ git switch -c feature/ana-api-helper
$ echo "export class ApiHelper {}" > pages/ApiHelper.ts
$ git add pages/ApiHelper.ts
$ git commit -m "test: add api helper"

$ git switch main
$ git merge feature/ana-api-helper

$ git switch -c feature/luis-fixtures
$ echo "export const testUsers = [];" > fixtures.ts
$ git add fixtures.ts
$ git commit -m "test: add fixtures file"
# Luis NO mergea todavía
```

Ahora responde usando comandos:

1. Lista todas las ramas locales.
2. Lista solo las ramas **ya mergeadas** a la actual.
3. Lista solo las ramas **NO mergeadas**.
4. Borra de forma segura todas las ramas mergeadas (excepto `main`).

**✅ Resultado esperado:**

```bash
$ git branch
# feature/ana-api-helper  (mergeada)
# feature/luis-fixtures   (NO mergeada)
# * main

$ git switch main
$ git branch --merged
#   feature/ana-api-helper
# * main

$ git branch --no-merged
#   feature/luis-fixtures

$ git branch -d feature/ana-api-helper
# Deleted branch feature/ana-api-helper.

$ git branch -d feature/luis-fixtures
# error: The branch 'feature/luis-fixtures' is not fully merged.
# (esto es correcto: Git te protege de perder trabajo)
```

---

## Reto 4.9 — Reto en equipo: workflow paralelo

> **Escenario:** hoy tú, Ana y Luis van a trabajar cada uno en una feature. Simula los 3 flujos en tu mismo repo sandbox.

- **Tú:** `feature/tu-mobile-nav-test` — agrega `tests/mobile-nav.spec.ts`.
- **Ana:** `feature/ana-cart-page` — agrega `pages/CartPage.ts`.
- **Luis:** `feature/luis-config-ci` — agrega `ci.yml`.

Para cada rama:
1. Crea la rama desde `main` actualizado.
2. Crea el archivo.
3. Haz el commit con un mensaje siguiendo las convenciones.
4. Vuelve a `main`.
5. Mergea con `--no-ff`.
6. Borra la rama.

Al final revisa:
```bash
$ git log --oneline --graph -10
```

**✅ Resultado esperado:** debes ver 3 "bifurcaciones" en el gráfico, una por cada feature. Esto es exactamente lo que verás en el historial de un repo de automatización con equipos reales.

---

## Reto 4.10 — Preguntas teóricas

Responde (sin ejecutar comandos):

1. ¿Cuál es la diferencia entre `git branch -d` y `git branch -D`?
2. ¿Qué pasa si intentas borrar la rama en la que estás actualmente?
3. ¿Cuándo NO se puede hacer un fast-forward merge?
4. Si haces un merge con conflicto y ya empezaste a resolverlo pero te das cuenta que quieres cancelar, ¿qué comando usas?
5. ¿Por qué muchos equipos usan `--no-ff` incluso cuando sería posible un fast-forward?

**✅ Resultado esperado:**

1. `-d` solo borra si la rama está mergeada (seguro). `-D` borra siempre, incluso si pierdes commits (peligroso).
2. Git lo impide con error. Tienes que cambiarte a otra rama primero.
3. Cuando la rama destino tiene commits nuevos desde que se bifurcó la feature. Entonces se crea un merge commit.
4. `git merge --abort`.
5. Porque preserva en el historial que los commits venían de una feature branch, lo que hace más fácil revertir toda la feature si hace falta (`git revert -m 1 <merge-commit>`) y hace el log más legible.

---

## ✅ Checklist de salida del Módulo 4

- [ ] Sé crear y cambiar de rama con `switch -c`.
- [ ] Entiendo la diferencia entre fast-forward y 3-way merge.
- [ ] He provocado y resuelto al menos un conflicto real.
- [ ] Sé abortar un merge con `merge --abort`.
- [ ] Sé listar ramas mergeadas / no-mergeadas para saber cuáles puedo borrar.
- [ ] Sé nombrar ramas siguiendo el patrón `<tipo>/<descripción>`.
- [ ] Entiendo por qué `--no-ff` es común en equipos de automatización.

Si marcaste todo ✅, pasa al [Módulo 5: Workflows y Rebase](../modulo-05-workflows-rebase/).
