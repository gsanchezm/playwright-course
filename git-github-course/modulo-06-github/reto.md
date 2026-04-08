# Reto - Módulo 6: GitHub

Objetivo: publicar tu repo local en GitHub, abrir tu primer Pull Request real, configurar protección de `main` y practicar el flujo de revisión.

> ⚠️ **Necesitas una cuenta de GitHub gratuita** para hacer estos retos. Si aún no la creaste, regístrate en [github.com](https://github.com) antes de continuar.

---

## Reto 6.1 — Configurar la cuenta correctamente

1. Crea una cuenta en GitHub con el **mismo correo** que configuraste en `git config --global user.email`.
2. Activa **2FA** en **Settings → Password and authentication**.
3. Llena tu perfil con nombre real, bio corta ("QA Automation Engineer") y foto profesional.

**✅ Verificación:**
- Tu URL pública es `github.com/tu-usuario`.
- Bajo tu foto aparece el badge de "2FA enabled".

---

## Reto 6.2 — Configurar autenticación SSH

1. Genera una llave SSH:
   ```bash
   $ ssh-keygen -t ed25519 -C "tu-correo@ejemplo.com"
   ```
   Acepta las opciones por defecto.
2. Muestra la llave pública:
   ```bash
   $ cat ~/.ssh/id_ed25519.pub
   ```
3. Copia toda la salida.
4. Ve a **GitHub → Settings → SSH and GPG keys → New SSH key**:
   - **Title:** `Mi laptop personal` (o lo que quieras).
   - **Key:** pega el contenido.
5. Prueba la conexión:
   ```bash
   $ ssh -T git@github.com
   ```

**✅ Resultado esperado:**
```
Hi tu-usuario! You've successfully authenticated, but GitHub does not provide shell access.
```

Si ves este mensaje, SSH está listo.

---

## Reto 6.3 — Crear el repo en GitHub y subir tu sandbox

1. En GitHub, crea un nuevo repo llamado `qa-playwright-demo`:
   - **Description:** "Playwright framework — práctica del curso de Git para QA".
   - **Visibility:** público.
   - **NO marques** ninguna de las opciones de inicialización (README, .gitignore, license).
2. Conecta tu repo local (en el sandbox del Módulo 2) al nuevo remoto:
   ```bash
   $ cd ~/sandbox/qa-playwright-demo
   $ git remote add origin git@github.com:tu-usuario/qa-playwright-demo.git
   $ git remote -v
   ```
3. Empuja la rama principal:
   ```bash
   $ git push -u origin main
   ```
4. Empuja los tags:
   ```bash
   $ git push origin --tags
   ```

**✅ Resultado esperado:** al recargar la página del repo en GitHub, ves todos tus archivos, el historial de commits y bajo "Releases / Tags" aparecen `v0.1.0` y `v1.0.0`.

---

## Reto 6.4 — Abrir tu primer Pull Request

1. Crea una feature branch localmente:
   ```bash
   $ git switch -c feature/add-readme-badges
   ```
2. Edita `README.md` y agrega una sección con badges ficticios:
   ```markdown
   # qa-playwright-demo

   ![tests](https://img.shields.io/badge/tests-passing-green)
   ![playwright](https://img.shields.io/badge/playwright-1.47-blue)

   Test framework para práctica del curso de Git para QA.

   ## Instalación
   \`\`\`bash
   pnpm install
   pnpm test
   \`\`\`
   ```
3. Commitea y pushea:
   ```bash
   $ git add README.md
   $ git commit -m "docs: add badges and install instructions to README"
   $ git push -u origin feature/add-readme-badges
   ```
4. Ve a GitHub. Verás un banner amarillo: **"feature/add-readme-badges had recent pushes ... Compare & pull request"**. Click.
5. Llena el PR con una buena descripción siguiendo la plantilla del `ejemplo.md`:
   - **Título:** `docs: add badges and install instructions to README`
   - **Descripción:** usa la plantilla (¿Qué cambia?, ¿Por qué?, ¿Cómo probarlo?, Checklist).
6. Click **Create pull request**.

**✅ Resultado esperado:** el PR existe en `https://github.com/tu-usuario/qa-playwright-demo/pulls` con título y descripción completos.

---

## Reto 6.5 — Mergear tu PR con diferentes estrategias

1. Desde la página del PR que acabas de crear, busca el botón verde **Merge pull request**. Notarás una flechita que abre 3 opciones:
   - **Create a merge commit**
   - **Squash and merge**
   - **Rebase and merge**
2. Elige **Squash and merge**.
3. Confirma.
4. Borra la rama desde GitHub (botón **Delete branch**).
5. En tu máquina local, sincroniza:
   ```bash
   $ git switch main
   $ git pull origin main
   $ git log --oneline -3
   ```

**✅ Resultado esperado:** en local, `main` tiene un nuevo commit llamado `docs: add badges and install instructions to README (#1)`. Ya no hay separación de commits porque el squash los aplanó.

6. Opcional: borra la rama local obsoleta:
   ```bash
   $ git branch -d feature/add-readme-badges
   ```

---

## Reto 6.6 — Proteger la rama `main`

1. Ve a **Settings → Branches → Add branch ruleset** (o "Add rule" en la versión clásica).
2. Configura:
   - **Branch name pattern:** `main`
   - ✅ **Require a pull request before merging.**
   - ✅ **Require approvals:** 1.
   - ✅ **Require status checks to pass before merging.** (Si no tienes CI configurado, déjalo desactivado por ahora.)
   - ✅ **Block force pushes.**
3. Guarda.
4. **Prueba la protección:** intenta hacer un push directo a `main` desde local.
   ```bash
   $ echo "prueba" >> NOTES.md
   $ git add NOTES.md
   $ git commit -m "test: direct push"
   $ git push origin main
   ```

**✅ Resultado esperado:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
```

GitHub rechaza el push. Excelente — tu rama está protegida.

5. Revierte el commit local ya que no entrará al remoto:
   ```bash
   $ git reset --hard HEAD~1
   ```

---

## Reto 6.7 — Simular un PR que requiere revisión

Después del reto 6.6, todo cambio debe pasar por PR. Simula el flujo completo:

1. Crea una feature branch y un cambio:
   ```bash
   $ git switch -c fix/stabilize-login
   $ echo "// added explicit wait" >> tests/login.spec.ts
   $ git add tests/login.spec.ts
   $ git commit -m "fix: stabilize login test with explicit wait"
   $ git push -u origin fix/stabilize-login
   ```
2. En GitHub, abre el PR.
3. Intenta mergearlo inmediatamente. Notarás que el botón dice **"Review required"** en rojo.
4. Aprueba tu propio PR:
   - Click en **Files changed**.
   - Click en **Review changes** → selecciona **Approve** → **Submit review**.
5. Vuelve a la pestaña **Conversation**. Ahora el PR se puede mergear.

> 💡 **Nota:** GitHub no te deja aprobar tu propio PR en cuentas de empresa. En repos personales sí, solo para practicar. En un equipo real, otra persona aprobaría.

---

## Reto 6.8 — Crear y publicar un Release

1. En tu repo GitHub, ve a la pestaña **Releases → Draft a new release**.
2. Click **Choose a tag** y selecciona `v1.0.0` de los que subiste.
3. **Release title:** `v1.0.0 - First stable framework`.
4. **Describe this release:** escribe algo como:
   ```markdown
   ## What's included
   - 5 core tests: login, logout, checkout, profile, search.
   - LoginPage Page Object.
   - Basic .gitignore for Playwright artifacts.

   ## Known limitations
   - No CI yet.
   - No reporting beyond default Playwright HTML report.
   ```
5. Click **Publish release**.

**✅ Resultado esperado:** el release aparece en `/releases` y GitHub genera automáticamente los archivos `Source code (zip)` y `Source code (tar.gz)`.

---

## Reto 6.9 — Crear labels útiles para el equipo

Configura las siguientes labels en tu repo:

1. Ve a **Issues → Labels → New label**.
2. Crea (o edita las existentes):
   - `flaky` — rojo (#d73a4a)
   - `framework` — azul (#0075ca)
   - `good first issue` — verde (#7057ff)
   - `needs review` — amarillo (#fbca04)
   - `ci` — morado (#8A2BE2)

3. Crea un **issue** de prueba:
   - **Title:** `flaky: login test fails intermittently in CI`
   - **Body:** "El test `tests/login.spec.ts` falla ~20% de las veces por un race condition en el fill del password. Necesitamos agregar un waitFor explícito."
   - **Labels:** `flaky`.

**✅ Resultado esperado:** el issue aparece en la pestaña **Issues** con la label `flaky` en rojo.

---

## Reto 6.10 — Cerrar un issue desde un PR

1. Toma nota del número del issue que creaste en el reto 6.9 (ej. `#5`).
2. Crea una feature branch local para arreglarlo:
   ```bash
   $ git switch main
   $ git pull origin main
   $ git switch -c fix/flaky-login-wait
   $ # ...edita tests/login.spec.ts agregando un waitFor...
   $ echo "await page.waitFor(selector);" >> tests/login.spec.ts
   $ git add tests/login.spec.ts
   $ git commit -m "fix: add explicit waitFor before login click"
   $ git push -u origin fix/flaky-login-wait
   ```
3. Abre un PR en GitHub. En la descripción incluye:
   ```markdown
   Closes #5

   Agrega un waitFor explícito antes del click en el botón de login para eliminar el race condition reportado.
   ```
4. Mergea el PR (squash and merge).
5. Ve a la pestaña **Issues**.

**✅ Resultado esperado:** el issue #5 está **automáticamente cerrado** y enlazado al PR que lo resolvió. Esta es una de las funciones más útiles de GitHub para gestionar trabajo en un equipo de automatización.

---

## Reto 6.11 — Reto en equipo: simular una revisión de código

> Si tienes un compañero tomando este curso contigo, hagan este reto juntos. Si no, invita a cualquier colega a que haga lo siguiente.

1. Invita a tu compañero como colaborador:
   - **Settings → Collaborators → Add people**.
2. Tu compañero debe clonar el repo y crear una feature branch:
   ```bash
   $ git clone git@github.com:tu-usuario/qa-playwright-demo.git
   $ cd qa-playwright-demo
   $ git switch -c feature/add-search-tests
   $ # ...cambios...
   $ git push -u origin feature/add-search-tests
   ```
3. Tu compañero abre un PR.
4. **Tú revisas:**
   - Lee el diff en **Files changed**.
   - Deja al menos **1 comentario** en una línea específica (click en el `+` junto a la línea).
   - Submit review como **Request changes**.
5. Tu compañero debe responder al comentario y hacer un commit nuevo que lo corrija:
   ```bash
   $ # arregla lo que pediste
   $ git commit -am "review: address selector feedback"
   $ git push
   ```
6. El PR se actualiza automáticamente. Tú lo vuelves a revisar y das **Approve**.
7. Mergea.

**✅ Resultado esperado:** el PR tiene el historial completo de revisión: commit inicial, comentarios, commit de corrección, aprobación y merge. **Este es el flujo real que vas a usar todos los días en un equipo de QA automation.**

---

## Reto 6.12 — Preguntas teóricas

Responde (sin ejecutar comandos):

1. ¿Por qué es mejor autenticarse con SSH en vez de HTTPS + token para uso diario?
2. ¿Cuál es la diferencia entre **fork** y **clone**?
3. ¿Por qué recomendamos marcar "Require branches to be up to date before merging" en la protección de `main`?
4. Si tu PR tiene 8 commits "WIP" y vas a usar **Squash and merge** de GitHub, ¿necesitas hacer `rebase -i` localmente para limpiarlos? ¿Por qué?
5. ¿Qué pasa si mergeas un PR que cierra el issue #42 con `Closes #42` pero 10 minutos después te das cuenta que introdujo un bug? ¿Qué haces con el issue y con el código?

**✅ Resultado esperado:**

1. Porque SSH se configura **una sola vez** y no expira; los tokens HTTPS expiran cada cierto tiempo y hay que regenerarlos. Además, SSH no requiere recordar/pegar una contraseña en cada operación sensible.
2. **Clone** es una copia local de un repo (trabajas en la misma URL original). **Fork** es una copia tuya del repo en GitHub, bajo tu usuario, que luego puedes clonar. Fork se usa cuando no tienes permisos de push al repo original y quieres contribuir vía PR.
3. Porque si alguien mergeó otra cosa a `main` mientras tu PR estaba abierto, tus tests podrían pasar en la versión antigua de main pero romperse cuando se combinen. Forzar que la rama esté "up to date" garantiza que CI corrió contra el estado real que quedará en `main`.
4. **No es estrictamente necesario**, porque Squash and merge combinará los 8 commits en uno solo automáticamente al mergear. **Pero sí es recomendable** hacerlo localmente de todas formas, porque te da control sobre el mensaje final del commit y te obliga a revisar el orden de los cambios antes del PR.
5. Dos opciones: (a) revertir el PR con un nuevo PR que haga `git revert <merge-commit>`, lo cual también **reabre el issue** si tu repo tiene esa config; (b) abrir un PR de hotfix que arregle el bug. Lo importante es que **nunca** borres el commit con `reset --hard` en main, porque ya está pusheado y otros lo tienen.

---

## ✅ Checklist de salida del Módulo 6

- [ ] Mi cuenta de GitHub tiene 2FA activado.
- [ ] Configuré SSH y `ssh -T git@github.com` funciona.
- [ ] Mi repo sandbox está publicado en GitHub con todos sus commits y tags.
- [ ] Abrí, revisé y mergeé al menos un Pull Request.
- [ ] Configuré protección de rama en `main`.
- [ ] Creé al menos un Release atado a un tag.
- [ ] Sé la diferencia entre las 3 estrategias de merge de GitHub.
- [ ] Entiendo el flujo de code review: commits → comentarios → arreglar → approve → merge.

---

## 🎓 Fin del curso

Si marcaste todo ✅, **felicidades**: ya tienes las bases de Git y GitHub que un automatizador QA profesional necesita.

**¿Qué sigue?**
- Practica lo aprendido en un proyecto real, idealmente tu repo de tests de automatización.
- Invita a tu equipo a trabajar con el mismo flujo: protección de rama, PRs con revisión, rebase interactivo antes de PR.
- Cuando estés listo, pasa al curso de **Playwright** (próximamente) para aplicar todo esto a un framework real de automatización E2E.
