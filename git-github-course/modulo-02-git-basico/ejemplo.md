# Módulo 2: Git Básico — Tu primer repo de automatización

> **Escenario del instructor:** Eres la primera automatizadora en tu empresa. Te encargan crear el repo oficial de tests de Playwright. Nadie lo ha hecho antes. Desde cero hasta tu primer commit: aquí lo aprendes.

---

## 1. Obtener un repositorio Git

Hay **dos formas** de empezar a trabajar con un repo:

### Opción A: Inicializar un repo nuevo desde cero (`git init`)

Se usa cuando **tú** estás creando el proyecto desde cero. Este será el caso cuando inicies el framework de automatización de tu empresa.

```bash
$ mkdir qa-automation-framework
$ cd qa-automation-framework
$ git init
Initialized empty Git repository in /Users/tu/qa-automation-framework/.git/
```

Lo que acaba de pasar:
- Git creó una subcarpeta oculta `.git/` dentro de tu proyecto.
- Esa carpeta contiene **todo** el historial del repo (commits, ramas, config local).
- Mientras esa carpeta exista, tu proyecto es un repo Git.

> ⚠️ **Nunca borres `.git/` a mano.** Si lo haces, pierdes todo el historial. Para "des-inicializar" un repo simplemente borras esa carpeta (a veces sirve si rompiste algo muy feo en un sandbox).

### Opción B: Clonar un repo existente (`git clone`)

Se usa cuando ya existe un repo en un servidor (típicamente GitHub) y tú te unes al equipo. Este será el caso cuando entres a una empresa y quieras descargar el framework existente.

```bash
$ git clone https://github.com/miempresa/qa-automation-framework.git
Cloning into 'qa-automation-framework'...
remote: Enumerating objects: 1523, done.
remote: Counting objects: 100% (1523/1523), done.
remote: Compressing objects: 100% (842/842), done.
Receiving objects: 100% (1523/1523), 2.14 MiB | 5.32 MiB/s, done.
Resolving deltas: 100% (710/710), done.

$ cd qa-automation-framework
$ ls
package.json  playwright.config.ts  tests/  README.md
```

`git clone` hace 3 cosas a la vez:
1. Descarga el repo completo (incluyendo todo el historial).
2. Crea una carpeta local con el nombre del repo.
3. Configura automáticamente un "remoto" llamado `origin` que apunta a la URL original.

Puedes clonar con un nombre de carpeta distinto:
```bash
$ git clone https://github.com/miempresa/qa-automation-framework.git mis-tests
```

---

## 2. Registrar cambios en el repositorio

Este es el **corazón** del flujo diario con Git. Hay 4 comandos que usarás 50 veces al día:

| Comando | ¿Qué hace? |
|---------|------------|
| `git status` | Muestra qué archivos cambiaron, cuáles están en staging, en qué rama estás. |
| `git diff` | Muestra las líneas exactas que cambiaron. |
| `git add <archivo>` | Mueve un archivo del working dir al staging area. |
| `git commit -m "mensaje"` | Graba todo lo del staging area como un commit permanente. |

### 2.1 El ciclo de vida de un archivo en Git

```
  [untracked]  →  [unmodified]  →  [modified]  →  [staged]  →  [committed]
       ↑                                                            ↓
       └────────────── (editas, luego add, luego commit) ───────────┘
```

- **Untracked:** Git ve el archivo pero no lo está siguiendo. Nunca ha sido agregado.
- **Unmodified:** está siendo seguido, pero no ha cambiado desde el último commit.
- **Modified:** está siendo seguido y lo editaste, pero aún no está en staging.
- **Staged:** lo marcaste con `git add` para incluirlo en el próximo commit.
- **Committed:** ya está grabado en el historial.

### 2.2 `git status` — tu comando más usado

Crea un primer test y verifica el estado:

```bash
$ mkdir tests
$ echo "test('smoke', () => {});" > tests/smoke.spec.ts
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        tests/

nothing added to commit but untracked files present (use "git add" to track)
```

Git te dice: "hay una carpeta `tests/` que no estoy siguiendo. Si la quieres en el repo, usa `git add`".

