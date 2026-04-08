import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

export default function Eyebrow({ children, className = "" }: Props) {
  return (
    <p
      className={`font-mono text-xs uppercase tracking-[0.2em] text-qa-cyan ${className}`.trim()}
    >
      {children}
    </p>
  );
}
