import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Container({ children, className = "", ...rest }: Props) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-6 lg:px-8 ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
