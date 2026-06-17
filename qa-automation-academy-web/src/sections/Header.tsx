import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Container from "@/components/Container";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

// Lección demo: la vista interactiva (poblada con contenido real).
const LECCION_DEMO = "/leccion";

type NavLink = {
  label: string;
  to: string;
  /** true => enlace de ancla en la propia página (usa <a>). */
  hash?: boolean;
  match: (path: string) => boolean;
};

const navLinks: NavLink[] = [
  { label: "Inicio", to: "/", match: (p) => p === "/" },
  { label: "Cursos", to: "/cursos", match: (p) => p.startsWith("/cursos") },
  {
    label: "Lección demo",
    to: LECCION_DEMO,
    match: (p) => p.startsWith("/leccion"),
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-qa-line/70 bg-qa-base/80 backdrop-blur-md"
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="QA Academy — inicio">
          <BrandMark />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navegación principal" className="hidden md:block">
          <ul className="flex items-center gap-8 font-sans text-sm">
            {navLinks.map((item) => {
              const active = item.match(pathname);
              const cls = `transition-colors ${
                active
                  ? "font-semibold text-accent"
                  : "text-qa-muted hover:text-qa-text"
              }`;
              return (
                <li key={item.label}>
                  {item.hash ? (
                    <a href={item.to} className={cls}>
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.to} className={cls}>
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button as="a" href="/docs/setup" variant="accent" className="hidden sm:inline-flex">
            Empezar
          </Button>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-qa-line bg-qa-elevated text-qa-muted transition-colors hover:text-qa-text md:hidden"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </Container>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-qa-line/70 bg-qa-base/95 backdrop-blur-md md:hidden">
          <nav aria-label="Navegación móvil">
            <ul className="flex flex-col py-2">
              {navLinks.map((item) => {
                const cls =
                  "flex items-center gap-2 px-6 py-3 font-sans text-sm text-qa-muted transition-colors hover:bg-qa-elevated hover:text-qa-text";
                return (
                  <li key={item.label}>
                    {item.hash ? (
                      <a
                        href={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={cls}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={cls}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
              <li className="px-6 py-3">
                <Button as="a" href="/docs/setup" variant="accent" className="w-full">
                  Empezar
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
