# Reto - Módulo 5: Workflows y Rebase

Objetivo: practicar rebase (básico e interactivo) y entender cómo se organiza un equipo de automatización con un workflow trunk-based.

> ⚠️ **Importante:** todos estos retos se hacen en tu repo sandbox **local**. No pushees nada a un remoto real hasta el Módulo 6.

---

## Reto 5.1 — Rebase lineal básico

Setup: simula que estás trabajando en una feature mientras `main` avanza.

1. Asegúrate de estar en `main` con algo de historia:
   ```bash
   $ git switch main
   $ git log --oneline -3
   ```
2. Crea la feature branch:
   ```bash
   $ git switch -c feature/api-helper
   $ echo "export class ApiClient {}" > pages/ApiClient.ts
   $ git add pages/ApiClient.ts
   $ git commit -m "test: add ApiClient scaffold"
   ```
3. Simula que `main` avanzó (otros mergearon cosas):
   ```bash
   $ git switch main
   $ echo "# Notes" > NOTES.md
   $ git add NOTES.md
   $ git commit -m "docs: add notes file"
   $ echo "more" >> NOTES.md
   $ git add NOTES.md
   $ git commit -m "docs: extend notes file"
   ```
4. Mira el gráfico antes del rebase:
   ```bash
   $ git log --oneline --graph --all -10
   ```
   Debes ver que `feature/api-helper` y `main` divergieron.
5. Haz el rebase:
   ```bash
   $ git switch feature/api-helper
   $ git rebase main
   ```
6. Mira el gráfico después:
   ```bash
   $ git log --oneline --graph --all -10
   ```

**✅ Resultado esperado:** tu commit `test: add ApiClient scaffold` ahora aparece **después** de los 2 commits de notas. El historial es lineal.

---

## Reto 5.2 — Fast-forward merge después del rebase

Después del reto 5.1, tu feature branch está lista para un merge limpio.

1. Cambia a main:
   ```bash
   $ git switch main
   ```
2. Mergea:
   ```bash
   $ git merge feature/api-helper
   ```

**✅ Resultado esperado:** el mensaje dice `Fast-forward`. No se crea un merge commit. El historial de main es totalmente lineal:

```bash
$ git log --oneline -5
* (HEAD -> main) test: add ApiClient scaffold
* docs: extend notes file
* docs: add notes file
* ...
```

Compara este historial con el del Módulo 4 cuando usabas `--no-ff`: este es más corto y más lineal, aquel preservaba las bifurcaciones.

---

## Reto 5.3 — Rebase con conflicto

1. Crea una nueva feature branch:
   ```bash
   $ git switch main
   $ git switch -c feature/update-notes
   $ echo "# Updated Notes from feature" > NOTES.md
   $ git add NOTES.md
   $ git commit -m "docs: rewrite notes from feature branch"
   ```
2. Simula que main también cambió NOTES.md:
   ```bash
   $ git switch main
   $ echo "# Updated Notes from main" > NOTES.md
   $ git add NOTES.md
   $ git commit -m "docs: rewrite notes from main branch"
   ```
3. Intenta rebasear la feature:
   ```bash
   $ git switch feature/update-notes
   $ git rebase main
   ```

**✅ Resultado esperado:** Git detecta un conflicto:
```
CONFLICT (content): Merge conflict in NOTES.md
error: could not apply ... docs: rewrite notes from feature branch
```

4. Resuélvelo manualmente (abre `NOTES.md`, quita los marcadores, deja el contenido que prefieras).
5. Continúa el rebase:
   ```bash
   $ git add NOTES.md
   $ git rebase --continue
   ```
   Git puede abrirte el editor para confirmar el mensaje del commit — guarda y cierra.
6. Verifica:
   ```bash
   $ git log --oneline --graph --all -5
   ```

**✅ Resultado esperado:** el rebase terminó exitosamente y la rama `feature/update-notes` tiene su commit aplicado encima del último commit de `main`.

---

## Reto 5.4 — Abortar un rebase

1. Crea una rama conflictiva a propósito:
   ```bash
   $ git switch main
   $ git switch -c feature/bad-rebase
   $ echo "totalmente diferente" > NOTES.md
   $ git add NOTES.md
   $ git commit -m "docs: replace notes with junk"
   ```
2. Vuelve a main y agrega cambios:
   ```bash
   $ git switch main
   $ echo "diferente en main" > NOTES.md
   $ git add NOTES.md
   $ git commit -m "docs: another main change"
   ```
