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

## 2.1 Inicializar un repo

Hay dos formas de empezar:

```bash
# A) Crear un repo nuevo desde cero
$ mkdir mi-suite-playwright && cd mi-suite-playwright
$ git init
Initialized empty Git repository in .../mi-suite-playwright/.git/

# B) Clonar un repo que ya existe en GitHub
$ git clone git@github.com:miempresa/qa-playwright.git
$ cd qa-playwright
```

`git init` crea la carpeta oculta `.git/` que contiene todo el historial. **No la borres.**

## 2.2 El ciclo `status → add → commit`

Crea tu primer archivo y míralo recorrer los 3 estados:

```bash
$ echo "test('smoke', () => {});" > tests/smoke.spec.ts
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        tests/

nothing added to commit but untracked files present
```

Git te dice: "veo `tests/` pero no la sigo. Si quieres que entre al repo, usa `git add`".

```bash
$ git add tests/smoke.spec.ts
$ git status
Changes to be committed:
        new file:   tests/smoke.spec.ts

$ git commit -m "test: add first smoke test"
[main (root-commit) a1b2c3d] test: add first smoke test
 1 file changed, 1 insertion(+)
```

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
chore: upgrade @playwright/test to 1.47.0
refactor: extract login steps into LoginPage POM
```

❌ Malos mensajes que verás mil veces en repos reales: `update`, `fix`, `asdf`, `WIP`, `cambios`.

## 2.5 `git diff` — ver qué cambió

```bash
$ git diff                  # working dir vs staging
$ git diff --staged         # staging vs último commit
$ git diff HEAD             # working dir + staging vs último commit
$ git diff --name-only      # sólo lista de archivos
```

Las líneas con `-` son borradas, las `+` son agregadas.

---

> 📚 **Profundización opcional:** **Variantes avanzadas de `add` (`-p`, `-i`)** · **Casos reales del día a día**
