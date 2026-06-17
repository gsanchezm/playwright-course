// ============================================================
// helpers/dom.ts — el "navegador de bolsillo" del curso
// ============================================================
// Carga UNA vez el fixture estatico `fixtures/omnipizza.html` dentro de un
// DOM de jsdom y expone helpers minimos para practicar selectores OFFLINE:
//
//   import { countCss, countXpath, $$, $x, text, attr } from "../helpers/dom";
//
//   - CSS   -> document.querySelectorAll(selector)
//   - XPath -> document.evaluate(expr, ...)   (XPath 1.0, como el navegador)
//
// ⚠️ FIDELIDAD: jsdom es un APROXIMADOR de sintaxis. Cubre CSS moderno
// (:has, :is, :where, :not, atributos) y casi todo XPath 1.0 (ejes,
// contains, normalize-space, translate, text() vs .). La UNICA divergencia
// conocida es la indexacion con parentesis `(//x)[n]`, que jsdom evalua
// como `//x[n]` (por-padre). En el navegador / Playwright / Selenium es
// correcta. Regla del curso: jsdom = sintaxis; navegador = verdad.
// ============================================================

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";

// __dirname existe porque el curso corre en modo CommonJS bajo tsx
// (igual que el curso de Regex). Cargamos el fixture relativo a ESTE modulo.
const fixturePath = join(__dirname, "..", "fixtures", "omnipizza.html");
const html = readFileSync(fixturePath, "utf8");

const dom = new JSDOM(html);

/** El `document` del fixture de OmniPizza (un DOM real, sin red ni JS). */
export const document = dom.window.document;

const XPathResult = dom.window.XPathResult;

/** querySelectorAll como array (mas comodo que un NodeList para .length / .map). */
export function $$(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

/** Cuantos elementos matchea un selector CSS. El "asercion" mas barato. */
export function countCss(selector: string): number {
  return $$(selector).length;
}

/** Evalua una expresion XPath y devuelve los nodos como array (snapshot ordenado). */
export function $x(expression: string): Node[] {
  const result = document.evaluate(
    expression,
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null,
  );
  const nodes: Node[] = [];
  for (let i = 0; i < result.snapshotLength; i++) {
    const node = result.snapshotItem(i);
    if (node) nodes.push(node);
  }
  return nodes;
}

/** Cuantos nodos matchea una expresion XPath. */
export function countXpath(expression: string): number {
  return $x(expression).length;
}

/** Texto visible de un nodo, con el whitespace recortado (como normalize-space). */
export function text(node: Node | Element | undefined | null): string {
  return (node?.textContent ?? "").trim();
}

/** Valor de un atributo, o null si no existe. */
export function attr(el: Element | undefined | null, name: string): string | null {
  return el ? el.getAttribute(name) : null;
}
