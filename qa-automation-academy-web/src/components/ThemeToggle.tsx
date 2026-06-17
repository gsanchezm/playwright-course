import { useTheme, type Theme } from "@/theme/ThemeProvider";

const SunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

const segments: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Tema claro", icon: SunIcon },
  { value: "dark", label: "Tema oscuro", icon: MoonIcon },
];

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="group"
      aria-label="Conmutar tema"
      className={`inline-flex items-center gap-0.5 rounded-full border border-qa-line bg-qa-elevated p-0.5 ${className}`.trim()}
    >
      {segments.map((seg) => {
        const active = theme === seg.value;
        return (
          <button
            key={seg.value}
            type="button"
            onClick={() => setTheme(seg.value)}
            aria-pressed={active}
            aria-label={seg.label}
            title={seg.label}
            className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
              active
                ? "bg-accent text-accent-fg"
                : "text-qa-muted hover:text-qa-text"
            }`}
          >
            {seg.icon}
          </button>
        );
      })}
    </div>
  );
}
