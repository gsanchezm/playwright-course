export type LogoBg = "black" | "white";

type Props = {
  src: string;
  alt: string;
  /** Fondo del chip: negro para Regex, blanco para el resto. */
  bg?: LogoBg;
  /** Altura de la imagen en px (18–26). */
  size?: number;
  className?: string;
};

/**
 * Chip de logo oficial. Mantiene cada logo legible en claro y oscuro fijando el
 * fondo del contenedor (negro para Regex, blanco para los demás).
 */
export default function LogoChip({
  src,
  alt,
  bg = "white",
  size = 22,
  className = "",
}: Props) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-[11px] p-2 ring-1 ring-black/5 ${
        bg === "black" ? "bg-black" : "bg-white"
      } ${className}`.trim()}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ height: size, width: "auto" }}
        className="block object-contain"
      />
    </span>
  );
}
