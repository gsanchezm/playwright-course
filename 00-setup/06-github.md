# 06 — GitHub: cuenta y autenticación SSH

> **¿Qué es GitHub?** El servicio más popular para alojar repos de Git. Lo usaremos en el [curso de Git/GitHub](../git-github-course/) y para subir tu framework de Playwright.

> **Sitio oficial:** https://github.com/

---

## 1. Crear tu cuenta

1. Ve a https://github.com/signup
2. Regístrate con:
   - El **mismo correo** que configuraste en `git config --global user.email` (archivo [04-git.md](./04-git.md)).
   - Un nombre de usuario **profesional** — esta será tu identidad pública (`github.com/tu-usuario`). Idealmente tu nombre real o una variante.
   - Una contraseña fuerte.
3. Verifica el correo (te llega un código).

> 💡 **Esta cuenta es parte de tu CV como automatizador.** Hazla pública, súbele tus proyectos, y úsala para contribuir a open source. Reclutadores la van a mirar.

---

## 2. Activar autenticación de dos factores (2FA) — OBLIGATORIO

GitHub **exige 2FA** desde 2023 para hacer push a la mayoría de repos. Configúralo ya.

1. **Settings → Password and authentication → Two-factor authentication → Enable 2FA**.
2. Elige un método. Recomendados (en orden):
   - **App autenticadora** (Google Authenticator, Authy, 1Password) — la mejor opción.
   - **Security key** (YubiKey) — aún más seguro si tienes una.
3. Guarda los **recovery codes** en un lugar seguro (1Password, archivo cifrado, etc.). Si pierdes el celular y no tienes los códigos de recuperación, **pierdes la cuenta para siempre**.

---

## 3. Completar el perfil

**Settings → Profile:**
- ✅ Nombre completo
- ✅ Foto profesional
- ✅ Bio: ej. "QA Automation Engineer | Playwright | TypeScript"
- ✅ Ubicación
- ⚠️ NO pongas tu correo personal aquí — usa una dirección que aceptes para spam laboral.

---

## 4. Autenticación SSH (recomendado para uso diario)

Para hacer `git push` necesitas autenticarte. Hay 2 métodos: HTTPS con token, o **SSH con llaves**. SSH es **mucho mejor** porque lo configuras una vez y nunca más te pide nada.

> **MUY IMPORTANTE (Windows): ¿Git Bash o PowerShell?**
> En Windows puedes generar la llave SSH **de dos formas**, y los comandos son **diferentes**. El error más común del curso es **mezclar comandos de una terminal en la otra**. Por eso, abajo te damos las dos versiones completas.
> **Elige UNA sola terminal y úsala para TODOS los pasos.** Si eres principiante, te recomendamos **Git Bash** (los comandos son idénticos a los de Mac/Linux).

### 4.1 Generar tu llave SSH

```bash
$ ssh-keygen -t ed25519 -C "tu-correo@ejemplo.com"
```

Cuando pregunte:
- **"Enter file in which to save the key"** → presiona Enter (acepta el default `~/.ssh/id_ed25519`).
- **"Enter passphrase"** → opcional. Si pones una, te la pedirá cada vez (más seguro). Si dejas vacío, no.
- **"Enter same passphrase again"** → repite o Enter.

Resultado:
```
Your identification has been saved in /Users/tu/.ssh/id_ed25519
Your public key has been saved in /Users/tu/.ssh/id_ed25519.pub
```

### 4.2 Copiar la llave pública

#### macOS
```bash
$ pbcopy < ~/.ssh/id_ed25519.pub
```
La llave queda en tu portapapeles.

> 💡 **Opción con llavero (para no volver a teclear la passphrase).** Si le pusiste passphrase a la llave, crea (o edita) el archivo `~/.ssh/config` con este contenido para que macOS la recuerde en el Llavero:
> ```
> Host github.com
>     AddKeysToAgent yes
>     UseKeychain yes
>     IdentityFile ~/.ssh/id_ed25519
> ```
> Luego agrega la llave al agente guardando la passphrase en el llavero:
> ```bash
> $ ssh-add --apple-use-keychain ~/.ssh/id_ed25519
> ```
> En macOS anteriores a Monterey (12) la opción era `-K` en lugar de `--apple-use-keychain`.

#### Windows — Git Bash (recomendado)
Una vez generada la llave, inicia el agente, agrega la llave privada y copia la **pública** al portapapeles:
```bash
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/id_ed25519
$ clip < ~/.ssh/id_ed25519.pub
```

#### Windows — PowerShell nativo
Los comandos cambian (sobre todo iniciar el agente y copiar). La **primera vez** debes habilitar el agente de Windows con PowerShell **como Administrador**:
```powershell
> Get-Service ssh-agent | Set-Service -StartupType Automatic
> Start-Service ssh-agent
```
Después, ya como usuario normal, agrega la llave privada y copia la **pública**:
```powershell
> ssh-add $env:USERPROFILE\.ssh\id_ed25519
> Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard
```

