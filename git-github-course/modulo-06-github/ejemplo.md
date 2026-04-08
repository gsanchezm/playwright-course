# Módulo 6: GitHub — Cuenta, contribuir y mantener un proyecto

> **Escenario del instructor:** Tu framework local ya está listo y profesional. Ahora toca publicarlo en GitHub, invitar al equipo, configurar la cuenta con seguridad, abrir tu primer Pull Request y — cuando crezcas — aprender a **mantener** el repo como lead de automatización.

---

## 1. Configuración de la cuenta

### 1.1 Crear la cuenta

Entra a [github.com](https://github.com) y regístrate con:
- El **mismo correo** que configuraste en `git config user.email`.
- Un nombre de usuario profesional (este será tu identidad pública: `github.com/tu-usuario`).

> 💡 **Consejo:** usa tu nombre real o una variante profesional. Tu cuenta de GitHub es parte de tu CV como automatizador.

### 1.2 Activar autenticación de dos factores (2FA)

**Obligatorio** desde 2023 para poder hacer push a la mayoría de repos: **Settings → Password and authentication → Two-factor authentication**.

Opciones recomendadas:
- **App autenticadora** (Google Authenticator, Authy, 1Password) — la mejor opción.
- **Security key** (YubiKey) — aún mejor si tienes una.

### 1.3 Configurar tu perfil

**Settings → Profile:**
- Nombre completo.
- Foto (ayuda a que te identifiquen en los PRs).
- Bio: ej. "QA Automation Engineer | Playwright | TypeScript".
- URL de tu LinkedIn o portafolio.

### 1.4 Autenticarse desde la terminal: SSH vs HTTPS

Para subir código a GitHub necesitas autenticarte. Hay 2 métodos:

#### Opción A: HTTPS con token personal (PAT)

1. GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic)** → **Generate new token**.
2. Marca los permisos mínimos: `repo` (todas las operaciones de repos).
3. Copia el token **una sola vez** (GitHub no lo muestra de nuevo).
4. La primera vez que hagas `git push`, Git te pedirá usuario y contraseña — pon el token como contraseña.
5. Para no tener que pegarlo cada vez:
   ```bash
   # macOS
   $ git config --global credential.helper osxkeychain
   # Windows
   $ git config --global credential.helper manager
   # Linux
   $ git config --global credential.helper cache
   ```

**Ventaja:** fácil de empezar.
**Desventaja:** los tokens expiran y hay que regenerarlos.

#### Opción B: SSH (recomendada para uso diario)

1. Genera un par de llaves SSH:
   ```bash
   $ ssh-keygen -t ed25519 -C "tu-correo@ejemplo.com"
   ```
   Acepta las opciones por defecto (presiona Enter). Si quieres, agrega una passphrase.
2. Muestra la llave pública y cópiala:
   ```bash
   $ cat ~/.ssh/id_ed25519.pub
   ssh-ed25519 AAAAC3Nza...XYZ tu-correo@ejemplo.com
   ```
3. Pégala en **GitHub → Settings → SSH and GPG keys → New SSH key**.
4. Prueba la conexión:
   ```bash
   $ ssh -T git@github.com
   Hi tu-usuario! You've successfully authenticated, but GitHub does not provide shell access.
   ```
5. **Usa URLs SSH al clonar:**
   ```bash
   $ git clone git@github.com:tu-usuario/qa-playwright.git    # SSH
   # en vez de:
   $ git clone https://github.com/tu-usuario/qa-playwright.git # HTTPS
   ```

**Ventaja:** configuras una vez, funciona para siempre.
**Desventaja:** requiere entender llaves SSH.

---

## 2. Crear y subir tu primer repo a GitHub

### 2.1 Crear el repo desde la web

1. GitHub → botón **New repository** (arriba derecha).
2. Llena:
   - **Repository name:** `qa-playwright-demo` (el mismo nombre de tu carpeta local).
   - **Description:** "Playwright test framework — curso QA Automation".
   - **Visibility:** público (para aprender) o privado (si es de la empresa).
   - **NO marques** "Initialize with a README / .gitignore / license" — tu repo local ya los tiene. Si GitHub crea archivos iniciales, tendrás un conflicto al hacer el primer push.
3. Click **Create repository**.

### 2.2 Conectar tu repo local

GitHub te muestra las instrucciones. Para un repo que ya existe localmente:

```bash
$ cd ~/sandbox/qa-playwright-demo
$ git remote add origin git@github.com:tu-usuario/qa-playwright-demo.git
$ git branch -M main      # asegúrate que tu rama se llama main (no master)
$ git push -u origin main
```

Resultado esperado:
```
Enumerating objects: 25, done.
Counting objects: 100% (25/25), done.
Writing objects: 100% (25/25), 4.23 KiB | 4.23 MiB/s, done.
Total 25 (delta 0), reused 0 (delta 0)
To github.com:tu-usuario/qa-playwright-demo.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main' from 'origin'.
```

