# 2. Crear, cambiar y listar ramas

## 2.1 Listar ramas

```bash
$ git branch
* main
  feature/mobile-tests
  fix/flaky-login
```

El asterisco `*` indica en qué rama estás actualmente.

**Variantes útiles:**

```bash
$ git branch -v         # con el último commit de cada rama
$ git branch -a         # incluir ramas remotas
$ git branch --merged   # ramas ya mergeadas a la actual
$ git branch --no-merged # ramas con trabajo pendiente
```

## 2.2 Crear una rama

```bash
$ git branch feature/mobile-tests
```

Esto crea la rama pero **NO te cambia a ella**. Sigues en `main`.

## 2.3 Cambiar de rama

```bash
$ git checkout feature/mobile-tests
# o el equivalente moderno (Git 2.23+):
$ git switch feature/mobile-tests
```

## 2.4 Crear Y cambiar en un solo paso (lo más común)

```bash
$ git checkout -b feature/mobile-tests
# o equivalente moderno:
$ git switch -c feature/mobile-tests
```

> 💡 **Usa `switch` cuando puedas.** `checkout` hace demasiadas cosas distintas (cambiar ramas, descartar archivos, restaurar archivos) y es fácil confundirse. `switch` solo cambia ramas.

## 2.5 Borrar ramas

```bash
$ git branch -d feature/mobile-tests   # seguro: solo borra si ya está mergeada
$ git branch -D feature/mobile-tests   # forzado: borra sin importar nada ⚠️
```

## 2.6 Renombrar una rama

```bash
$ git branch -m nombre-nuevo             # renombra la rama actual
$ git branch -m vieja nueva              # renombra otra rama
```
