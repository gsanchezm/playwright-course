# 3. Contribuir a un proyecto (el flujo del Pull Request)

Este es **el flujo más importante** del módulo. Así es como contribuyes a cualquier repo de tu equipo (o a un proyecto open source).

## 3.1 Fork vs Colaborador directo

- **Si eres miembro del equipo** con permisos de push → clonas el repo y trabajas en ramas directas. Abres PRs desde `feature/*` a `main`.
- **Si NO eres miembro** (contribuidor externo, open source) → haces **fork** (copia tuya del repo), trabajas ahí, y abres un PR desde tu fork al repo original.

## 3.2 Flujo completo con fork (ejemplo open source)

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

## 3.3 Flujo completo como miembro del equipo (caso típico de QA automation)

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

## 3.4 Escribir un buen Pull Request

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

## 3.5 El flujo de revisión (code review)

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

## 3.6 Estrategias de merge en GitHub

GitHub ofrece 3 formas de mergear un PR:

| Opción | ¿Qué hace? | Cuándo usar |
|--------|------------|-------------|
| **Merge commit** | Crea un merge commit tradicional. Preserva el historial completo de la feature. | Por defecto; si el equipo usa `--no-ff`. |
| **Squash and merge** | Combina todos los commits del PR en **uno solo** antes de mergear a main. | Si tu equipo no usa rebase interactivo y prefiere que GitHub aplane todo. |
| **Rebase and merge** | Reaplica tus commits sobre main de forma lineal, sin merge commit. | Si quieres historial lineal estricto. |

**Recomendación para equipos de QA automation:** usa **squash and merge** si no quieres preocuparte por limpiar commits manualmente, o **rebase and merge** si tu equipo sí rebasea antes.

## 3.7 Cerrar issues automáticamente desde un PR

Si escribes `Closes #432` o `Fixes #432` en la descripción del PR, al mergearse GitHub cerrará automáticamente el issue #432.

Palabras clave: `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves`, `resolved`.
