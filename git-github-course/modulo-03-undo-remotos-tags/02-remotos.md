# 2. Trabajar con remotos

Un **remoto** es una copia del repo alojada en otra máquina (típicamente GitHub, GitLab o Bitbucket). Los remotos permiten que tu equipo de automatización **comparta** el mismo repo.

## 2.1 Ver los remotos configurados

```bash
$ git remote -v
origin  https://github.com/miempresa/qa-playwright.git (fetch)
origin  https://github.com/miempresa/qa-playwright.git (push)
```

- `origin` es el **nombre** del remoto (convención: cuando clonas, Git lo llama así por defecto).
- `(fetch)` es de dónde descargas; `(push)` es hacia dónde subes. Casi siempre son la misma URL.

## 2.2 Agregar un remoto

Si creaste tu repo con `git init` (local) y quieres conectarlo a GitHub después:

```bash
$ git remote add origin https://github.com/miempresa/qa-playwright.git
$ git remote -v
```

## 2.3 Descargar cambios del remoto: `fetch` vs `pull`

Hay dos comandos para traer cambios del remoto:

```bash
$ git fetch origin     # descarga cambios pero NO los mergea
$ git pull origin main # descarga cambios Y hace merge automático en tu rama actual
```

**Cuál usar en la práctica:**

- **`git fetch`** es más seguro: descarga los commits remotos pero no toca tu trabajo local. Después puedes mirar qué cambió con `git log origin/main` y decidir.
- **`git pull`** es atajo de `git fetch` + `git merge`. Úsalo cuando sabes que no hay cambios locales que puedan chocar.

> 💡 **Tip del equipo de automatización:** empieza el día con `git fetch origin && git status` para ver qué pasó sin que Git te mezcle nada sin permiso.

## 2.4 Subir cambios al remoto: `git push`

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

## 2.5 Renombrar y quitar remotos

```bash
$ git remote rename origin github
$ git remote remove github
```

## 2.6 Ver detalles de un remoto

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
