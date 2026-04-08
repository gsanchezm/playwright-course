import Container from "@/components/Container";
import Icon from "@/components/Icon";

const navItems = [
  { href: "#rutas", label: "Rutas" },
  { href: "#metodologia", label: "Metodología" },
  { href: "#highlights", label: "Highlights" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-qa-line/50 bg-qa-base/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
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

        <nav aria-label="Navegación principal" className="hidden md:block">
          <ul className="flex items-center gap-8 font-sans text-sm text-qa-muted">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="transition-colors hover:text-qa-text"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="https://github.com/gilbertosanchez/typescript"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-qa-line bg-qa-panel/40 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-qa-text transition-all hover:border-qa-cyan hover:text-qa-cyan"
          aria-label="Abrir repositorio en GitHub"
        >
          <Icon name="github" className="h-4 w-4" />
          <span className="hidden sm:inline">Repo</span>
        </a>
      </Container>
    </header>
  );
}
