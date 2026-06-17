import type { Token } from "@/data/snippets";

/**
 * Clases de color para la sintaxis dentro de la ventana de código.
 * La zona de código es CONSTANTE en ambos temas (siempre oscura): usa los
 * tokens fijos `code-*` definidos en tailwind.config, no los tokens de tema.
 */
export const codeTokenClass: Record<Token["kind"], string> = {
  plain: "text-code-base",
  keyword: "text-code-keyword",
  string: "text-code-string",
  comment: "text-code-comment italic",
  fn: "text-code-fn",
  type: "text-code-fn",
  cmd: "text-code-keyword",
};

/** Clases compartidas del contenedor "ventana": fondo + borde oscuros fijos. */
export const codeWindowClass =
  "relative overflow-hidden rounded-2xl border border-code-border bg-code-bg";

/** Clases compartidas del chrome (barra superior con traffic lights). */
export const codeChromeClass =
  "flex h-10 items-center gap-4 border-b border-code-border bg-[#0b1220] px-4";
