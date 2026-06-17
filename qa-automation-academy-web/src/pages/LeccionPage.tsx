import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Container from "@/components/Container";
import LogoChip from "@/components/LogoChip";
import ProgressBar from "@/components/ProgressBar";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import LessonEditor from "@/components/LessonEditor";
import Terminal, { type RunState } from "@/components/Terminal";
import { lesson, steps } from "@/data/lessonSteps";

/** Render inline de `code` y **bold** dentro de las instrucciones. */
function renderInline(text: string, prefix: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${prefix}-c${i}`}
          className="rounded bg-qa-elevated px-1 py-0.5 font-mono text-[0.85em] text-qa-text ring-1 ring-qa-line"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part.split(/(\*\*[^*]+\*\*)/g).map((bp, j) => {
      if (bp.startsWith("**") && bp.endsWith("**")) {
        return (
          <strong key={`${prefix}-b${i}-${j}`} className="font-semibold text-qa-text">
            {bp.slice(2, -2)}
          </strong>
        );
      }
      return <span key={`${prefix}-t${i}-${j}`}>{bp}</span>;
    });
  });
}

export default function LeccionPage() {
  const [step, setStep] = useState(0);
  const [run, setRun] = useState<RunState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Limpia cualquier timer pendiente al desmontar.
  useEffect(() => clearTimer, []);

  // Cambiar de paso resetea el output a idle y cancela un run en curso.
  const selectStep = (i: number) => {
    if (i < 0 || i >= steps.length) return;
    clearTimer();
    setRun("idle");
    setStep(i);
  };

  const runTests = () => {
    clearTimer();
    setRun("running");
    timerRef.current = setTimeout(() => {
      setRun("passed");
      timerRef.current = null;
    }, 1600);
  };

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-qa-base font-sans text-qa-text">
      {/* Toolbar */}
      <header className="sticky top-0 z-30 border-b border-qa-line/70 bg-qa-base/80 backdrop-blur-md">
        <Container className="flex h-14 items-center gap-3">
          <Link
            to={lesson.courseHref}
            className="inline-flex shrink-0 items-center gap-1.5 font-sans text-sm text-qa-muted transition-colors hover:text-qa-text"
          >
            <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
            <span className="hidden sm:inline">Cursos</span>
          </Link>

          <span className="h-5 w-px bg-qa-line" aria-hidden="true" />

          <div className="flex min-w-0 items-center gap-2">
            <LogoChip src={lesson.logo} alt="" bg="white" size={16} />
            <span className="truncate font-mono text-xs uppercase tracking-[0.12em] text-qa-muted">
              {lesson.module}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-xs text-qa-muted sm:inline">
              Paso {step + 1} de {steps.length}
            </span>
            <ProgressBar value={progress} className="hidden w-24 sm:block" />
            <ThemeToggle />
          </div>
        </Container>
      </header>

      <Container className="py-8">
        <div className="grid gap-6 lg:grid-cols-[228px_1fr_1fr]">
          {/* Sidebar de pasos */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <ol className="space-y-1">
              {steps.map((s, i) => {
                const done = i < step;
                const currentStep = i === step;
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => selectStep(i)}
                      aria-current={currentStep ? "step" : undefined}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                        currentStep
                          ? "bg-accent-soft"
                          : "hover:bg-qa-elevated"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                          done || currentStep
                            ? "border-accent bg-accent text-accent-fg"
                            : "border-qa-line text-qa-muted"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span
                        className={`font-sans text-sm leading-snug ${
                          currentStep
                            ? "font-semibold text-qa-text"
                            : "text-qa-muted"
                        }`}
                      >
                        {s.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          {/* Instrucciones */}
          <section className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Paso {step + 1}
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-qa-text sm:text-[28px]">
              {current.title}
            </h1>

            {/* Callout META */}
            <div className="mt-5 rounded-2xl bg-accent-soft p-4">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                Meta
              </p>
              <p className="mt-1.5 font-sans text-sm leading-relaxed text-qa-text">
                {current.meta}
              </p>
            </div>

            {/* Cuerpo */}
            <div className="mt-5 space-y-3">
              {current.body.map((p, i) => (
                <p key={i} className="font-sans text-[15px] leading-relaxed text-qa-muted">
                  {renderInline(p, `body${step}-${i}`)}
                </p>
              ))}
            </div>

            {/* Pista */}
            <div className="mt-5 flex gap-3 rounded-2xl border border-qa-line bg-qa-elevated/60 p-4">
              <span aria-hidden="true" className="text-base leading-none">💡</span>
              <p className="font-sans text-sm leading-relaxed text-qa-muted">
                {renderInline(current.hint, `hint${step}`)}
              </p>
            </div>

            {/* Navegación */}
            <div className="mt-7 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => selectStep(step - 1)}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full border border-qa-line px-4 py-2 font-sans text-sm text-qa-text transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => selectStep(step + 1)}
                disabled={step === steps.length - 1}
                className="inline-flex items-center gap-2 rounded-full border border-qa-line px-4 py-2 font-sans text-sm text-qa-text transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente paso
                <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Editor + runner */}
          <section className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
            <LessonEditor
              code={current.code}
              filename={lesson.file}
              highlight={current.highlight}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button as="button" variant="accent" onClick={runTests}>
                <Icon name="play" className="h-4 w-4" />
                Correr tests
              </Button>
              <Link
                to={lesson.fullLessonHref}
                className="inline-flex items-center gap-1.5 font-mono text-sm text-accent transition-all hover:gap-2.5"
              >
                Ver lección completa
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>
            <Terminal state={run} testName={lesson.testName} />
          </section>
        </div>
      </Container>
    </div>
  );
}
