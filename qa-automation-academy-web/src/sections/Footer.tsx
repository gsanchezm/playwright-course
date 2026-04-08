import Container from "@/components/Container";
import Icon from "@/components/Icon";

const moduleLinks = [
  { label: "Setup", href: "https://github.com/gilbertosanchez/typescript/tree/main/00-setup", external: true },
  { label: "TypeScript para QA", href: "https://github.com/gilbertosanchez/typescript/tree/main/typescript-qa-course", external: true },
  { label: "Git / GitHub", href: "https://github.com/gilbertosanchez/typescript/tree/main/git-github-course", external: true },
  { label: "Playwright", href: "https://github.com/gilbertosanchez/typescript/tree/main/playwright-course", external: true },
];

const navLinks = [
  { label: "Rutas", href: "#rutas" },
  { label: "Metodología", href: "#metodologia" },
  { label: "Highlights", href: "#highlights" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-qa-line bg-qa-base py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-display text-base font-semibold text-qa-text">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-qa-accent text-qa-base">
                <span className="font-mono text-xs font-bold">QA</span>
              </span>
              QA<span className="text-qa-muted">/Academy</span>
            </div>
            <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-qa-muted">
              Academia práctica de QA Automation. Ejercicios reales de
              TypeScript, Git/GitHub y Playwright.
            </p>
            <a
              href="https://github.com/gilbertosanchez/typescript"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-qa-cyan transition-all hover:gap-3"
              aria-label="Repositorio en GitHub (abre en nueva pestaña)"
            >
              <Icon name="github" className="h-4 w-4" />
              github.com/gilbertosanchez/typescript
              <Icon name="external" className="h-3 w-3" />
            </a>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-qa-muted">
              Módulos
            </h3>
            <ul className="mt-4 space-y-3 font-sans text-sm text-qa-text">
              {moduleLinks.map((m) => (
                <li key={m.label}>
                  <a
                    href={m.href}
                    {...(m.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-2 transition-colors hover:text-qa-cyan"
                  >
                    {m.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-qa-muted">
              Navegación
            </h3>
            <ul className="mt-4 space-y-3 font-sans text-sm text-qa-text">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="transition-colors hover:text-qa-cyan"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-qa-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-qa-muted">
            © {new Date().getFullYear()} QA Automation Academy. Hecho con
            TypeScript y Tailwind.
          </p>
          <p className="font-mono text-xs text-qa-muted">
            Publicado en Render · Sitio estático
          </p>
        </div>
      </Container>
    </footer>
  );
}
