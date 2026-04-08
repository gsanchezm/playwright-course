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
  cyan: "hover:border-qa-cyan/40",
  periwinkle: "hover:border-qa-periwinkle/40",
  lavender: "hover:border-qa-lavender/40",
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
      className={`group relative rounded-2xl border border-qa-line bg-qa-panel/60 p-6 shadow-card backdrop-blur-sm transition-all duration-300 sm:p-8 hover:-translate-y-1 ${accentRing[accent]} ${className}`.trim()}
    >
      {showHighlight && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-qa-accent opacity-60"
        />
      )}
      {children}
    </Tag>
  );
}
