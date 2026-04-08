import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import SectionReveal from "@/components/SectionReveal";
import Icon from "@/components/Icon";
import { methodology } from "@/data/methodology";

export default function Methodology() {
  return (
    <section
      id="metodologia"
      className="relative bg-qa-elevated py-20 sm:py-28 lg:py-32"
      aria-labelledby="metodologia-title"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
          <SectionReveal>
            <Eyebrow>Cómo aprendes aquí</Eyebrow>
            <h2
              id="metodologia-title"
              className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-qa-text sm:text-4xl"
            >
              Práctica primero, teoría justa.
            </h2>
            <p className="mt-4 max-w-xl font-sans text-lg leading-relaxed text-qa-muted">
              Cada módulo está diseñado para que escribas código desde el
              primer minuto. Nada de pasividad ni de tutoriales de relleno: sólo
              lo que realmente usa un QA automatizado moderno.
            </p>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-qa-line bg-qa-panel/50 px-4 py-2 font-mono text-xs text-qa-muted">
              <Icon name="target" className="h-4 w-4 text-qa-cyan" />
              <span>Enfoque hands-on, progresión guiada</span>
            </div>
          </SectionReveal>

          <SectionReveal delay={120}>
            <ol className="relative space-y-4 border-l border-qa-line pl-6">
              {methodology.map((step, i) => (
                <li key={step.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[31px] top-1 grid h-6 w-6 place-items-center rounded-full border border-qa-line bg-qa-panel font-mono text-[10px] text-qa-cyan"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-lg font-medium text-qa-text">
                    {step.title}
                  </h3>
                  <p className="mt-1 max-w-xl font-sans text-base leading-relaxed text-qa-muted">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </SectionReveal>
        </div>
      </Container>
    </section>
  );
}
