# Módulo 3: Deshacer cambios, trabajar con remotos, tags y aliases

> **Escenario del instructor:** Ya tienes tu framework funcionando localmente. Hoy vas a: (a) recuperarte de un error tonto sin pérdida de trabajo, (b) conectar tu repo a GitHub para compartirlo con el equipo, y (c) etiquetar una versión oficial `v1.0.0` del framework.

---

## 1. Deshacer cosas (Undoing)

Git es muy bueno para deshacer casi cualquier error. Lo **importante** es saber qué comando usar según dónde está el error.

### 1.1 El error más común: "olvidé un archivo en el último commit"

Supón que acabas de hacer un commit de un nuevo test, pero **olvidaste agregar el Page Object**:

```bash
$ git add tests/cart.spec.ts
$ git commit -m "test: add cart checkout flow"
# 🤦 te das cuenta que olvidaste CartPage.ts
```

Solución: `git commit --amend` reemplaza el último commit con uno nuevo que incluye los cambios adicionales.

```bash
$ git add pages/CartPage.ts
$ git commit --amend --no-edit
```

El `--no-edit` mantiene el mensaje anterior intacto. Si también quieres cambiar el mensaje, omite `--no-edit`:

```bash
$ git commit --amend -m "test: add cart checkout flow with CartPage POM"
```

> ⚠️ **Regla de oro del amend:** **NUNCA** hagas `--amend` a un commit que ya hiciste `push` al remoto compartido. `--amend` reescribe el historial, y si alguien ya descargó el commit original, tendrás problemas graves. Úsalo solo en commits locales.

### 1.2 "Agregué un archivo al staging y no quería"

```bash
$ git add .env   # 🤦 no quería subir el .env con secretos
$ git status
Changes to be committed:
        new file:   .env
```

Para sacarlo del staging **sin perder los cambios**:

```bash
$ git restore --staged .env
# o en versiones antiguas de Git:
$ git reset HEAD .env
```

Ahora `.env` vuelve a estar "modified" (o "untracked" si era nuevo), pero sigue en tu disco con su contenido intacto.

### 1.3 "Modifiqué un archivo y quiero descartar los cambios"

Supón que estabas experimentando con `tests/login.spec.ts` y quieres volver al último commit, **perdiendo** lo que hiciste:

```bash
$ git restore tests/login.spec.ts
# o equivalente antiguo:
$ git checkout -- tests/login.spec.ts
```

> ⚠️ **Peligro:** esto es **irreversible**. Los cambios descartados no están en ningún lugar (ni en staging ni en commits). Asegúrate 100% antes de hacerlo.

### 1.4 `git reset` — la navaja suiza (con cuidado)

`git reset` mueve el puntero de la rama hacia atrás. Tiene 3 modos:

| Modo | ¿Qué hace con los commits? | ¿Qué hace con el staging? | ¿Qué hace con el working dir? |
|------|----------------------------|---------------------------|-------------------------------|
| `--soft` | Los "deshace" | Los deja en staging | Los deja en working dir |
| `--mixed` (default) | Los "deshace" | Los saca del staging | Los deja en working dir |
| `--hard` | Los "deshace" | Los saca del staging | **Los borra del disco** ⚠️ |

#### Ejemplo de `reset --soft`: deshacer el último commit para rehacerlo mejor

```bash
$ git log --oneline
a1b2c3d (HEAD -> main) test: add login
7f8e9d0 chore: initial framework

$ git reset --soft HEAD~1
$ git log --oneline
7f8e9d0 (HEAD -> main) chore: initial framework

$ git status
Changes to be committed:
        new file:   tests/login.spec.ts
```

El commit desapareció pero tus archivos siguen en staging, listos para un nuevo commit.

#### Ejemplo de `reset --hard`: descartar los últimos 2 commits por completo

```bash
$ git reset --hard HEAD~2
```

🛑 **Esto borra los 2 últimos commits Y los cambios de disco.** Úsalo solo cuando estés seguro.

> 💡 **Red de seguridad: `git reflog`.** Aunque hagas `reset --hard`, Git guarda el historial de HEAD en el "reflog" por al menos 30 días. Si te arrepientes:
> ```bash
> $ git reflog
> 7f8e9d0 HEAD@{0}: reset: moving to HEAD~2
> a1b2c3d HEAD@{1}: commit: test: add login
> $ git reset --hard a1b2c3d
> ```
> Esto recupera el commit que habías "borrado".

### 1.5 `git revert` — deshacer de forma segura en repos compartidos

Cuando el commit **YA está en el remoto** y otros ya lo descargaron, NO uses `reset`. Usa `git revert`, que crea un **nuevo commit** que deshace los cambios del commit anterior.

