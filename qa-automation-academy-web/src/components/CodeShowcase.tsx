import { useState } from "react";
import { snippets, type Snippet, type Token } from "@/data/snippets";

const tokenClass: Record<Token["kind"], string> = {
  plain: "text-qa-text",
  keyword: "text-qa-lavender",
  string: "text-qa-cyan",
  comment: "text-qa-muted/60 italic",
  fn: "text-qa-periwinkle",
  type: "text-qa-blue",
  cmd: "text-qa-lavender",
};

function renderLine(line: Snippet["lines"][number], index: number) {
  return (
    <div
      key={index}
      className={`flex gap-4 px-6 ${
        line.active ? "bg-qa-cyan/5 border-l-2 border-qa-cyan -ml-[2px]" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="w-6 shrink-0 select-none text-right text-qa-muted/40"
      >
        {index + 1}
      </span>
      <code className="block whitespace-pre">
        {line.tokens.map((tok, i) => (
          <span key={i} className={tokenClass[tok.kind]}>
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
      className={`relative overflow-hidden rounded-2xl border border-qa-line bg-qa-panel shadow-card shadow-glow ${className}`.trim()}
      role="region"
      aria-label="Ejemplos de código de aprendizaje"
    >
      {/* Window chrome */}
      <div className="flex h-10 items-center gap-4 border-b border-qa-line bg-qa-elevated px-4">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-qa-violet/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-qa-periwinkle/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-qa-cyan/60" />
        </div>
        <div
          role="tablist"
          aria-label="Selector de ejemplo"
          className="flex items-center gap-1"
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
                    ? "text-qa-cyan border-b border-qa-cyan"
                    : "text-qa-muted hover:text-qa-text"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <span className="ml-auto hidden font-mono text-[11px] text-qa-muted sm:inline">
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
