# 1. Deshacer cosas (Undoing)

Git es muy bueno para deshacer casi cualquier error. Lo **importante** es saber qué comando usar según dónde está el error.

## 1.1 El error más común: "olvidé un archivo en el último commit"

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

## 1.2 "Agregué un archivo al staging y no quería"

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

## 1.3 "Modifiqué un archivo y quiero descartar los cambios"

Supón que estabas experimentando con `tests/login.spec.ts` y quieres volver al último commit, **perdiendo** lo que hiciste:

```bash
$ git restore tests/login.spec.ts
# o equivalente antiguo:
$ git checkout -- tests/login.spec.ts
```

> ⚠️ **Peligro:** esto es **irreversible**. Los cambios descartados no están en ningún lugar (ni en staging ni en commits). Asegúrate 100% antes de hacerlo.

## 1.4 `git reset` — la navaja suiza (con cuidado)

`git reset` mueve el puntero de la rama hacia atrás. Tiene 3 modos:

| Modo | ¿Qué hace con los commits? | ¿Qué hace con el staging? | ¿Qué hace con el working dir? |
|------|----------------------------|---------------------------|-------------------------------|
| `--soft` | Los "deshace" | Los deja en staging | Los deja en working dir |
| `--mixed` (default) | Los "deshace" | Los saca del staging | Los deja en working dir |
| `--hard` | Los "deshace" | Los saca del staging | **Los borra del disco** ⚠️ |

### Ejemplo de `reset --soft`: deshacer el último commit para rehacerlo mejor

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

### Ejemplo de `reset --hard`: descartar los últimos 2 commits por completo

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

## 1.5 `git revert` — deshacer de forma segura en repos compartidos

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

## 1.6 Tabla decisión: ¿qué comando de "undo" uso?

| Situación | Comando |
|-----------|---------|
| Olvidé agregar un archivo al último commit local | `git commit --amend` |
| Agregué algo al staging y no quería | `git restore --staged <archivo>` |
| Modifiqué un archivo y quiero descartar los cambios | `git restore <archivo>` |
| Quiero deshacer el último commit local pero conservar los cambios | `git reset --soft HEAD~1` |
| Quiero borrar el último commit local Y sus cambios | `git reset --hard HEAD~1` ⚠️ |
| Quiero deshacer un commit que ya está en el remoto | `git revert <hash>` |
| Acabo de hacer `reset --hard` y me arrepentí | `git reflog` + `git reset --hard <hash>` |
