export type TokenKind = "plain" | "keyword" | "string" | "comment" | "fn" | "type" | "cmd";

export type Token = { kind: TokenKind; text: string };

export type Line = {
  tokens: Token[];
  active?: boolean;
};

export type Snippet = {
  id: "setup" | "typescript" | "github" | "playwright";
  label: string;
  filename: string;
  language: string;
  lines: Line[];
};

// Helpers compactos para construir tokens
const t = (text: string): Token => ({ kind: "plain", text });
const k = (text: string): Token => ({ kind: "keyword", text });
const s = (text: string): Token => ({ kind: "string", text });
const c = (text: string): Token => ({ kind: "comment", text });
const f = (text: string): Token => ({ kind: "fn", text });
const ty = (text: string): Token => ({ kind: "type", text });
const cmd = (text: string): Token => ({ kind: "cmd", text });

// Cada tab corresponde a una carpeta del repo. El código es real:
// proviene literalmente de los ejercicios del curso, con comentarios
// reducidos a lo esencial.
export const snippets: Snippet[] = [
  // ────────────────────────────────────────────────────────────
  // 00-setup/ → instalación completa en una pasada
  // ────────────────────────────────────────────────────────────
  {
    id: "setup",
    label: "Setup",
    filename: "00-setup/install.sh",
    language: "bash",
    lines: [
      { tokens: [c("# Instala todo lo necesario para los 3 cursos")] },
      { tokens: [cmd("brew"), t(" install node@20 git")] },
      { tokens: [cmd("npm"), t(" install -g pnpm")] },
      { tokens: [t("")] },
      { tokens: [c("# Configura tu identidad de Git")] },
      {
        tokens: [
          cmd("git"),
          t(" config --global user.name "),
          s('"Tu Nombre"'),
        ],
      },
      {
        tokens: [
          cmd("git"),
          t(" config --global user.email "),
          s('"tu@correo.com"'),
        ],
        active: true,
      },
      { tokens: [t("")] },
      { tokens: [c("# Llave SSH para GitHub")] },
      {
        tokens: [
          cmd("ssh-keygen"),
          t(" -t ed25519 -C "),
          s('"tu@correo.com"'),
        ],
      },
      { tokens: [t("")] },
      { tokens: [c("# Dependencias y navegadores de Playwright")] },
      { tokens: [cmd("pnpm"), t(" install")] },
      { tokens: [cmd("pnpm"), t(" exec playwright install")] },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // typescript-qa-course/ → tipo personalizado con union type
  // (extracto de modulo-04-objects-types/03-optional-props.ts)
  // ────────────────────────────────────────────────────────────
  {
    id: "typescript",
    label: "TypeScript",
    filename: "modulo-04-objects-types/bug-report.ts",
    language: "ts",
    lines: [
      { tokens: [c("// Tipo personalizado para reportar bugs en QA")] },
      {
        tokens: [
          k("type"),
          t(" "),
          ty("BugReport"),
          t(" = {"),
        ],
      },
      { tokens: [t("  id: "), ty("number"), t(";")] },
      { tokens: [t("  title: "), ty("string"), t(";")] },
      {
        tokens: [
          t("  severity: "),
          s('"LOW"'),
          t(" | "),
          s('"MEDIUM"'),
          t(" | "),
          s('"HIGH"'),
          t(" | "),
          s('"CRITICAL"'),
          t(";"),
        ],
        active: true,
      },
      { tokens: [t("  assignee?: "), ty("string"), t(";")] },
      { tokens: [t("};")] },
      { tokens: [t("")] },
      {
        tokens: [
          k("const"),
          t(" bug: "),
          ty("BugReport"),
          t(" = {"),
        ],
      },
      { tokens: [t("  id: 1042,")] },
      {
        tokens: [
          t("  title: "),
          s('"Submit button unresponsive"'),
          t(","),
        ],
      },
      { tokens: [t("  severity: "), s('"HIGH"'), t(",")] },
      { tokens: [t("};")] },
      { tokens: [t("")] },
      {
        tokens: [
          f("console"),
          t("."),
          f("log"),
          t("("),
          s("`Bug #${bug.id}: ${bug.title}`"),
          t(");"),
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // git-github-course/ → flujo real de feature branch + PR
  // (extracto de modulo-04-ramas-y-merge/ejemplo.md)
  // ────────────────────────────────────────────────────────────
  {
    id: "github",
    label: "Git/GitHub",
    filename: "git-github-course/feature-flow.sh",
    language: "bash",
    lines: [
      { tokens: [c("# Sincroniza main antes de empezar")] },
      { tokens: [cmd("git"), t(" switch main")] },
      { tokens: [cmd("git"), t(" pull origin main")] },
      { tokens: [t("")] },
      { tokens: [c("# Crea tu rama con nombre semántico")] },
      {
        tokens: [
          cmd("git"),
          t(" switch -c "),
          s("feature/add-cart-tests"),
        ],
        active: true,
      },
      { tokens: [t("")] },
      { tokens: [cmd("git"), t(" add tests/cart.spec.ts")] },
      {
        tokens: [
          cmd("git"),
          t(" commit -m "),
          s('"test: add cart checkout flow"'),
        ],
      },
      { tokens: [t("")] },
      { tokens: [c("# Sube y abre el PR")] },
      {
        tokens: [
          cmd("git"),
          t(" push -u origin "),
          s("feature/add-cart-tests"),
        ],
      },
      { tokens: [cmd("gh"), t(" pr create --fill")] },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // playwright-course/ → primer test real con getByRole
  // (extracto de modulo-01-vision-general/hello.spec.ts)
  // ────────────────────────────────────────────────────────────
  {
    id: "playwright",
    label: "Playwright",
    filename: "modulo-01-vision-general/hello.spec.ts",
    language: "ts",
    lines: [
      {
        tokens: [
          k("import"),
          t(" { "),
          f("test"),
          t(", "),
          f("expect"),
          t(" } "),
          k("from"),
          t(" "),
          s('"@playwright/test"'),
          t(";"),
        ],
      },
      { tokens: [t("")] },
      {
        tokens: [
          f("test"),
          t("("),
          s('"Get Started navega a Installation"'),
          t(", "),
          k("async"),
          t(" ({ page }) => {"),
        ],
      },
      {
        tokens: [
          t("  "),
          k("await"),
          t(" page."),
          f("goto"),
          t("("),
          s('"https://playwright.dev/"'),
          t(");"),
        ],
      },
      { tokens: [t("")] },
      {
        tokens: [
          t("  "),
          k("await"),
          t(" page."),
          f("getByRole"),
          t("("),
          s('"link"'),
          t(", { name: "),
          s('"Get started"'),
          t(" })."),
          f("click"),
          t("();"),
        ],
        active: true,
      },
      { tokens: [t("")] },
      {
        tokens: [
          t("  "),
          k("await"),
          t(" "),
          f("expect"),
          t("("),
        ],
      },
      {
        tokens: [
          t("    page."),
          f("getByRole"),
          t("("),
          s('"heading"'),
          t(", { name: "),
          s('"Installation"'),
          t(" })"),
        ],
      },
      {
        tokens: [
          t("  )."),
          f("toBeVisible"),
          t("();"),
        ],
      },
      { tokens: [t("});")] },
    ],
  },
];
