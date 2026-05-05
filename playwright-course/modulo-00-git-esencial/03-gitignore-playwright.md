# 3. `.gitignore` para Playwright

`.gitignore` es un archivo que le dice a Git **qué archivos jamás debe trackear**. En un repo de Playwright, hay carpetas y archivos que **nunca** deben subirse:

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

> 📚 **Profundización opcional:** [Casos avanzados de `.gitignore`](../../git-github-course/modulo-02-git-basico/02-registrar-cambios.md) · [Plantillas oficiales por lenguaje](https://github.com/github/gitignore)
