import type { ReactNode } from "react";
import type { PathStatus } from "@/data/paths";

type Props = {
  status: PathStatus;
  className?: string;
  children?: ReactNode;
};

const defaultLabel: Record<PathStatus, string> = {
  live: "Live",
  soon: "Soon",
  "in-progress": "In Progress",
};

const styles: Record<PathStatus, { wrap: string; dot: string }> = {
  live: {
    wrap: "border-qa-cyan/40 bg-qa-cyan/10 text-qa-cyan",
    dot: "bg-qa-cyan shadow-[0_0_8px_#77F2FF]",
  },
  soon: {
    wrap: "border-qa-periwinkle/30 bg-qa-periwinkle/10 text-qa-periwinkle",
    dot: "bg-qa-periwinkle",
  },
  "in-progress": {
    wrap: "border-qa-lavender/40 bg-qa-lavender/10 text-qa-lavender",
    dot: "bg-qa-lavender shadow-[0_0_6px_#B495FF]",
  },
};

export default function Badge({ status, className = "", children }: Props) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] ${s.wrap} ${className}`.trim()}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {children ?? defaultLabel[status]}
    </span>
  );
}
