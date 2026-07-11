# 3. `.gitignore` para Playwright

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

En un repo de Playwright **completo** (el que tendrás al final del curso), estos son todos los archivos y carpetas que **nunca** deben subirse. Es tu mapa de referencia — pero ojo: la mayoría aún **no existe** en tu carpeta. En M00 solo necesitas el subconjunto mínimo (`node_modules/`, `.env`); el resto se cubre en M01/M06 cuando esas carpetas nacen.

| No commitear | Por qué | Nace en |
|---|---|---|
| `node_modules/` | Pesa cientos de MB; se reinstala con `pnpm install` | M01 (`pnpm install`) |
| `.env` | Contiene secretos (credenciales, tokens) | M01 |
| `.auth/` | `storageState` con sesiones autenticadas | M06 (`auth.setup.ts`) |
| `playwright-report/` | HTML report que se regenera en cada corrida | M01 (1ª corrida) |
| `test-results/` | Screenshots, videos, traces de fallos | M01 (1er fallo) |
| `blob-report/`, `traces/` | Artefactos intermedios | M08 (CI) |
| `*.log`, `.DS_Store` | Ruido del sistema operativo y procesos | — |

## 3.1 Crear un `.gitignore` mínimo (el definitivo llega en M01)

> 🎯 **Secuencia importante:** en M00 creas un `.gitignore` **mínimo** — lo justo para que tu primer commit del proyecto no arrastre secretos ni dependencias. El `.gitignore` **definitivo y completo** se consolida en **M01**: cuando corras `pnpm create playwright`, el installer trae su propio `.gitignore` (con `/test-results/`, `/playwright-report/`, `/playwright/.auth/`, etc.) y en M01 solo le **añades** `.env` y `.auth/`. **No dupliques aquí la lista final** — la armas una vez, bien, en M01.

**3.1.1 — Crear el archivo en la raíz de `playwright-course`**
- **Qué hago:** en la raíz de tu repo, crea el archivo desde VS Code (el nombre es exactamente `.gitignore`, sin extensión):

```bash
$ code .gitignore
```

Pega este contenido mínimo y guarda:

```gitignore
# Dependencias (cientos de MB, se reinstalan con pnpm install)
node_modules/

# Variables de entorno y secretos (¡nunca al repo!)
.env
.env.local
```

- **Por qué:** estas dos líneas cubren los dos riesgos reales que ya tienes hoy: `node_modules/` (peso) y `.env` (secretos). Lo demás (`test-results/`, `playwright-report/`, `.auth/`) todavía **no existe** en tu carpeta — esas carpetas nacen en M01/M06, y allí el installer + tú las cubrirán.
- **Cómo verifico:** `git status` muestra `.gitignore` como *untracked* (sí queremos versionarlo). Si más adelante creas un `.env`, `git status` **NO** debe listarlo.

> 💡 Compromete `.gitignore` en tu **primer commit**, antes de `pnpm install`. Si ya instalaste y `node_modules/` quedó trackeado, sácalo del índice (sin borrarlo del disco) con: `git rm -r --cached node_modules/` y luego commitea.

## 3.2 Verificar que funciona

**3.2.1 — Comprobar que `.env` queda invisible para Git**
- **Qué hago:** crea un `.env` de prueba y corre `git status`.
- **Por qué:** la única forma de confiar en un `.gitignore` es probarlo: el archivo prohibido debe **desaparecer** de la lista de untracked.
- **Cómo verifico:**

```bash
$ echo "API_TOKEN=supersecreto" > .env
$ git status
On branch main

Untracked files:
        .gitignore        ← este SÍ lo versionamos

# .env NO aparece → .gitignore está funcionando
```

> 🪟 **PowerShell:** mismo caveat de codificación de la lección 2 (`>` puede generar UTF-16); para esta prueba con `git status` no importa.

Más adelante, cuando corras `pnpm install`, `node_modules/` tampoco aparecerá como untracked. Esa es la señal de que tu `.gitignore` está bien configurado.

## 3.3 Caso típico: te metiste el `.env` por error

Esto pasa cuando haces `git add .env` a mano (saltándote el `.gitignore`) o cuando el `.env` ya estaba trackeado antes de añadir la regla.

**3.3.1 — Detectar que el `.env` se coló al staging**
- **Qué hago:** `git status`
- **Por qué:** confirmas el daño antes de actuar. Si ves `.env` bajo *Changes to be committed*, está en staging pero **aún no** en el historial — todavía estás a tiempo.
- **Cómo verifico:**

```bash
$ git add .env   # 🤦
$ git status
Changes to be committed:
        new file:   .env
```

**3.3.2 — Sacarlo del staging SIN perder el archivo (si aún no commiteaste)**
- **Qué hago:** `git restore --staged .env`
- **Por qué:** lo regresa de **staging → working**. El archivo sigue en tu disco (lo necesitas para correr tests), pero ya no entrará al commit.
- **Cómo verifico:** `git status` deja de listarlo en *Changes to be committed*; si el `.gitignore` ya tiene la regla, desaparece por completo de untracked.

**3.3.3 — Si YA commiteaste (pero aún no pusheaste)**
- **Qué hago:** `git rm --cached .env` y luego `git commit -m "chore: untrack .env"`
- **Por qué:** `--cached` quita el archivo del **índice de Git** (deja de trackearlo) pero lo **deja en tu disco**. El nuevo commit registra "este archivo ya no se sigue".
- **Cómo verifico:** `git status` muestra el `.env` como untracked otra vez (y el `.gitignore` lo silencia). El archivo sigue existiendo: `ls .env` lo encuentra.

> ⚠️ **Si ya pusheaste un `.env` con secretos al remoto público, los secretos están comprometidos.** Rotar credenciales inmediatamente. Borrar el commit del historial NO es suficiente — un fork pudo haberlo descargado.

---

> 📚 **Profundización opcional:** [Casos avanzados de `.gitignore`](../../git-github-course/modulo-02-git-basico/02-registrar-cambios.md) · [Plantillas oficiales por lenguaje](https://github.com/github/gitignore)
