# 2. Registrar cambios en el repositorio

Este es el **corazón** del flujo diario con Git. Hay 4 comandos que usarás 50 veces al día:

| Comando | ¿Qué hace? |
|---------|------------|
| `git status` | Muestra qué archivos cambiaron, cuáles están en staging, en qué rama estás. |
| `git diff` | Muestra las líneas exactas que cambiaron. |
| `git add <archivo>` | Mueve un archivo del working dir al staging area. |
| `git commit -m "mensaje"` | Graba todo lo del staging area como un commit permanente. |

## 2.1 El ciclo de vida de un archivo en Git

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

## 2.2 `git status` — tu comando más usado

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

## 2.3 `git add` — mover al staging

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

> ⚠️ **Cuidado con `git add .`:** es muy común que agregue basura (node_modules, reportes, .env con secretos). Por eso el `.gitignore` existe — lo vemos en la sección 2.7.

## 2.4 `git commit` — grabar en el historial

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

### Buenas prácticas de mensajes de commit

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

## 2.5 `git diff` — ver qué cambió exactamente

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

## 2.6 Saltarse el staging: `commit -a`

Si ya agregaste un archivo al repo una vez (ya es "tracked"), puedes saltar el `git add` con `-a`:

```bash
$ git commit -a -m "fix: stabilize login test"
```

`-a` agrega automáticamente al staging **todos los archivos ya trackeados que cambiaron**. No incluye archivos nuevos (untracked).

## 2.7 `.gitignore` — qué NO debe estar en el repo

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
