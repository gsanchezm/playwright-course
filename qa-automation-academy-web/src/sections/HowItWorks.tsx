import Container from "@/components/Container";

const steps = [
  {
    num: "01",
    title: "Elige una ruta",
    desc: "Regex, TypeScript, Git/GitHub o Playwright. Cada curso arranca desde cero y avanza por módulos.",
  },
  {
    num: "02",
    title: "Resuelve ejercicios reales",
    desc: "Código real en un editor, no diapositivas. Corre los tests y obtén feedback inmediato de cada paso.",
  },
  {
    num: "03",
    title: "Domina con práctica",
    desc: "Construye suites mantenibles y un flujo de trabajo profesional que puedes llevar a tu equipo.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-title"
      className="py-16 sm:py-20"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Cómo funciona
          </p>
          <h2
            id="como-funciona-title"
            className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-qa-text sm:text-[34px]"
          >
            Aprender haciendo, en tres pasos.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-[18px] md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-3xl border border-qa-line bg-qa-panel p-7 shadow-soft"
            >
              <span className="font-mono text-2xl font-bold text-accent">
                {step.num}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold tracking-[-0.02em] text-qa-text">
                {step.title}
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-qa-muted">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
