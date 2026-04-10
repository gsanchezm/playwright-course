import { Link } from "react-router-dom";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import CodeShowcase from "@/components/CodeShowcase";
import Icon from "@/components/Icon";
import Badge from "@/components/Badge";

const techBadges = [
  { label: "Setup", status: "live" as const },
  { label: "TypeScript", status: "live" as const },
  { label: "Git / GitHub", status: "live" as const },
  { label: "Playwright", status: "live" as const },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-qa-hero"
      aria-labelledby="hero-title"
    >
      {/* Decorative orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-qa-cyan/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-qa-violet/10 blur-3xl" />

      <Container className="relative py-16 sm:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          {/* Left: copy + CTAs */}
          <div>
            <Eyebrow>QA Automation Academy</Eyebrow>

            <h1
              id="hero-title"
              className="mt-4 font-display text-3xl font-semibold leading-[1.08] tracking-tight text-qa-text sm:text-4xl lg:text-5xl xl:text-6xl"
            >
              Aprende automatización con{" "}
              <span className="bg-qa-accent bg-clip-text text-transparent">
                ejercicios reales
              </span>
              , desde TypeScript hasta Playwright.
            </h1>

            <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-qa-muted sm:text-lg sm:mt-6">
              Una academia práctica para QA que quieren dar el salto a
              automatización: tipado, flujo real de Git/GitHub y tests E2E con
              Playwright, en una sola ruta.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:mt-8">
              <Button as="a" href="#rutas" variant="primary">
                Explorar rutas
                <Icon name="arrow-right" className="h-4 w-4" />
              </Button>
              <Link
                to="/docs/setup"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-qa-line bg-qa-panel/40 px-6 py-3 font-sans font-medium text-qa-text backdrop-blur-sm transition-all hover:border-qa-cyan hover:text-qa-cyan"
              >
                Empezar con Setup
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-qa-muted">
                Stack de rutas
              </span>
              {techBadges.map((b) => (
                <Badge key={b.label} status={b.status} className="">
                  {b.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right: code showcase — only on large screens */}
          <div className="hidden lg:block lg:pl-4">
            <CodeShowcase />
          </div>
        </div>
      </Container>
    </section>
  );
}
