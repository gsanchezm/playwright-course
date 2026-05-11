# Reto - Módulo 3: Deshacer, Remotos, Tags y Aliases

Objetivo: practicar cómo recuperarte de errores comunes, conectar tu repo a un remoto y etiquetar una versión oficial del framework.

> 💡 Trabaja en el mismo repo sandbox del Módulo 2 (`~/sandbox/qa-playwright-demo`).

---

## Reto 3.1 — `commit --amend`: arreglar un commit incompleto

1. Crea un nuevo test y commitéalo:
   ```bash
   $ echo "test('search', () => {});" > tests/search.spec.ts
   $ git add tests/search.spec.ts
   $ git commit -m "test: add search scenario"
   ```
2. Oh no, olvidaste crear la Page Object. Créala ahora:
   ```bash
   $ echo "export class SearchPage {}" > pages/SearchPage.ts
   ```
3. Usa `--amend` para incluirla en el **mismo** commit sin crear uno nuevo:
   ```bash
   $ git add pages/SearchPage.ts
   $ git commit --amend --no-edit
   ```
4. Verifica:
   ```bash
   $ git log --oneline -1 --stat
   ```

**✅ Resultado esperado:** el último commit ahora incluye **2 archivos** (`tests/search.spec.ts` y `pages/SearchPage.ts`). Solo existe **un** commit para este cambio, no dos.

---

## Reto 3.2 — Sacar un archivo del staging

1. Crea un archivo `.env` con un "secreto":
   ```bash
   $ echo "DB_PASSWORD=very-secret" > .env
   ```
2. Agrégalo al staging **a propósito** (para el ejercicio):
   ```bash
   $ git add -f .env    # -f fuerza aunque esté en .gitignore
   $ git status
   ```
3. Dándote cuenta del error, sácalo del staging sin borrarlo del disco:
   ```bash
   $ git restore --staged .env
   $ git status
   ```

**✅ Resultado esperado:** `.env` ya NO aparece en "Changes to be committed". Si sigue en "Untracked files" o ya no aparece (porque lo tienes en `.gitignore`), es correcto. El archivo sigue en tu disco con su contenido.

---

## Reto 3.3 — Descartar cambios locales

1. Modifica `tests/login.spec.ts` agregando cualquier línea (p. ej. `// TODO: fix`).
2. Ve el diff para confirmar:
   ```bash
   $ git diff tests/login.spec.ts
   ```
3. Descarta los cambios y vuelve al último commit:
   ```bash
   $ git restore tests/login.spec.ts
   $ git diff tests/login.spec.ts
   ```

**✅ Resultado esperado:** el segundo `git diff` no muestra nada (archivo idéntico al último commit).

---

## Reto 3.4 — `reset --soft`: deshacer commits pero conservar los cambios

1. Crea rápidamente dos commits "malos":
   ```bash
   $ echo "// bad test 1" >> tests/bad1.spec.ts
   $ git add tests/bad1.spec.ts
   $ git commit -m "WIP bad commit 1"

   $ echo "// bad test 2" >> tests/bad2.spec.ts
   $ git add tests/bad2.spec.ts
   $ git commit -m "WIP bad commit 2"
   ```
2. Mira el log:
   ```bash
   $ git log --oneline -3
   ```
3. Deshaz los **dos** últimos commits pero mantén los archivos en staging:
   ```bash
   $ git reset --soft HEAD~2
   $ git log --oneline -3
   $ git status
   ```
4. Ahora crea un único commit bien hecho:
   ```bash
   $ git commit -m "test: scaffold bad1 and bad2 placeholder tests"
   ```

**✅ Resultado esperado:** donde antes había 2 commits "WIP", ahora hay un solo commit limpio que contiene los mismos archivos. Este patrón se llama **"squash manual"**.

---

## Reto 3.5 — `reset --hard` y rescate con `reflog`

> ⚠️ **Este reto te enseña a recuperarte de `reset --hard`.** Hazlo SOLO en el sandbox.

1. Crea un test importante y commitealo:
   ```bash
   $ echo "test('critical flow', () => {});" > tests/critical.spec.ts
   $ git add tests/critical.spec.ts
   $ git commit -m "test: add critical flow"
   ```
2. "Accidentalmente" borra el último commit Y sus archivos:
   ```bash
   $ git reset --hard HEAD~1
   $ ls tests/critical.spec.ts
   # ls: no such file
   ```
3. Rescátalo con `reflog`:
   ```bash
   $ git reflog
   ```
   Busca la línea `HEAD@{1}` que dice `commit: test: add critical flow` y copia su hash (7 caracteres al inicio).
4. Vuelve a ese commit:
   ```bash
   $ git reset --hard <hash>
   $ ls tests/critical.spec.ts
   ```

**✅ Resultado esperado:** el archivo `tests/critical.spec.ts` vuelve a existir y el commit aparece de nuevo en `git log`.

---

## Reto 3.6 — `git revert` en repo compartido (simulación)

Imagina que el commit `test: add bad flaky test` ya fue pusheado al remoto, así que NO puedes usar `reset`.

1. Crea un commit "malo":
   ```bash
   $ echo "test('flaky', () => { /* siempre falla */ });" > tests/flaky.spec.ts
   $ git add tests/flaky.spec.ts
   $ git commit -m "test: add bad flaky test"
   ```
2. Obtén el hash:
   ```bash
   $ git log --oneline -1
   ```
3. Reviértelo (se abrirá un editor; guarda y cierra sin modificar nada):
   ```bash
   $ git revert <hash>
   ```
