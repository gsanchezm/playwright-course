# 3. Ver el historial de commits (`git log`)

Una vez que tienes varios commits, `git log` te muestra la historia completa.

## Versión completa (default)

```bash
$ git log
commit 7f3a1e8c9b (HEAD -> main)
Author: Gilberto Sánchez <gil@empresa.com>
Date:   Mon Apr 07 10:32:15 2025 -0600

    test: add checkout happy path

commit 2b8c4d6e
Author: María Pérez <maria@empresa.com>
Date:   Fri Apr 04 16:12:08 2025 -0600

    fix: stabilize login test

commit a1b2c3d
Author: Gilberto Sánchez <gil@empresa.com>
Date:   Fri Apr 04 09:00:00 2025 -0600

    test: add smoke test
```

## Las 5 variantes de `git log` que más usarás

**1. Una línea por commit (el favorito del día a día):**
```bash
$ git log --oneline
7f3a1e8 test: add checkout happy path
2b8c4d6 fix: stabilize login test
a1b2c3d test: add smoke test
```

**2. Árbol gráfico con ramas:**
```bash
$ git log --oneline --graph --all --decorate
* 7f3a1e8 (HEAD -> main) test: add checkout happy path
* 2b8c4d6 fix: stabilize login test
* a1b2c3d test: add smoke test
```

**3. Estadísticas de cambios:**
```bash
$ git log --stat
commit 7f3a1e8c9b
    test: add checkout happy path

 tests/checkout.spec.ts | 45 +++++++++++++++++++++++++++++++++++++++
 1 file changed, 45 insertions(+)
```

**4. Filtrar por autor:**
```bash
$ git log --author="María"
```

**5. Ver el contenido completo de cada cambio (`-p`):**
```bash
$ git log -p tests/login.spec.ts
```

**Combinando:**
```bash
$ git log --oneline --since="1 week ago" --author="Gilberto"
```
