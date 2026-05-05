# Módulo 03 — Refactor a POM (OOP incremental)

**Duración estimada:** 80-105 min (incluye dos *Git breaks* — branches y conflictos)
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

---

## 🌿 Git break — Refactoriza en una rama (no en `main`)

Vas a tocar varios archivos a la vez (`BasePage`, `LoginPage`, `CatalogPage`, `CheckoutPage`). Esto es **el momento perfecto** para una rama dedicada: si el refactor sale mal, descartas la rama y `main` queda intacto.

### El flujo

```bash
# 1. Asegúrate de estar en main al día
$ git switch main
$ git pull            # sólo si ya tienes remoto configurado

# 2. Crea tu rama de feature
$ git switch -c feature/m03-pom

# 3. Trabaja, commitea por pasos
$ git add pages/BasePage.ts
$ git commit -m "refactor: add BasePage with shared helpers"

$ git add pages/LoginPage.ts pages/CatalogPage.ts
$ git commit -m "refactor: extract Login and Catalog Page Objects"

# 4. Cuando el refactor está listo, vuelve a main y mergea
$ git switch main
$ git merge feature/m03-pom

# 5. Borra la rama ya mergeada
$ git branch -d feature/m03-pom
```

### Convención de nombres de rama

| Prefijo | Uso |
|---|---|
| `feature/` | Nueva capacidad (POM, fixture, test) |
| `fix/` | Arreglar un test flaky o bug del framework |
| `chore/` | Upgrade de dependencias, limpieza |
| `refactor/` | Reestructurar sin cambiar comportamiento |

### Fast-forward vs merge commit

Cuando `main` no tiene commits nuevos desde que creaste tu rama, Git hace **fast-forward** (avanza el puntero, sin commit extra). Si `main` avanzó (porque alguien más mergeó), Git crea un **merge commit** con dos padres. Ambos están bien — sólo es bueno saber qué estás viendo cuando lees `git log --graph`.

---

## ⚔️ Git break — Resolver un conflicto

Imagina que tú estás en `feature/m03-pom` y cambiaste el locator del input de email en `LoginPage`:

```typescript
// Tu cambio
get emailInput() { return this.page.getByLabel('Correo'); }
```

Mientras tanto, una compañera ya mergeó otro cambio al mismo método en `main`:

```typescript
// El cambio en main que llegó primero
get emailInput() { return this.page.getByRole('textbox', { name: 'Email' }); }
```

Cuando intentas mergear, Git no puede decidir y te avisa:

```bash
$ git switch main
$ git merge feature/m03-pom
Auto-merging pages/LoginPage.ts
CONFLICT (content): Merge conflict in pages/LoginPage.ts
Automatic merge failed; fix conflicts and then commit the result.
```

### Cómo se ve el archivo en conflicto

```typescript
export class LoginPage extends BasePage {
<<<<<<< HEAD
  get emailInput() { return this.page.getByRole('textbox', { name: 'Email' }); }
=======
  get emailInput() { return this.page.getByLabel('Correo'); }
>>>>>>> feature/m03-pom
}
```

- `<<<<<<< HEAD` = lo que está en `main` ahora.
- `=======` = separador.
- `>>>>>>> feature/m03-pom` = lo que trae tu rama.

### Cómo lo resuelves

1. Decide manualmente cuál se queda (o combinas ambos).
2. **Borra los marcadores** (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Marca el archivo como resuelto y termina el merge:

```bash
$ git add pages/LoginPage.ts
$ git commit                # abre el editor con el mensaje pre-escrito; guarda y cierra
```

### Si te arrepientes

```bash
$ git merge --abort
```

Esto regresa el repo al estado previo, como si el merge nunca hubiera pasado.

> 💡 **VS Code** tiene botones inline **Accept Current**, **Accept Incoming**, **Accept Both** sobre cada bloque en conflicto. Úsalos para evitar errores manuales.

---

> 📚 **Profundización opcional:** [Conceptos de ramas](../../git-github-course/modulo-04-ramas-y-merge/01-ramas-conceptos.md) · [Flujo feature-branch detallado](../../git-github-course/modulo-04-ramas-y-merge/03-flujo-feature-branch.md) · [Tipos de merge](../../git-github-course/modulo-04-ramas-y-merge/04-merge.md) · [Conflictos avanzados](../../git-github-course/modulo-04-ramas-y-merge/05-conflictos.md) · [Workflows de equipo y rebase](../../git-github-course/modulo-05-workflows-rebase/)

