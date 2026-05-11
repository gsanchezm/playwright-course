# 3. Tags: marcar versiones oficiales del framework

Un **tag** es una etiqueta permanente sobre un commit específico. Se usa para marcar **versiones oficiales** del framework de automatización. Por ejemplo: "este es el estado de los tests que validamos junto con el release v2.3 de la app".

## 3.1 Dos tipos de tags

| Tipo | Comando | Incluye |
|------|---------|---------|
| Lightweight | `git tag v1.0.0` | Solo el hash del commit (como un bookmark). |
| Annotated | `git tag -a v1.0.0 -m "..."` | Hash + autor + fecha + mensaje + puede ser firmado con GPG. |

**Regla:** para versiones oficiales del framework usa **siempre annotated** (`-a`).

## 3.2 Crear un tag annotated

```bash
$ git tag -a v1.0.0 -m "Release v1.0.0: stable framework with 80 tests covering checkout flow"
$ git tag
v1.0.0

$ git show v1.0.0
tag v1.0.0
Tagger: Gilberto Sánchez <gil@empresa.com>
Date:   Mon Apr 07 14:00:00 2025 -0600

Release v1.0.0: stable framework with 80 tests covering checkout flow

commit 7f8e9d0a1b2c3d
Author: Gilberto Sánchez <gil@empresa.com>
Date:   Mon Apr 07 13:50:00 2025 -0600

    chore: bump version to 1.0.0
```

## 3.3 Tag sobre un commit antiguo

¿Y si olvidaste taggear en el momento y quieres etiquetar retroactivamente?

```bash
$ git log --oneline
7f8e9d0 (HEAD -> main) chore: bump version to 1.0.0
a1b2c3d fix: stabilize checkout test
2b4c5d6 test: add cart flow

$ git tag -a v0.9.0 2b4c5d6 -m "Release candidate v0.9.0"
```

## 3.4 Subir tags al remoto

Los tags **NO se suben automáticamente con `git push`**. Tienes que empujarlos explícitamente:

```bash
$ git push origin v1.0.0         # un solo tag
$ git push origin --tags         # todos los tags
```

## 3.5 Borrar tags

```bash
$ git tag -d v1.0.0                    # local
$ git push origin --delete v1.0.0      # remoto
```

## 3.6 Caso de uso real: versionar tu framework junto al release de la app

```bash
# La app acaba de liberar v2.3.0. Los tests que tengo ahora
# cubren ese release y están verdes en CI.
$ git tag -a test-suite-v2.3.0 -m "Test suite validated against app v2.3.0"
$ git push origin test-suite-v2.3.0
```

Ahora, si meses después alguien del equipo dice "necesito reproducir qué tests teníamos cuando salió v2.3.0", basta con:

```bash
$ git checkout test-suite-v2.3.0
```
