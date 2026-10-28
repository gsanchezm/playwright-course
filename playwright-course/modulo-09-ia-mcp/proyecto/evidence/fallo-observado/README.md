# Evidencia capturada de una falla

Archivos de esta carpeta, capturados en vivo contra OmniPizza (Chromium, mercado MX):

- `error.txt` — mensaje de error de una aserción de Playwright ejecutada sobre el catálogo.
- `aria-snapshot.txt` — `ariaSnapshot()` del `body` de `/catalog` en el momento de la falla.
- `actions.log` — pasos ejecutados, uno por línea, con el valor observado en cada intento (3 intentos).
- `screenshot.png` — captura de página completa del catálogo en el momento de la falla.

La historia relacionada es `stories/US-03-login-usuario-problematico.md`.
