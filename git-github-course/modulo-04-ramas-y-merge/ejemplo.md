# Módulo 4: Ramas y Merge — Trabajando en paralelo con el equipo

> **Escenario del instructor:** Tu equipo de 4 automatizadores necesita trabajar en paralelo: tú estás escribiendo tests de mobile, Ana está agregando nuevos Page Objects, Luis está arreglando tests flaky, y Carla está actualizando la config de CI. Si todos trabajan sobre `main` se van a pisar. La solución: **ramas**.

---

## 1. Ramas en pocas palabras

Una **rama (branch)** es una línea de desarrollo independiente. Técnicamente es solo un "puntero móvil" a un commit. Cuando haces un commit nuevo en una rama, el puntero avanza automáticamente.

```
         main → C1 ── C2 ── C3
```

Si creas una rama `feature/mobile-tests` a partir de `main` y haces un commit:

```
         main            → C3
                          \
         feature/mobile-tests → C4
```

Ambas ramas comparten la historia C1 → C2 → C3, pero ahora divergen. Esto permite que tú trabajes en `feature/mobile-tests` sin afectar a `main`.

### ¿Por qué son baratas las ramas en Git?

Porque son **solo un archivo de 41 bytes** con el hash del commit al que apuntan. Crear una rama es instantáneo (literalmente milisegundos), a diferencia de otros VCS donde una rama era una copia completa de archivos.

**Moraleja:** crea ramas sin miedo. Una por feature, una por bugfix, una por experimento. Es la filosofía de Git.

---

## 2. Crear, cambiar y listar ramas

### 2.1 Listar ramas

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

### 2.2 Crear una rama

```bash
$ git branch feature/mobile-tests
```

Esto crea la rama pero **NO te cambia a ella**. Sigues en `main`.

### 2.3 Cambiar de rama

```bash
$ git checkout feature/mobile-tests
# o el equivalente moderno (Git 2.23+):
$ git switch feature/mobile-tests
```

### 2.4 Crear Y cambiar en un solo paso (lo más común)

```bash
$ git checkout -b feature/mobile-tests
# o equivalente moderno:
$ git switch -c feature/mobile-tests
```

> 💡 **Usa `switch` cuando puedas.** `checkout` hace demasiadas cosas distintas (cambiar ramas, descartar archivos, restaurar archivos) y es fácil confundirse. `switch` solo cambia ramas.

### 2.5 Borrar ramas

```bash
$ git branch -d feature/mobile-tests   # seguro: solo borra si ya está mergeada
$ git branch -D feature/mobile-tests   # forzado: borra sin importar nada ⚠️
```

### 2.6 Renombrar una rama

```bash
$ git branch -m nombre-nuevo             # renombra la rama actual
$ git branch -m vieja nueva              # renombra otra rama
```

---

## 3. Flujo básico: feature branch

Este es el flujo que usarás **todos los días** en un equipo de automatización:

```bash
# 1. Asegúrate de estar al día con main
$ git switch main
$ git pull origin main

# 2. Crea tu rama de feature con un nombre descriptivo
$ git switch -c feature/add-mobile-checkout-tests

# 3. Trabaja: edita, agrega, commitea
$ # ...editas tests/checkout.mobile.spec.ts...
$ git add tests/checkout.mobile.spec.ts
$ git commit -m "test: add mobile checkout happy path"

$ # ...editas pages/MobileCheckoutPage.ts...
$ git add pages/MobileCheckoutPage.ts
$ git commit -m "test: add MobileCheckoutPage POM"

# 4. Vuelve a main y mergea tu feature
$ git switch main
$ git merge feature/add-mobile-checkout-tests

# 5. Borra la rama ya mergeada
$ git branch -d feature/add-mobile-checkout-tests
```

### Convenciones de nombres de ramas

Un buen nombre de rama sigue el patrón `<tipo>/<descripción-corta>`:

| Prefijo | Uso |
|---------|-----|
| `feature/` | Nuevo test, nueva Page Object, nueva capacidad del framework |
| `fix/` | Arreglar un test flaky, un bug del framework |
| `chore/` | Mantenimiento: upgrade de dependencias, limpieza |
| `refactor/` | Reestructurar sin cambiar comportamiento |
| `ci/` | Cambios en el pipeline de CI/CD |
| `docs/` | Solo documentación |

Ejemplos buenos:
- `feature/add-api-login-helper`
- `fix/flaky-checkout-race-condition`
- `chore/upgrade-playwright-1.47`
- `ci/run-tests-on-pr`

❌ Ejemplos malos:
- `mi-rama`, `test`, `cambios`, `tmp`, `juan-sucursal`

---

## 4. Merge: unir ramas

Hay dos tipos de merge que verás constantemente:

