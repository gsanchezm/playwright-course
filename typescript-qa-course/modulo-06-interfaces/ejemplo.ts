// ============================================================
// Módulo 6: Interfaces - Runner
// ============================================================
// Cada mini-clase expone su interfaz y su demo:
//   01-api-response.ts  ─ interface ApiResponse
//   02-product-list.ts  ─ interfaces Product + ProductListResponse
//   03-web-actions.ts   ─ interface WebActions + clase PlaywrightHelper
//   04-assertion-fn.ts  ─ interface AssertionFn + expectToEqual
//
// Para correr una sola mini-clase:
//   pnpm tsx modulo-06-interfaces/03-web-actions.ts
// ============================================================

import "./01-api-response";
import "./02-product-list";
import "./03-web-actions";
import "./04-assertion-fn";

// ============================================================
// 📝 Nota: ¿Cuándo usar "type" vs "interface"?
// ============================================================
// - "interface": objetos/clases, declaration merging, extends/implements.
// - "type": union types, intersecciones (&), primitivos, tuples.
// En la práctica: objetos y clases → interface; lo demás → type.
// ============================================================
