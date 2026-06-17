import { useState } from "react";
import { snippets, type Snippet } from "@/data/snippets";
import {
  codeTokenClass,
  codeWindowClass,
  codeChromeClass,
} from "@/lib/code-theme";

function renderLine(line: Snippet["lines"][number], index: number) {
  return (
    <div
      key={index}
      className={`flex gap-4 px-6 ${
        line.active ? "bg-code-string/5 border-l-2 border-code-string -ml-[2px]" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="w-6 shrink-0 select-none text-right text-code-comment/60"
      >
        {index + 1}
      </span>
      <code className="block whitespace-pre">
        {line.tokens.map((tok, i) => (
          <span key={i} className={codeTokenClass[tok.kind]}>
            {tok.text}
          </span>
        ))}
      </code>
    </div>
  );
}

type Props = {
  className?: string;
  initialTab?: Snippet["id"];
};

export default function CodeShowcase({
  className = "",
  initialTab = "typescript",
}: Props) {
  const [active, setActive] = useState<Snippet["id"]>(initialTab);
  const current = snippets.find((s) => s.id === active) ?? snippets[0];

  return (
    <div
      className={`${codeWindowClass} shadow-card ${className}`.trim()}
      role="region"
      aria-label="Ejemplos de código de aprendizaje"
    >
      {/* Window chrome */}
      <div className={codeChromeClass}>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-code-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-yellow" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-green" />
        </div>
        <div
          role="tablist"
          aria-label="Selector de ejemplo"
          className="flex items-center gap-0.5 overflow-x-auto"
        >
          {snippets.map((s) => {
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`panel-${s.id}`}
                id={`tab-${s.id}`}
                onClick={() => setActive(s.id)}
                className={`px-3 py-1 font-mono text-xs transition-colors ${
                  isActive
                    ? "text-code-string border-b border-code-string"
                    : "text-code-base/70 hover:text-code-base"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <span className="ml-auto hidden font-mono text-[11px] text-code-base/70 sm:inline">
          {current.filename}
        </span>
      </div>

      {/* Code body */}
      <div
        id={`panel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${current.id}`}
        className="overflow-x-auto py-5 font-mono text-sm leading-[1.7]"
      >
        {current.lines.map((line, i) => renderLine(line, i))}
      </div>
    </div>
  );
}
