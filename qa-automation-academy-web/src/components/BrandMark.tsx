import Icon from "@/components/Icon";

type Props = {
  /** Muestra el wordmark "QA·Academy" junto al ícono. */
  withWordmark?: boolean;
  className?: string;
};

/** Marca QA·Academy: cuadrado verde redondeado con triángulo play. */
export default function BrandMark({ withWordmark = true, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-fg shadow-soft">
        <Icon name="play" className="h-4 w-4" />
      </span>
      {withWordmark && (
        <span className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-qa-text">
          QA<span className="text-accent">·</span>Academy
        </span>
      )}
    </span>
  );
}
