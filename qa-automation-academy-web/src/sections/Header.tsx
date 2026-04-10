import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Container from "@/components/Container";

const navItems = [
  { href: "#rutas", label: "Rutas" },
  { href: "#metodologia", label: "Metodología" },
  { href: "#highlights", label: "Highlights" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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
      className="sticky top-0 z-30 border-b border-qa-line/50 bg-qa-base/70 backdrop-blur-md"
    >
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <a
          href="#top"
          className="flex items-center gap-2 font-display text-base font-semibold text-qa-text"
          aria-label="QA Automation Academy — ir al inicio"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-qa-accent text-qa-base">
            <span className="font-mono text-xs font-bold">QA</span>
          </span>
          <span className="hidden sm:inline">
            <span className="text-qa-text">QA</span>
            <span className="text-qa-muted">/Academy</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="Navegación principal" className="hidden md:block">
          <ul className="flex items-center gap-8 font-sans text-sm text-qa-muted">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition-colors hover:text-qa-text">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/docs/setup" className="transition-colors hover:text-qa-text">
                Docs
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right: Docs CTA + hamburger */}
        <div className="flex items-center gap-2">
          <Link
            to="/docs/setup"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-qa-line bg-qa-panel/40 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-qa-text transition-all hover:border-qa-cyan hover:text-qa-cyan"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-qa-cyan" aria-hidden="true" />
            <span>Docs</span>
          </Link>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-qa-line bg-qa-panel/40 text-qa-muted transition-colors hover:text-qa-text md:hidden"
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
        <div id="mobile-menu" className="border-t border-qa-line/50 bg-qa-base/95 backdrop-blur-md md:hidden">
          <nav aria-label="Navegación móvil">
            <ul className="flex flex-col py-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-3 font-sans text-sm text-qa-muted transition-colors hover:bg-qa-elevated hover:text-qa-text"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/docs/setup"
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3 font-sans text-sm text-qa-muted transition-colors hover:bg-qa-elevated hover:text-qa-text"
                >
                  Docs / Setup
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
