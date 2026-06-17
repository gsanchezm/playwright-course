import { Link } from "react-router-dom";
import LogoChip from "@/components/LogoChip";
import ProgressBar from "@/components/ProgressBar";
import Icon from "@/components/Icon";
import type { Course, CourseLevel } from "@/data/courses";

const levelDot: Record<CourseLevel, string> = {
  Principiante: "bg-level-beginner",
  Intermedio: "bg-level-intermediate",
  Avanzado: "bg-level-advanced",
};

function progressLabel(progress: number): string {
  if (progress <= 0) return "Aún no empezado";
  if (progress >= 100) return "Completado ✓";
  return `${progress}% completado`;
}

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={course.href}
      className="group flex h-full flex-col rounded-3xl border border-qa-line bg-qa-panel p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {course.logo ? (
            <LogoChip src={course.logo} alt="" bg={course.logoBg} size={20} />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-accent text-accent-fg">
              <Icon name="play" className="h-4 w-4" />
            </span>
          )}
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-qa-muted">
            {course.track}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-qa-muted">
          <span
            className={`h-2 w-2 rounded-full ${levelDot[course.level]}`}
            aria-hidden="true"
          />
          {course.level}
        </span>
      </div>

      <h3 className="mt-5 font-display text-lg font-bold tracking-[-0.02em] text-qa-text">
        {course.title}
      </h3>
      <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-qa-muted">
        {course.description}
      </p>

      <p className="mt-4 font-mono text-xs text-qa-muted">
        {course.lessons} lecciones · {course.duration}
      </p>

      <div className="mt-3">
        <ProgressBar value={course.progress} />
        <div className="mt-2 flex items-center justify-between">
          <p className="font-mono text-[11px] text-qa-muted">
            {progressLabel(course.progress)}
          </p>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-accent transition-all group-hover:gap-2">
            Abrir
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
