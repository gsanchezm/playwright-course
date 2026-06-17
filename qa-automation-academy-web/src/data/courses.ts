import { docsNav, sectionOrder, type DocSection } from "@/data/docsNav";
import type { LogoBg } from "@/components/LogoChip";

export type CourseLevel = "Principiante" | "Intermedio" | "Avanzado";

export type Course = {
  /** id = id de la sección de docs (fuente real del contenido). */
  id: string;
  /** Etiqueta de track usada en los chips de filtro. */
  track: string;
  title: string;
  description: string;
  logo?: string;
  logoBg: LogoBg;
  lessons: number;
  modules: number;
  duration: string;
  level: CourseLevel;
  /** Ruta a la primera lección real del curso. */
  href: string;
  /** Progreso simulado (en la app real vendría del backend). */
  progress: number;
};

// Metadatos editoriales por curso. El conteo de lecciones/módulos se deriva
// del contenido real (docsNav), no se inventa.
type CourseMeta = {
  track: string;
  title: string;
  description: string;
  logo?: string;
  logoBg: LogoBg;
  duration: string;
  level: CourseLevel;
  progress: number;
};

const META: Record<string, CourseMeta> = {
  setup: {
    track: "Setup",
    title: "Setup del entorno",
    description:
      "Deja tu máquina lista: terminal, Node, pnpm, Git, VS Code y los navegadores de Playwright.",
    logoBg: "white",
    duration: "1–2 h",
    level: "Principiante",
    progress: 0,
  },
  regex: {
    track: "Regex",
    title: "Regex para QA",
    description:
      "De cero a avanzado con la lente del testing: validar, parsear logs, sanear datos y evitar ReDoS.",
    logo: "/logos/logo-regex.png",
    logoBg: "black",
    duration: "6–8 h",
    level: "Intermedio",
    progress: 0,
  },
  typescript: {
    track: "TypeScript",
    title: "TypeScript para QA",
    description:
      "Tipado práctico, funciones, objetos, clases (POM) e interfaces aplicados al día a día de QA.",
    logo: "/logos/logo-typescript.png",
    logoBg: "white",
    duration: "5–6 h",
    level: "Principiante",
    progress: 0,
  },
  "git-github": {
    track: "Git",
    title: "Git y GitHub para QA",
    description:
      "Flujo real de ramas y commits, workflows de equipo, rebase y pull requests en GitHub.",
    logo: "/logos/logo-git.png",
    logoBg: "white",
    duration: "5–6 h",
    level: "Intermedio",
    progress: 0,
  },
  playwright: {
    track: "Playwright",
    title: "Automatización con Playwright",
    description:
      "Suites E2E mantenibles: locators accesibles, POM, fixtures, API testing y CI, con Git integrado.",
    logo: "/logos/logo-playwright.png",
    logoBg: "white",
    duration: "6–7 h",
    level: "Avanzado",
    progress: 0,
  },
};

function moduleCount(section: DocSection): number {
  const groups = new Set<string>();
  for (const item of section.items) {
    if (item.group) groups.add(item.group);
  }
  // Si no hay grupos (p.ej. Setup), cuenta como 1 módulo.
  return groups.size || 1;
}

function buildCourse(section: DocSection): Course | null {
  const meta = META[section.id];
  if (!meta) return null;
  const first = section.items[0];
  return {
    id: section.id,
    track: meta.track,
    title: meta.title,
    description: meta.description,
    logo: meta.logo,
    logoBg: meta.logoBg,
    lessons: section.items.length,
    modules: moduleCount(section),
    duration: meta.duration,
    level: meta.level,
    href: first ? `/docs/${section.id}/${first.slug}` : `/docs/${section.id}`,
    progress: meta.progress,
  };
}

// Orden de presentación: usa el orden canónico (fuente de verdad en docsNav).
export const courses: Course[] = sectionOrder
  .map((id) => docsNav.find((s) => s.id === id))
  .filter((s): s is DocSection => Boolean(s))
  .map(buildCourse)
  .filter((c): c is Course => Boolean(c));

/** Cursos destacados para la sección "Empieza por aquí" del Home (arranque del camino). */
export const featuredCourses: Course[] = ["setup", "regex", "typescript"]
  .map((id) => courses.find((c) => c.id === id))
  .filter((c): c is Course => Boolean(c));

/** Tracks para los chips de filtro de la vista Cursos. */
export const courseTracks: string[] = [
  "Todos",
  "Regex",
  "TypeScript",
  "Git",
  "Playwright",
];
