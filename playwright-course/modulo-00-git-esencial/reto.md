# Reto — M00 Git esencial

## Objetivo

Practicar el ciclo completo en una carpeta sandbox antes de empezar M01.

## Setup

```bash
$ mkdir ~/sandbox/m00-git && cd ~/sandbox/m00-git
```

## Pasos

1. **Configura tu identidad** (si aún no lo hiciste):
   ```bash
   $ git config --global user.name "Tu Nombre"
   $ git config --global user.email "tu@correo.com"
   ```

2. **Inicializa el repo:**
   ```bash
   $ git init
   ```

3. **Crea un `.gitignore` antes de cualquier otro archivo**, copiando el de [`03-gitignore-playwright.md`](./03-gitignore-playwright.md).

4. **Crea un archivo de prueba** (simula un test):
   ```bash
   $ echo "test('login funciona', () => {});" > tests/login.spec.ts
   ```

5. **Crea un archivo que NO debe entrar al repo** (simula un secreto):
   ```bash
   $ echo "API_TOKEN=supersecreto" > .env
   ```

6. **Corre `git status`.** Verifica que:
   - `.gitignore` y `tests/` aparecen como untracked.
   - **`.env` NO aparece** (porque `.gitignore` lo excluye).

7. **Haz tu primer commit:**
   ```bash
   $ git add .gitignore tests/
   $ git commit -m "chore: initial repo setup with gitignore and first test"
   ```

8. **Modifica el test:**
   ```bash
   $ echo "test('logout funciona', () => {});" >> tests/login.spec.ts
   ```

9. **Mira el diff** y haz un segundo commit:
   ```bash
   $ git diff
   $ git add tests/login.spec.ts
   $ git commit -m "test: add logout case"
   ```

10. **Revisa la historia:**
    ```bash
    $ git log --oneline
    ```

## Resultado esperado

Tu `git log --oneline` debe verse así:

```
b4d5e6f (HEAD -> main) test: add logout case
a1b2c3d chore: initial repo setup with gitignore and first test
```

Y `git status` debe decir:

```
On branch main
nothing to commit, working tree clean
```

## Bonus

- Con `git config --list --global` confirma que tu nombre y correo están bien.
- Modifica `tests/login.spec.ts` y, antes de commitear, sácalo del staging con `git restore --staged tests/login.spec.ts`. Vuelve a hacer `git status` para ver el cambio.

---

> 📚 **Si quieres más práctica con Git** (escenarios de equipo, conflictos, rebase): el reto del [módulo 2 del curso completo](../../git-github-course/modulo-02-git-basico/reto.md) tiene 12 pasos adicionales.
