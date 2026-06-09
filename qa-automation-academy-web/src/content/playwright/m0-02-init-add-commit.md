# init, add y commit

## 2.0 ¿Qué es un commit, exactamente?

Un **commit** es una **fotografía completa** de tu proyecto en un momento dado, con tres datos pegados:

1. **Qué archivos había** (no un "diff" — Git guarda el snapshot completo).
2. **Quién la tomó** (autor + email — por eso configuras `user.name` y `user.email`).
3. **Por qué** (el mensaje que escribes con `-m "..."`).

> 💡 **Analogía QA:** un commit es como guardar el estado *"build #345 — green run"* en tu pipeline de CI. Si mañana alguien rompe algo, puedes regresar a la build verde exacta y comparar.

Cuando alguien te diga *"hazme un commit"*, lo que pide es: **toma una foto del estado actual del proyecto, fírmala con tu nombre y déjale un mensaje a tu yo-del-futuro (o a un compañero)**.

---

Estos son los 4 comandos que vas a usar **decenas de veces al día**:

| Comando | Qué hace |
|---|---|
| `git status` | Muestra qué cambió, qué está en staging, en qué rama estás. |
| `git add <archivo>` | Mueve un archivo de working dir a staging. |
| `git commit -m "mensaje"` | Graba todo lo del staging como un commit permanente. |
| `git diff` | Muestra las líneas exactas que cambiaron. |

## 2.1 Inicializar el proyecto real del curso

> 🎯 **Esto NO es un sandbox desechable.** Aquí creas `playwright_architecture`, **el mismo proyecto que llenarás en M01** con `pnpm create playwright`. Todo lo que practiques en M00 (status / add / commit / diff / log) queda en su historial real. Tu primer commit del curso nace aquí.

```bash
$ mkdir playwright_architecture && cd playwright_architecture
$ git init
Initialized empty Git repository in .../playwright_architecture/.git/

$ git status
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

`git init` crea la carpeta oculta `.git/` que contiene **todo el historial**. **No la borres jamás** — borrarla equivale a tirar la caja negra del avión. En M01 el installer de Playwright poblará esta misma carpeta con `tests/`, `playwright.config.ts`, etc., **encima de este historial**.

> 🪟 **PowerShell:** usa `;` en vez de `&&` → `mkdir playwright_architecture; cd playwright_architecture; git init`. La carpeta `.git/` está oculta — verla con `Get-ChildItem -Force` (alias `ls -Force`).

> 💡 **¿Y si el proyecto ya existe en GitHub?** En equipos reales muchas veces clonas en vez de iniciar de cero:
> ```bash
> $ git clone git@github.com:miempresa/qa-playwright.git && cd qa-playwright
> ```
> `git clone` hace `init` + descarga el historial completo + configura el remoto, todo de un golpe. Para este curso usamos `git init` porque el proyecto nace contigo.

## 2.2 El ciclo `status → add → commit`

Crea el primer archivo del proyecto y míralo recorrer los 3 estados. (En el **reto** harás esto "de verdad" con un `.gitignore` y un primer commit semántico; aquí lo paseamos para entender cada parada.)

```bash
$ echo "# playwright_architecture" > README.md
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md

nothing added to commit but untracked files present
```

Un archivo nuevo arranca como **untracked**: existe en tu working directory pero Git todavía no lo sigue. Git te dice: "veo `README.md` pero no lo sigo. Si quieres que entre al repo, usa `git add`".

```bash
$ git add README.md
$ git status
Changes to be committed:
        new file:   README.md

$ git commit -m "chore: bootstrap playwright_architecture project"
[main (root-commit) a1b2c3d] chore: bootstrap playwright_architecture project
 1 file changed, 1 insertion(+)

