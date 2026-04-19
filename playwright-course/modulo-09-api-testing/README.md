# Módulo 9 — API testing puro (aislado del UI)

> **Historia del curso:** hasta M8 construiste un suite completo de UI contra OmniPizza. Hoy aprendes a probar el **backend directamente** con el mismo framework. Este módulo es **completamente independiente del UI** — no usa `page` en ningún lado.
>
> **Referencia oficial:** [API Testing](https://playwright.dev/docs/api-testing)

---

## Filosofía del curso — por qué separar UI de API

Los tests de UI y los de API son disciplinas distintas. En este curso:

| Suite | Qué prueba | Cuándo corre |
|---|---|---|
| `modulo-02…08/` (UI) | Pantallas, flujos de usuario, accesibilidad | PRs + regresión diaria |
| `modulo-09-api-testing/` (API) | Lógica de backend, reglas, contratos HTTP | PRs + regresión diaria |

**No los mezclamos.** El curso NO enseña el patrón "login vía API + sembrar JWT + probar UI" (atomic testing) — ese es un curso avanzado. Aquí, cada suite vive por separado y se ejecuta con un comando propio:

```bash
pnpm test modulo-09-api-testing     # solo API
pnpm test modulo-02-anotaciones     # solo UI
```

---

## OmniPizza Backend

| Aspecto | Valor |
|---|---|
| Live | https://omnipizza-backend.onrender.com |
| Stack | FastAPI (Python) |
| Docs | `/api/docs` (Swagger UI) · `/api/redoc` · `/api/openapi.json` |
| Auth | JWT via POST /api/auth/login |
| Headers requeridos | `Authorization: Bearer <token>` · `X-Country-Code: MX|US|CH|JP` |

### Endpoints principales (los que cubrimos en el módulo)

```
GET  /health                   → healthcheck (no auth)
GET  /api/countries            → lista de mercados (no auth)
GET  /api/pizzas               → catálogo (requiere X-Country-Code)
POST /api/auth/login           → login (body: username, password)
GET  /api/auth/profile         → perfil del usuario (requiere Bearer)
GET  /api/orders               → órdenes del usuario (requiere Bearer)
```

---

## Archivos del módulo

| Archivo | Verbo / Concepto | Escenario |
|---|---|---|
| [01-get-request.spec.ts](./01-get-request.spec.ts) | GET | `/health`, `/api/countries`, `/api/pizzas` |
| [02-post-request.spec.ts](./02-post-request.spec.ts) | POST | `/api/auth/login` — happy path + errores |
| [03-put-patch-delete.spec.ts](./03-put-patch-delete.spec.ts) | PUT / PATCH / DELETE | jsonplaceholder.typicode.com (OmniPizza no los usa) |
| [04-auth-headers.spec.ts](./04-auth-headers.spec.ts) | Headers | Bearer + X-Country-Code + `apiRequest.newContext` |
| [05-api-workflow.spec.ts](./05-api-workflow.spec.ts) | Flujo completo | login → profile → pizzas → orders |
| [reto.spec.ts](./reto.spec.ts) | Integrador | Tu ejercicio de API pura |

---

## Sobre el archivo PUT/PATCH/DELETE

OmniPizza solo expone **GET y POST**. Para enseñar PUT/PATCH/DELETE usamos **jsonplaceholder.typicode.com** (API mock pública, sin API key). La sintaxis es idéntica — cuando tu app real tenga esos verbos, solo cambias la URL.

---

## Cheatsheet

```typescript
import { test, expect } from '@playwright/test';

test('ejemplo', async ({ request }) => {
  // GET
  const getRes = await request.get('https://api.example.com/users/1', {
    headers: { 'X-Country-Code': 'MX' },
  });
  expect(getRes.status()).toBe(200);
  const body = await getRes.json();

  // POST con JSON body
  const postRes = await request.post('https://api.example.com/login', {
    data: { username: 'x', password: 'y' },
  });

  // PUT / PATCH / DELETE — mismo patrón
  await request.put(url, { data });
  await request.patch(url, { data });
  await request.delete(url);
});
```

### Contexto reusable con headers default

```typescript
import { request as apiRequest } from '@playwright/test';

const ctx = await apiRequest.newContext({
  baseURL: 'https://api.example.com',
  extraHTTPHeaders: {
    Authorization: `Bearer ${token}`,
    'X-Country-Code': 'MX',
  },
});

await ctx.get('/pizzas');   // lleva los headers automáticamente
await ctx.dispose();
```

---

## Qué chequear en cada response

```typescript
expect(response.status()).toBe(200);
expect(response.ok()).toBeTruthy();

const body = await response.json();
expect(body).toHaveProperty('access_token');
expect(body.username).toBe('standard_user');

// Headers
expect(response.headers()['content-type']).toContain('application/json');

// URL final (útil si hay redirects)
expect(response.url()).toBe('https://api.example.com/users/1');
```

---

## Cómo correr

```bash
# Todo el módulo
pnpm test modulo-09-api-testing

# Solo un archivo
pnpm test modulo-09-api-testing/02-post-request.spec.ts

# Con reporte detallado
pnpm test modulo-09-api-testing --reporter=list
```

> ⚠️ Las pruebas de API también sufren el cold-start de Render — el `retries: 1` por describe absorbe el primer intento fallido.

➡️ [reto.spec.ts](./reto.spec.ts) · [Módulo 10 — POM (refactor final del framework)](../modulo-10-pom/)
