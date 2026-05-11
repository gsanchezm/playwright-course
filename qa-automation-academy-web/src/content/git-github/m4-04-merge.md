# 4. Merge: unir ramas

Hay dos tipos de merge que verás constantemente:

## 4.1 Fast-forward merge

Cuando la rama destino (`main`) **no tiene commits nuevos** desde que creaste tu feature, Git simplemente "avanza el puntero". No crea un commit de merge.

```
Antes del merge:
  main → C1 ── C2
              \
               feature → C3 ── C4

Después de `git switch main && git merge feature`:
  main, feature → C1 ── C2 ── C3 ── C4
```

Salida:
```bash
$ git merge feature/mobile-tests
Updating 2b4c5d6..7f8e9d0
Fast-forward
 tests/checkout.mobile.spec.ts | 45 +++++++++++
 1 file changed, 45 insertions(+)
```

## 4.2 3-way merge (merge commit)

Cuando la rama destino **tiene commits nuevos** desde que creaste tu feature (porque alguien más ya mergeó otras cosas), Git no puede hacer fast-forward. Crea un **merge commit** que tiene 2 padres.

```
Antes:
  main → C1 ── C2 ── C5 (Ana mergeó su feature aquí)
              \
               feature → C3 ── C4

Después:
  main → C1 ── C2 ── C5 ── C6 (merge commit, 2 padres: C5 y C4)
              \             /
               feature → C3 ── C4
```

Salida:
```bash
$ git merge feature/mobile-tests
Merge made by the 'ort' strategy.
 tests/checkout.mobile.spec.ts | 45 +++++++++++
 1 file changed, 45 insertions(+)
```

Git abre tu editor para que confirmes el mensaje del merge commit. Guarda y cierra.

## 4.3 Forzar un merge commit incluso si podría ser fast-forward

A veces quieres **preservar** en el historial la información de "esto vino de una feature". Usa `--no-ff`:

```bash
$ git merge --no-ff feature/mobile-tests
```

Muchos equipos de automatización prefieren esto porque el historial queda más legible: sabes exactamente qué commits pertenecían a qué feature branch.
