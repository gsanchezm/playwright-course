# Reto — Módulo 1: Primer contacto con OmniPizza

## Reto 1.1 — Instalación completa

1. Desde `playwright-course/` corre `pnpm install`.
2. Corre `pnpm install-browsers` (descarga Chromium, Firefox y WebKit).
3. Verifica con `pnpm exec playwright --version`.

**✅ Resultado esperado:** ves una versión `1.47.x` o superior.

---

## Reto 1.2 — Despierta OmniPizza

El backend vive en Render con free tier; si nadie lo ha tocado, está "dormido".

1. Abre https://omnipizza-frontend.onrender.com en tu navegador.
2. Espera a ver el formulario de login (puede tardar 20-40 s).
3. Haz login manualmente con `standard_user` / `pizza123` y confirma que llegas al catálogo.

**✅ Resultado esperado:** ves las pizzas en `/catalog`. (Si no, el backend sigue dormido — vuelve a refrescar.)

---

## Reto 1.3 — Corre tu primer test

```bash
pnpm test modulo-01-vision-general/hello.spec.ts
```

**✅ Resultado esperado:** 1 test verde en ~5-10 s (más si el backend estaba frío).

---

## Reto 1.4 — Rompe y arregla

1. En `hello.spec.ts`, cambia `standard_user` por `locked_out_user`.
2. Corre el test. Va a fallar porque `locked_out_user` recibe 403 y nunca llega a `/catalog`.
3. Observa el mensaje de error.
4. Restaura `standard_user` y vuelve a correr.

**✅ Resultado esperado:** primero rojo con un error claro del assertion de URL; luego verde.

---

## Reto 1.5 — Modo UI

Corre el suite en modo interactivo:

```bash
pnpm test:ui
```

En la ventana que abre:
1. Presiona "▶️ Run" sobre el test de `hello.spec.ts`.
2. Observa el time-travel: puedes clickar cualquier paso de la izquierda y ves el DOM congelado.
3. Pasa el cursor sobre `getByLabel('Username')` — verás el elemento resaltado.

**✅ Resultado esperado:** entiendes que Playwright UI es un IDE visual para tus tests.

---

## Reto 1.6 — Preguntas teóricas

1. ¿Por qué Playwright descarga sus propios navegadores en vez de usar los que ya tienes instalados?
2. ¿Qué significa `fullyParallel: true` en `playwright.config.ts`?
3. ¿Cuál es la diferencia conceptual entre `browser`, `context` y `page`?
4. ¿Por qué OmniPizza usa usuarios "deterministas" en vez de cuentas reales? ¿Qué ventaja tiene para el testing?

**Respuestas:**

1. Para garantizar que los tests corran **exactamente igual** en tu laptop, en la de un compañero y en CI. Evita bugs del tipo "a mí me pasa pero a ti no".
2. Que los archivos de test se ejecutan en paralelo usando varios workers, lo que acelera el suite completo.
3. `browser` es el navegador completo; `context` es un perfil aislado (cookies, storage) dentro de ese navegador — como una ventana incógnito; `page` es una pestaña dentro del context.
4. Porque permiten reproducir comportamientos específicos (happy path, error, latencia) de forma **determinista**. En la vida real es imposible probar "un usuario lento" con una cuenta normal — OmniPizza te regala esa variación de golpe.

---

## ✅ Checklist

- [ ] Playwright y los 3 navegadores están instalados.
- [ ] El deploy live de OmniPizza responde.
- [ ] Corrí `hello.spec.ts` en verde.
- [ ] Rompí y arreglé el test cambiando de usuario.
- [ ] Exploré Playwright UI.

➡️ Siguiente: [Módulo 2 — Anotaciones](../modulo-02-anotaciones/)
