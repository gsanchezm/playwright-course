# 1. Configuración de la cuenta

## 1.1 Crear la cuenta

Entra a [github.com](https://github.com) y regístrate con:
- El **mismo correo** que configuraste en `git config user.email`.
- Un nombre de usuario profesional (este será tu identidad pública: `github.com/tu-usuario`).

> 💡 **Consejo:** usa tu nombre real o una variante profesional. Tu cuenta de GitHub es parte de tu CV como automatizador.

## 1.2 Activar autenticación de dos factores (2FA)

**Obligatorio** desde 2023 para poder hacer push a la mayoría de repos: **Settings → Password and authentication → Two-factor authentication**.

Opciones recomendadas:
- **App autenticadora** (Google Authenticator, Authy, 1Password) — la mejor opción.
- **Security key** (YubiKey) — aún mejor si tienes una.

## 1.3 Configurar tu perfil

**Settings → Profile:**
- Nombre completo.
- Foto (ayuda a que te identifiquen en los PRs).
- Bio: ej. "QA Automation Engineer | Playwright | TypeScript".
- URL de tu LinkedIn o portafolio.

## 1.4 Autenticarse desde la terminal: SSH vs HTTPS

Para subir código a GitHub necesitas autenticarte. Hay 2 métodos:

### Opción A: HTTPS con token personal (PAT)

1. GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic)** → **Generate new token**.
2. Marca los permisos mínimos: `repo` (todas las operaciones de repos).
3. Copia el token **una sola vez** (GitHub no lo muestra de nuevo).
4. La primera vez que hagas `git push`, Git te pedirá usuario y contraseña — pon el token como contraseña.
5. Para no tener que pegarlo cada vez:
   ```bash
   # macOS
   $ git config --global credential.helper osxkeychain
   # Windows
   $ git config --global credential.helper manager
   # Linux
   $ git config --global credential.helper cache
   ```

**Ventaja:** fácil de empezar.
**Desventaja:** los tokens expiran y hay que regenerarlos.

### Opción B: SSH (recomendada para uso diario)

1. Genera un par de llaves SSH:
   ```bash
   $ ssh-keygen -t ed25519 -C "tu-correo@ejemplo.com"
   ```
   Acepta las opciones por defecto (presiona Enter). Si quieres, agrega una passphrase.
2. Muestra la llave pública y cópiala:
   ```bash
   $ cat ~/.ssh/id_ed25519.pub
   ssh-ed25519 AAAAC3Nza...XYZ tu-correo@ejemplo.com
   ```
3. Pégala en **GitHub → Settings → SSH and GPG keys → New SSH key**.
4. Prueba la conexión:
   ```bash
   $ ssh -T git@github.com
   Hi tu-usuario! You've successfully authenticated, but GitHub does not provide shell access.
   ```
5. **Usa URLs SSH al clonar:**
   ```bash
   $ git clone git@github.com:tu-usuario/qa-playwright.git    # SSH
   # en vez de:
   $ git clone https://github.com/tu-usuario/qa-playwright.git # HTTPS
   ```

**Ventaja:** configuras una vez, funciona para siempre.
**Desventaja:** requiere entender llaves SSH.
