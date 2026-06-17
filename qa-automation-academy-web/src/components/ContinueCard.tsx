import { Link } from "react-router-dom";
import LogoChip from "@/components/LogoChip";
import ProgressBar from "@/components/ProgressBar";
import Icon from "@/components/Icon";
import type { Course } from "@/data/courses";

type Props = {
  course: Course;
  /** Progreso simulado para la tarjeta de "continuar". */
  progress: number;
  /** Lección donde se "quedó" el usuario. */
  resumeHref: string;
  resumeLabel: string;
};

export default function ContinueCard({
  course,
  progress,
  resumeHref,
  resumeLabel,
}: Props) {
  return (
    <div className="grid overflow-hidden rounded-3xl border border-qa-line bg-qa-panel shadow-soft md:grid-cols-2">
      {/* Lado claro: info + progreso */}
      <div className="flex flex-col p-7 sm:p-8">
        <div className="flex items-center gap-3">
          {course.logo ? (
            <LogoChip src={course.logo} alt="" bg={course.logoBg} size={20} />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-accent text-accent-fg">
              <Icon name="play" className="h-4 w-4" />
            </span>
          )}
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Continúa donde lo dejaste
          </span>
        </div>

        <h3 className="mt-5 font-display text-xl font-bold tracking-[-0.02em] text-qa-text">
          {course.title}
        </h3>
        <p className="mt-2 font-sans text-sm leading-relaxed text-qa-muted">
          Retoma en <span className="text-qa-text">{resumeLabel}</span> y sigue
          sumando tests verdes.
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between font-mono text-[11px] text-qa-muted">
            <span>{progress}% completado</span>
            <span>{course.lessons} lecciones</span>
          </div>
          <ProgressBar value={progress} className="mt-2" />
        </div>

        <div className="mt-auto pt-6">
          <Link
            to={resumeHref}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-sans font-semibold text-accent-fg shadow-soft transition-all hover:-translate-y-[1px] hover:brightness-[1.04]"
          >
            Continuar
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Lado oscuro: mini-terminal (siempre oscuro) */}
      <div className="flex flex-col justify-center border-t border-code-border bg-code-bg p-7 font-mono text-[13px] leading-[1.9] md:border-l md:border-t-0 md:p-8">
        <div className="flex items-center gap-1.5 pb-3" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-code-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-yellow" />
          <span className="h-2.5 w-2.5 rounded-full bg-code-green" />
        </div>
        <div>
          <span className="text-code-comment">$ </span>
          <span className="text-code-keyword">npx</span>
          <span className="text-code-base"> playwright test</span>
        </div>
        <div className="text-code-base">
          Running <span className="text-code-base">32</span> tests…
        </div>
        <div>
          <span className="text-code-success">✓ 28 passed</span>
        </div>
        <div className="text-code-comment">~ 4 pending</div>
        <div>
          <span className="text-code-success">✓ </span>
          <span className="text-code-base">28 passed </span>
          <span className="text-code-comment">(12.4s)</span>
          <span className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-code-success animate-qaa-blink" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
