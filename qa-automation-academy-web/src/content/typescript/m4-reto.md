# 🚩 Reto — Módulo 4: "Structuring the Cart Payload"

> **Módulo 4 · Objetos y Tipos**

> **Analogía QA:** vas a modelar el **payload** de un carrito de compras y restringir el método de pago a un union cerrado — exactamente lo que harías al describir el contrato de un endpoint en un test de contract.

---

## Instrucciones

1. Define un `type` llamado `Product` con las propiedades:
   - `id` (`number`)
   - `name` (`string`)
   - `price` (`number`)
2. Crea una variable `myCart` que sea un **array de `Product`** (`Product[]`) con al menos 2 productos.
3. Crea un union type llamado `PaymentMethod` que solo permita los valores: `"CreditCard"`, `"Cash"` o `"PayPal"`.
4. Declara una variable `selectedPayment` con tipo `PaymentMethod` y asígnale un valor válido.
5. Intenta asignar un valor inválido (ej. `"Bitcoin"`) a `selectedPayment` para ver el error de TypeScript. Luego comenta esa línea.
6. Imprime el carrito y el método de pago.

---

## Plantilla

```ts
// @file modulo-04-objects-types/reto.ts
// 🚩 Reto QA - Módulo 4: "Structuring the Cart Payload"

// TODO 1: Define un "type" llamado "Product" con las propiedades:
//   - id (number)
//   - name (string)
//   - price (number)


// TODO 2: Crea una variable "myCart" que sea un ARRAY de Product (Product[])
// con al menos 2 productos


// TODO 3: Crea un Union Type llamado "PaymentMethod" que solo permita
// los valores: "CreditCard", "Cash" o "PayPal"


// TODO 4: Declara una variable "selectedPayment" con tipo PaymentMethod
// y asígnale un valor válido


// TODO 5: Intenta asignar un valor inválido (ej: "Bitcoin") a selectedPayment
// para ver el error de TypeScript. Luego comenta esa línea.


// TODO 6: Imprime el carrito y el método de pago
// Ejemplo: console.log(`Cart: ${myCart.length} items, Payment: ${selectedPayment}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-objects-types/reto.ts
```

**Output esperado:**

```bash
Cart: 2 items, Payment: CreditCard
Productos: Wireless Mouse, Mechanical Keyboard
```

---

## Checklist de auto-corrección

- [ ] `Product` se declara con `type` (no con `interface` ni con `class`).
- [ ] `myCart` está tipado como `Product[]` y contiene al menos **dos** productos válidos.
- [ ] `PaymentMethod` es un **union de literales** (`"CreditCard" | "Cash" | "PayPal"`).
- [ ] Asignar `"Bitcoin"` produce un **error de compilación** (lo viste y luego comentaste la línea).
- [ ] El `console.log` muestra cantidad de productos y el método de pago seleccionado.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Sintaxis del type: `type Product = { id: number; name: string; price: number };`.
- Array tipado: `const myCart: Product[] = [{ id: 1, name: "...", price: 25 }, ...];`.
- Union de literales: `type PaymentMethod = "CreditCard" | "Cash" | "PayPal";`.
- Para iterar y mostrar nombres: `myCart.map(p => p.name).join(", ")`.

</details>

---

⬅️ Anterior: [4.5 intersection types](/docs/typescript/m4-intersection) · ➡️ Siguiente: [5.1 BasePage](/docs/typescript/m5-base-page)
