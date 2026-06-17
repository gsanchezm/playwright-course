import { useMemo } from "react";
import { tokenizeTs } from "@/lib/tokenize-ts";
import {
  codeTokenClass,
  codeWindowClass,
  codeChromeClass,
} from "@/lib/code-theme";

type Props = {
  code: string;
  filename: string;
  /** Subcadenas que marcan las líneas activas (resaltadas) del paso. */
  highlight?: string[];
};

export default function LessonEditor({ code, filename, highlight = [] }: Props) {
  const lines = useMemo(() => tokenizeTs(code), [code]);

  return (
    <div className={`${codeWindowClass} shadow-card`}>
      <div className={codeChromeClass}>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-code-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-yellow" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-green" />
        </div>
        <span className="ml-auto truncate font-mono text-[11px] text-code-base/70">
          {filename}
        </span>
      </div>

      <div className="overflow-x-auto py-4 font-mono text-[13px] leading-[1.75]">
        {lines.map((line, i) => {
          const text = line.tokens.map((t) => t.text).join("");
          const active =
            text.trim().length > 0 &&
            highlight.some((h) => text.includes(h));
          return (
            <div
              key={i}
              className={`flex gap-4 px-5 ${
                active
                  ? "bg-code-string/10 border-l-2 border-code-string -ml-[2px]"
                  : ""
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
          );
        })}
      </div>
    </div>
  );
}
