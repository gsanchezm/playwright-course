import { tokenizeTs } from "@/lib/tokenize-ts";
import type { Line, Token } from "@/data/snippets";

const tokenClass: Record<Token["kind"], string> = {
  plain: "text-qa-text",
  keyword: "text-qa-lavender",
  string: "text-qa-cyan",
  comment: "text-qa-muted/60 italic",
  fn: "text-qa-periwinkle",
  type: "text-qa-blue",
  cmd: "text-qa-lavender",
};

type Props = {
  code: string;
  language?: string;
  filename?: string;
};

function plainLines(code: string): Line[] {
  return code.split("\n").map((line) => ({
    tokens: line ? [{ kind: "plain", text: line }] : [],
  }));
}

function bashLines(code: string): Line[] {
  return code.split("\n").map((line) => {
    if (!line) return { tokens: [] };
    const trimmed = line.trimStart();
    if (trimmed.startsWith("#")) {
      return { tokens: [{ kind: "comment", text: line }] };
    }
    // Highlight leading $ prompt as plain, first word after as cmd.
    const promptMatch = line.match(/^(\s*\$\s*)(\S+)(.*)$/);
    if (promptMatch) {
      return {
        tokens: [
          { kind: "plain", text: promptMatch[1] },
          { kind: "cmd", text: promptMatch[2] },
          { kind: "plain", text: promptMatch[3] },
        ],
      };
    }
    return { tokens: [{ kind: "plain", text: line }] };
  });
}

export default function CodeWindow({ code, language, filename }: Props) {
  const isTs =
    language === "ts" || language === "tsx" || language === "typescript";
  const isBash =
    language === "bash" || language === "sh" || language === "shell";

  const lines: Line[] = isTs
    ? tokenizeTs(code)
    : isBash
      ? bashLines(code)
      : plainLines(code);

  const label = filename ?? (language ? language.toUpperCase() : null);

  return (
    <div className="my-6 relative overflow-hidden rounded-2xl border border-qa-line bg-qa-panel shadow-card shadow-glow">
      {/* Window chrome */}
      <div className="flex h-10 items-center gap-4 border-b border-qa-line bg-qa-elevated px-4">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-qa-violet/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-qa-periwinkle/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-qa-cyan/60" />
        </div>
        {label && (
          <span className="ml-auto truncate font-mono text-[11px] text-qa-muted">
            {label}
          </span>
        )}
      </div>
      {/* Code body */}
      <div className="overflow-x-auto py-5 font-mono text-sm leading-[1.7]">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4 px-6">
            <span
              aria-hidden="true"
              className="w-6 shrink-0 select-none text-right text-qa-muted/40"
            >
              {i + 1}
            </span>
            <code className="block whitespace-pre">
              {line.tokens.length === 0 ? (
                <span>&nbsp;</span>
              ) : (
                line.tokens.map((tok, j) => (
                  <span key={j} className={tokenClass[tok.kind]}>
                    {tok.text}
                  </span>
                ))
              )}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
