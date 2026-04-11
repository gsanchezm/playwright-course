import type { Line, Token, TokenKind } from "@/data/snippets";

const KEYWORDS = new Set([
  "let",
  "const",
  "var",
  "if",
  "else",
  "function",
  "return",
  "true",
  "false",
  "type",
  "interface",
  "class",
  "new",
  "import",
  "from",
  "export",
  "null",
  "undefined",
  "as",
  "typeof",
  "in",
  "of",
  "for",
  "while",
  "extends",
  "implements",
  "async",
  "await",
]);

const TYPE_WORDS = new Set([
  "string",
  "number",
  "boolean",
  "void",
  "null",
  "undefined",
  "any",
  "unknown",
  "never",
  "object",
]);

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  const trimStart = line.search(/\S/);
  if (trimStart >= 0 && line.slice(trimStart).startsWith("//")) {
    return [{ kind: "comment", text: line }];
  }

  let i = 0;
  let plainBuf = "";

  const flushPlain = () => {
    if (!plainBuf) return;
    const re = /([A-Za-z_$][A-Za-z0-9_$]*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(plainBuf)) !== null) {
      if (m.index > last) {
        tokens.push({ kind: "plain", text: plainBuf.slice(last, m.index) });
      }
      const word = m[1];
      const nextChar = plainBuf[re.lastIndex] ?? "";
      let kind: TokenKind;
      if (KEYWORDS.has(word)) {
        kind = "keyword";
      } else if (TYPE_WORDS.has(word)) {
        kind = "type";
      } else if (/^[A-Z]/.test(word)) {
        kind = "type";
      } else if (nextChar === "(" || word === "console") {
        kind = "fn";
      } else {
        kind = "plain";
      }
      tokens.push({ kind, text: word });
      last = re.lastIndex;
    }
    if (last < plainBuf.length) {
      tokens.push({ kind: "plain", text: plainBuf.slice(last) });
    }
    plainBuf = "";
  };

  while (i < line.length) {
    const ch = line[i];

    if (ch === '"' || ch === "'" || ch === "`") {
      flushPlain();
      const quote = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === "\\") j += 2;
        else j += 1;
      }
      j = Math.min(j + 1, line.length);
      tokens.push({ kind: "string", text: line.slice(i, j) });
      i = j;
      continue;
    }

    if (ch === "/" && line[i + 1] === "/") {
      flushPlain();
      tokens.push({ kind: "comment", text: line.slice(i) });
      i = line.length;
      continue;
    }

    plainBuf += ch;
    i += 1;
  }

  flushPlain();
  return tokens;
}

export function tokenizeTs(code: string): Line[] {
  return code.split("\n").map((raw) => ({ tokens: tokenizeLine(raw) }));
}