3. Intenta rebasear:
   ```bash
   $ git switch feature/bad-rebase
   $ git rebase main
   ```
4. Cuando aparezca el conflicto, en vez de resolverlo, **aborta**:
   ```bash
   $ git rebase --abort
   ```
5. Verifica:
   ```bash
   $ cat NOTES.md
   $ git log --oneline -3
   ```

**✅ Resultado esperado:** `NOTES.md` vuelve a tener `totalmente diferente` (el contenido de tu feature antes del rebase). El historial de tu rama no fue modificado.

---

## Reto 5.5 — Rebase interactivo: `squash` de commits WIP

Este reto es el **más importante** del módulo. Vas a aprender a limpiar commits desordenados antes de abrir un PR.

1. Crea una feature branch y simula un día de trabajo "desordenado":
   ```bash
   $ git switch main
   $ git switch -c feature/add-search-tests
   $ echo "test 1" > tests/search.spec.ts
   $ git add tests/search.spec.ts
   $ git commit -m "WIP first attempt"

   $ echo "test 2" >> tests/search.spec.ts
   $ git add tests/search.spec.ts
   $ git commit -m "try again"

   $ echo "test 3" >> tests/search.spec.ts
   $ git add tests/search.spec.ts
   $ git commit -m "fix typo"

   $ echo "test 4" >> tests/search.spec.ts
   $ git add tests/search.spec.ts
   $ git commit -m "finally works"
   ```
2. Mira el historial desordenado:
   ```bash
   $ git log --oneline -5
   ```
3. Inicia el rebase interactivo de los últimos 4 commits:
   ```bash
   $ git rebase -i HEAD~4
   ```
4. En el editor que se abre, cambia los últimos 3 `pick` por `squash` (o `s`):
   ```
   pick <hash> WIP first attempt
   squash <hash> try again
   squash <hash> fix typo
   squash <hash> finally works
   ```
5. Guarda y cierra el editor.
6. Se abre un segundo editor donde combinar mensajes. Borra todo y escribe un mensaje limpio:
   ```
   test: add search scenarios with edge cases
   ```
7. Guarda y cierra.
8. Verifica:
   ```bash
   $ git log --oneline -3
   ```

**✅ Resultado esperado:** donde había 4 commits "WIP", ahora hay **un solo commit** con el mensaje limpio. Tu PR se verá mucho más profesional.

---

## Reto 5.6 — Rebase interactivo: `reword`, `drop`, reordenar

1. Crea 3 commits en una rama:
   ```bash
   $ git switch main
   $ git switch -c feature/multi-commit
   $ echo "a" > a.txt && git add a.txt && git commit -m "test: add A"
   $ echo "b" > b.txt && git add b.txt && git commit -m "agregar B con typo"
   $ echo "c" > c.txt && git add c.txt && git commit -m "test: add C"
   ```
2. Abre el rebase interactivo:
   ```bash
   $ git rebase -i HEAD~3
   ```
3. En el editor:
   - Cambia `pick` del commit B por `reword` (vas a arreglar el mensaje).
   - Reordena las líneas para que quede `test: add C` antes que B.
4. Guarda y cierra. Git te abrirá el editor del mensaje de B; cámbialo a `test: add B`. Guarda y cierra.
5. Verifica:
   ```bash
   $ git log --oneline -4
   ```

**✅ Resultado esperado:**
```
<hash> test: add B
<hash> test: add C
<hash> test: add A
<hash> ... (commit anterior de main)
```

---

## Reto 5.7 — `drop`: eliminar un commit

1. Crea una rama con un commit "malo" en medio:
   ```bash
   $ git switch main
   $ git switch -c feature/with-bad-commit
   $ echo "good1" > good1.txt && git add good1.txt && git commit -m "test: add good1"
   $ echo "BAD" > bad.txt && git add bad.txt && git commit -m "test: BAD commit to remove"
   $ echo "good2" > good2.txt && git add good2.txt && git commit -m "test: add good2"
   ```
2. Elimina el commit malo con rebase interactivo:
   ```bash
   $ git rebase -i HEAD~3
   ```
   Cambia el `pick` del commit BAD por `drop` (o `d`), o simplemente **borra la línea**.
3. Guarda y cierra.
4. Verifica:
   ```bash
   $ git log --oneline -3
   $ ls bad.txt
   ```

