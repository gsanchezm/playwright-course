import { useMemo, useState } from "react";
import { NavLink, Link, useParams } from "react-router-dom";
import { docsNav, type DocItem } from "@/data/docsNav";

const accentClass: Record<string, string> = {
  cyan: "text-qa-cyan border-qa-cyan",
  periwinkle: "text-qa-periwinkle border-qa-periwinkle",
  lavender: "text-qa-lavender border-qa-lavender",
  muted: "text-qa-muted border-qa-muted",
};

type Props = {
  onNavigate?: () => void;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${
        open ? "rotate-90" : ""
      }`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M6.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 01-1.06-1.06L10.94 10 6.22 5.28a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Agrupa items consecutivos por su campo `group`. */
function groupItems(items: DocItem[]): Array<{
  group: string | null;
  items: DocItem[];
}> {
  const result: Array<{ group: string | null; items: DocItem[] }> = [];
  for (const item of items) {
    const last = result[result.length - 1];
    const g = item.group ?? null;
    if (last && last.group === g) {
      last.items.push(item);
    } else {
      result.push({ group: g, items: [item] });
    }
  }
  return result;
}

export default function DocSidebar({ onNavigate }: Props) {
  const { section: currentSection, slug: currentSlug } = useParams<{
    section: string;
    slug: string;
  }>();

  // Sección actual siempre expandida de arranque.
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(currentSection ? [currentSection] : [])
  );

  // Grupo actual (si el item activo tiene group) expandido de arranque.
  const initialGroups = useMemo(() => {
    const set = new Set<string>();
    for (const section of docsNav) {
      const active = section.items.find((i) => i.slug === currentSlug);
      if (active?.group && section.id === currentSection) {
        set.add(`${section.id}:${active.group}`);
      }
    }
    return set;
  }, [currentSection, currentSlug]);

  const [expandedGroups, setExpandedGroups] =
    useState<Set<string>>(initialGroups);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <nav aria-label="Documentación" className="flex flex-col gap-4 py-6">
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

      {docsNav.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        const accentColor = accentClass[section.accent].split(" ")[0];
        const groups = groupItems(section.items);
        const hasGroups = groups.some((g) => g.group !== null);

        return (
          <div key={section.id}>
            {/* Section header: clickable if available */}
            <button
              type="button"
              onClick={() => section.available && toggleSection(section.id)}
              disabled={!section.available}
              aria-expanded={section.available ? isExpanded : undefined}
              className={`flex w-full items-center gap-2 px-4 py-1 text-left transition-colors ${
                section.available
                  ? "cursor-pointer hover:opacity-80"
                  : "cursor-default"
              }`}
            >
              {section.available && <Chevron open={isExpanded} />}
              <span
                className={`font-mono text-[11px] uppercase tracking-[0.18em] font-semibold ${
                  section.available ? accentColor : "text-qa-muted/50"
                }`}
              >
                {section.title}
              </span>
              {!section.available && (
                <span className="rounded border border-qa-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-qa-muted/50">
                  Pronto
                </span>
              )}
            </button>

            {/* Section body */}
            {section.available && isExpanded && section.items.length > 0 && (
              <div className="mt-2">
                {hasGroups ? (
                  // Render groups (collapsible)
                  <ul className="space-y-3">
                    {groups.map((group) => {
                      if (group.group === null) {
                        return group.items.map((item) => (
                          <li key={item.slug}>
                            <SidebarLink
                              section={section.id}
                              item={item}
                              onNavigate={onNavigate}
                              indent={false}
                            />
                          </li>
                        ));
                      }
                      const key = `${section.id}:${group.group}`;
                      const open = expandedGroups.has(key);
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => toggleGroup(key)}
                            aria-expanded={open}
                            className="flex w-full items-center gap-1.5 px-4 py-1 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-qa-muted transition-colors hover:text-qa-text"
                          >
                            <Chevron open={open} />
                            <span>{group.group}</span>
                          </button>
                          {open && (
                            <ul className="mt-1 space-y-0.5">
                              {group.items.map((item) => (
                                <li key={item.slug}>
                                  <SidebarLink
                                    section={section.id}
                                    item={item}
                                    onNavigate={onNavigate}
                                    indent
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  // Flat list
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.slug}>
                        <SidebarLink
                          section={section.id}
                          item={item}
                          onNavigate={onNavigate}
                          indent={false}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!section.available && (
              <div className="ml-6 border-l-2 border-transparent py-2 pl-4 pr-3 font-sans text-sm text-qa-muted/40 italic">
                Contenido en desarrollo
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarLink({
  section,
  item,
  onNavigate,
  indent,
}: {
  section: string;
  item: DocItem;
  onNavigate?: () => void;
  indent: boolean;
}) {
  return (
    <NavLink
      to={`/docs/${section}/${item.slug}`}
      onClick={onNavigate}
      className={({ isActive }) =>
        `block border-l-2 py-1.5 pr-3 font-sans text-sm transition-all ${
          indent ? "pl-8" : "pl-4"
        } ${
          isActive
            ? `border-qa-cyan bg-qa-cyan/8 text-qa-text font-medium`
            : "border-transparent text-qa-muted hover:border-qa-line hover:text-qa-text"
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}
