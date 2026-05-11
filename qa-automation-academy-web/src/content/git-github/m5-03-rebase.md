# 3. Rebase — mantener el historial lineal

## 3.1 ¿Qué es rebase?

`rebase` toma los commits de tu rama y los **reaplica** sobre otra base. El resultado es un historial lineal (sin merge commits) que se lee mucho más fácil.

**Antes del rebase:**
```
main          ●──●──●──●  (otros mergeados)
               \
feature/mine    ●──●      (tus 2 commits)
```

**Después de `git rebase main` desde `feature/mine`:**
```
main          ●──●──●──●
                       \
feature/mine            ●──●  (tus 2 commits reaplicados arriba de main)
```

Ahora cuando mergees `feature/mine` a `main`, será un **fast-forward** limpio, sin merge commits.

## 3.2 Ejemplo práctico

```bash
# Estás en feature/mine con 2 commits desde que saliste de main.
# Mientras tanto, main avanzó 3 commits por mergeos de otros.

$ git switch feature/mine
$ git fetch origin
$ git rebase origin/main
First, rewinding head to replay your work on top of it...
Applying: test: add cart checkout
Applying: test: add cart empty state
```

Ahora tus 2 commits "viven" encima de los últimos cambios de `main`.

## 3.3 Rebase con conflictos

Si Git encuentra un conflicto durante el rebase:

```bash
$ git rebase origin/main
Applying: test: add cart checkout
CONFLICT (content): Merge conflict in pages/CartPage.ts
error: could not apply 7f8e9d0... test: add cart checkout
Resolve all conflicts manually, mark them as resolved with
"git add/rm <conflicted_files>", then run "git rebase --continue".
You can instead skip this commit: run "git rebase --skip".
To abort and get back to the state before "git rebase", run "git rebase --abort".
```

Flujo para resolver:

```bash
# 1. Edita el archivo y resuelve los marcadores como en un merge normal
$ nano pages/CartPage.ts

# 2. Marca como resuelto
$ git add pages/CartPage.ts

# 3. Continúa el rebase
$ git rebase --continue
```

Si hay varios commits que chocan, Git puede pedirte resolver conflictos **uno por uno**.

En cualquier momento puedes abortar y volver a como estabas:
```bash
$ git rebase --abort
```

## 3.4 ⚠️ La regla de oro del rebase

> **NUNCA hagas rebase a commits que ya están en un remoto compartido.**

Rebase **reescribe el historial**: crea commits nuevos con hashes distintos. Si alguien ya descargó los commits originales, su copia quedará desincronizada y habrá problemas graves cuando intente hacer pull.

**Regla simple:** rebasea solo **tus ramas locales privadas**, antes de pushear. Una vez pusheadas, usa `merge`.

**Única excepción:** si tú eres el único usuario de la rama remota (típico en una feature branch personal) y le avisas al equipo, puedes hacer `git push --force-with-lease`. Pero úsalo con mucho cuidado.

## 3.5 Rebase interactivo (`rebase -i`) — el favorito para limpiar antes de un PR

Esto es **oro puro** para un automatizador. Antes de abrir un PR, puedes **reescribir tus propios commits locales** para que se vean profesionales: combinarlos, renombrarlos, reordenarlos, editarlos.

```bash
$ git log --oneline -5
a1b2c3d (HEAD -> feature/cart) fix typo
2b4c5d6 WIP
3d4e5f6 try again
4g5h6i7 test: add cart tests (initial)
7f8e9d0 (main) ...

$ git rebase -i HEAD~4
```

Se abre un editor con:

```
pick 4g5h6i7 test: add cart tests (initial)
pick 3d4e5f6 try again
pick 2b4c5d6 WIP
pick a1b2c3d fix typo

# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# d, drop = remove commit
```

Tu objetivo: convertir esos 4 commits caóticos en **un solo commit limpio**. Cambia a:

```
pick 4g5h6i7 test: add cart tests (initial)
squash 3d4e5f6 try again
squash 2b4c5d6 WIP
squash a1b2c3d fix typo
```

Guarda y cierra. Git te abre otro editor para que escribas el mensaje final del commit combinado:

```
test: add cart page tests with happy path and edge cases
```

Resultado:

```bash
$ git log --oneline -5
b1c2d3e (HEAD -> feature/cart) test: add cart page tests with happy path and edge cases
7f8e9d0 (main) ...
```

Un solo commit limpio. **Ahora sí** puedes abrir un PR.

## 3.6 Acciones comunes en rebase interactivo

| Acción | Para qué |
|--------|----------|
| `pick` | Usar el commit tal cual |
| `reword` | Cambiar solo el mensaje |
| `edit` | Pausar para modificar archivos del commit |
| `squash` | Combinar con el anterior, preservando los mensajes |
| `fixup` | Combinar con el anterior, descartando el mensaje |
| `drop` | Borrar el commit por completo |
| (reordenar) | Cambia el orden de las líneas para reordenar commits |

## 3.7 Caso de uso real en un repo de automatización

**Antes del rebase interactivo:**
```
a1b2c3d fix typo in selector
2b4c5d6 add remember me test
3d4e5f6 WIP login test
4g5h6i7 fix waitFor bug
5h6i7j8 initial login test
```

**Después:**
```
c1d2e3f test: add login page tests with rememberMe option
```

Tu PR ahora tiene **1 commit limpio**, no 5 commits de "WIP". Tu líder técnico te lo va a agradecer mucho.

## 3.8 `pull --rebase` en vez de `pull`

Si quieres evitar merge commits cuando descargas cambios de `origin/main`:

```bash
$ git pull --rebase origin main
```

Esto hace: `fetch origin main` + `rebase origin/main`. Útil si estás en una feature branch y quieres incorporar los últimos cambios de main sin ensuciar el historial.

Puedes configurarlo como default:
```bash
$ git config --global pull.rebase true
```
