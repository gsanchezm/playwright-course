# Módulo 1: Introducción a Git

> **Analogía del instructor:** Git es como tu sistema de gestión de casos de prueba (TestRail, Zephyr, Xray), pero para **código**. Cada "commit" es una versión guardada de tu suite de automatización con quién la escribió, cuándo y por qué.

---

## 1. ¿Qué es un Sistema de Control de Versiones (VCS)?

Un **Sistema de Control de Versiones** (VCS, del inglés _Version Control System_) guarda el historial completo de cambios de un conjunto de archivos a lo largo del tiempo, de modo que puedes:

- Volver a una versión anterior si algo se rompe.
- Saber quién hizo qué cambio y cuándo.
- Trabajar en paralelo con otros sin pisarse los cambios.
- Experimentar con nuevas ideas sin miedo.

![Sistema de Control de Versiones Distribuido](https://git-scm.com/book/en/v2/images/distributed.png)
*Fuente: [git-scm.com - About Version Control](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control)*


### ¿Por qué lo necesita un automatizador QA?

Imagina este escenario real:

> Hoy es lunes. Escribiste 15 tests nuevos para el flujo de checkout el viernes pasado. Hoy actualizas un localizador y **de repente 8 tests fallan**. No recuerdas qué cambiaste. Tu compañera también tocó ese archivo. ¿Cómo saber qué pasó?

Sin Git:
- Copias y pegas carpetas con nombres como `tests_v1/`, `tests_v2_FINAL/`, `tests_BUENO_NO_TOCAR/`.
- Pierdes horas comparando archivos manualmente.
- Terminas restaurando desde una "copia de seguridad" que no está actualizada.

Con Git:
```bash
$ git log --oneline tests/checkout.spec.ts    # ver qué cambió en ese archivo
$ git diff HEAD~5 HEAD tests/checkout.spec.ts # comparar la versión actual vs hace 5 commits
$ git checkout <commit-anterior> -- tests/checkout.spec.ts  # restaurar la versión anterior
```

**Moraleja:** Un automatizador sin Git es como un tester manual sin un sistema de gestión de bugs. Funciona, pero no escala.

---

## 2. Una breve historia de Git

- **1991-2002:** El kernel de Linux se mantenía intercambiando parches por correo (una locura).
- **2002-2005:** Linus Torvalds adoptó **BitKeeper**, un VCS comercial y gratuito para proyectos open source.
- **2005:** BitKeeper retiró la gratuidad. Linus escribió Git en **10 días** con estos objetivos:
  - Velocidad extrema.
  - Diseño distribuido (cada clon es un repo completo).
  - Soporte para flujos no lineales (miles de ramas en paralelo).
  - Integridad total: imposible modificar el historial sin que se note.

Hoy Git es el VCS más usado del mundo.

---

## 3. ¿Qué es Git exactamente?

Git es un **VCS distribuido** que trabaja con **snapshots** (fotografías), no con diferencias.

### Snapshots vs Diferencias

La mayoría de VCS antiguos (CVS, Subversion) guardaban **diferencias** entre archivos. Git no: cada vez que haces `commit`, toma una **foto completa** del estado de todos tus archivos. Si un archivo no cambió, Git guarda un "puntero" a la versión anterior (no duplica datos).

```
Commit 1: [testA.ts v1] [testB.ts v1] [config.ts v1]
Commit 2: [testA.ts v2] [testB.ts →v1] [config.ts →v1]
Commit 3: [testA.ts →v2] [testB.ts v2] [config.ts v2]
```

#### Almacenamiento basado en Deltas vs Snapshots

| Almacenamiento basado en deltas (Diferencias) | Almacenamiento basado en Snapshots (Git) |
| :---: | :---: |
| ![Deltas](https://git-scm.com/book/en/v2/images/deltas.png) | ![Snapshots](https://git-scm.com/book/en/v2/images/snapshots.png) |
| *Fuente: [git-scm.com](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)* | *Fuente: [git-scm.com](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)* |

---

### Los 3 estados de un archivo en Git

A diferencia de otros sistemas, Git gestiona tus archivos a través de tres áreas principales:

```
  Working Directory   ───>   Staging Area   ───>   Git Directory
   (Área de trabajo)         (Index / Staging)       (Repository)
      "Modificado"             "Preparado"          "Confirmado"
```

![Los 3 estados de Git](https://git-scm.com/book/en/v2/images/areas.png)
*Fuente: [git-scm.com - The Three States](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)*



1. **Working directory (working tree):** Los archivos que ves en tu editor. Aquí editas tu test.
2. **Staging area (index):** Una "sala de espera" donde pones los cambios que SÍ quieres incluir en el próximo commit.
3. **Repository (.git):** El historial permanente. Lo que está aquí ya está guardado para siempre.

> 💡 **Analogía QA:** Es como preparar un reporte de bugs:
> - `working directory` = los bugs que detectas durante tu sesión de pruebas.
> - `staging area` = los bugs que ya validaste y quieres incluir en el reporte final.
> - `repository` = el reporte enviado al equipo de desarrollo (ya no puedes "des-enviarlo" fácilmente).

---

## 4. La línea de comandos

En este curso usaremos **exclusivamente la terminal**. Aunque existen GUIs (GitHub Desktop, SourceTree, GitKraken, la pestaña Git de VS Code), un automatizador profesional necesita dominar la CLI por 3 razones:

1. **CI/CD:** Los pipelines de GitHub Actions, Jenkins, GitLab CI ejecutan comandos Git crudos. Si no los entiendes, no puedes depurar un build roto.
2. **Todos los comandos existen en CLI; no todos existen en la GUI.** Cosas como `git reflog`, `git bisect`, o un `rebase -i` complejo son mucho más claras en terminal.
3. **Es universal:** Cualquier máquina Linux remota, contenedor Docker, o servidor CI tiene `git` pero no necesariamente una GUI.

### Terminal recomendada por sistema operativo

| Sistema | Terminal recomendada |
|---------|----------------------|
| macOS | Terminal.app o iTerm2 |
| Windows | Windows Terminal + Git Bash (viene con Git) |
| Linux | Cualquiera (gnome-terminal, konsole, alacritty...) |

---

## 5. Instalación de Git

### macOS

**Opción 1 (recomendada):** con Homebrew.
```bash
$ brew install git
```

**Opción 2:** con Xcode Command Line Tools (viene con macOS).
```bash
$ xcode-select --install
```

### Windows

Descarga el instalador oficial de [git-scm.com/download/win](https://git-scm.com/download/win) y ejecuta el `.exe`. Acepta los valores por defecto excepto:
- **"Use Visual Studio Code as Git's default editor"** (si tienes VS Code instalado).
- **"Git from the command line and also from 3rd-party software"**.
- **"Checkout as-is, commit Unix-style line endings"**.

### Linux (Debian/Ubuntu)

```bash
$ sudo apt update
$ sudo apt install git
```

### Linux (Fedora/RHEL)

```bash
$ sudo dnf install git
```

### Verificar la instalación

```bash
$ git --version
git version 2.45.2
```

Si ves un número de versión 2.x o superior, estás listo.

---

## 6. Primera configuración de Git (First-Time Setup)

Git guarda configuración en **3 niveles** (de menor a mayor precedencia):

| Nivel | Archivo | Flag | Aplica a |
|-------|---------|------|----------|
| System | `/etc/gitconfig` | `--system` | Todos los usuarios del equipo |
| Global | `~/.gitconfig` | `--global` | Tu usuario en todos los repos |
| Local | `.git/config` | `--local` (default) | Solo el repo actual |

### Configuración mínima obligatoria

Cada commit queda firmado con tu nombre y tu correo. Configúralos **ANTES** de tu primer commit:

```bash
$ git config --global user.name "Gilberto Sánchez"
$ git config --global user.email "gil@miempresa.com"
```

> ⚠️ **Importante:** Usa el mismo correo con el que tienes cuenta en GitHub. De lo contrario, tus commits aparecerán como "autor desconocido" en los PRs.

### Editor por defecto

Cuando Git necesita que escribas un mensaje de commit largo o un rebase interactivo, abre un editor. Configúralo a VS Code:

```bash
$ git config --global core.editor "code --wait"
```

O a nano (más simple si no tienes VS Code):
```bash
$ git config --global core.editor "nano"
```

### Nombre de la rama principal

Por convención moderna, la rama principal se llama `main` (antes era `master`). Configúralo para que los nuevos repos empiecen con `main`:

```bash
$ git config --global init.defaultBranch main
```

### Colorear la salida

```bash
$ git config --global color.ui auto
```

### Verificar tu configuración

```bash
$ git config --list --global
user.name=Gilberto Sánchez
user.email=gil@miempresa.com
core.editor=code --wait
init.defaultBranch=main
color.ui=auto
```

---

## 7. Cómo pedir ayuda (`git help`)

Git viene con un manual completo integrado. Hay 3 formas equivalentes de abrirlo:

```bash
$ git help <comando>
$ git <comando> --help
$ man git-<comando>
```

Ejemplos:
```bash
$ git help commit      # manual completo de commit
$ git commit --help    # mismo resultado
$ git commit -h        # versión corta (una pantalla)
```

> 💡 **Tip para automatizadores:** Cuando estés escribiendo un script de CI que use Git, siempre empieza consultando `git <comando> -h` para ver las flags disponibles. Te ahorra buscar en Stack Overflow.

### Recursos oficiales

- **Libro oficial (gratuito y en español):** [git-scm.com/book/es/v2](https://git-scm.com/book/es/v2)
- **Referencia de comandos:** [git-scm.com/docs](https://git-scm.com/docs)
- **Tutorial interactivo:** [learngitbranching.js.org](https://learngitbranching.js.org) (muy recomendado para visualizar ramas)

---

## 8. Resumen del módulo

- Un **VCS** guarda el historial completo de tu código (y de tus tests).
- **Git** es un VCS distribuido basado en **snapshots**, no en diferencias.
- Un archivo en Git vive en 3 estados: **working directory → staging → repository**.
- La **CLI** es la herramienta universal; toda GUI es opcional.
- La configuración inicial obligatoria es: `user.name`, `user.email`, `core.editor`, `init.defaultBranch`.
- Para cualquier duda: `git <comando> --help`.

---

## Glosario mínimo

| Término | Significado |
|---------|-------------|
| **Repository (repo)** | Carpeta donde Git guarda el historial (subcarpeta `.git`). |
| **Working directory** | Tus archivos actuales tal como los ves en el editor. |
| **Staging area (index)** | Área temporal donde pones cambios antes de un commit. |
| **Commit** | Un snapshot guardado del proyecto con un mensaje descriptivo. |
| **Branch (rama)** | Una línea de desarrollo paralela. |
| **Remote** | Una copia del repo alojada en otro lugar (GitHub, GitLab, etc.). |
| **Clone** | Descargar un repo remoto completo a tu máquina. |
| **Push** | Subir tus commits al remoto. |
| **Pull** | Descargar commits nuevos desde el remoto. |

➡️ Ahora haz los ejercicios en [reto.md](./reto.md).
