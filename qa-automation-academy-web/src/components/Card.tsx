import type { ReactNode } from "react";
import type { PathAccent } from "@/data/paths";

type Props = {
  children: ReactNode;
  accent?: PathAccent;
  showHighlight?: boolean;
  as?: "article" | "div";
  className?: string;
};

const accentRing: Record<PathAccent, string> = {
  cyan: "hover:border-accent/40",
  periwinkle: "hover:border-accent/40",
  lavender: "hover:border-accent/40",
  violet: "hover:border-accent/40",
};

export default function Card({
  children,
  accent = "cyan",
  showHighlight = true,
  as = "article",
  className = "",
}: Props) {
  const Tag = as;
  return (
    <Tag
      className={`group relative rounded-3xl border border-qa-line bg-qa-panel p-6 shadow-soft transition-all duration-300 sm:p-8 hover:-translate-y-1 hover:shadow-card ${accentRing[accent]} ${className}`.trim()}
    >
      {showHighlight && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-accent opacity-60"
        />
      )}
      {children}
    </Tag>
  );
}
