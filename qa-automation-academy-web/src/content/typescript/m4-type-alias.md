# 4.2 — `type` alias: un molde reutilizable

> **Módulo 4 · Objetos y Tipos**

> **Analogía QA:** un `type` es como definir las **columnas de una tabla** de usuarios de prueba o el **schema de una fixture**. Una vez definido, lo usas para tipar todos los registros con la misma forma.

---

## ¿Qué aprendes?

- Cómo declarar un `type` con `export type Nombre = { ... }`.
- Por qué separar el `type` (el contrato) de los **datos** (las fixtures) ayuda a reutilizar.
- Cómo `import type { ... }` trae solo el tipo sin agregar peso al bundle final.

---

## Código

```ts
// @file modulo-04-objects-types/02-type-alias/test-user.type.ts
export type TestUser = {
  username: string;
  password: string;
  isActive: boolean;
};
```

```ts
// @file modulo-04-objects-types/02-type-alias/test-users.ts
import type { TestUser } from "./test-user.type";

export const adminUser: TestUser = {
  username: "admin@test.com",
  password: "SecurePass123!",
  isActive: true,
};

export const viewerUser: TestUser = {
  username: "viewer@test.com",
  password: "Viewer123!",
  isActive: false,
};
```

```ts
// @file modulo-04-objects-types/02-type-alias/index.ts
import { adminUser, viewerUser } from "./test-users";

console.log(`Admin: ${adminUser.username}, Active: ${adminUser.isActive}`);
console.log(`Viewer: ${viewerUser.username}, Active: ${viewerUser.isActive}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-objects-types/02-type-alias/index.ts
```

---

## Qué observar

- El `type` vive en su propio archivo `.type.ts` para dejar claro que **solo describe forma**, no aporta lógica.
- Las fixtures (`adminUser`, `viewerUser`) reutilizan el contrato sin repetir las claves.
- Si mañana cambias `isActive` por `enabled` en el `type`, **todos** los lugares que lo usen marcan error de compilación — esa es la red de seguridad que ganas al tipar.

---

⬅️ Anterior: [4.1 objeto básico](/docs/typescript/m4-basic-object) · ➡️ Siguiente: [4.3 propiedades opcionales](/docs/typescript/m4-optional-props)
