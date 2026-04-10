import { Link } from "react-router-dom";
import Container from "@/components/Container";

const moduleLinks = [
  { label: "Setup", to: "/docs/setup" },
  { label: "TypeScript para QA", to: "/docs/typescript" },
  { label: "Git / GitHub", to: "/docs/git-github" },
  { label: "Playwright", to: "/docs/playwright" },
];

const navLinks = [
  { label: "Rutas", href: "#rutas" },
  { label: "Metodología", href: "#metodologia" },
  { label: "Highlights", href: "#highlights" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-qa-line bg-qa-base py-14 sm:py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 font-display text-base font-semibold text-qa-text">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-qa-accent text-qa-base">
                <span className="font-mono text-xs font-bold">QA</span>
              </span>
              QA<span className="text-qa-muted">/Academy</span>
            </div>
            <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-qa-muted">
              Academia práctica de QA Automation. Ejercicios reales de
              TypeScript, Git/GitHub y Playwright. Todo el contenido disponible
              en esta página.
            </p>
            <Link
              to="/docs/setup"
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-qa-cyan transition-all hover:gap-3"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-qa-cyan" aria-hidden="true" />
              Comenzar con Setup
            </Link>
          </div>

          {/* Modules */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-qa-muted">
              Módulos
            </h3>
            <ul className="mt-4 space-y-3 font-sans text-sm text-qa-text">
              {moduleLinks.map((m) => (
                <li key={m.label}>
                  <Link
                    to={m.to}
                    className="inline-flex items-center gap-2 transition-colors hover:text-qa-cyan"
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-qa-muted">
              Navegación
            </h3>
            <ul className="mt-4 space-y-3 font-sans text-sm text-qa-text">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-qa-cyan">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-qa-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-qa-muted">
            © {new Date().getFullYear()} QA Automation Academy. Diseñado por Gilberto Sánchez Mares.
          </p>
          <p className="font-mono text-xs text-qa-muted">
            Publicado en Render · Sitio estático
          </p>
        </div>
      </Container>
    </footer>
  );
}
