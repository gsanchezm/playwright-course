import { useMemo, useState } from "react";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import Container from "@/components/Container";
import CourseCard from "@/components/CourseCard";
import ContinueCard from "@/components/ContinueCard";
import { courses, courseTracks } from "@/data/courses";

const CONTINUE_ID = "playwright";

export default function CursosPage() {
  const [filter, setFilter] = useState<string>("Todos");

  const visible = useMemo(
    () =>
      filter === "Todos"
        ? courses
        : courses.filter((c) => c.track === filter),
    [filter],
  );

  const continueCourse = courses.find((c) => c.id === CONTINUE_ID);

  return (
    <div className="min-h-screen bg-qa-base font-sans text-qa-text">
      <Header />
      <main>
        <Container className="py-12 sm:py-16">
          {/* Encabezado */}
          <header className="max-w-2xl">
            <h1 className="font-display text-[clamp(32px,4.5vw,42px)] font-extrabold tracking-[-0.035em] text-qa-text">
              Explora los cursos
            </h1>
            <p className="mt-4 font-sans text-base leading-relaxed text-qa-muted sm:text-[17px]">
              Cuatro tecnologías, una misma forma de aprender: ejercicios reales
              con feedback al correr los tests. Elige por dónde empezar.
            </p>
          </header>

          {/* Continúa donde lo dejaste */}
          {continueCourse && (
            <div className="mt-10">
              <ContinueCard
                course={continueCourse}
                progress={64}
                resumeHref="/docs/playwright/m3-guia"
                resumeLabel="Módulo 3 · POM"
              />
            </div>
          )}

          {/* Filtros */}
          <div
            role="group"
            aria-label="Filtrar por tecnología"
            className="mt-12 flex flex-wrap gap-2"
          >
            {courseTracks.map((track) => {
              const active = filter === track;
              return (
                <button
                  key={track}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(track)}
                  className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-qa-line bg-qa-panel text-qa-muted hover:border-accent/40 hover:text-qa-text"
                  }`}
                >
                  {track}
                </button>
              );
            })}
          </div>

          {/* Grid de cursos */}
          <div className="mt-8 grid grid-cols-1 gap-[18px] sm:grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
            {visible.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {visible.length === 0 && (
            <p className="mt-10 font-sans text-sm text-qa-muted">
              No hay cursos para este filtro todavía.
            </p>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
