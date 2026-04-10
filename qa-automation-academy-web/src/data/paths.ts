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
    id: "git-github",
    title: "Git y GitHub para testers",
    status: "live",
    description:
      "Aprende el flujo real que usan los equipos de automatización: ramas, PRs, revisión y CI básico.",
    capabilities: [
      "Flujo feature branch, rebase y merge sin miedo",
      "Pull requests con revisión efectiva entre QA y dev",
      "Integración con GitHub Actions para tests automáticos",
    ],
    href: "/docs/git-github",
    accent: "periwinkle",
    iconName: "git-branch",
    logo: "/git-icon.svg",
  },
  {
    id: "playwright",
    title: "Playwright para automatización web",
    status: "live",
    description:
      "De cero a suites E2E mantenibles con la herramienta más moderna del ecosistema de testing web.",
    capabilities: [
      "Locators accesibles con getByRole, getByLabel y getByText",
      "Page Object Model, fixtures, parametrización y API testing",
      "11 módulos: anotaciones, locators, codegen, reports, IA y más",
    ],
    href: "/docs/playwright",
    accent: "lavender",
    iconName: "play",
    logo: "/playwright-logo.svg",
  },
];
