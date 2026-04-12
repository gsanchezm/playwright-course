# 2.4 — any (y por qué evitarlo)

> **Módulo 2 · Tipos**

> **Analogía QA:** usar `any` es como aceptar **cualquier dato** en un campo de formulario sin validar nada. Pierdes toda la protección que te da TypeScript y los bugs aparecen en runtime, no en compilación.

---

## ¿Qué aprendes?

- Por qué `any` es un antipatrón.
- Cómo `unknown` te obliga a verificar el tipo antes de usar el valor.

---

## Código

```ts
// Mala práctica: "any" acepta cualquier cosa sin avisar de errores.
let data: any = "esto puede ser cualquier cosa";
data = 42;
data = true;
data = { foo: "bar" };

console.log(`Valor actual de 'data': ${JSON.stringify(data)}`);

// Alternativa segura: "unknown" te obliga a verificar el tipo.
let safeData: unknown = "hola";
if (typeof safeData === "string") {
  console.log(`En mayúsculas: ${safeData.toUpperCase()}`);
}
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/04-any.ts
```

---

## Qué observar

- Con `any`, TypeScript no te avisa si llamas un método que no existe — crash en runtime.
- Con `unknown`, el compilador exige un `typeof` o un cast antes de usar el valor.
- Regla práctica: **nunca uses `any` en código de tests**, salvo para ejemplos pedagógicos como este.

⬅️ Anterior: [2.3 string](/docs/typescript/m2-strings) · ➡️ Siguiente: [2.5 arrays](/docs/typescript/m2-arrays)
