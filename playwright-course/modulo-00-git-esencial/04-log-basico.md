# 4. `git log` — leer la historia de la suite

`git log` es tu **bitácora del equipo**: te dice qué cambió, quién lo cambió y cuándo. En un repo de tests, esto es el primer recurso cuando alguien pregunta "¿desde cuándo está roto este test?".

## 4.1 Lo mínimo que debes saber

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

## 4.2 Versión compacta — la que más vas a usar

```bash
$ git log --oneline
a1b2c3d (HEAD -> main) test: add user profile happy path
7f8e9d0 fix: stabilize checkout test — wait for network idle
3e4f5a6 chore: initial framework
```

Una línea por commit. Perfecto para revisar rápido qué se hizo esta semana.

## 4.3 Ver qué cambió en un commit específico

```bash
$ git log -p tests/checkout.spec.ts
```

`-p` agrega el **diff** de cada commit que tocó ese archivo. Útil para responder "¿quién cambió este selector y por qué?".

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
