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
      { slug: "m1-console-log", label: "1.1 console.log" },
      { slug: "m1-variables", label: "1.2 Variables" },
      { slug: "m2-booleans", label: "2.1 boolean" },
      { slug: "m2-numbers", label: "2.2 number" },
      { slug: "m2-strings", label: "2.3 string" },
      { slug: "m2-any", label: "2.4 any" },
      { slug: "m2-arrays", label: "2.5 arrays" },
      { slug: "m2-tuples", label: "2.6 tuples" },
    ],
  },
  {
    id: "git-github",
    title: "Git y GitHub para testers",
    accent: "periwinkle",
    available: false,
    items: [],
  },
  {
    id: "playwright",
    title: "Playwright para QA",
    accent: "lavender",
    available: false,
    items: [],
  },
];
