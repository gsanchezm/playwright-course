import { Link } from "react-router-dom";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Icon, { type IconName } from "@/components/Icon";
import SectionReveal from "@/components/SectionReveal";
import { paths, type PathAccent } from "@/data/paths";

const accentIconClass: Record<PathAccent, string> = {
  cyan: "text-qa-cyan",
  periwinkle: "text-qa-periwinkle",
  lavender: "text-qa-lavender",
};

const accentLinkClass: Record<PathAccent, string> = {
  cyan: "text-qa-cyan",
  periwinkle: "text-qa-periwinkle",
  lavender: "text-qa-lavender",
};

export default function PathsGrid() {
  return (
    <section
      id="rutas"
      className="relative bg-qa-base py-20 sm:py-28 lg:py-32"
      aria-labelledby="rutas-title"
    >
      <Container>
        <SectionReveal>
          <Eyebrow>Rutas de aprendizaje</Eyebrow>
          <h2
            id="rutas-title"
            className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-qa-text sm:text-4xl"
          >
            Tres caminos conectados para llegar a automatización real.
          </h2>
          <p className="mt-4 max-w-2xl font-sans text-lg leading-relaxed text-qa-muted">
            Empieza con TypeScript, consolida tu flujo con Git/GitHub y termina
            escribiendo tests E2E con Playwright. Cada ruta es práctica y
            progresiva.
          </p>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {paths.map((p, i) => (
            <SectionReveal key={p.id} delay={i * 80}>
              <Card accent={p.accent} as="article" className="flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-xl border border-qa-line bg-qa-panel ${accentIconClass[p.accent]}`}
                    aria-hidden="true"
                  >
                    <Icon name={p.iconName as IconName} className="h-5 w-5" />
                  </span>
                  <Badge status={p.status} />
                </div>

                <h3 className="mt-6 font-display text-xl font-medium leading-snug text-qa-text sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-3 font-sans text-base leading-relaxed text-qa-muted">
                  {p.description}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {p.capabilities.map((cap) => (
                    <li
                      key={cap}
                      className="flex gap-3 font-sans text-sm text-qa-muted"
                    >
                      <Icon
                        name="check"
                        className={`mt-0.5 h-4 w-4 shrink-0 ${accentIconClass[p.accent]}`}
                      />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  {p.href.startsWith("http") ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 font-mono text-sm transition-all hover:gap-3 ${accentLinkClass[p.accent]}`}
                    >
                      {p.status === "live" ? "Empezar ruta" : "Ver detalles"}
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      to={p.href}
                      className={`inline-flex items-center gap-2 font-mono text-sm transition-all hover:gap-3 ${accentLinkClass[p.accent]}`}
                    >
                      {p.status === "live" ? "Empezar ruta" : "Ver detalles"}
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </Card>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