**✅ Resultado esperado:** el commit BAD ya no existe y `bad.txt` no está en el working directory. Solo quedan `good1.txt` y `good2.txt`.

---

## Reto 5.8 — `pull --rebase`

1. Simula un remoto local para este ejercicio (un repo "bare" en otra carpeta):
   ```bash
   $ git clone --bare ~/sandbox/qa-playwright-demo ~/sandbox/fake-remote.git
   $ git remote add fake ~/sandbox/fake-remote.git
   $ git push fake main
   ```
2. Simula que alguien más pusheó a `main`:
   ```bash
   $ git clone ~/sandbox/fake-remote.git ~/sandbox/otra-copia
   $ cd ~/sandbox/otra-copia
   $ echo "cambio remoto" >> NOTES.md
   $ git add NOTES.md
   $ git commit -m "docs: remote change"
   $ git push origin main
   $ cd ~/sandbox/qa-playwright-demo
   ```
3. En tu copia, haz un commit local antes de pullear:
   ```bash
   $ echo "cambio local" > local.txt
   $ git add local.txt
   $ git commit -m "test: add local file"
   ```
4. Trae los cambios del remoto con `--rebase`:
   ```bash
   $ git pull --rebase fake main
   ```
5. Mira el historial:
   ```bash
   $ git log --oneline --graph -5
   ```

**✅ Resultado esperado:** tu commit local aparece **después** del commit remoto, como si hubieras trabajado desde el último estado del remoto. No hay merge commit. El historial es lineal.

> 💡 Si no quieres ensuciar tu filesystem con repos fake, este reto es **opcional**. Lo importante es que entiendas el flujo conceptualmente.

---

## Reto 5.9 — Preguntas teóricas

Responde sin ejecutar comandos:

1. ¿Por qué NUNCA debes rebasear commits que ya pusheaste a un remoto compartido?
2. ¿Cuál es la diferencia entre `squash` y `fixup` en un rebase interactivo?
3. Si haces `git pull --rebase` y hay conflicto, ¿cuál es la secuencia correcta para resolverlo?
4. ¿Qué workflow (trunk-based, gitflow, integration-manager) recomendarías para un equipo de 5 automatizadores que deployan tests diariamente? ¿Por qué?
5. Tu compañero hizo `git push --force` sobre `main` después de rebasearlo. ¿Qué debe hacer el resto del equipo?

**✅ Resultado esperado:**

1. Porque `rebase` reescribe el historial creando commits con hashes nuevos. Si otros ya descargaron los commits originales, su repo local apuntará a commits "fantasma" y el próximo pull será un caos de merges y conflictos innecesarios.
2. `squash` combina el commit con el anterior **y pregunta qué mensaje usar** (abre editor). `fixup` hace lo mismo pero **descarta silenciosamente** el mensaje del commit combinado.
3. (a) resolver los conflictos en los archivos, (b) `git add <archivos>`, (c) `git rebase --continue`. (NO uses `git commit` — el rebase maneja el commit por ti).
4. Trunk-based con topic branches y PRs. Porque es ligero, se integra bien con GitHub, evita ramas zombie, y el historial de `main` es el estado real del framework en cada momento. Gitflow sería overkill; integration-manager solo aplica a open source.
5. Lo ideal: hacer `git fetch origin && git reset --hard origin/main` para descartar los commits antiguos y reescribir sus ramas locales basándose en el nuevo main. PERO — este escenario es doloroso y por eso la regla es: **no hagas force push sobre ramas compartidas sin avisar al equipo primero**.

---

## ✅ Checklist de salida del Módulo 5

- [ ] Sé hacer un rebase lineal de una feature branch sobre `main`.
- [ ] Sé resolver conflictos durante un rebase (`--continue`) y abortarlo (`--abort`).
- [ ] Sé hacer rebase interactivo para `squash`, `reword`, `drop` y reordenar commits.
- [ ] Puedo limpiar 4 commits "WIP" en 1 commit limpio antes de abrir un PR.
- [ ] Entiendo la regla de oro: no rebasear commits ya pusheados.
- [ ] Sé explicar cuándo usar merge vs rebase.
- [ ] Conozco los 3 workflows principales y sé cuál recomienda el curso para un equipo de QA.

Si marcaste todo ✅, pasa al [Módulo 6: GitHub](../modulo-06-github/).
