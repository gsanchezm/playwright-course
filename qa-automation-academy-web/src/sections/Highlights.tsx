import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Card from "@/components/Card";
import Icon, { type IconName } from "@/components/Icon";
import SectionReveal from "@/components/SectionReveal";
import { highlights } from "@/data/highlights";

export default function Highlights() {
  return (
    <section
      id="highlights"
      className="relative bg-qa-base py-20 sm:py-28 lg:py-32"
      aria-labelledby="highlights-title"
    >
      <Container>
        <SectionReveal>
          <Eyebrow>Qué encontrarás</Eyebrow>
          <h2
            id="highlights-title"
            className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-qa-text sm:text-4xl"
          >
            Una academia pensada para ejecutarse en tu terminal.
          </h2>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {highlights.map((h, i) => (
            <SectionReveal key={h.id} delay={i * 80}>
              <Card accent="cyan" as="article" className="h-full">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-qa-line bg-qa-panel text-qa-cyan"
                  >
                    <Icon name={h.iconName as IconName} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-medium text-qa-text">
                      {h.title}
                    </h3>
                    <p className="mt-2 max-w-xl font-sans text-base leading-relaxed text-qa-muted">
                      {h.description}
                    </p>
                  </div>
                </div>
                <pre className="mt-6 overflow-x-auto rounded-lg border border-qa-line bg-qa-elevated px-4 py-3 font-mono text-sm text-qa-cyan">
                  <code>$ {h.detail}</code>
                </pre>
              </Card>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
