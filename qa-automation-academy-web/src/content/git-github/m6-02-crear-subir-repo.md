# 2. Crear y subir tu primer repo a GitHub

## 2.1 Crear el repo desde la web

1. GitHub → botón **New repository** (arriba derecha).
2. Llena:
   - **Repository name:** `qa-playwright-demo` (el mismo nombre de tu carpeta local).
   - **Description:** "Playwright test framework — curso QA Automation".
   - **Visibility:** público (para aprender) o privado (si es de la empresa).
   - **NO marques** "Initialize with a README / .gitignore / license" — tu repo local ya los tiene. Si GitHub crea archivos iniciales, tendrás un conflicto al hacer el primer push.
3. Click **Create repository**.

## 2.2 Conectar tu repo local

GitHub te muestra las instrucciones. Para un repo que ya existe localmente:

```bash
$ cd ~/sandbox/qa-playwright-demo
$ git remote add origin git@github.com:tu-usuario/qa-playwright-demo.git
$ git branch -M main      # asegúrate que tu rama se llama main (no master)
$ git push -u origin main
```

Resultado esperado:
```
Enumerating objects: 25, done.
Counting objects: 100% (25/25), done.
Writing objects: 100% (25/25), 4.23 KiB | 4.23 MiB/s, done.
Total 25 (delta 0), reused 0 (delta 0)
To github.com:tu-usuario/qa-playwright-demo.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main' from 'origin'.
```

Recarga la página de GitHub y verás todo tu código.

## 2.3 Subir los tags también

```bash
$ git push origin --tags
```

GitHub ahora tiene tus tags `v0.1.0`, `v1.0.0`, etc. bajo la pestaña **Releases / Tags**.