### 2.3 `git add` — mover al staging

```bash
$ git add tests/smoke.spec.ts
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   tests/smoke.spec.ts
```

Variantes útiles:

```bash
$ git add archivo1.ts archivo2.ts   # varios archivos a la vez
$ git add tests/                     # toda una carpeta recursivamente
$ git add .                          # TODO lo que cambió en el directorio actual
$ git add -u                         # solo archivos ya trackeados (no agrega untracked nuevos)
$ git add -p                         # modo interactivo: elegir trozo por trozo qué agregar
```

> ⚠️ **Cuidado con `git add .`:** es muy común que agregue basura (node_modules, reportes, .env con secretos). Por eso el `.gitignore` existe — lo vemos en la sección 3.

### 2.4 `git commit` — grabar en el historial

```bash
$ git commit -m "add smoke test"
[main (root-commit) a1b2c3d] add smoke test
 1 file changed, 1 insertion(+)
 create mode 100644 tests/smoke.spec.ts
```

Lo que Git te está diciendo:
- `main (root-commit)`: primer commit de la rama `main`.
- `a1b2c3d`: los primeros 7 caracteres del **hash SHA-1** único de este commit.
- `1 file changed, 1 insertion(+)`: estadísticas del cambio.

#### Buenas prácticas de mensajes de commit

Un buen mensaje de commit para un equipo de automatización sigue esta forma:

```
<tipo>: <qué cambió, en imperativo y en inglés>

<opcional: por qué>
```

Tipos comunes en un repo de automatización:
- `test:` agrega o modifica casos de prueba.
- `fix:` corrige un bug del framework o de un test.
- `chore:` actualiza dependencias, configura linter, etc.
- `docs:` cambios solo en documentación.
- `refactor:` reestructura código sin cambiar su comportamiento.
- `ci:` cambios en pipelines de CI/CD.

Ejemplos reales:

```
test: add checkout happy path for mobile viewport
fix: stabilize login test — wait for network idle before clicking submit
chore: upgrade @playwright/test to 1.47.0
refactor: extract login steps into LoginPage POM
ci: run tests on pull requests against main
```

❌ Malos mensajes (que verás mil veces en repos reales):
```
update
fix
asdf
cambios
WIP
```

### 2.5 `git diff` — ver qué cambió exactamente

```bash
$ git diff
diff --git a/tests/smoke.spec.ts b/tests/smoke.spec.ts
index a1b2c3d..e4f5g6h 100644
--- a/tests/smoke.spec.ts
+++ b/tests/smoke.spec.ts
@@ -1 +1,2 @@
 test('smoke', () => {});
+test('login', () => {});
```

- `-` = líneas removidas.
- `+` = líneas agregadas.

Variantes:

```bash
$ git diff                    # working dir vs staging
$ git diff --staged           # staging vs último commit
$ git diff HEAD               # working dir vs último commit (ambos combinados)
$ git diff HEAD~3 HEAD        # hace 3 commits vs ahora
$ git diff main feature-xyz   # comparar dos ramas completas
$ git diff --name-only        # solo listar archivos que cambiaron
```

### 2.6 Saltarse el staging: `commit -a`

Si ya agregaste un archivo al repo una vez (ya es "tracked"), puedes saltar el `git add` con `-a`:

```bash
$ git commit -a -m "fix: stabilize login test"
```

`-a` agrega automáticamente al staging **todos los archivos ya trackeados que cambiaron**. No incluye archivos nuevos (untracked).

### 2.7 `.gitignore` — qué NO debe estar en el repo

Crea un archivo llamado `.gitignore` en la raíz de tu repo con la lista de patrones a ignorar. Este es un `.gitignore` típico para un repo de automatización:

```gitignore
# Dependencias
node_modules/

# Reportes generados por Playwright
playwright-report/
test-results/
blob-report/
traces/

# Screenshots y videos de tests fallidos
screenshots/
videos/

# Variables de entorno con secretos
.env
.env.local
.env.*.local

# Archivos del sistema operativo
.DS_Store
Thumbs.db

# Editores
.vscode/
.idea/
*.swp

# Logs
*.log
npm-debug.log*
```

