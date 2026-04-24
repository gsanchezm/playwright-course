# Módulo 03 — Refactor a POM (OOP incremental)

**Duración estimada:** 50-60 min
**Pieza que suma al framework:** `pages/BasePage.ts` + `LoginPage.ts` + `CatalogPage.ts` + `CheckoutPage.ts`. El spec de M02 se refactoriza y se nota cuánto se limpia.

---

## 🔥 Ritual de apertura — "reactivar el dolor"

**Antes de tocar ninguna clase**, haz este ejercicio:

1. Abre `modulo-02-locators-data/ejemplo.spec.ts`.
2. Marca con resaltador (o copia a un archivo aparte) **cada línea que se repite** entre el bucle de mercados: login, selección de mercado, validación de URL.
3. **Cuenta las líneas duplicadas.** Anota el número.
4. Completa: *"Si añado un tercer flujo (checkout), voy a duplicar ____ líneas más."*

Sólo **después** de ese ejercicio abrimos `BasePage.ts`. El patrón se gana — no se impone.

---

## Analogía

¿Recuerdas el dolor? Cada test nuevo repetía los mismos locators. El **Page Object Model** es la solución: crear un **mapa reutilizable** de cada pantalla, como un tester manual mantiene un documento *"así se llega al módulo de login"*. El código pasa de script a **libro de recetas**: `await loginPage.loginInMarket(user, 'MX')` se lee como user story, no como instrucción técnica.

---

## Conceptos JIT

| Concepto | Analogía QA |
|---|---|
| `class BasePage` | Plantilla genérica: toda pantalla tiene helpers comunes |
| `extends BasePage` | Herencia: no copio, reutilizo |
| `super(page)` | Pasar el `page` al constructor del padre |
| `private get loginButton()` | Documentación interna del Page — el test nunca la toca |
| `public async loginAs(user)` | Acción de negocio — la interfaz pública del POM |
| `protected tid()` | Herramienta del equipo QA interno: la ven las hijas, no el cliente (test) |
| `readonly page: Page` | Tu pestaña del navegador: no cambia a mitad del TC |

> **⚠️ Nota sobre `abstract`:** en este módulo `BasePage` es una clase **normal**, no abstracta. La palabra `abstract` aparecerá por primera vez en M05 cuando tengamos varios servicios que realmente la justifiquen. Por ahora la convención es humana: **no instancies `BasePage` directamente — extiéndela**.

---

## Arquitectura del POM en el framework

```
pages/
├── BasePage.ts        ← clase normal, helpers compartidos (tid, waitForUrl, screenshot)
├── LoginPage.ts       ← extiende BasePage, maneja /
├── CatalogPage.ts     ← extiende BasePage, maneja /catalog
└── CheckoutPage.ts    ← extiende BasePage, maneja /checkout (esqueleto — el reto)
```

---

## Paso a paso

1. **Hacer el ritual** (ver arriba).
2. Abre `pages/BasePage.ts` y lee los comentarios.
3. Abre `pages/LoginPage.ts` y nota:
   - Los locators son `private`.
   - Las acciones públicas leen como user stories.
4. Corre el ejemplo:
   ```bash
   pnpm m3
   ```
5. **Antes/después**: compara `modulo-02/ejemplo.spec.ts` vs `modulo-03/ejemplo.spec.ts`. Cuenta las líneas eliminadas.
6. Reto: completa `reto.spec.ts` (usa `CheckoutPage`).

---

## Outcome esperado

- [ ] Puedes explicar qué significa `private` / `protected` / `public` en este contexto.
- [ ] Entiendes por qué `readonly page: Page` evita bugs.
- [ ] Sabes extender `BasePage` para crear un Page nuevo.
- [ ] **Puedes contar las líneas eliminadas** vs M02.
- [ ] Sabes que `abstract` llega en M05 — no lo introdujimos aquí.

---

## Comandos útiles

```bash
pnpm m3
pnpm typecheck                                   # la herencia introduce errores sutiles
pnpm exec playwright test --reporter=list        # output compacto
```
