# 4. Casos de uso reales del día a día

## Caso 1: Empezar el día de trabajo

```bash
$ cd qa-automation-framework
$ git status                      # ¿en qué estado dejé las cosas ayer?
$ git log --oneline -5            # ¿cuáles fueron los últimos 5 commits?
```

## Caso 2: Antes de irte a comer

```bash
$ git status                      # ¿qué tengo modificado?
$ git diff                        # ¿qué cambié exactamente?
$ git add tests/checkout.spec.ts
$ git commit -m "test: add checkout happy path"
```

## Caso 3: Revisar qué hizo tu compañera esta semana

```bash
$ git log --oneline --author="María" --since="1 week ago"
$ git log -p tests/login.spec.ts  # ver el contenido de sus cambios a un archivo
```

## Caso 4: Agregar un archivo y al mismo tiempo excluir otro

```bash
$ git status
modified: tests/login.spec.ts
modified: .env               # ❌ no quiero subir esto

$ echo ".env" >> .gitignore  # agregarlo al .gitignore para el futuro
$ git add tests/login.spec.ts
$ git add .gitignore
$ git commit -m "test: stabilize login; ignore .env"
```