```bash
$ git log --oneline
a1b2c3d (HEAD -> main) test: add broken flaky test
7f8e9d0 chore: framework skeleton

$ git revert a1b2c3d
```

Git abre tu editor con un mensaje de commit pre-escrito (`Revert "test: add broken flaky test"`). Guarda y cierra. Resultado:

```bash
$ git log --oneline
b4d5e6f (HEAD -> main) Revert "test: add broken flaky test"
a1b2c3d test: add broken flaky test
7f8e9d0 chore: framework skeleton
```

El commit original sigue ahí, pero el nuevo lo anula. **Esto es seguro para repos compartidos** porque no reescribe el historial.

### 1.6 Tabla decisión: ¿qué comando de "undo" uso?

| Situación | Comando |
|-----------|---------|
| Olvidé agregar un archivo al último commit local | `git commit --amend` |
| Agregué algo al staging y no quería | `git restore --staged <archivo>` |
| Modifiqué un archivo y quiero descartar los cambios | `git restore <archivo>` |
| Quiero deshacer el último commit local pero conservar los cambios | `git reset --soft HEAD~1` |
| Quiero borrar el último commit local Y sus cambios | `git reset --hard HEAD~1` ⚠️ |
| Quiero deshacer un commit que ya está en el remoto | `git revert <hash>` |
| Acabo de hacer `reset --hard` y me arrepentí | `git reflog` + `git reset --hard <hash>` |

---

## 2. Trabajar con remotos

Un **remoto** es una copia del repo alojada en otra máquina (típicamente GitHub, GitLab o Bitbucket). Los remotos permiten que tu equipo de automatización **comparta** el mismo repo.

### 2.1 Ver los remotos configurados

```bash
$ git remote -v
origin  https://github.com/miempresa/qa-playwright.git (fetch)
origin  https://github.com/miempresa/qa-playwright.git (push)
```

- `origin` es el **nombre** del remoto (convención: cuando clonas, Git lo llama así por defecto).
- `(fetch)` es de dónde descargas; `(push)` es hacia dónde subes. Casi siempre son la misma URL.

### 2.2 Agregar un remoto

Si creaste tu repo con `git init` (local) y quieres conectarlo a GitHub después:

```bash
$ git remote add origin https://github.com/miempresa/qa-playwright.git
$ git remote -v
```

### 2.3 Descargar cambios del remoto: `fetch` vs `pull`

Hay dos comandos para traer cambios del remoto:

```bash
$ git fetch origin     # descarga cambios pero NO los mergea
$ git pull origin main # descarga cambios Y hace merge automático en tu rama actual
```

**Cuál usar en la práctica:**

- **`git fetch`** es más seguro: descarga los commits remotos pero no toca tu trabajo local. Después puedes mirar qué cambió con `git log origin/main` y decidir.
- **`git pull`** es atajo de `git fetch` + `git merge`. Úsalo cuando sabes que no hay cambios locales que puedan chocar.

> 💡 **Tip del equipo de automatización:** empieza el día con `git fetch origin && git status` para ver qué pasó sin que Git te mezcle nada sin permiso.

### 2.4 Subir cambios al remoto: `git push`

```bash
$ git push origin main
Enumerating objects: 12, done.
Writing objects: 100% (12/12), 2.34 KiB | 2.34 MiB/s, done.
To https://github.com/miempresa/qa-playwright.git
   7f8e9d0..a1b2c3d  main -> main
```

Si es tu **primer push** de una rama nueva, necesitas el flag `-u` para vincularla al remoto:

```bash
$ git push -u origin main
```

Después de hacer esto una vez, puedes usar solo `git push` en esa rama.

### 2.5 Renombrar y quitar remotos

```bash
$ git remote rename origin github
$ git remote remove github
```

### 2.6 Ver detalles de un remoto

```bash
$ git remote show origin
* remote origin
  Fetch URL: https://github.com/miempresa/qa-playwright.git
  Push  URL: https://github.com/miempresa/qa-playwright.git
  HEAD branch: main
  Remote branches:
    main                  tracked
    feature/mobile-tests  tracked
  Local branch configured for 'git pull':
    main merges with remote main
  Local ref configured for 'git push':
    main pushes to main (up to date)
```

---

## 3. Tags: marcar versiones oficiales del framework

Un **tag** es una etiqueta permanente sobre un commit específico. Se usa para marcar **versiones oficiales** del framework de automatización. Por ejemplo: "este es el estado de los tests que validamos junto con el release v2.3 de la app".

### 3.1 Dos tipos de tags

