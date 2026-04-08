# ✅ Verificación final del setup

> **Antes de empezar los cursos**, ejecuta estos comandos en una terminal **nueva** y compara con la salida esperada. Si algo falla, vuelve al archivo correspondiente.

---

## Verificación rápida (1 minuto)

Copia y pega TODO este bloque en tu terminal:

```bash
echo "=== Terminal y shell ===" && echo $SHELL
echo "" && echo "=== Node.js ===" && node --version
echo "" && echo "=== npm ===" && npm --version
echo "" && echo "=== pnpm ===" && pnpm --version
echo "" && echo "=== Git ===" && git --version
echo "" && echo "=== Git config ===" && git config --global user.name && git config --global user.email
echo "" && echo "=== VS Code ===" && code --version
echo "" && echo "=== SSH a GitHub ===" && ssh -T git@github.com
```

---

## ✅ Salida esperada (lo que cada línea DEBE mostrar)

```
=== Terminal y shell ===
/bin/zsh                              ← o /bin/bash

=== Node.js ===
v20.11.0                              ← v20.x o superior

=== npm ===
10.2.4                                ← cualquier 9.x o 10.x

=== pnpm ===
9.12.0                                ← v9.x o superior

=== Git ===
git version 2.45.2                    ← v2.40 o superior

=== Git config ===
Tu Nombre Real
tu-correo@ejemplo.com

=== VS Code ===
1.94.2                                ← cualquier 1.90+
abcdef0123456789                      ← hash del commit
x64                                   ← o arm64

=== SSH a GitHub ===
Hi tu-usuario! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## Checklist por curso

### 📘 Para el curso de TypeScript

- [ ] `node --version` muestra v18+
- [ ] `pnpm --version` muestra 9+
- [ ] VS Code abre con `code .`
- [ ] La extensión "Pretty TypeScript Errors" está instalada (opcional)

**Probar:**
```bash
$ cd typescript-qa-course
$ pnpm install
$ pnpm m1
```
Debe imprimir el "Hello, Automation!" del módulo 1.

---

### 🔀 Para el curso de Git/GitHub

- [ ] `git --version` muestra v2.40+
- [ ] `git config --global user.name` y `user.email` están configurados
- [ ] Tengo cuenta de GitHub con 2FA activado
- [ ] `ssh -T git@github.com` me saluda con mi usuario
- [ ] La extensión "GitLens" está instalada en VS Code

**Probar:**
```bash
$ mkdir ~/sandbox-git-test
$ cd ~/sandbox-git-test
$ git init
$ echo "hola" > test.txt
$ git add test.txt
$ git commit -m "test: primer commit"
$ git log --oneline
```
Debe mostrar tu commit con tu nombre como autor.

---

### 🎭 Para el curso de Playwright

- [ ] Todo lo de TypeScript ✅
- [ ] Los navegadores de Playwright están instalados
- [ ] La extensión "Playwright Test for VSCode" está instalada
- [ ] (Opcional) GitHub Copilot funciona

**Probar:**
```bash
$ cd playwright-course
$ pnpm install
$ pnpm exec playwright install
$ pnpm test modulo-01-vision-general/hello.spec.ts
```
Debe correr 6 tests verdes (2 tests × 3 navegadores).

---

## ⚠️ Si algo falla

| Falla | Vuelve al archivo |
|-------|-------------------|
| `command not found: node` | [02-nodejs.md](./02-nodejs.md) |
| `command not found: pnpm` | [03-pnpm.md](./03-pnpm.md) |
| `command not found: git` | [04-git.md](./04-git.md) |
| `command not found: code` | [05-vscode.md](./05-vscode.md) |
| `git config user.name` está vacío | [04-git.md](./04-git.md) sección "Configuración mínima" |
| `Permission denied (publickey)` en SSH | [06-github.md](./06-github.md) sección 4 |
| `playwright: command not found` | [07-playwright-browsers.md](./07-playwright-browsers.md) |

---

## 🎓 Lista final del nivel "listo para empezar"

Marca todo lo siguiente:

- [ ] Mi terminal es moderna (Terminal.app, iTerm2, Windows Terminal o equivalente)
- [ ] Node.js v18+ instalado y verificado
- [ ] pnpm v9+ instalado y verificado
- [ ] Git v2.40+ instalado y configurado con mi nombre y correo
- [ ] VS Code instalado con las extensiones recomendadas
- [ ] Cuenta de GitHub creada con 2FA activado
- [ ] Llave SSH generada y vinculada a GitHub
- [ ] `ssh -T git@github.com` responde con mi usuario
- [ ] (Si voy a hacer Playwright) navegadores instalados con `playwright install`
- [ ] (Opcional) GitHub Copilot funcionando

Si marcaste **todo lo que aplica a tus cursos**, estás 100% listo. 🚀

---

## ➡️ Siguiente paso

Elige tu primer curso:

- 📘 **[Curso de TypeScript para QA](../typescript-qa-course/)** — empieza aquí si vienes de pruebas manuales y nunca has programado.
- 🔀 **[Curso de Git/GitHub para QA](../git-github-course/)** — empieza aquí si ya sabes algo de programación pero no de control de versiones.
- 🎭 **[Curso de Playwright para QA](../playwright-course/)** — empieza aquí si ya dominas TypeScript y Git, y quieres ir directo a la automatización E2E.

**Recomendación:** hazlos en este orden — TypeScript → Git/GitHub → Playwright.

¡Buena suerte! 🎯