Recarga la página de GitHub y verás todo tu código.

### 2.3 Subir los tags también

```bash
$ git push origin --tags
```

GitHub ahora tiene tus tags `v0.1.0`, `v1.0.0`, etc. bajo la pestaña **Releases / Tags**.

---

## 3. Contribuir a un proyecto (el flujo del Pull Request)

Este es **el flujo más importante** del módulo. Así es como contribuyes a cualquier repo de tu equipo (o a un proyecto open source).

### 3.1 Fork vs Colaborador directo

- **Si eres miembro del equipo** con permisos de push → clonas el repo y trabajas en ramas directas. Abres PRs desde `feature/*` a `main`.
- **Si NO eres miembro** (contribuidor externo, open source) → haces **fork** (copia tuya del repo), trabajas ahí, y abres un PR desde tu fork al repo original.

### 3.2 Flujo completo con fork (ejemplo open source)

```bash
# 1. En GitHub, click "Fork" en el repo original.
#    Esto crea github.com/tu-usuario/repo-original.

# 2. Clona tu fork
$ git clone git@github.com:tu-usuario/repo-original.git
$ cd repo-original

# 3. Agrega el repo original como remoto "upstream"
$ git remote add upstream git@github.com:dueno-original/repo-original.git
$ git remote -v
origin    git@github.com:tu-usuario/repo-original.git (fetch)
origin    git@github.com:tu-usuario/repo-original.git (push)
upstream  git@github.com:dueno-original/repo-original.git (fetch)
upstream  git@github.com:dueno-original/repo-original.git (push)

# 4. Crea tu feature branch
$ git switch -c feature/add-mobile-locator

# 5. Trabaja, commitea, (rebase -i para limpiar si hace falta)
$ # ...
$ git commit -m "test: add mobile checkout locator"

# 6. Antes de pushear, asegúrate que tu rama está al día con upstream
$ git fetch upstream
$ git rebase upstream/main

# 7. Sube a tu fork
$ git push -u origin feature/add-mobile-locator

# 8. En GitHub, aparece un botón "Compare & pull request". Haz click.
```

### 3.3 Flujo completo como miembro del equipo (caso típico de QA automation)

```bash
# 1. Ya tienes el repo clonado (lo hiciste en el onboarding).
$ git switch main
$ git pull origin main

# 2. Crea tu feature branch
$ git switch -c feature/add-user-profile-tests

# 3. Trabaja
$ # ...edita, agrega, commitea...
$ git commit -m "test: add user profile happy path"
$ git commit -m "test: add user profile validation errors"

# 4. (Opcional pero recomendado) limpia el historial
$ git rebase -i main

# 5. Asegúrate que estás al día con main
$ git fetch origin
$ git rebase origin/main

# 6. Sube la rama
$ git push -u origin feature/add-user-profile-tests

# 7. En GitHub, abre el PR con el botón "Compare & pull request"
```

### 3.4 Escribir un buen Pull Request

Un PR de automatización debería incluir:

**Título:** claro y accionable.
- ✅ `test: add user profile tests (happy path + validations)`
- ❌ `cambios varios`

**Descripción:** usa una plantilla como esta:

```markdown
## ¿Qué cambia?
- Agrega 5 tests para la pantalla de perfil de usuario.
- Nuevo Page Object `pages/UserProfilePage.ts`.

## ¿Por qué?
Cierra el ticket QA-432. Cobertura de perfil era 0% y el equipo
reportó 3 bugs en producción en ese flujo el mes pasado.

## ¿Cómo probarlo localmente?
```
pnpm install
pnpm test tests/user-profile.spec.ts
```

## Screenshots (si aplica)
[captura del reporte HTML de Playwright]

## Checklist
- [x] Tests corren verde localmente
- [x] Tests corren verde en CI
- [x] Agregué el Page Object siguiendo el patrón del framework
- [x] Usé los selectores de `data-testid`, no CSS frágiles
- [x] El PR está rebaseado sobre main
```

### 3.5 El flujo de revisión (code review)

Una vez abierto el PR:

1. **GitHub Actions / CI** corre automáticamente los tests contra tu rama.
2. Tus compañeros reciben notificación y entran a revisar.
3. Pueden dejar:
   - **Comments:** preguntas o sugerencias no bloqueantes.
   - **Request changes:** cambios obligatorios antes de mergear.
   - **Approve:** ✅ listo para mergear.
4. Respondes a los comentarios haciendo cambios en tu rama local y pusheando:
   ```bash
   $ # ...arreglas lo que pidieron...
   $ git commit -m "review: address comments on UserProfilePage"
   $ git push
   ```
5. Cuando tengas N aprobaciones (la política de tu equipo), **mergeas**.

### 3.6 Estrategias de merge en GitHub

GitHub ofrece 3 formas de mergear un PR:

