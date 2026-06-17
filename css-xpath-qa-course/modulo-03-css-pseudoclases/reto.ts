// ============================================================
// 🚩 Reto QA — Módulo 3: "Aislar con pseudo-clases relacionales"
// ============================================================
// Instrucciones:
//   1. Tu tarea: escribe UN selector CSS que use :has() y/o :not() y aísle
//      EXACTAMENTE la card "Sin Gluten" que NO esté agotada. En OmniPizza esa
//      card es Cuatro Quesos (data-testid="pizza-card-102"): tiene el badge
//      .badge--sin-gluten y NO tiene el atributo data-sold-out.
//
//      Pistas conceptuales (NO la respuesta):
//        - :has() te deja pedir "la card que CONTENGA un badge concreto" (3.5).
//        - :not([...]) te deja excluir las que tengan un atributo (3.4).
//        - Combínalos en un solo selector sobre .pizza-card.
//
//   2. Reemplaza el selector marcado con CAMBIAME (ahora ".pizza-card", que
//      matchea las 4) por tu selector. Debe dejar EXACTAMENTE 1 match y que
//      ese match sea la card 102.
//
//   3. Ejecuta:  pnpm tsx modulo-03-css-pseudoclases/reto.ts
//
//   Es ESPERADO que veas ❌ hasta resolverlo: con ".pizza-card" el conteo da 4
//   (no 1) y la identidad no es "pizza-card-102". Cuando tu selector esté bien,
//   las DOS filas quedan en ✅: exactamente 1 match y es la card 102.
//
//   BONUS (opcional): hay un segundo objetivo comentado abajo — aislar el ÚNICO
//   input deshabilitado de toppings (Jalapeño). Descoméntalo y resuélvelo igual.
// ============================================================
import { $$, attr } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 3: Aislar con pseudo-clases relacionales =====");

// ------------------------------------------------------------
// TODO: reemplaza el selector CAMBIAME por uno con :has() y/o :not() que
//       deje EXACTAMENTE 1 match: la card Sin Gluten NO agotada (102).
// ------------------------------------------------------------
const SELECTOR_RETO = ".pizza-card"; // CAMBIAME (combina una relación :has(...) con una exclusión :not([...]))

// ------------------------------------------------------------
// Aserciones (NO las toques): tu selector debe matchear 1 elemento y ese
// elemento debe ser la card con data-testid="pizza-card-102".
// ------------------------------------------------------------
const elegidos = $$(SELECTOR_RETO);
check("el selector deja EXACTAMENTE 1 match", elegidos.length, 1);
check(
  "ese único match es la card Sin Gluten no agotada (102)",
  attr(elegidos[0], "data-testid"),
  "pizza-card-102",
);

// ------------------------------------------------------------
// BONUS — descomenta y resuelve: aísla el ÚNICO input deshabilitado de
// toppings (el checkbox Jalapeño, value="jalapeno").
// ------------------------------------------------------------
// const SELECTOR_BONUS = ".toppings input"; // CAMBIAME (filtra por :disabled)
// const bonus = $$(SELECTOR_BONUS);
// check("BONUS: exactamente 1 input deshabilitado en toppings", bonus.length, 1);
// check("BONUS: ese input es el de Jalapeño", attr(bonus[0], "value"), "jalapeno");

console.log(
  "\nObjetivo: cuando tu selector esté listo, las 2 filas muestran ✅ " +
    "(1 match y es pizza-card-102).",
);
