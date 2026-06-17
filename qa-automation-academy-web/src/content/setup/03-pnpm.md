# 03 — pnpm (gestor de paquetes)

> **¿Qué es?** pnpm es un gestor de paquetes para Node.js, alternativa a `npm` y `yarn`. Es **3-5x más rápido**, **usa menos disco** (cachea paquetes globalmente), y maneja monorepos mucho mejor. Es lo que usan los 3 cursos.

> **Sitio oficial:** https://pnpm.io/

> **Versión recomendada:** **10.x o superior**.
---

![Guía visual de pnpm](/pnpm-guide.jpg)

---

## Instalación (todos los sistemas operativos)

### Opción A (recomendada): con npm
Como ya tienes Node.js instalado, simplemente:

```bash
$ npm install -g pnpm
```

El `-g` significa "global": pnpm queda disponible en cualquier carpeta de tu sistema.

### Opción B: con corepack (incluido con Node.js v16.10+)

```bash
$ corepack enable
$ corepack prepare pnpm@latest --activate
```

> ⚠️ **Corepack fue removido a partir de Node 25.** En Node 24 funciona, pero la Opción A (`npm install -g pnpm`) funciona siempre — es la recomendada.

### Opción C: con script standalone

#### macOS / Linux
```bash
$ curl -fsSL https://get.pnpm.io/install.sh | sh -
```

#### Windows (PowerShell)
```powershell
> iwr https://get.pnpm.io/install.ps1 -useb | iex
```

### Opción D: con Homebrew (solo macOS)
```bash
$ brew install pnpm
```

---

## ✅ Verificación

```bash
$ pnpm --version
10.x.x    # ← debe ser 10.x o superior
```

Si imprime un número de versión, está listo.

---

## 🎓 Comandos básicos de pnpm

Estos son los que usarás durante los cursos:

| Comando | Qué hace | Equivalente en npm |
|---------|----------|---------------------|
| `pnpm install` | Instala todas las dependencias del `package.json` | `npm install` |
| `pnpm install <paquete>` | Agrega un paquete | `npm install <paquete>` |
| `pnpm install -D <paquete>` | Agrega un paquete de desarrollo | `npm install -D <paquete>` |
| `pnpm remove <paquete>` | Quita un paquete | `npm uninstall <paquete>` |
| `pnpm update` | Actualiza dependencias | `npm update` |
| `pnpm test` | Corre el script "test" del package.json | `npm test` |
| `pnpm run <script>` | Corre cualquier script del package.json | `npm run <script>` |
| `pnpm exec <comando>` | Ejecuta un binario instalado localmente | `npx <comando>` |

> 💡 **Tip:** `pnpm` y `pnpm run` son intercambiables. Para scripts del `package.json` puedes escribir solo `pnpm test` en vez de `pnpm run test`.

---

## ⚠️ ¿Por qué pnpm y no npm o yarn?

- **Velocidad:** 2-3x más rápido que npm en instalaciones limpias.
- **Disco:** instala los paquetes una sola vez en `~/.pnpm-store/` y los enlaza con symlinks. Si tienes 10 proyectos, no descargas React 10 veces.
- **Estricto:** evita el "phantom dependencies" problem (acceder a paquetes que no declaraste explícitamente en tu package.json).
- **Es el estándar moderno** en muchos equipos de frontend y QA.

> **Lectura corta y entretenida:** [Why should we use pnpm? — pnpm.io](https://pnpm.io/motivation)

---

## 🧩 TypeScript global (opcional)

En el curso usaremos TypeScript dentro de cada proyecto (Playwright ya lo trae). Aun así, instalarlo de forma global ayuda para verificar versiones y compilar fuera de proyectos:

```bash
$ npm install -g typescript   # útil para verificar versiones y compilar fuera de proyectos
$ tsc -v                       # Version 5.x.x
```

> **Buena práctica:** en cada proyecto agrégalo como dev-dependency con `pnpm add -D typescript`. Playwright ya lo incluye al crear el proyecto en TypeScript.

---

## ⚠️ Problemas comunes

### "command not found: pnpm" después de instalar
- Reinicia tu terminal.
- Verifica con `npm list -g --depth=0` que aparece `pnpm`.
- En macOS, asegúrate que `~/.npm-global/bin` (o equivalente) esté en tu PATH.

### "pnpm install" se queda colgado en Windows
- Probablemente Windows Defender está escaneando los archivos. Excluye la carpeta del proyecto en Defender.
- Abre **PowerShell como Administrador** y excluye la carpeta del store de pnpm:

```powershell
> Add-MpPreference -ExclusionPath $(pnpm store path)
```

### "ejecución de scripts está deshabilitada" (Windows)
- Abre **PowerShell como Administrador** y ejecuta:

```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### "libatomic.so.1: cannot open shared object file" (Linux)
- El binario de pnpm necesita esa librería. Instálala:

```bash
$ sudo apt install -y libatomic1
```

### "ERR_PNPM_PEER_DEP_ISSUES"
- Tu `package.json` tiene un peer dependency conflict. Puedes ignorar warnings con `pnpm install --no-strict-peer-dependencies` o arreglarlo actualizando las versiones.

### ¿Puedo mezclar pnpm con npm en el mismo proyecto?
- **NO.** Borra tu `node_modules/` y `package-lock.json` antes de cambiar de gestor. Los cursos asumen `pnpm-lock.yaml`.

➡️ Siguiente: [04-git.md](./04-git.md)
