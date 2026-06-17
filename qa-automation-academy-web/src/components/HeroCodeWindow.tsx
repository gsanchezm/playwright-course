import { snippets } from "@/data/snippets";
import {
  codeTokenClass,
  codeWindowClass,
  codeChromeClass,
} from "@/lib/code-theme";

const snippet = snippets.find((s) => s.id === "playwright") ?? snippets[0];

/**
 * Ventana de código del hero: chrome con traffic lights + nombre de archivo,
 * cuerpo con un test de Playwright resaltado y footer "✓ 1 passed" con cursor
 * parpadeante. Zona de código siempre oscura (tokens code-*).
 */
export default function HeroCodeWindow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`${codeWindowClass} shadow-card ${className}`.trim()}
      role="img"
      aria-label="Ejemplo de un test de Playwright que pasa"
    >
      {/* Chrome */}
      <div className={codeChromeClass}>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-code-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-yellow" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-green" />
        </div>
        <span className="ml-auto truncate font-mono text-[11px] text-code-base/70">
          {snippet.filename}
        </span>
      </div>

      {/* Body */}
      <div className="overflow-x-auto py-5 font-mono text-[13px] leading-[1.75]">
        {snippet.lines.map((line, i) => (
          <div
            key={i}
            className={`flex gap-4 px-5 ${
              line.active ? "bg-code-string/5 border-l-2 border-code-string -ml-[2px]" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className="w-5 shrink-0 select-none text-right text-code-comment/60"
            >
              {i + 1}
            </span>
            <code className="block whitespace-pre">
              {line.tokens.length === 0 ? (
                <span>&nbsp;</span>
              ) : (
                line.tokens.map((tok, j) => (
                  <span key={j} className={codeTokenClass[tok.kind]}>
                    {tok.text}
                  </span>
                ))
              )}
            </code>
          </div>
        ))}
      </div>

      {/* Footer terminal */}
      <div className="flex items-center gap-2 border-t border-code-border bg-[#0b1220] px-5 py-3 font-mono text-[12.5px]">
        <span className="text-code-success">✓</span>
        <span className="text-code-base">1 passed</span>
        <span className="text-code-comment">(1.2s)</span>
        <span className="ml-1 inline-block h-3.5 w-2 bg-code-success animate-qaa-blink" aria-hidden="true" />
      </div>
    </div>
  );
}
