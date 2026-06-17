import { Link } from "react-router-dom";
import Container from "@/components/Container";
import CourseCard from "@/components/CourseCard";
import Icon from "@/components/Icon";
import { featuredCourses } from "@/data/courses";

export default function StartHere() {
  return (
    <section
      id="empieza"
      aria-labelledby="empieza-title"
      className="scroll-mt-20 py-16 sm:py-20"
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Empieza por aquí
            </p>
            <h2
              id="empieza-title"
              className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-qa-text sm:text-[34px]"
            >
              Cursos para dar tu primer paso.
            </h2>
          </div>
          <Link
            to="/cursos"
            className="inline-flex items-center gap-2 font-mono text-sm text-accent transition-all hover:gap-3"
          >
            Ver todos los cursos
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </Container>
    </section>
  );
}
