import Container from "@/components/Container";
import Icon from "@/components/Icon";

export default function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="py-12 sm:py-16">
      <Container>
        <div className="relative overflow-hidden rounded-[28px] bg-accent-band px-8 py-12 text-center shadow-card sm:px-12 sm:py-16">
          <h2
            id="cta-title"
            className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-[36px]"
          >
            ¿List@ para escribir tu primer test?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-white/85">
            Empieza con el Setup del entorno y pasa de cero a tu primera suite de
            tests en una sola tarde. Sin costo.
          </p>
          <a
            href="/docs/setup"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-sans font-semibold text-emerald-900 shadow-soft transition-all hover:-translate-y-[1px] hover:shadow-card"
          >
            Empezar gratis
            <Icon name="arrow-right" className="h-4 w-4" />
          </a>
        </div>
      </Container>
    </section>
  );
}
