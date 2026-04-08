# 02 — Node.js

> **¿Qué es?** Node.js es el "motor" que ejecuta JavaScript/TypeScript fuera del navegador. Sin él no puedes correr `tsx`, `pnpm`, ni Playwright.

> **Sitio oficial:** https://nodejs.org/

> **Versión recomendada para el curso:** **v20 LTS** (Long Term Support).

---

## 🍎 macOS

### Opción A (recomendada): Homebrew

Si no tienes Homebrew, instálalo primero desde https://brew.sh/

```bash
$ brew install node@20
```

### Opción B: instalador oficial
1. Ve a https://nodejs.org/
2. Descarga el instalador **LTS** (no la "Current").
3. Ábrelo y sigue los pasos.

### Opción C (avanzada): nvm — gestor de versiones

`nvm` te permite tener varias versiones de Node y cambiar entre ellas. Útil si trabajas en proyectos con distintas versiones.

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
$ source ~/.zshrc
$ nvm install 20
$ nvm use 20
```

- **Sitio oficial de nvm:** https://github.com/nvm-sh/nvm

---

## 🪟 Windows

### Opción A (recomendada): instalador oficial
1. Ve a https://nodejs.org/
2. Descarga el `.msi` **LTS** para Windows.
3. Ejecútalo y acepta los valores por defecto.
4. ⚠️ Asegúrate de marcar **"Add to PATH"** durante la instalación.

### Opción B: con winget
```powershell
> winget install OpenJS.NodeJS.LTS
```

### Opción C: nvm-windows
- **Sitio oficial:** https://github.com/coreybutler/nvm-windows
- Descarga `nvm-setup.exe` desde Releases.

---

## 🐧 Linux

### Ubuntu / Debian (con NodeSource — recomendado)

```bash
$ curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
$ sudo apt install -y nodejs
```

### Fedora / RHEL
```bash
$ sudo dnf install nodejs
```

### Arch
```bash
$ sudo pacman -S nodejs npm
```

---

## ✅ Verificación

Abre una terminal **nueva** (las viejas no ven los cambios de PATH) y ejecuta:

```bash
$ node --version
v20.11.0    # ← debe ser 20.x.x o superior

$ npm --version
10.2.4      # ← cualquier versión 9.x o 10.x está bien
```

Si los dos comandos imprimen versiones, **Node.js está listo**.

---

## ⚠️ Problemas comunes

### "command not found: node"
- Reinicia tu terminal después de instalar.
- En macOS: agrega `/usr/local/bin` o `/opt/homebrew/bin` a tu PATH.
- En Windows: vuelve a abrir Windows Terminal o reinicia la PC.

### "EACCES permission denied" al instalar paquetes
- En macOS/Linux: significa que estás intentando instalar como root sin necesidad. Configura npm para instalar en tu home:
  ```bash
  $ mkdir ~/.npm-global
  $ npm config set prefix '~/.npm-global'
  $ echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
  $ source ~/.zshrc
  ```

### Tengo Node.js v18 ¿es suficiente?
Sí, los cursos funcionan con v18+, pero **v20 LTS es lo recomendado**. Si tu proyecto del trabajo usa v18, no lo cambies.

### ¿Puedo usar Bun o Deno en vez de Node.js?
Para este curso, **no**. Usaremos Node.js + pnpm porque son los más comunes en equipos de QA reales. Bun/Deno son alternativas válidas pero no las cubrimos.

➡️ Siguiente: [03-pnpm.md](./03-pnpm.md)
