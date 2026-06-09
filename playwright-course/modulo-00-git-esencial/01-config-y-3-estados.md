# 1. Configuración inicial + los 3 estados

## 1.1 Identidad para tus commits

**1.1.1 — Configura tu nombre, correo y rama por defecto**
- **Qué hago:** tres comandos `git config --global`, **antes** de tu primer commit:

```bash
$ git config --global user.name "Tu Nombre"
$ git config --global user.email "tu@correo.com"
$ git config --global init.defaultBranch main
```

- **Por qué:** cada commit queda **firmado** con tu nombre y correo (es lo que verás en `git log` y en los Pull Requests). Si no lo configuras antes del primer commit, Git puede fallar o firmar con datos basura. `init.defaultBranch main` hace que cada `git init` nuevo arranque en `main` (en vez del antiguo `master`).
- **Cómo verifico:** lo confirmas en el paso 1.2 con `git config --list --global`.

> ⚠️ Usa el mismo correo de tu cuenta de GitHub. De lo contrario, tus commits aparecen como "autor desconocido" en los Pull Requests y no se enlazan a tu perfil.

## 1.2 Verificar configuración

**1.2.1 — Confirma que la identidad quedó registrada**
- **Qué hago:** `git config --list --global`
- **Por qué:** quieres ver, antes de seguir, que tu nombre y correo realmente quedaron guardados. Lo que pones con `--global` vive en `~/.gitconfig` (Windows: `C:\Users\<tú>\.gitconfig`) y aplica a **todos** tus repos.
- **Cómo verifico:** la salida incluye tus tres líneas:

```bash
$ git config --list --global
user.name=Tu Nombre
user.email=tu@correo.com
init.defaultBranch=main
```

> 💡 ¿Trabajas con dos identidades (laboral / personal)? Puedes sobreescribir el correo **por repo** con `git config --local user.email "..."` dentro de cada carpeta — el `--local` gana sobre el `--global` solo en ese repo.

## 1.3 Los 3 estados de un archivo

> 🎯 **Idea grande:** un archivo en Git **siempre** está en uno de 3 lugares. Saber en cuál estás es la mitad del trabajo — el resto son comandos para moverlo.

Git mueve tus archivos por **3 áreas**:

```
  Working Directory   ───>   Staging Area   ───>   Repository (.git)
   (lo que editas)             (sala de espera)         (historial)
                  git add                    git commit
```

| Estado | Qué es (en 1 línea) | Cómo se llega |
|---|---|---|
| **Working** | El archivo tal cual está en tu editor *ahora* | (editas con VS Code, vim, etc.) |
| **Staging** | Versión "marcada" para entrar al próximo commit | `git add <archivo>` |
| **Repository** | Versión guardada en el historial — ya no se pierde fácilmente | `git commit -m "..."` |

### Ejemplo paseado: un test viaja por los 3 estados

Imagina que editas `login.spec.ts`. Cada parada tiene su comando y su señal observable:

**1.3.1 — Working: editas en el editor**
- **Qué hago:** escribes/cambias el test en VS Code y guardas (`Ctrl+S`).
- **Por qué:** guardar en el editor solo afecta al **working directory**. Git lo ve, pero todavía no lo sigue para el próximo commit.
- **Cómo verifico:** `git status` dice `modified: login.spec.ts` (en rojo, bajo *Changes not staged*).

**1.3.2 — Staging: marcas que ese cambio sí va**
- **Qué hago:** `git add login.spec.ts`
- **Por qué:** mueves el archivo a la **sala de espera**. Estás declarando "esto entra al próximo commit" — pero aún no está grabado.
- **Cómo verifico:** `git status` ahora lo lista bajo `Changes to be committed:` (en verde).

**1.3.3 — Repository: lo grabas en el historial**
- **Qué hago:** `git commit -m "test: add login happy path"`
- **Por qué:** tomas la **foto definitiva** de lo que estaba en staging y la guardas en `.git/`. A partir de aquí, aunque borres el archivo del editor, puedes recuperarlo.
- **Cómo verifico:** `git status` dice `nothing to commit, working tree clean`.

Después del paso 1.3.3, ese commit queda en `.git/` para siempre — la foto ya no se pierde con un `Ctrl+Z`.

### Por qué importa el staging

El staging es la **sala de espera** donde decides exactamente qué cambios entran al próximo commit. Si tocas 5 archivos pero sólo dos pertenecen a la misma feature, agregas sólo esos dos al staging y los commiteas juntos. Los otros tres quedan en working dir para un commit aparte.

> 💡 **Analogía QA — reporte de bugs:**
> - *Working* = bugs que detectas mientras pruebas, aún tienes la libreta abierta.
> - *Staging* = bugs ya validados y redactados que sí van al reporte final, pero el reporte todavía no se envía.
> - *Repository* = reporte enviado al equipo de desarrollo. Ya quedó registrado quién lo envió, cuándo y qué decía. "Des-enviarlo" implica un nuevo trámite, no se borra con `Ctrl+Z`.

> ⚠️ **Confusión típica:** "ya guardé en VS Code, ¿por qué `git status` dice que tengo cambios sin commitear?". Porque guardar en el editor sólo afecta al **Working Directory**. Git necesita que pases por `add` (staging) y `commit` (repository) — son pasos distintos a propósito.

---

> 📚 **Profundización opcional:** [Niveles de configuración (system / global / local)](../../git-github-course/modulo-01-introduccion-git/06-primera-configuracion.md) · [Snapshots vs deltas](../../git-github-course/modulo-01-introduccion-git/03-que-es-git.md)
