import Container from "@/components/Container";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import HeroCodeWindow from "@/components/HeroCodeWindow";

const LECCION_DEMO = "/leccion";

const stats = [
  { value: "6", label: "tecnologías" },
  { value: "150+", label: "lecciones" },
  { value: "100%", label: "práctico" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Blob radial verde difuminado (flota suave) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-[-6%] h-[460px] w-[460px] rounded-full bg-accent/20 blur-3xl animate-qaa-float"
      />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_1fr] lg:gap-16">
          {/* Left: copy + CTAs */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3.5 py-1.5 font-mono text-[12.5px] font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Práctica real, no solo videos
            </span>

            <h1
              id="hero-title"
              className="mt-5 font-display font-extrabold leading-[1.04] tracking-[-0.035em] text-qa-text text-[clamp(38px,5vw,58px)]"
            >
              Aprende QA escribiendo{" "}
              <span className="text-accent">código de verdad</span>.
            </h1>

            <p className="mt-5 max-w-xl font-sans text-base leading-relaxed text-qa-muted sm:text-[17px]">
              Una academia práctica y gratuita: resuelve ejercicios reales de
              Regex, TypeScript, Git/GitHub, CSS/XPath, Playwright y Fluent
              Interface, y obtén feedback automático al correr los tests.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button as="a" href="/cursos" variant="accent">
                Explorar cursos
                <Icon name="arrow-right" className="h-4 w-4" />
              </Button>
              <Button as="a" href={LECCION_DEMO} variant="ghost">
                Ver una lección
              </Button>
            </div>

            <dl className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="flex items-baseline gap-1.5 font-mono text-sm text-qa-muted">
                    <span className="text-base font-bold text-qa-text">
                      {s.value}
                    </span>
                    {s.label}
                  </dd>
                  {i < stats.length - 1 && (
                    <span className="text-qa-line" aria-hidden="true">
                      ·
                    </span>
                  )}
                </div>
              ))}
            </dl>
          </div>

          {/* Right: code window */}
          <div className="relative lg:pl-2">
            <HeroCodeWindow />
          </div>
        </div>
      </Container>
    </section>
  );
}
