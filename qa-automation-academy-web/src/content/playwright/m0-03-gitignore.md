# .gitignore para Playwright

## ¿Qué es `.gitignore`?

`.gitignore` es un archivo de texto plano (sin extensión) que vive en la raíz de tu repo y le dice a Git **qué archivos jamás debe trackear** — ni mostrarlos como "untracked", ni dejarlos entrar a un commit aunque hagas `git add .`.

> 💡 **Analogía QA:** es la **lista negra** que mantiene tu equipo de testing — "estos endpoints jamás se prueban en producción", "estas credenciales jamás se loguean en consola". `.gitignore` es la lista negra del repo: tú decides qué nunca debe salir publicado.

### Cómo se ve un repo *sin* `.gitignore` (anti-ejemplo real)

```bash
$ git status
Untracked files:
  node_modules/           ← 200 MB de dependencias, regenerables
  .env                    ← 🔥 contiene API_TOKEN=sk-live-...
  playwright-report/      ← 50 MB de HTML que cambia cada corrida
  test-results/           ← screenshots, videos, traces
  .auth/user.json         ← 🔥 sesión activa, equivale a estar logueado
  .DS_Store               ← basura de macOS
```

Si haces `git add .` aquí, **commiteas todo eso al historial** — incluyendo secretos. Y aunque después los borres, **quedan en el historial para siempre** (Git no olvida fácil). Por eso `.gitignore` se crea **antes del primer commit**.

---

En un repo de Playwright, hay carpetas y archivos que **nunca** deben subirse:

| No commitear | Por qué |
|---|---|
| `node_modules/` | Pesa cientos de MB; se reinstala con `pnpm install` |
| `.env` | Contiene secretos (credenciales, tokens) |
| `.auth/` | `storageState` con sesiones autenticadas |
| `playwright-report/` | HTML report que se regenera en cada corrida |
| `test-results/` | Screenshots, videos, traces de fallos |
| `blob-report/`, `traces/` | Artefactos intermedios |
| `*.log`, `.DS_Store` | Ruido del sistema operativo y procesos |

## 3.1 Crear el `.gitignore`

En la **raíz** de tu repo, crea un archivo llamado `.gitignore` con este contenido (es el mismo que usa este curso):

```gitignore
# Dependencias
node_modules/

# Reportes y artefactos generados por Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
traces/

# Variables de entorno y secretos
.env
.env.local
.env.*.local

# Sesiones autenticadas (storageState)
.auth/

# Sistema operativo y editores
.DS_Store
Thumbs.db
.vscode/
.idea/

# Logs
*.log
```

> 💡 Compromete `.gitignore` en tu **primer commit**, antes de `pnpm install`. Si ya instalaste y `node_modules/` quedó trackeado, sácalo con: `git rm -r --cached node_modules/` y luego commitea.

## 3.2 Verificar que funciona

```bash
$ git status
On branch main
nothing to commit, working tree clean
```

Si después de `pnpm install` ves esto (en lugar de `node_modules/` como untracked), tu `.gitignore` está bien configurado.

## 3.3 Caso típico: te metiste el `.env` por error

```bash
$ git add .env   # 🤦
$ git status
Changes to be committed:
        new file:   .env
```

Sácalo del staging **antes** de commitear, sin perder el archivo:

```bash
$ git restore --staged .env
```

Si ya commiteaste y aún no pusheaste:

```bash
$ git rm --cached .env       # quita del repo, deja en disco
$ git commit -m "chore: untrack .env"
```

> ⚠️ **Si ya pusheaste un `.env` con secretos al remoto público, los secretos están comprometidos.** Rotar credenciales inmediatamente. Borrar el commit del historial NO es suficiente — un fork pudo haberlo descargado.

---

> 📚 **Profundización opcional:** **Casos avanzados de `.gitignore`** · [Plantillas oficiales por lenguaje](https://github.com/github/gitignore)
