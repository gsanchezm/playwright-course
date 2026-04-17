# Reto - Módulo 1: Introducción a Git

Objetivo: dejar tu máquina lista para trabajar con Git como automatizador QA profesional.

---

## Reto 1.1 — Verificar la instalación

Abre una terminal nueva y ejecuta:

```bash
$ git --version
```

**✅ Resultado esperado:** una línea similar a `git version 2.45.2` (la versión exacta puede variar; debe ser 2.x o superior).

**❌ Si dices "command not found"** → vuelve a [`05-instalacion.md`](./05-instalacion.md) y reinstala.

---

## Reto 1.2 — Configurar tu identidad

Configura tu nombre y correo global. Usa el **mismo correo** con el que abrirás tu cuenta de GitHub en el Módulo 6.

```bash
$ git config --global user.name "Tu Nombre Real"
$ git config --global user.email "tu-correo@ejemplo.com"
```

**Verifica:**

```bash
$ git config --global user.name
$ git config --global user.email
```

**✅ Resultado esperado:** ambos comandos deben imprimir exactamente lo que configuraste.

---

## Reto 1.3 — Configurar editor y rama por defecto

1. Configura tu editor favorito. Si tienes VS Code:
   ```bash
   $ git config --global core.editor "code --wait"
   ```
2. Configura la rama principal como `main`:
   ```bash
   $ git config --global init.defaultBranch main
   ```
3. Activa colores en la salida:
   ```bash
   $ git config --global color.ui auto
   ```

**Verifica toda tu config de una sola vez:**

```bash
$ git config --list --global
```

**✅ Resultado esperado:** debes ver al menos estas 5 líneas:
```
user.name=...
user.email=...
core.editor=code --wait
init.defaultBranch=main
color.ui=auto
```

---

## Reto 1.4 — Explorar la ayuda integrada

Sin salir de la terminal, responde estas 3 preguntas consultando **únicamente** el manual de Git (`git help` / `--help` / `-h`):

1. ¿Qué hace el flag `--amend` del comando `git commit`?
2. ¿Cuál es la diferencia entre `git log --oneline` y `git log --stat`?
3. ¿Qué opción le pasarías a `git diff` para ver solo los **nombres** de los archivos modificados (sin el contenido)?

> 💡 **Pista:** para las preguntas 1 y 2 usa `git help commit` y `git help log`. Para la 3, usa `git diff --help` y busca la palabra "name".

**✅ Resultado esperado:**
1. `--amend` reemplaza el último commit con un nuevo commit (útil si olvidaste agregar un archivo o quieres corregir el mensaje).
2. `--oneline` muestra un resumen de una línea por commit; `--stat` incluye estadísticas de qué archivos cambiaron y cuántas líneas se agregaron/eliminaron.
3. `git diff --name-only`.

---

## Reto 1.5 — Simular el escenario del automatizador

En [`01-que-es-vcs.md`](./01-que-es-vcs.md) leíste la historia del automatizador que modificó un localizador y rompió 8 tests. **Sin tocar código aún**, responde en un archivo de texto o en un comentario:

1. ¿Qué comando usarías para ver el historial de cambios de un archivo llamado `tests/checkout.spec.ts`?
2. ¿Qué comando usarías para comparar la versión actual de ese archivo contra su versión de hace 3 commits?
3. ¿Qué comando usarías para restaurar ese archivo a como estaba hace 3 commits, **sin tocar los demás archivos**?

**✅ Resultado esperado:**

```bash
# 1
git log --oneline tests/checkout.spec.ts

# 2
git diff HEAD~3 HEAD tests/checkout.spec.ts

# 3
git checkout HEAD~3 -- tests/checkout.spec.ts
# (equivalente moderno: git restore --source=HEAD~3 tests/checkout.spec.ts)
```

No necesitas ejecutarlos todavía — en el Módulo 2 y 3 los usarás en un repo real.

---

## Reto 1.6 — Reto de equipo (discusión)

> Este reto es para discutir con tu equipo de automatización o con tu mentor.

Imagina que tu equipo de QA tiene **4 automatizadores** trabajando en el mismo repo de tests de Playwright. Actualmente cada uno trabaja en su carpeta local y envía un ZIP por Slack los viernes. Responde:

1. Enumera al menos **3 problemas concretos** del flujo actual (ZIPs por Slack).
2. ¿Cómo mejoraría cada uno de esos problemas al adoptar Git + un remoto en GitHub?
3. ¿Qué pasa hoy si dos personas modifican el mismo archivo `loginPage.ts` el mismo día?

**✅ Resultado esperado (ejemplo de respuesta):**
1. Problemas: (a) no hay historial de quién cambió qué; (b) es imposible revertir un cambio sin tener la copia exacta; (c) si dos personas tocan el mismo archivo, una pisa a la otra; (d) no hay revisión de código; (e) los ZIPs se pierden.
2. Git: (a) cada commit queda firmado por su autor; (b) `git revert` / `git checkout` permiten volver a cualquier versión; (c) Git detecta los conflictos y obliga a resolverlos; (d) los PRs de GitHub fuerzan revisión antes de mergear; (e) todo vive en un remoto centralizado.
3. Hoy la última persona que envía el ZIP "gana" y las modificaciones de los demás se pierden sin aviso.

---

## ✅ Checklist de salida del Módulo 1

Antes de pasar al Módulo 2, debes poder responder **sí** a todo esto:

- [ ] `git --version` funciona en mi terminal.
- [ ] `git config --global user.name` devuelve mi nombre.
- [ ] `git config --global user.email` devuelve mi correo.
- [ ] `git config --global init.defaultBranch` devuelve `main`.
- [ ] Sé abrir la ayuda de cualquier comando con `git <comando> --help`.
- [ ] Entiendo qué es el **working directory**, **staging area** y **repository**.
- [ ] Entiendo por qué un equipo de automatización NO debe compartir código por ZIP.

Si marcaste todo ✅, pasa al [Módulo 2: Git Básico](../modulo-02-git-basico/).
