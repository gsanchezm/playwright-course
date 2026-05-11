# 5. Conflictos de merge

Un **conflicto** ocurre cuando Git no puede decidir automáticamente cómo fusionar cambios porque **dos ramas modificaron las mismas líneas** del mismo archivo.

## 5.1 Ejemplo realista

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

## 5.2 Ver qué archivos tienen conflicto

```bash
$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")

Unmerged paths:
        both modified:   pages/LoginPage.ts
```

## 5.3 El archivo con conflicto

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

## 5.4 Resolver el conflicto

Abre el archivo en tu editor y **decide manualmente** qué se queda. Lo más común es combinar ambos cambios:

```typescript
export class LoginPage {
  usernameInput = '#email';
  passwordInput = '#password';
  rememberMeCheckbox = '#remember';
}
```

Elimina TODOS los marcadores (`<<<<<<<`, `=======`, `>>>>>>>`).

## 5.5 Terminar el merge

```bash
$ git add pages/LoginPage.ts
$ git status
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

$ git commit    # abre el editor con el mensaje de merge pre-escrito
```

## 5.6 Abortar un merge si te arrepientes

```bash
$ git merge --abort
```

Esto devuelve tu repo al estado anterior al merge, como si nunca hubiera pasado.

## 5.7 Herramientas visuales de merge

VS Code tiene un editor de conflictos muy bueno: al abrir un archivo con conflictos te muestra botones **Accept Current Change**, **Accept Incoming Change**, **Accept Both Changes**.

También existen herramientas externas:
```bash
$ git mergetool
```
