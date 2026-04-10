import { NavLink, Link } from "react-router-dom";
import { docsNav } from "@/data/docsNav";

const accentClass: Record<string, string> = {
  cyan: "text-qa-cyan border-qa-cyan",
  periwinkle: "text-qa-periwinkle border-qa-periwinkle",
  lavender: "text-qa-lavender border-qa-lavender",
  muted: "text-qa-muted border-qa-muted",
};

type Props = {
  onNavigate?: () => void;
};

export default function DocSidebar({ onNavigate }: Props) {
  return (
    <nav aria-label="Documentación" className="flex flex-col gap-6 py-6">
      {/* Back to home */}
      <Link
        to="/"
        className="flex items-center gap-2 px-4 font-mono text-xs uppercase tracking-[0.15em] text-qa-muted transition-colors hover:text-qa-text"
        onClick={onNavigate}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        Inicio
      </Link>

      {docsNav.map((section) => (
        <div key={section.id}>
          <div className="mb-2 flex items-center gap-2 px-4">
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.18em] font-semibold ${
                section.available
                  ? accentClass[section.accent].split(" ")[0]
                  : "text-qa-muted/50"
              }`}
            >
              {section.title}
            </span>
            {!section.available && (
              <span className="rounded border border-qa-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-qa-muted/50">
                Pronto
              </span>
            )}
          </div>

          {section.available && section.items.length > 0 ? (
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.slug}>
                  <NavLink
                    to={`/docs/${section.id}/${item.slug}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `block border-l-2 py-1.5 pl-4 pr-3 font-sans text-sm transition-all ${
                        isActive
                          ? `border-qa-cyan bg-qa-cyan/8 text-qa-text font-medium`
                          : "border-transparent text-qa-muted hover:border-qa-line hover:text-qa-text"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : !section.available ? (
            <div className="border-l-2 border-transparent py-2 pl-4 pr-3 font-sans text-sm text-qa-muted/40 italic">
              Contenido en desarrollo
            </div>
          ) : null}
        </div>
      ))}
    </nav>
  );
}
