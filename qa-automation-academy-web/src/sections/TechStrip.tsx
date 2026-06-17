import { Link } from "react-router-dom";
import Container from "@/components/Container";
import LogoChip from "@/components/LogoChip";
import { courses } from "@/data/courses";

type Tech = {
  id: string;
  name: string;
  oneliner: string;
};

// Orden canónico de la academia: Regex, TypeScript, Git & GitHub, Playwright.
const techs: Tech[] = [
  { id: "regex", name: "Regex", oneliner: "Valida, parsea y sanea datos con expresiones regulares." },
  { id: "typescript", name: "TypeScript", oneliner: "Tipado práctico aplicado al día a día de QA." },
  { id: "git-github", name: "Git & GitHub", oneliner: "Flujo real de ramas, commits y pull requests." },
  { id: "playwright", name: "Playwright", oneliner: "Tests E2E modernos, accesibles y mantenibles." },
];

export default function TechStrip() {
  return (
    <section aria-label="Tecnologías" className="py-6 sm:py-10">
      <Container>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {techs.map((tech) => {
            const course = courses.find((c) => c.id === tech.id);
            if (!course) return null;
            return (
              <Link
                key={tech.id}
                to={course.href}
                className="group flex flex-col gap-4 rounded-3xl border border-qa-line bg-qa-panel p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
              >
                <LogoChip
                  src={course.logo!}
                  alt={`Logo de ${tech.name}`}
                  bg={course.logoBg}
                  size={22}
                />
                <div>
                  <h3 className="font-display text-[17px] font-bold tracking-[-0.02em] text-qa-text">
                    {tech.name}
                  </h3>
                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-qa-muted">
                    {tech.oneliner}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
