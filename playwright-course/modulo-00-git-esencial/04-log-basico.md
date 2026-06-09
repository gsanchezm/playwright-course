# 4. `git log` — leer la historia de la suite

`git log` es tu **bitácora del equipo**: te dice qué cambió, quién lo cambió y cuándo. En un repo de tests, esto es el primer recurso cuando alguien pregunta "¿desde cuándo está roto este test?".

## 4.1 Lo mínimo que debes saber

**4.1.1 — Ver el historial completo**
- **Qué hago:** `git log`
- **Por qué:** es la vista detallada de la bitácora — cada commit con su hash completo, autor, fecha y mensaje. La usas cuando necesitas el contexto completo de un cambio (no solo el título).
- **Cómo verifico:** se abre un pager con un bloque por commit como este:

```bash
$ git log
commit a1b2c3d4e5f67890abcdef1234567890abcdef12 (HEAD -> main)
Author: Tu Nombre <tu@correo.com>
Date:   Tue May 5 10:24:13 2026 -0600

    test: add user profile happy path

commit 7f8e9d01234567890abcdef1234567890abcdef
Author: Ana Pérez <ana@miempresa.com>
Date:   Mon May 4 18:02:55 2026 -0600

    fix: stabilize checkout test — wait for network idle
```

Cada commit muestra:
- **Hash** (`a1b2c3d…`) — identificador único.
- **Autor** y **fecha**.
- **Mensaje** que pusiste con `-m`.

> Sal del log con `q`. Avanza con `↓` o `Espacio`.

### ¿Qué es un hash y para qué sirve?

El hash (`a1b2c3d4e5f6...`) es una cadena de **40 caracteres hexadecimales** que Git genera para cada commit. Es **único e irrepetible** — equivale a la huella dactilar de ese commit.

> 💡 **Analogía QA:** es el **ID de un ticket de Jira** (`QA-1234`). Cuando alguien te dice *"el bug que vimos en QA-1234"*, no necesita repetir el contexto — el ID apunta exactamente a ese ticket. En Git, cuando alguien te dice *"revierte el commit `a1b2c3d`"*, está señalando con precisión esa foto del proyecto.

En la práctica casi siempre usas los **primeros 7 caracteres** (`a1b2c3d`); Git los reconoce mientras sean únicos en el repo.

### Cómo leer `(HEAD -> main)`

```
commit a1b2c3d4...  (HEAD -> main)
```

- **`HEAD`** = "donde estás parado ahora". Es un puntero móvil que apunta al commit que estás viendo.
- **`main`** = el nombre de tu rama (puntero a un commit).
- **`HEAD -> main`** se lee: *"HEAD está apuntando a main, y main está en este commit"*. O sea, estás trabajando en `main` y el último commit de `main` es este.

> 🎯 **En breve:** `HEAD` es como el cursor de tu editor — siempre marca dónde estás trabajando. `main` es el nombre de la rama. Cuando ambos coinciden en el mismo commit, lees `(HEAD -> main)`.

## 4.2 Versión compacta — la que más vas a usar

**4.2.1 — Ver el historial en una línea por commit**
- **Qué hago:** `git log --oneline`
- **Por qué:** es la vista que usarás el 90% del tiempo: hash corto + mensaje, sin ruido. Perfecta para revisar rápido qué se hizo esta semana o confirmar tu último commit.
- **Cómo verifico:** una línea por commit, el más reciente arriba:

```bash
$ git log --oneline
a1b2c3d (HEAD -> main) test: add user profile happy path
7f8e9d0 fix: stabilize checkout test — wait for network idle
3e4f5a6 chore: initial framework
```

## 4.3 Ver qué cambió en un commit específico

**4.3.1 — Ver el diff de cada commit que tocó un archivo**
- **Qué hago:** `git log -p tests/checkout.spec.ts`
- **Por qué:** `-p` añade el **diff** (las líneas `-`/`+` de la lección 2) de cada commit que tocó ese archivo, con autor y fecha. Es la pieza que cierra la pregunta de QA: "¿**quién** cambió este selector, **cuándo** y **a qué**?".
- **Cómo verifico:** por cada commit verás su encabezado (hash/autor/fecha) seguido del diff de ese archivo. Sal del pager con `q`.

## 4.4 Otras variantes que vas a querer cuando duela

```bash
$ git log --oneline -10                 # los últimos 10 commits
$ git log --author="Ana"                # commits de Ana
$ git log --since="1 week ago"          # esta semana
$ git log --grep="checkout"             # commits cuyo mensaje contiene "checkout"
$ git log --oneline --graph --all       # ver ramas como árbol
```

> 💡 **Tip del automatizador:** cuando un test empieza a fallar de la nada, `git log --oneline -- tests/ese-test.spec.ts` te dice los últimos commits que lo tocaron. Ahí suele estar la causa.

---

> 📚 **Profundización opcional:** [Filtros avanzados de `git log`](../../git-github-course/modulo-02-git-basico/03-historial-log.md)
