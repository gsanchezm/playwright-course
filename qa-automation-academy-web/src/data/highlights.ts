export type Highlight = {
  id: string;
  title: string;
  description: string;
  iconName: "code" | "git-branch" | "play" | "zap";
  detail: string;
};

export const highlights: Highlight[] = [
  {
    id: "snippets",
    title: "Snippets legibles",
    description:
      "Cada módulo incluye código corto, comentado y listo para modificar en tu editor.",
    iconName: "code",
    detail: "pnpm tsx modulo-01/ejemplo.ts",
  },
  {
    id: "git-workflow",
    title: "Workflow real de Git",
    description:
      "Ramas, PRs y rebase aplicados a entregables de testing, no a ejemplos de libro.",
    iconName: "git-branch",
    detail: "git rebase -i origin/main",
  },
  {
    id: "playwright-tests",
    title: "Tests con Playwright",
    description:
      "Suites E2E con locators accesibles, fixtures y trazas para debugging real.",
    iconName: "play",
    detail: "pnpm playwright test --ui",
  },
  {
    id: "deploy-rapido",
    title: "Despliegue simple",
    description:
      "Proyectos listos para publicar como sitios estáticos, sin fricción de infraestructura.",
    iconName: "zap",
    detail: "pnpm build && pnpm preview",
  },
];
