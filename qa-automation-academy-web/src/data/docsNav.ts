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
    available: false,
    items: [],
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
