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

En un repo de Playwright **completo** (el que tendrás al final del curso), estos son todos los archivos y carpetas que **nunca** deben subirse. Es tu mapa de referencia — pero ojo: la mayoría aún **no existe** en tu carpeta. En M00 solo necesitas el subconjunto mínimo (`node_modules/`, `.env`); el resto se cubre en M01/M04 cuando esas carpetas nacen.

| No commitear | Por qué | Nace en |
|---|---|---|
| `node_modules/` | Pesa cientos de MB; se reinstala con `pnpm install` | M01 (`pnpm install`) |
| `.env` | Contiene secretos (credenciales, tokens) | M01 |
| `.auth/` | `storageState` con sesiones autenticadas | M04 (`auth.setup.ts`) |
| `playwright-report/` | HTML report que se regenera en cada corrida | M01 (1ª corrida) |
| `test-results/` | Screenshots, videos, traces de fallos | M01 (1er fallo) |
| `blob-report/`, `traces/` | Artefactos intermedios | M06 (CI) |
| `*.log`, `.DS_Store` | Ruido del sistema operativo y procesos | — |

## 3.1 Crear un `.gitignore` mínimo (el definitivo llega en M01)

> 🎯 **Secuencia importante:** en M00 creas un `.gitignore` **mínimo** — lo justo para que tu primer commit del proyecto no arrastre secretos ni dependencias. El `.gitignore` **definitivo y completo** se consolida en **M01**: cuando corras `pnpm create playwright`, el installer trae su propio `.gitignore` (con `/test-results/`, `/playwright-report/`, `/playwright/.auth/`, etc.) y en M01 solo le **añades** `.env` y `.auth/`. **No dupliques aquí la lista final** — la armas una vez, bien, en M01.

En la **raíz** de `playwright-course`, crea el archivo desde VS Code (el nombre es exactamente `.gitignore`, sin extensión):

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

Estas dos líneas cubren los dos riesgos reales que ya tienes hoy: `node_modules/` (peso) y `.env` (secretos). Lo demás (`test-results/`, `playwright-report/`, `.auth/`) todavía **no existe** en tu carpeta — esas carpetas nacen en M01/M04, y allí el installer + tú las cubrirán.

> 💡 Compromete `.gitignore` en tu **primer commit**, antes de `pnpm install`. Si ya instalaste y `node_modules/` quedó trackeado, sácalo con: `git rm -r --cached node_modules/` y luego commitea.

## 3.2 Verificar que funciona

La única forma de confiar en un `.gitignore` es probarlo: crea un `.env` de prueba y comprueba que **desaparece** de la lista de untracked.

```bash
$ echo "API_TOKEN=supersecreto" > .env
$ git status
On branch main

Untracked files:
        .gitignore        ← este SÍ lo versionamos

# .env NO aparece → .gitignore está funcionando
```

> 🪟 **PowerShell:** mismo caveat de codificación de la sección 2 (`>` puede generar UTF-16); para esta prueba con `git status` no importa.

Más adelante, cuando corras `pnpm install`, `node_modules/` tampoco aparecerá como untracked. Esa es la señal de que tu `.gitignore` está bien configurado.

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