### 4.1 Fast-forward merge

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

### 4.2 3-way merge (merge commit)

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

### 4.3 Forzar un merge commit incluso si podría ser fast-forward

A veces quieres **preservar** en el historial la información de "esto vino de una feature". Usa `--no-ff`:

```bash
$ git merge --no-ff feature/mobile-tests
```

Muchos equipos de automatización prefieren esto porque el historial queda más legible: sabes exactamente qué commits pertenecían a qué feature branch.

---

## 5. Conflictos de merge

Un **conflicto** ocurre cuando Git no puede decidir automáticamente cómo fusionar cambios porque **dos ramas modificaron las mismas líneas** del mismo archivo.

### 5.1 Ejemplo realista

Tú estás en `feature/update-login-selectors` y cambiaste `pages/LoginPage.ts`:

```typescript
export class LoginPage {
  usernameInput = '#email';   // antes era #username
  passwordInput = '#password';
}
```

Mientras tanto, Ana ya mergeó `feature/add-remember-me` a `main` con este cambio en el MISMO archivo:

```typescript
export class LoginPage {
  usernameInput = '#username';
  passwordInput = '#password';
  rememberMeCheckbox = '#remember'; // nueva línea
}
```

Cuando intentas mergear tu rama a `main`:

```bash
$ git switch main
$ git pull
$ git merge feature/update-login-selectors
Auto-merging pages/LoginPage.ts
CONFLICT (content): Merge conflict in pages/LoginPage.ts
Automatic merge failed; fix conflicts and then commit the result.
```

### 5.2 Ver qué archivos tienen conflicto

```bash
$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")

Unmerged paths:
        both modified:   pages/LoginPage.ts
```

### 5.3 El archivo con conflicto

Git inserta marcadores:

```typescript
export class LoginPage {
<<<<<<< HEAD
  usernameInput = '#username';
  passwordInput = '#password';
  rememberMeCheckbox = '#remember';
=======
  usernameInput = '#email';
  passwordInput = '#password';
>>>>>>> feature/update-login-selectors
}
```

- `<<<<<<< HEAD`: cambios en la rama actual (`main`).
- `=======`: separador.
- `>>>>>>> feature/update-login-selectors`: cambios de la rama que estás mergeando.

### 5.4 Resolver el conflicto

Abre el archivo en tu editor y **decide manualmente** qué se queda. Lo más común es combinar ambos cambios:

```typescript
export class LoginPage {
  usernameInput = '#email';
  passwordInput = '#password';
  rememberMeCheckbox = '#remember';
}
```

Elimina TODOS los marcadores (`<<<<<<<`, `=======`, `>>>>>>>`).

### 5.5 Terminar el merge

```bash
$ git add pages/LoginPage.ts
$ git status
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

$ git commit    # abre el editor con el mensaje de merge pre-escrito
```

### 5.6 Abortar un merge si te arrepientes

```bash
$ git merge --abort
```

Esto devuelve tu repo al estado anterior al merge, como si nunca hubiera pasado.

### 5.7 Herramientas visuales de merge

VS Code tiene un editor de conflictos muy bueno: al abrir un archivo con conflictos te muestra botones **Accept Current Change**, **Accept Incoming Change**, **Accept Both Changes**.

También existen herramientas externas:
```bash
$ git mergetool
```

---

## 6. Gestión de ramas

### 6.1 Ver en qué commit está cada rama

```bash
$ git branch -v
  feature/mobile-tests  a1b2c3d test: add mobile checkout
* main                  7f8e9d0 Merge branch 'feature/login'
  fix/flaky-checkout    2b4c5d6 fix: stabilize waitForNetworkIdle
```

### 6.2 Ver ramas ya mergeadas y sin mergear

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

### 6.3 Renombrar una rama mal nombrada

```bash
$ git branch -m feature/login feature/update-login-selectors
```

---

## 7. Resumen del módulo

- Una **rama** es un puntero móvil a un commit. Crearlas es gratis.
- **`switch`** es más seguro que `checkout` para solo cambiar de rama.
- El flujo diario: `switch main && pull && switch -c feature/... && trabajar && merge`.
- **Fast-forward merge:** cuando `main` no avanzó; Git solo mueve el puntero.
- **3-way merge:** cuando ambas ramas avanzaron; Git crea un merge commit con 2 padres.
- Los **conflictos** ocurren cuando dos ramas editan las mismas líneas. Hay que resolverlos a mano.
- Usa `--no-ff` si quieres preservar en el historial que los commits venían de una feature branch.
- Los nombres de rama siguen el patrón `<tipo>/<descripción-corta>`.

➡️ Ahora haz los ejercicios en [reto.md](./reto.md).