| Opción | ¿Qué hace? | Cuándo usar |
|--------|------------|-------------|
| **Merge commit** | Crea un merge commit tradicional. Preserva el historial completo de la feature. | Por defecto; si el equipo usa `--no-ff`. |
| **Squash and merge** | Combina todos los commits del PR en **uno solo** antes de mergear a main. | Si tu equipo no usa rebase interactivo y prefiere que GitHub aplane todo. |
| **Rebase and merge** | Reaplica tus commits sobre main de forma lineal, sin merge commit. | Si quieres historial lineal estricto. |

**Recomendación para equipos de QA automation:** usa **squash and merge** si no quieres preocuparte por limpiar commits manualmente, o **rebase and merge** si tu equipo sí rebasea antes.

### 3.7 Cerrar issues automáticamente desde un PR

Si escribes `Closes #432` o `Fixes #432` en la descripción del PR, al mergearse GitHub cerrará automáticamente el issue #432.

Palabras clave: `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves`, `resolved`.

---

## 4. Mantener un proyecto (lead de automatización)

Cuando tu equipo crece, tú eres quien **mantiene** el repo. Aquí las cosas más importantes.

### 4.1 Proteger la rama `main` (Branch protection rules)

**Settings → Branches → Add rule:**

Configura para `main`:
- ✅ **Require a pull request before merging.**
- ✅ **Require approvals:** mínimo 1 (o 2 si el equipo es más grande).
- ✅ **Require status checks to pass before merging** — ata esto a tu CI de GitHub Actions que corre los tests.
- ✅ **Require branches to be up to date before merging.**
- ✅ **Do not allow bypassing the above settings** — sí, incluso tú como admin.
- ⬜ Force pushes (bloquear): marcado.

**Resultado:** nadie puede pushear directo a `main` nunca más. Todo pasa por PR con tests verdes y revisión.

### 4.2 Etiquetas (labels)

Crea labels útiles para gestionar los PRs y issues:

| Label | Color | Para qué |
|-------|-------|----------|
| `flaky` | rojo | Tests inestables que hay que arreglar |
| `framework` | azul | Cambios al core del framework (no tests) |
| `good first issue` | verde | Tareas sencillas para nuevos en el equipo |
| `needs review` | amarillo | PR listo para que alguien lo mire |
| `blocked` | gris | Bloqueado por algo externo |
| `ci` | morado | Cambios al pipeline de CI/CD |

### 4.3 Milestones

Agrupa issues y PRs por entregas. Por ejemplo:
- `Sprint 42 - Regression suite`
- `Release v2.0 of framework`

### 4.4 Revisar código de tu equipo

Buenas prácticas al revisar un PR de un compañero:

1. **Corre los tests en tu máquina** (no solo confíes en el CI). Haz `git fetch && git switch pr-branch`.
2. **Revisa los selectores:** ¿son `data-testid` o CSS frágiles?
3. **Busca anti-patterns:** `page.waitForTimeout(5000)` → sugiere `waitFor` específico.
4. **Verifica que los tests son determinísticos:** ¿pueden fallar por orden aleatorio o datos compartidos?
5. **Pregunta por qué, no por qué no:** "¿Cuál es el motivo de no usar el Page Object existente aquí?" es mejor que "Deberías usar el Page Object".

### 4.5 Releases

En GitHub puedes crear un **release** atado a un tag:

1. **Releases → Draft a new release.**
2. Elige el tag (por ejemplo `v1.0.0`).
3. Título: `v1.0.0 - First stable framework release`.
4. Notas: describe qué cambió, qué tests se agregaron, qué bugs se arreglaron.
5. Publica.

El release queda visible en la pestaña **Releases** del repo y otros pueden descargarlo como `.zip` o `.tar.gz`.

### 4.6 Un vistazo breve a GitHub Actions (CI para tests)

GitHub Actions permite correr tus tests automáticamente en cada push/PR. Un workflow mínimo para Playwright:

```yaml
# .github/workflows/tests.yml
name: Run Playwright tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

> 💡 Profundizar en GitHub Actions está fuera del alcance de este curso, pero sabiendo lo anterior ya puedes configurar un CI básico para tu framework.

---

## 5. Resumen del módulo

- **2FA siempre.** No es opcional.
- **SSH** es la forma profesional de autenticarse para uso diario.
- Tu primer push desde un repo local: `git remote add origin ...` + `git push -u origin main`.
- **Pull Request** es el mecanismo de contribución estándar. Escribe buenos títulos, descripciones y checklists.
- **Squash and merge** o **rebase and merge** son las estrategias más limpias para un repo de automatización.
- Como mantenedor: protege `main`, configura CI, usa labels y milestones, revisa PRs con criterio.
- Los tags locales se suben con `git push origin --tags` y se pueden convertir en Releases.

➡️ Ahora haz los ejercicios en [reto.md](./reto.md).
