import { tokenizeTs } from "@/lib/tokenize-ts";
import {
  codeTokenClass,
  codeWindowClass,
  codeChromeClass,
} from "@/lib/code-theme";
import type { Line } from "@/data/snippets";

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
    <div className={`my-6 ${codeWindowClass} shadow-card`}>
      {/* Window chrome */}
      <div className={codeChromeClass}>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-code-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-yellow" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-green" />
        </div>
        {label && (
          <span className="ml-auto truncate font-mono text-[11px] text-code-base/70">
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
              className="w-6 shrink-0 select-none text-right text-code-comment/60"
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
    </div>
  );
}