4. Verifica:
   ```bash
   $ git log --oneline -3
   $ ls tests/flaky.spec.ts
   ```

**✅ Resultado esperado:** ahora hay **2** commits: el original `test: add bad flaky test` Y un nuevo commit `Revert "test: add bad flaky test"`. El archivo `tests/flaky.spec.ts` ya NO existe en el working directory. Ambos commits conviven en el historial — esto es exactamente lo que quieres en un repo compartido.

---

## Reto 3.7 — Conectar un remoto (sin subir todavía)

Para este reto **no necesitas** crear el repo en GitHub todavía (eso lo haremos en el Módulo 6). Solo practicaremos la configuración local del remoto.

1. Agrega un remoto ficticio:
   ```bash
   $ git remote add origin https://github.com/tu-usuario/qa-playwright-demo.git
   ```
2. Lista los remotos:
   ```bash
   $ git remote -v
   ```
3. Renómbralo a `github`:
   ```bash
   $ git remote rename origin github
   $ git remote -v
   ```
4. Elimínalo:
   ```bash
   $ git remote remove github
   $ git remote -v
   ```

**✅ Resultado esperado:** cada comando muestra el estado actualizado. Al final, `git remote -v` no imprime nada.

---

## Reto 3.8 — Crear tags

1. Crea un tag lightweight sobre el commit actual:
   ```bash
   $ git tag v0.1.0-draft
   ```
2. Crea un tag annotated (esto es lo que SÍ se usa en producción):
   ```bash
   $ git tag -a v1.0.0 -m "Release v1.0.0: primer framework estable con 5 tests"
   ```
3. Lista los tags:
   ```bash
   $ git tag
   ```
4. Ver información completa del tag annotated:
   ```bash
   $ git show v1.0.0
   ```
5. Borra el tag lightweight (no lo queremos):
   ```bash
   $ git tag -d v0.1.0-draft
   ```

**✅ Resultado esperado:** al final queda **únicamente** el tag `v1.0.0` y `git show v1.0.0` muestra tu nombre como tagger, fecha y el mensaje completo.

---

## Reto 3.9 — Taggear un commit antiguo

1. Mira tu historial:
   ```bash
   $ git log --oneline
   ```
2. Elige el commit donde creaste el framework inicial (probablemente el `chore: initial framework skeleton` del Módulo 2) y taggealo como `v0.1.0`:
   ```bash
   $ git tag -a v0.1.0 <hash> -m "Release v0.1.0: framework skeleton"
   ```
3. Lista tus tags ordenados:
   ```bash
   $ git tag --sort=v:refname
   ```

**✅ Resultado esperado:**
```
v0.1.0
v1.0.0
```

---

## Reto 3.10 — Configurar 5 aliases imprescindibles

Configura estos aliases globalmente:

```bash
$ git config --global alias.st status
$ git config --global alias.co checkout
$ git config --global alias.br branch
$ git config --global alias.ci commit
$ git config --global alias.lg "log --oneline --graph --all --decorate"
```

Luego pruébalos:

```bash
$ git st
$ git lg
$ git br
```

**Bonus:** crea un alias propio llamado `tests-changed` que liste los archivos de tests que han cambiado desde el último commit:

```bash
$ git config --global alias.tests-changed "diff --name-only HEAD -- tests/"
```

Pruébalo modificando un test primero:

```bash
$ echo "// change" >> tests/login.spec.ts
$ git tests-changed
```

**✅ Resultado esperado:** `git tests-changed` imprime `tests/login.spec.ts`.

---

## Reto 3.11 — Reto en equipo: la hotfix urgente

> Escenario: hoy viernes, 5pm. Tu compañero Juan mergeó un commit que rompe **todos** los tests de regresión. Ya está en el remoto. El equipo lo usa.

**Responde (sin ejecutar):**

1. ¿Qué comando usarías para identificar el hash del commit "malo"?
2. ¿Puedes usar `git reset --hard` para quitarlo? ¿Por qué sí o por qué no?
3. ¿Cuál es el comando correcto para deshacerlo de forma segura?
4. Después de aplicar la solución, ¿qué tienes que hacer para que el resto del equipo se beneficie del arreglo?

**✅ Resultado esperado:**

1. `git log --oneline` y buscar el commit de Juan por mensaje, o `git log --author="Juan"`.
2. **No.** `reset --hard` reescribe el historial. Como Juan ya pusheó y otros ya tienen el commit, reescribir el historial causaría conflictos severos al resto del equipo.
3. `git revert <hash-de-juan>`. Esto crea un nuevo commit que anula el malo sin borrar la historia.
4. `git push origin main` para subir el commit de revert al remoto.

---

## ✅ Checklist de salida del Módulo 3

- [ ] Sé corregir el último commit local con `--amend` sin crear un commit duplicado.
- [ ] Sé sacar un archivo del staging con `git restore --staged`.
- [ ] Sé descartar cambios locales con `git restore`.
- [ ] Entiendo la diferencia entre `reset --soft`, `--mixed` y `--hard`.
- [ ] Sé cuándo usar `revert` en vez de `reset`.
- [ ] Sé que `reflog` puede rescatarme de un `reset --hard`.
- [ ] Sé agregar, listar, renombrar y quitar remotos.
- [ ] Sé crear tags annotated (`-a`) y subirlos con `push --tags`.
- [ ] Tengo al menos 5 aliases configurados.

Si marcaste todo ✅, pasa al [Módulo 4: Ramas y Merge](../modulo-04-ramas-y-merge/).
