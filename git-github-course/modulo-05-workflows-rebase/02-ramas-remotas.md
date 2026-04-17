# 2. Ramas remotas

Una **rama remota** es una referencia a la última versión conocida de una rama en el servidor. Se nombran como `<remoto>/<rama>`, por ejemplo `origin/main`.

## 2.1 Ver ramas remotas

```bash
$ git branch -r
  origin/HEAD -> origin/main
  origin/main
  origin/develop
  origin/feature/mobile-tests

$ git branch -a     # locales + remotas
* main
  feature/my-work
  remotes/origin/main
  remotes/origin/develop
```

## 2.2 `fetch` vs `pull` recordatorio

```bash
$ git fetch origin                  # descarga commits nuevos a origin/*, sin tocar tu rama local
$ git pull origin main              # = fetch + merge origin/main en tu rama actual
$ git pull --rebase origin main     # = fetch + rebase (historial lineal, ver sección 3)
```

## 2.3 Rama local "tracking" una rama remota

Cuando haces `git clone`, tu `main` local está "trackeando" (siguiendo) `origin/main`. Esto significa que Git sabe dónde hacer `push` y desde dónde hacer `pull` sin que se lo digas.

Para crear una rama local que trackee una remota:

```bash
$ git switch feature/mobile-tests
# Equivale a: git switch -c feature/mobile-tests origin/feature/mobile-tests
```

Para hacer que una rama local existente trackee una remota:

```bash
$ git branch -u origin/feature/mobile-tests
```

## 2.4 Publicar una rama local al remoto por primera vez

```bash
$ git switch -c feature/add-cart-tests
$ # ...commits...
$ git push -u origin feature/add-cart-tests
```

El `-u` (short for `--set-upstream`) vincula tu rama local con la remota. Después puedes hacer solo `git push`.

## 2.5 Borrar una rama remota

```bash
$ git push origin --delete feature/old-experiment
```

Muy útil después de que tu PR fue mergeado y la rama ya no sirve.

## 2.6 Limpiar referencias obsoletas

Si un compañero borró una rama remota pero tu local sigue viendo `origin/feature/old`:

```bash
$ git fetch --prune
# o configura que siempre ocurra automáticamente:
$ git config --global fetch.prune true
```
