import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Link } from "react-router-dom";
import CodeWindow from "./CodeWindow";

function collectText(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(collectText).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return collectText(props.children);
  }
  return "";
}

function extractFilename(code: string): { filename?: string; code: string } {
  const lines = code.split("\n");
  const first = lines[0] ?? "";
  // Matches "// @file path" or "# @file path"
  const match = first.match(/^\s*(?:\/\/|#)\s*@file\s+(.+?)\s*$/);
  if (match) {
    return { filename: match[1], code: lines.slice(1).join("\n") };
  }
  return { code };
}

type Props = {
  content: string;
};

export default function MarkdownContent({ content }: Props) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="mb-6 font-display text-3xl font-semibold leading-tight tracking-tight text-qa-text sm:text-4xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 font-display text-2xl font-semibold leading-snug tracking-tight text-qa-text first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 font-display text-xl font-medium leading-snug text-qa-text">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-6 font-sans text-base font-semibold text-qa-text">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="mb-4 font-sans text-base leading-relaxed text-qa-muted">
        {children}
      </p>
    ),
    a: ({ href, children }) => {
      const isInternal = href?.startsWith("/");
      if (isInternal && href) {
        return (
          <Link
            to={href}
            className="text-qa-cyan underline underline-offset-2 transition-colors hover:text-qa-ice"
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-qa-cyan underline underline-offset-2 transition-colors hover:text-qa-ice"
        >
          {children}
        </a>
      );
    },
    ul: ({ children }) => (
      <ul className="mb-4 space-y-1.5 pl-5 font-sans text-base text-qa-muted">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-1.5 pl-5 font-sans text-base text-qa-muted">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed marker:text-qa-cyan/70">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-2 border-qa-cyan/50 bg-qa-elevated/60 py-3 pl-4 pr-3 font-sans text-sm italic text-qa-muted">
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...rest }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="rounded bg-qa-panel px-1.5 py-0.5 font-mono text-sm text-qa-cyan"
            {...rest}
          >
            {children}
          </code>
        );
      }
      // Block code — render untouched so `pre` can introspect className + text.
      return <code className={className}>{children}</code>;
    },
    pre: ({ children }) => {
      const child = Array.isArray(children) ? children[0] : children;
      if (!isValidElement(child)) {
        return (
          <pre className="mb-4 overflow-x-auto rounded-xl border border-qa-line bg-qa-panel p-4 font-mono text-sm leading-relaxed">
            {children}
          </pre>
        );
      }
      const childProps = child.props as {
        className?: string;
        children?: ReactNode;
      };
      const className = childProps.className ?? "";
      const langMatch = className.match(/language-(\w+)/);
      const language = langMatch ? langMatch[1] : undefined;
      const rawText = collectText(childProps.children).replace(/\n$/, "");
      const { filename, code } = extractFilename(rawText);
      return (
        <CodeWindow code={code} language={language} filename={filename} />
      );
    },
    table: ({ children }) => (
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse font-sans text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-qa-line">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="py-2.5 pr-4 text-left font-mono text-xs uppercase tracking-wider text-qa-muted">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-qa-line/40 py-2.5 pr-4 text-qa-muted">
        {children}
      </td>
    ),
    hr: () => <hr className="my-8 border-qa-line" />,
    strong: ({ children }) => (
      <strong className="font-semibold text-qa-text">{children}</strong>
    ),
    em: ({ children }) => <em className="text-qa-muted/80">{children}</em>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
