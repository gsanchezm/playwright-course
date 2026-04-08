import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "ghost";

type CommonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    as: "a";
  };

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    as?: "button";
  };

type Props = AnchorProps | NativeButtonProps;

const base =
  "inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full px-6 py-3 font-sans font-medium transition-all duration-200 ease-out focus-visible:outline-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-qa-accent text-qa-base ring-1 ring-qa-cyan/30 shadow-[0_10px_30px_-10px_rgba(119,242,255,0.35)] hover:-translate-y-[1px] hover:shadow-[0_16px_40px_-10px_rgba(119,242,255,0.55)]",
  ghost:
    "border border-qa-line bg-qa-panel/40 text-qa-text backdrop-blur-sm hover:border-qa-cyan hover:text-qa-cyan hover:bg-qa-panel/60",
};

export default function Button(props: Props) {
  const variant: Variant = props.variant ?? "primary";
  const className = props.className ?? "";
  const classes = `${base} ${variants[variant]} ${className}`.trim();

  if (props.as === "a") {
    const { as, variant: _variant, className: _className, children, ...rest } =
      props;
    void as;
    void _variant;
    void _className;
    return (
      <a className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { as, variant: _variant, className: _className, children, ...rest } =
    props;
  void as;
  void _variant;
  void _className;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
