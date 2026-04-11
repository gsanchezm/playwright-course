import { useMemo, useState } from "react";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import SectionReveal from "@/components/SectionReveal";
import { typescriptExercises } from "@/data/typescript-exercises";
import { tokenizeTs } from "@/lib/tokenize-ts";
import type { Line, Token } from "@/data/snippets";

const tokenClass: Record<Token["kind"], string> = {
  plain: "text-qa-text",
  keyword: "text-qa-lavender",
  string: "text-qa-cyan",
  comment: "text-qa-muted/60 italic",
  fn: "text-qa-periwinkle",
  type: "text-qa-blue",
  cmd: "text-qa-lavender",
};

function renderLine(line: Line, index: number) {
  return (
    <div key={index} className="flex gap-4 px-6">
      <span
        aria-hidden="true"
        className="w-6 shrink-0 select-none text-right text-qa-muted/40"
      >
        {index + 1}
      </span>
      <code className="block whitespace-pre">
        {line.tokens.length === 0 ? (
          <span>&nbsp;</span>
        ) : (
          line.tokens.map((tok, i) => (
            <span key={i} className={tokenClass[tok.kind]}>
              {tok.text}
            </span>
          ))
        )}
      </code>
    </div>
  );
}

export default function TypescriptProgress() {
  const [activeId, setActiveId] = useState(typescriptExercises[0].id);
  const active =
    typescriptExercises.find((ex) => ex.id === activeId) ??
    typescriptExercises[0];

  const lines = useMemo(() => tokenizeTs(active.code), [active.code]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof typescriptExercises>();
    typescriptExercises.forEach((ex) => {
      const list = map.get(ex.module) ?? [];
      list.push(ex);
      map.set(ex.module, list);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <section
      id="avances-typescript"
      className="relative bg-qa-base py-20 sm:py-28 lg:py-32"
      aria-labelledby="avances-typescript-title"
    >
      <Container>
        <SectionReveal>
          <Eyebrow>Avances del curso TypeScript</Eyebrow>
          <h2
            id="avances-typescript-title"
            className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-qa-text sm:text-4xl"
          >
            Ejercicios publicados: Hello World y Tipos básicos.
          </h2>
          <p className="mt-4 max-w-2xl font-sans text-lg leading-relaxed text-qa-muted">
            Código real del repositorio. Navega entre los ejercicios disponibles
            y revisa cómo cada concepto se aplica a situaciones del día a día de
            un QA automatizado.
          </p>
        </SectionReveal>

        <SectionReveal delay={120}>
          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-8">
            {/* Exercise selector */}
            <nav
              aria-label="Ejercicios del curso de TypeScript"
              className="rounded-2xl border border-qa-line bg-qa-panel p-4"
            >
              <ul className="space-y-6">
                {grouped.map(([moduleName, items]) => (
                  <li key={moduleName}>
                    <p className="px-2 font-mono text-[11px] uppercase tracking-[0.18em] text-qa-muted">
                      {moduleName}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {items.map((ex) => {
                        const isActive = ex.id === active.id;
                        return (
                          <li key={ex.id}>
                            <button
                              type="button"
                              onClick={() => setActiveId(ex.id)}
                              aria-current={isActive ? "true" : undefined}
                              className={`block w-full rounded-lg px-3 py-2 text-left font-mono text-xs transition-colors ${
                                isActive
                                  ? "bg-qa-cyan/10 text-qa-cyan"
                                  : "text-qa-muted hover:bg-qa-elevated hover:text-qa-text"
                              }`}
                            >
                              <span className="block">{ex.label}</span>
                              <span className="mt-0.5 block text-[10px] normal-case tracking-normal text-qa-muted/70">
                                {ex.description}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Code window */}
            <div
              className="relative overflow-hidden rounded-2xl border border-qa-line bg-qa-panel shadow-card shadow-glow"
              role="region"
              aria-label={`Código del ejercicio ${active.label}`}
            >
              <div className="flex h-10 items-center gap-4 border-b border-qa-line bg-qa-elevated px-4">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-qa-violet/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-qa-periwinkle/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-qa-cyan/60" />
                </div>
                <span className="font-mono text-[11px] text-qa-muted">
                  {active.filename}
                </span>
              </div>
              <div className="overflow-x-auto py-5 font-mono text-sm leading-[1.7]">
                {lines.map((line, i) => renderLine(line, i))}
              </div>
            </div>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
