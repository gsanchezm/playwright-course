export type DocSection = {
  id: string;
  title: string;
  accent: "cyan" | "periwinkle" | "lavender" | "muted";
  available: boolean;
  items: DocItem[];
};

export type DocItem = {
  slug: string;
  label: string;
  /** Opcional: etiqueta de grupo para crear sub-secciones colapsables. */
  group?: string;
};

export const docsNav: DocSection[] = [
  {
    id: "setup",
    title: "Setup",
    accent: "cyan",
    available: true,
    items: [
      { slug: "overview", label: "Visión general" },
      { slug: "01-terminal", label: "Terminal moderna" },
      { slug: "02-nodejs", label: "Node.js" },
      { slug: "03-pnpm", label: "pnpm" },
      { slug: "04-git", label: "Git" },
      { slug: "05-vscode", label: "VS Code" },
      { slug: "06-github", label: "GitHub y SSH" },
      { slug: "07-playwright-browsers", label: "Playwright browsers" },
      { slug: "08-herramientas-ia", label: "Herramientas de IA" },
      { slug: "verificacion", label: "Verificación final" },
    ],
  },
  {
    id: "typescript",
    title: "TypeScript para QA",
    accent: "cyan",
    available: true,
    items: [
      { slug: "m1-console-log", label: "1.1 console.log", group: "Módulo 1 · Hello World" },
      { slug: "m1-variables", label: "1.2 Variables", group: "Módulo 1 · Hello World" },
      { slug: "m1-reto", label: "🚩 Reto M1", group: "Módulo 1 · Hello World" },
      { slug: "m2-booleans", label: "2.1 boolean", group: "Módulo 2 · Tipos" },
      { slug: "m2-numbers", label: "2.2 number", group: "Módulo 2 · Tipos" },
      { slug: "m2-strings", label: "2.3 string", group: "Módulo 2 · Tipos" },
      { slug: "m2-any", label: "2.4 any", group: "Módulo 2 · Tipos" },
      { slug: "m2-arrays", label: "2.5 arrays", group: "Módulo 2 · Tipos" },
      { slug: "m2-tuples", label: "2.6 tuples", group: "Módulo 2 · Tipos" },
      { slug: "m2-enums", label: "2.7 enums", group: "Módulo 2 · Tipos" },
      { slug: "m2-void", label: "2.8 void", group: "Módulo 2 · Tipos" },
      { slug: "m2-null-undefined", label: "2.9 null y undefined", group: "Módulo 2 · Tipos" },
      { slug: "m2-reto", label: "🚩 Reto M2", group: "Módulo 2 · Tipos" },
      { slug: "m3-login", label: "3.1 función login", group: "Módulo 3 · Funciones" },
      { slug: "m3-login-options", label: "3.2 parámetros opcionales", group: "Módulo 3 · Funciones" },
      { slug: "m3-navigate", label: "3.3 valores por defecto", group: "Módulo 3 · Funciones" },
      { slug: "m3-arrow-functions", label: "3.4 arrow functions", group: "Módulo 3 · Funciones" },
      { slug: "m3-void-functions", label: "3.5 funciones void", group: "Módulo 3 · Funciones" },
      { slug: "m3-reto", label: "🚩 Reto M3", group: "Módulo 3 · Funciones" },
    ],
  },
  {
    id: "git-github",
    title: "Git y GitHub para testers",
    accent: "periwinkle",
    available: true,
    items: [
      { slug: "m1-01-que-es-vcs", label: "1.1 ¿Qué es un VCS?", group: "Módulo 1 · Introducción a Git" },
      { slug: "m1-02-historia-de-git", label: "1.2 Historia de Git", group: "Módulo 1 · Introducción a Git" },
      { slug: "m1-03-que-es-git", label: "1.3 ¿Qué es Git?", group: "Módulo 1 · Introducción a Git" },
      { slug: "m1-04-linea-de-comandos", label: "1.4 Línea de comandos", group: "Módulo 1 · Introducción a Git" },
      { slug: "m1-05-instalacion", label: "1.5 Instalación", group: "Módulo 1 · Introducción a Git" },
      { slug: "m1-06-primera-configuracion", label: "1.6 Primera configuración", group: "Módulo 1 · Introducción a Git" },
      { slug: "m1-07-pedir-ayuda", label: "1.7 git help", group: "Módulo 1 · Introducción a Git" },
      { slug: "m1-08-glosario", label: "1.8 Glosario", group: "Módulo 1 · Introducción a Git" },
      { slug: "m6-01-configuracion-cuenta", label: "6.1 Configuración de la cuenta", group: "Módulo 6 · GitHub" },
    ],
  },
  {
    id: "playwright",
    title: "Playwright para QA",
    accent: "lavender",
    available: false,
    items: [],
  },
];