| Tipo | Comando | Incluye |
|------|---------|---------|
| Lightweight | `git tag v1.0.0` | Solo el hash del commit (como un bookmark). |
| Annotated | `git tag -a v1.0.0 -m "..."` | Hash + autor + fecha + mensaje + puede ser firmado con GPG. |

**Regla:** para versiones oficiales del framework usa **siempre annotated** (`-a`).

### 3.2 Crear un tag annotated

```bash
$ git tag -a v1.0.0 -m "Release v1.0.0: stable framework with 80 tests covering checkout flow"
$ git tag
v1.0.0

$ git show v1.0.0
tag v1.0.0
Tagger: Gilberto Sánchez <gil@empresa.com>
Date:   Mon Apr 07 14:00:00 2025 -0600

Release v1.0.0: stable framework with 80 tests covering checkout flow

commit 7f8e9d0a1b2c3d
Author: Gilberto Sánchez <gil@empresa.com>
Date:   Mon Apr 07 13:50:00 2025 -0600

    chore: bump version to 1.0.0
```

### 3.3 Tag sobre un commit antiguo

¿Y si olvidaste taggear en el momento y quieres etiquetar retroactivamente?

```bash
$ git log --oneline
7f8e9d0 (HEAD -> main) chore: bump version to 1.0.0
a1b2c3d fix: stabilize checkout test
2b4c5d6 test: add cart flow

$ git tag -a v0.9.0 2b4c5d6 -m "Release candidate v0.9.0"
```

### 3.4 Subir tags al remoto

Los tags **NO se suben automáticamente con `git push`**. Tienes que empujarlos explícitamente:

```bash
$ git push origin v1.0.0         # un solo tag
$ git push origin --tags         # todos los tags
```

### 3.5 Borrar tags

```bash
$ git tag -d v1.0.0                    # local
$ git push origin --delete v1.0.0      # remoto
```

### 3.6 Caso de uso real: versionar tu framework junto al release de la app

```bash
# La app acaba de liberar v2.3.0. Los tests que tengo ahora
# cubren ese release y están verdes en CI.
$ git tag -a test-suite-v2.3.0 -m "Test suite validated against app v2.3.0"
$ git push origin test-suite-v2.3.0
```

Ahora, si meses después alguien del equipo dice "necesito reproducir qué tests teníamos cuando salió v2.3.0", basta con:

```bash
$ git checkout test-suite-v2.3.0
```

---

## 4. Git Aliases: escribir menos, hacer más

Un alias es un atajo personalizado. Muy útil para los comandos que usas 50 veces al día.

### 4.1 Configurar aliases

```bash
$ git config --global alias.co checkout
$ git config --global alias.br branch
$ git config --global alias.ci commit
$ git config --global alias.st status
$ git config --global alias.last "log -1 HEAD"
$ git config --global alias.lg "log --oneline --graph --all --decorate"
$ git config --global alias.unstage "restore --staged"
```

### 4.2 Usarlos

```bash
$ git st                     # equivale a git status
$ git lg                     # vista gráfica del historial
$ git unstage tests/login.spec.ts
$ git last                   # ver el último commit
```

### 4.3 Aliases útiles para un automatizador

```bash
# Ver qué tests cambiaron en los últimos 3 commits
$ git config --global alias.recent-tests "log --oneline -3 --stat -- tests/"

# Listar todos los tests modificados en la rama actual pero no en main
$ git config --global alias.my-tests "diff --name-only main...HEAD -- tests/"

# Log de una sola línea con colores y autor
$ git config --global alias.hist "log --pretty=format:'%C(yellow)%h%Creset %C(cyan)%an%Creset %s %C(green)(%cr)%Creset'"
```

### 4.4 Ver todos tus aliases

```bash
$ git config --global --get-regexp alias
alias.co checkout
alias.br branch
alias.ci commit
alias.st status
alias.last log -1 HEAD
alias.lg log --oneline --graph --all --decorate
```

---

## 5. Resumen del módulo

- **Undo local:** `--amend`, `restore`, `restore --staged`, `reset --soft/--mixed/--hard`.
- **Undo en repo compartido:** `git revert` (nunca `reset --hard` sobre commits ya pusheados).
- **Red de seguridad:** `git reflog` guarda tus movimientos por ~30 días.
- **Remotos:** `git remote add/remove/-v`, `git fetch` (seguro) vs `git pull` (atajo).
- **Tags:** siempre annotated (`-a`), no se pushean con `git push` (necesitan `--tags`).
- **Aliases:** define los 4-5 que más uses; te ahorran horas a la semana.

➡️ Ahora haz los ejercicios en [reto.md](./reto.md).
