# Módulo 9: API Testing con Playwright

> **Objetivo:** Hacer pruebas de APIs REST (GET, POST, PUT, DELETE) directamente desde Playwright usando la fixture `request`, y combinar tests UI + API.

> **Referencia oficial:** [api-testing](https://playwright.dev/docs/api-testing)

> **Sitio de pruebas:** [reqres.in](https://reqres.in) — API REST mock gratuita para aprender.

---

## 🎯 Analogía principal

> **Playwright no es solo para UI — también puede hacer lo que hacías en Postman.**
>
> Ventajas de hacer API testing con Playwright en vez de Postman:
> 1. Todo está en **código versionado en Git**, no en colecciones JSON copiadas.
> 2. Puedes **combinar UI + API en el mismo test**: crear un usuario vía API (rápido) y luego loguearte por UI (real).
> 3. Los tests de API son **10x más rápidos** que los de UI.
> 4. Usas el **mismo framework, mismo runner, mismo reporte** para todo.

**Analogía de equipo:** Antes tenías un automatizador de UI con Playwright y uno de API con Postman/REST Assured. Ahora una sola persona puede mantener ambos con la misma herramienta.

---

## Archivos del módulo

| Archivo | Método HTTP | Concepto |
|---------|-------------|----------|
| [01-get-request.spec.ts](./01-get-request.spec.ts) | GET | Leer datos, status 200, parsear JSON |
| [02-post-request.spec.ts](./02-post-request.spec.ts) | POST | Crear recursos, status 201 |
| [03-put-patch-delete.spec.ts](./03-put-patch-delete.spec.ts) | PUT / PATCH / DELETE | Actualizar y borrar |
| [04-auth-headers.spec.ts](./04-auth-headers.spec.ts) | Headers | Auth tokens, headers custom |
| [05-ui-mas-api.spec.ts](./05-ui-mas-api.spec.ts) | UI + API | Setup de datos por API + verificación UI |
| [reto.spec.ts](./reto.spec.ts) | — | Retos del alumno |

---

## 📋 Pasos explícitos para explicar en clase

1. **Pregunta al grupo:** "¿quién usa Postman hoy?". Explica que Playwright reemplaza Postman con ventajas.
2. **Muestra `01-get-request.spec.ts`** — el equivalente a un "Send" en Postman, pero en código versionado.
3. **Hablar de status codes:** 200, 201, 400, 401, 404, 500. Pídeles que los anoten.
4. **Muestra `02-post-request.spec.ts`** — crear un recurso y validar el body de respuesta.
5. **Explica PUT vs PATCH vs DELETE** en `03-*`. Usa la analogía: PUT = reemplazar todo el perfil, PATCH = cambiar solo el email, DELETE = borrar la cuenta.
6. **Muestra `04-auth-headers.spec.ts`** — cómo mandar tokens y headers custom.
7. **⭐ Muestra `05-ui-mas-api.spec.ts`** — el momento WOW. Explica cómo combinar ambos mundos: "en vez de loguearnos por UI (20 segundos), creamos el usuario por API (0.2 segundos) y luego validamos por UI".
8. **Envía al reto.**

---

## Cheatsheet de métodos HTTP

```typescript
import { test, expect } from '@playwright/test';

test('ejemplo', async ({ request }) => {
  // GET — leer
  const getRes = await request.get('https://reqres.in/api/users/1');
  expect(getRes.status()).toBe(200);
  const getBody = await getRes.json();

  // POST — crear
  const postRes = await request.post('https://reqres.in/api/users', {
    data: { name: 'María', job: 'QA' },
  });
  expect(postRes.status()).toBe(201);

  // PUT — reemplazar
  const putRes = await request.put('https://reqres.in/api/users/1', {
    data: { name: 'María', job: 'Lead QA' },
  });

  // PATCH — actualizar parcial
  const patchRes = await request.patch('https://reqres.in/api/users/1', {
    data: { job: 'Lead QA' },
  });

  // DELETE — eliminar
  const delRes = await request.delete('https://reqres.in/api/users/1');
  expect(delRes.status()).toBe(204);
});
```

➡️ Empieza por [01-get-request.spec.ts](./01-get-request.spec.ts).
