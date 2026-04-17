# 3. Flujo básico: feature branch

Este es el flujo que usarás **todos los días** en un equipo de automatización:

```bash
# 1. Asegúrate de estar al día con main
$ git switch main
$ git pull origin main

# 2. Crea tu rama de feature con un nombre descriptivo
$ git switch -c feature/add-mobile-checkout-tests

# 3. Trabaja: edita, agrega, commitea
$ # ...editas tests/checkout.mobile.spec.ts...
$ git add tests/checkout.mobile.spec.ts
$ git commit -m "test: add mobile checkout happy path"

$ # ...editas pages/MobileCheckoutPage.ts...
$ git add pages/MobileCheckoutPage.ts
$ git commit -m "test: add MobileCheckoutPage POM"

# 4. Vuelve a main y mergea tu feature
$ git switch main
$ git merge feature/add-mobile-checkout-tests

# 5. Borra la rama ya mergeada
$ git branch -d feature/add-mobile-checkout-tests
```

## Convenciones de nombres de ramas

Un buen nombre de rama sigue el patrón `<tipo>/<descripción-corta>`:

| Prefijo | Uso |
|---------|-----|
| `feature/` | Nuevo test, nueva Page Object, nueva capacidad del framework |
| `fix/` | Arreglar un test flaky, un bug del framework |
| `chore/` | Mantenimiento: upgrade de dependencias, limpieza |
| `refactor/` | Reestructurar sin cambiar comportamiento |
| `ci/` | Cambios en el pipeline de CI/CD |
| `docs/` | Solo documentación |

Ejemplos buenos:
- `feature/add-api-login-helper`
- `fix/flaky-checkout-race-condition`
- `chore/upgrade-playwright-1.47`
- `ci/run-tests-on-pr`

❌ Ejemplos malos:
- `mi-rama`, `test`, `cambios`, `tmp`, `juan-sucursal`
