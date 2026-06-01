# Config y los 3 estados de Git

## 1.1 Identidad para tus commits

Cada commit queda firmado con tu nombre y correo. Configúralos **antes** del primer commit:

```bash
$ git config --global user.name "Tu Nombre"
$ git config --global user.email "tu@correo.com"
$ git config --global init.defaultBranch main
```

> ⚠️ Usa el mismo correo de tu cuenta de GitHub. De lo contrario, tus commits aparecen como "autor desconocido" en los Pull Requests.

## 1.2 Verificar configuración

```bash
$ git config --list --global
user.name=Tu Nombre
user.email=tu@correo.com
init.defaultBranch=main
```

Lo que pones con `--global` queda en `~/.gitconfig` y aplica a todos tus repos. Si trabajas con múltiples identidades (laboral / personal), puedes sobreescribir por repo con `--local` dentro de cada carpeta.

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

Imagina que editas `login.spec.ts`:

```
1) Escribes el test en VS Code              →  Working
   git status: "modified: login.spec.ts"

2) Decides que ese cambio sí va al commit    →  Staging
   git add login.spec.ts
   git status: "Changes to be committed: login.spec.ts"

3) Lo grabas en el historial                 →  Repository
   git commit -m "test: add login happy path"
   git status: "nothing to commit, working tree clean"
```

Después del paso 3, ese commit queda en `.git/` para siempre — aunque borres el archivo del editor, puedes recuperarlo.

### Por qué importa el staging

El staging es la **sala de espera** donde decides exactamente qué cambios entran al próximo commit. Si tocas 5 archivos pero sólo dos pertenecen a la misma feature, agregas sólo esos dos al staging y los commiteas juntos. Los otros tres quedan en working dir para un commit aparte.

> 💡 **Analogía QA — reporte de bugs:**
> - *Working* = bugs que detectas mientras pruebas, aún tienes la libreta abierta.
> - *Staging* = bugs ya validados y redactados que sí van al reporte final, pero el reporte todavía no se envía.
> - *Repository* = reporte enviado al equipo de desarrollo. Ya quedó registrado quién lo envió, cuándo y qué decía. "Des-enviarlo" implica un nuevo trámite, no se borra con `Ctrl+Z`.

> ⚠️ **Confusión típica:** "ya guardé en VS Code, ¿por qué `git status` dice que tengo cambios sin commitear?". Porque guardar en el editor sólo afecta al **Working Directory**. Git necesita que pases por `add` (staging) y `commit` (repository) — son pasos distintos a propósito.

---

> 📚 **Profundización opcional:** **Niveles de configuración (system / global / local)** · **Snapshots vs deltas**
