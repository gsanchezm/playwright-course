# 6. Gestión de ramas

## 6.1 Ver en qué commit está cada rama

```bash
$ git branch -v
  feature/mobile-tests  a1b2c3d test: add mobile checkout
* main                  7f8e9d0 Merge branch 'feature/login'
  fix/flaky-checkout    2b4c5d6 fix: stabilize waitForNetworkIdle
```

## 6.2 Ver ramas ya mergeadas y sin mergear

```bash
$ git branch --merged       # ramas seguras para borrar
  feature/mobile-tests
* main

$ git branch --no-merged    # ramas con trabajo pendiente
  fix/flaky-checkout
  feature/api-helper
```

**Caso de uso real:** cada viernes, limpia ramas locales ya mergeadas:

```bash
$ git branch --merged | grep -v "^\*\|main" | xargs -n 1 git branch -d
```

## 6.3 Renombrar una rama mal nombrada

```bash
$ git branch -m feature/login feature/update-login-selectors
```