$ git status
On branch main
nothing to commit, working tree clean
```

`working tree clean` = no hay diferencias entre tu editor, el staging y el historial. El `(root-commit)` indica que es el **primer** commit del repo.

> 🪟 **PowerShell:** `echo "..." > archivo` funciona, pero genera el archivo en **UTF-16**. Para evitar sorpresas usa `Set-Content -Encoding utf8 README.md "# playwright_architecture"` o crea el archivo desde VS Code.

## 2.3 Variantes de `git add`

```bash
$ git add archivo1.ts archivo2.ts   # varios archivos
$ git add tests/                     # carpeta completa
$ git add .                          # TODO lo que cambió en cwd ⚠️
$ git add -u                         # sólo archivos ya trackeados
```

> ⚠️ `git add .` es cómodo pero peligroso: arrastra basura (`.env`, `playwright-report/`, screenshots). Por eso `.gitignore` existe (siguiente sección).

## 2.4 Buenos mensajes de commit

Un mensaje útil sigue la forma `<tipo>: <qué cambió>`. Tipos comunes en automatización:

| Prefijo | Cuándo |
|---|---|
| `test:` | Agrega o modifica casos de prueba |
| `fix:` | Corrige un test flaky o un bug del framework |
| `chore:` | Upgrade de dependencias, configuración |
| `docs:` | Sólo documentación |
| `refactor:` | Reestructura sin cambiar comportamiento |
| `ci:` | Cambios en pipelines |

Ejemplos reales:

```
test: add checkout happy path for mobile viewport
fix: stabilize login test — wait for network idle before clicking submit
chore: upgrade @playwright/test to latest
refactor: extract login steps into LoginPage POM
```

❌ Malos mensajes que verás mil veces en repos reales: `update`, `fix`, `asdf`, `WIP`, `cambios`.

## 2.5 `git diff` — leer exactamente qué cambió

`git diff` es la herramienta que responde la pregunta más frecuente de QA: **"¿quién cambió este selector y a qué?"**. Es la diferencia entre "el test de login se rompió" y "alguien cambió `username-desktop` por `username`".

### Un diff REAL: alguien cambió un selector

Supón que tu `tests/login.spec.ts` tenía esta línea (el selector real de OmniPizza):

```ts
await page.getByTestId("username-desktop").fill(USERNAME);
```

Un compañero la editó porque "el testid le pareció más limpio sin sufijo". Guardó en el editor pero aún no ha hecho `add`. Tú corres `git diff` y ves:

```diff
$ git diff tests/login.spec.ts
diff --git a/tests/login.spec.ts b/tests/login.spec.ts
index 8f3c1a2..b7e9d04 100644
--- a/tests/login.spec.ts
+++ b/tests/login.spec.ts
@@ -12,8 +12,8 @@ test("login exitoso", async ({ page }) => {
   await page.goto("/");
   await page.getByTestId("market-MX").click();

-  await page.getByTestId("username-desktop").fill(USERNAME);
-  await page.getByTestId("password-desktop").fill(PASSWORD);
+  await page.getByTestId("username").fill(USERNAME);
+  await page.getByTestId("password").fill(PASSWORD);
   await page.getByTestId("login-button-desktop").click();

   await expect(page).toHaveURL(/catalog/);
```

Ahí está la causa raíz: cambió `username-desktop` → `username` (y lo mismo para password). Como el testid real de OmniPizza es `username-desktop`, **ese cambio rompe el login**. `git diff` te lo muestra en segundos, con líneas `-` (lo que había) y `+` (lo nuevo).

### Cómo leer el encabezado del hunk `@@ -a,b +c,d @@`

La línea misteriosa `@@ -12,8 +12,8 @@` es el **encabezado de hunk** (un "hunk" es un bloque de líneas con cambios). Se lee así:

| Parte | Significa |
|---|---|
| `-12,8` | En el archivo **viejo** (`-`), el bloque empieza en la **línea 12** y abarca **8 líneas** (3 de contexto arriba + 2 que cambian + 3 de contexto abajo). |
| `+12,8` | En el archivo **nuevo** (`+`), empieza en la línea 12 y abarca 8 líneas. |
| `@@ … @@` | Delimitadores del hunk. Lo que sigue (`test("login exitoso"…`) es solo **contexto**: la función donde cae el cambio, para orientarte. |

Las líneas **sin** `-` ni `+` son contexto sin cambios (Git muestra 3 arriba y 3 abajo por defecto), para que veas el cambio *en su entorno* sin abrir el archivo.

### Las 4 variantes — y por qué importan

El error más común con `git diff` es correrlo y ver "nada" porque ya hiciste `add`. Cada variante compara **un par de estados distinto** de los 3 que viste en la sección 1:

```bash
$ git diff                  # A) working ↔ staging
$ git diff --staged         # B) staging ↔ HEAD (alias: --cached)
$ git diff HEAD             # C) working + staging ↔ HEAD
$ git diff --name-only      # D) sólo nombres de archivo
```

- **A — `git diff` (working ↔ staging):** muestra lo que cambiaste en el editor pero **aún NO agregaste** con `git add`. Es tu "última revisión antes de hacer stage". Si ya hiciste `git add archivo`, este comando NO lo muestra (ya salió de working) — por eso a veces "no muestra nada".
- **B — `git diff --staged` (staging ↔ HEAD):** muestra lo que está **en staging vs el último commit** — exactamente lo que entrará si haces `commit` ahora. Es tu "revisión final antes de commitear". Tras `git add login.spec.ts`, `git diff` sale vacío pero `git diff --staged` muestra el cambio del selector.
- **C — `git diff HEAD` (working + staging ↔ HEAD):** muestra **todo** lo que difiere del último commit, sin importar si está en staging o no. Es la suma de A + B — útil para una vista completa antes de decidir cómo agrupar tus commits.
- **D — `git diff --name-only` (solo nombres):** cuando tocaste 20 archivos no quieres leer 500 líneas de diff — solo **qué archivos** cambiaron. Imprime una ruta por línea, sin contenido:

```bash
$ git diff --name-only
tests/login.spec.ts
playwright.config.ts
```

> 💡 **Tip del automatizador:** para responder "¿quién y cuándo cambió este selector?" combinas dos herramientas: `git diff` te dice **qué** cambió ahora mismo, y `git log -p tests/login.spec.ts` (sección 4) te muestra el diff de **cada commit pasado** que tocó ese archivo — con autor y fecha. Juntas son tu detective de regresiones.

---

> 📚 **Profundización opcional:** **Variantes avanzadas de `add` (`-p`, `-i`)** · **Casos reales del día a día**