> ⚠️ **Diferencias clave entre las dos terminales (no las mezcles):**
> - **Ruta de la llave:** en Git Bash es `~/.ssh/id_ed25519`; en PowerShell es `$env:USERPROFILE\.ssh\id_ed25519` (con barra invertida `\`).
> - **Iniciar el agente:** `eval "$(ssh-agent -s)"` es de bash y **NO funciona en PowerShell** (da error). En PowerShell se usa `Start-Service ssh-agent`.
> - **Copiar la llave:** en Git Bash es `clip < archivo`; en PowerShell es `Get-Content archivo | Set-Clipboard`.

#### Linux
```bash
$ cat ~/.ssh/id_ed25519.pub
# selecciona y copia con Ctrl+Shift+C
```

> 📋 **Reglas para que GitHub acepte la llave:**
> - Es **UNA sola línea** que empieza con `ssh-ed25519` y termina con tu correo, **sin saltos de línea ni espacios al inicio**.
> - Copia la llave **PÚBLICA** (el archivo que termina en `.pub`). **NUNCA** el archivo sin `.pub`: esa es tu llave **PRIVADA** y es secreta.
> - Si al pegar ves el error **"Key is invalid"**, casi siempre copiaste la privada por error o se coló un salto de línea; vuelve a copiar el `.pub`.

### 4.3 Pegar la llave en GitHub

1. Ve a **GitHub → Settings → SSH and GPG keys → New SSH key**.
2. **Title:** algo descriptivo, ej. `Mi laptop personal MacBook Pro 2023`.
3. **Key type:** Authentication Key.
4. **Key:** pega el contenido del portapapeles. Debe quedar en **una sola línea** empezando con `ssh-ed25519`.
5. **Add SSH key**.

> 💡 **Tips para el Title de la llave.** El título te sirve para saber desde qué equipo te conectas y, si pierdes un dispositivo, cuál revocar. Usa algo que **identifique el equipo**, ej. `Laptop Dell Windows - personal`, `iMac Casa`, `MacBook Trabajo (junio 2026)`. Para ver el nombre real de tu equipo ejecuta `hostname` (en macOS también `scutil --get ComputerName`). **Evita títulos genéricos** como `llave1`.

### 4.4 Probar la conexión

```bash
$ ssh -T git@github.com
```

La primera vez te preguntará si confías en el host:
```
The authenticity of host 'github.com (140.82.x.x)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
```

Escribe `yes` y Enter.

**✅ Resultado esperado:**
```
Hi tu-usuario! You've successfully authenticated, but GitHub does not provide shell access.
```

Si ves este mensaje (con tu usuario), SSH está configurado. **Ya no necesitarás meter contraseñas nunca más al hacer push.**

---

## 5. Usar URLs SSH al clonar

A partir de ahora, cuando clones un repo, usa la URL **SSH** (no HTTPS):

```bash
# ✅ SSH (recomendado)
$ git clone git@github.com:usuario/repo.git

# ❌ HTTPS (te pedirá usuario/token cada vez)
$ git clone https://github.com/usuario/repo.git
```

En la página del repo, click en el botón verde **Code** → pestaña **SSH** → copia la URL.

---

## ⚠️ Alternativa: HTTPS + Personal Access Token (PAT)

Si no quieres SSH, puedes usar HTTPS con un token. Es más simple pero los tokens **expiran** y hay que regenerarlos.

1. **Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)**.
2. **Note:** descripción del token (ej. "laptop personal").
3. **Expiration:** elige un tiempo (90 días recomendado).
4. **Scopes:** marca solo `repo`.
5. **Generate token**.
6. **COPIA EL TOKEN INMEDIATAMENTE** — GitHub nunca lo mostrará de nuevo.
7. La primera vez que hagas `git push`, te pedirá usuario/contraseña. Pon tu usuario de GitHub y el **token** como contraseña.
8. Configura el credential helper para que no te lo pida cada vez:
   ```bash
   # macOS
   $ git config --global credential.helper osxkeychain
   # Windows
   $ git config --global credential.helper manager
   # Linux
   $ git config --global credential.helper cache
   ```

---

## ✅ Checklist

- [ ] Tengo cuenta de GitHub con mi correo de Git.
- [ ] 2FA está activado.
- [ ] Mi perfil tiene foto, nombre y bio.
- [ ] Generé una llave SSH ed25519.
- [ ] La llave pública está pegada en GitHub.
- [ ] `ssh -T git@github.com` me saluda con mi usuario.
- [ ] Sé clonar usando URL SSH (`git@github.com:...`).

---

## ⚠️ Problemas comunes

### `Permission denied (publickey)` al hacer ssh -T
- La llave no está en GitHub, o tienes la llave equivocada en `~/.ssh/`.
- Verifica con `cat ~/.ssh/id_ed25519.pub` y compara con la que pegaste en GitHub Settings.

### Tengo varias cuentas de GitHub (personal y trabajo)
- Necesitas configurar `~/.ssh/config` con varios hosts. Tutorial: [Multiple GitHub accounts with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#using-multiple-repositories-on-one-server).

### `git clone` me pide contraseña aunque tengo SSH configurado
- Estás clonando con URL HTTPS, no SSH. Cambia la URL del remoto:
  ```bash
  $ git remote set-url origin git@github.com:usuario/repo.git
  ```

➡️ Siguiente: [07-playwright-browsers.md](./07-playwright-browsers.md)
