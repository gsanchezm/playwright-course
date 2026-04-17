import { useState, useEffect, useRef } from "react";
import {
  useParams,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import DocSidebar from "@/components/docs/DocSidebar";
import MarkdownContent from "@/components/docs/MarkdownContent";
import { docsNav } from "@/data/docsNav";

// Eagerly import all .md files as raw strings, grouped by section folder.
const setupModules = import.meta.glob(
  "../content/setup/*.md",
  { query: "?raw", import: "default", eager: true }
) as Record<string, string>;

const typescriptModules = import.meta.glob(
  "../content/typescript/*.md",
  { query: "?raw", import: "default", eager: true }
) as Record<string, string>;

const gitGithubModules = import.meta.glob(
  "../content/git-github/*.md",
  { query: "?raw", import: "default", eager: true }
) as Record<string, string>;

function buildSlugMap(
  modules: Record<string, string>
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const path in modules) {
    const filename = path.split("/").pop()!.replace(".md", "");
    map[filename] = modules[path];
  }
  return map;
}

const setupContent = buildSlugMap(setupModules);
const typescriptContent = buildSlugMap(typescriptModules);
const gitGithubContent = buildSlugMap(gitGithubModules);

function getContent(section: string, slug: string): string | null {
  if (section === "setup") return setupContent[slug] ?? null;
  if (section === "typescript") return typescriptContent[slug] ?? null;
  if (section === "git-github") return gitGithubContent[slug] ?? null;
  return null;
}

function getNextPrev(section: string, slug: string) {
  const sec = docsNav.find((s) => s.id === section);
  if (!sec) return { prev: null, next: null };
  const idx = sec.items.findIndex((i) => i.slug === slug);
  return {
    prev: idx > 0 ? sec.items[idx - 1] : null,
    next: idx < sec.items.length - 1 ? sec.items[idx + 1] : null,
  };
}

export default function DocsPage() {
  const { section = "setup", slug } = useParams<{
    section: string;
    slug: string;
  }>();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── ALL hooks must be called unconditionally (Rules of Hooks) ──

  // Close sidebar on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarOpen]);

  // Close sidebar on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Scroll to top on navigation
  useEffect(() => {
    if (slug) window.scrollTo({ top: 0 });
  }, [section, slug]);

  // ── Derived values (after all hooks) ──
  const sectionData = docsNav.find((s) => s.id === section);

  // Redirect: /docs/setup → /docs/setup/overview (first item)
  if (!slug && sectionData && sectionData.items.length > 0) {
    return (
      <Navigate to={`/docs/${section}/${sectionData.items[0].slug}`} replace />
    );
  }

  const content = slug ? getContent(section, slug) : null;
  const { prev, next } = slug
    ? getNextPrev(section, slug)
    : { prev: null, next: null };

  return (
    <div className="min-h-screen bg-qa-base font-sans text-qa-text">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-qa-line/50 bg-qa-base/80 backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((v) => !v)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-qa-line bg-qa-panel/40 text-qa-muted transition-colors hover:text-qa-text lg:hidden"
          >
            {sidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-sm font-semibold text-qa-text"
            aria-label="QA Automation Academy — ir al inicio"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-qa-accent text-qa-base">
              <span className="font-mono text-[10px] font-bold">QA</span>
            </span>
            <span className="hidden sm:block">
              <span className="text-qa-text">QA</span>
              <span className="text-qa-muted">/Docs</span>
            </span>
          </Link>

          {/* Breadcrumb */}
          <div className="hidden items-center gap-1.5 font-mono text-xs text-qa-muted sm:flex">
            <span className="text-qa-line">/</span>
            <span className="capitalize text-qa-muted">{section}</span>
            {slug && (
              <>
                <span className="text-qa-line">/</span>
                <span className="text-qa-text">
                  {sectionData?.items.find((i) => i.slug === slug)?.label ??
                    slug}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto max-w-screen-xl lg:flex">
        {/* Sidebar — desktop fixed, mobile drawer */}
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-qa-base/80 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
          )}

          {/* Sidebar panel */}
          <div
            ref={sidebarRef}
            className={`fixed inset-y-0 left-0 z-20 w-72 overflow-y-auto border-r border-qa-line/50 bg-qa-base transition-transform duration-300 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:w-64 xl:w-72 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <DocSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
          <div className="mx-auto max-w-3xl">
            {content ? (
              <>
                <article>
                  <MarkdownContent content={content} />
                </article>

                {/* Prev / Next navigation */}
                <nav
                  aria-label="Navegación entre artículos"
                  className="mt-12 flex items-center justify-between gap-4 border-t border-qa-line pt-8"
                >
                  {prev ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/docs/${section}/${prev.slug}`)
                      }
                      className="flex items-center gap-2 font-sans text-sm text-qa-muted transition-colors hover:text-qa-text"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{prev.label}</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {next ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/docs/${section}/${next.slug}`)
                      }
                      className="flex items-center gap-2 font-sans text-sm text-qa-muted transition-colors hover:text-qa-text"
                    >
                      <span>{next.label}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ) : (
                    <div />
                  )}
                </nav>
              </>
            ) : (
              /* Not found / coming soon */
              <div className="py-20 text-center">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-qa-cyan">
                  Próximamente
                </p>
                <h1 className="mt-4 font-display text-3xl font-semibold text-qa-text">
                  Contenido en desarrollo
                </h1>
                <p className="mt-4 mx-auto max-w-sm font-sans text-qa-muted">
                  Esta sección estará disponible pronto. Mientras tanto,
                  comienza con el módulo de Setup.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    to="/docs/setup"
                    className="inline-flex items-center gap-2 rounded-full bg-qa-accent px-5 py-2.5 font-mono text-sm font-medium text-qa-base transition-all hover:-translate-y-px"
                  >
                    Ir al Setup
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <Link
                    to="/"
                    className="font-mono text-sm text-qa-muted transition-colors hover:text-qa-text"
                  >
                    ← Volver al inicio
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