> 💡 **Tip:** Compromete el `.gitignore` en tu primer commit, ANTES de hacer `npm install`. Si ya instalaste `node_modules/` antes, tendrás que removerlo del staging con `git rm -r --cached node_modules/`.

---

## 3. Ver el historial de commits (`git log`)

Una vez que tienes varios commits, `git log` te muestra la historia completa.

### Versión completa (default)

```bash
$ git log
commit 7f3a1e8c9b (HEAD -> main)
Author: Gilberto Sánchez <gil@empresa.com>
Date:   Mon Apr 07 10:32:15 2025 -0600

    test: add checkout happy path

commit 2b8c4d6e
Author: María Pérez <maria@empresa.com>
Date:   Fri Apr 04 16:12:08 2025 -0600

    fix: stabilize login test

commit a1b2c3d
Author: Gilberto Sánchez <gil@empresa.com>
Date:   Fri Apr 04 09:00:00 2025 -0600

    test: add smoke test
```

### Las 5 variantes de `git log` que más usarás

**1. Una línea por commit (el favorito del día a día):**
```bash
$ git log --oneline
7f3a1e8 test: add checkout happy path
2b8c4d6 fix: stabilize login test
a1b2c3d test: add smoke test
```

**2. Árbol gráfico con ramas:**
```bash
$ git log --oneline --graph --all --decorate
* 7f3a1e8 (HEAD -> main) test: add checkout happy path
* 2b8c4d6 fix: stabilize login test
* a1b2c3d test: add smoke test
```

**3. Estadísticas de cambios:**
```bash
$ git log --stat
commit 7f3a1e8c9b
    test: add checkout happy path

 tests/checkout.spec.ts | 45 +++++++++++++++++++++++++++++++++++++++
 1 file changed, 45 insertions(+)
```

**4. Filtrar por autor:**
```bash
$ git log --author="María"
```

**5. Ver el contenido completo de cada cambio (`-p`):**
```bash
$ git log -p tests/login.spec.ts
```

**Combinando:**
```bash
$ git log --oneline --since="1 week ago" --author="Gilberto"
```

---

## 4. Casos de uso reales del día a día

### Caso 1: Empezar el día de trabajo

```bash
$ cd qa-automation-framework
$ git status                      # ¿en qué estado dejé las cosas ayer?
$ git log --oneline -5            # ¿cuáles fueron los últimos 5 commits?
```

### Caso 2: Antes de irte a comer

```bash
$ git status                      # ¿qué tengo modificado?
$ git diff                        # ¿qué cambié exactamente?
$ git add tests/checkout.spec.ts
$ git commit -m "test: add checkout happy path"
```

### Caso 3: Revisar qué hizo tu compañera esta semana

```bash
$ git log --oneline --author="María" --since="1 week ago"
$ git log -p tests/login.spec.ts  # ver el contenido de sus cambios a un archivo
```

### Caso 4: Agregar un archivo y al mismo tiempo excluir otro

```bash
$ git status
modified: tests/login.spec.ts
modified: .env               # ❌ no quiero subir esto

$ echo ".env" >> .gitignore  # agregarlo al .gitignore para el futuro
$ git add tests/login.spec.ts
$ git add .gitignore
$ git commit -m "test: stabilize login; ignore .env"
```

---

## 5. Resumen del módulo

- `git init` crea un repo nuevo; `git clone` descarga uno existente.
- El flujo diario es: **editar → `git add` → `git commit`**.
- `git status` te dice en qué estado está todo. Úsalo **constantemente**.
- `git diff` te muestra las líneas exactas que cambiaron.
- Un `.gitignore` bien hecho evita 99% de los problemas de un repo de automatización (reportes, node_modules, .env).
- `git log --oneline --graph --all` es la vista más útil del historial.
- Escribe mensajes de commit descriptivos en imperativo (`add`, `fix`, `refactor`).

➡️ Ahora haz los ejercicios en [reto.md](./reto.md).
