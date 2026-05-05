export type PathStatus = "live" | "soon" | "in-progress";
export type PathAccent = "cyan" | "periwinkle" | "lavender";

export type LearningPath = {
  id: string;
  title: string;
  status: PathStatus;
  description: string;
  capabilities: [string, string, string];
  href: string;
  accent: PathAccent;
  iconName: "code" | "git-branch" | "play";
  logo?: string;
};

export const paths: LearningPath[] = [
  {
    id: "typescript",
    title: "TypeScript para QA",
    status: "live",
    description:
      "Domina tipado, funciones y estructuras reales aplicadas al día a día de un tester automatizado.",
    capabilities: [
      "Tipos, uniones y narrowing aplicados a casos de prueba",
      "Módulos, async/await y utilidades para scripts de QA",
      "6 módulos modulares: un archivo por concepto",
    ],
    href: "/docs/typescript",
    accent: "cyan",
    iconName: "code",
    logo: "/typescript.png",
  },
  {
    id: "playwright",
    title: "Playwright para automatización web",
    status: "live",
    description:
      "De cero a suites E2E mantenibles con la herramienta más moderna del ecosistema de testing web. Incluye Git esencial integrado: empieza aquí sin haber tomado otro curso de Git.",
    capabilities: [
      "Locators accesibles con getByRole, getByLabel y getByText",
      "Page Object Model, fixtures, parametrización y API testing",
      "7 módulos: M00 Git esencial + 6 módulos de framework con Git breaks integrados",
    ],
    href: "/docs/playwright",
    accent: "lavender",
    iconName: "play",
    logo: "/playwright-logo.svg",
  },
  {
    id: "git-github",
    title: "Git y GitHub para testers",
    status: "live",
    description:
      "Material de referencia profunda. Lo esencial vive integrado en el curso de Playwright. Toma este si quieres dominar workflows de equipo, rebase interactivo y mantenimiento de repos.",
    capabilities: [
      "Workflows de equipo: trunk-based, long-running, Gitflow",
      "Rebase interactivo, tags, aliases y ramas remotas avanzadas",
      "Mantenimiento de proyectos: branch protection, releases, code review",
    ],
    href: "/docs/git-github",
    accent: "periwinkle",
    iconName: "git-branch",
    logo: "/git-icon.svg",
  },
];
