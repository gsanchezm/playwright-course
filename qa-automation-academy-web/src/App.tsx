import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import TechStrip from "@/sections/TechStrip";
import HowItWorks from "@/sections/HowItWorks";
import StartHere from "@/sections/StartHere";
import CtaBand from "@/sections/CtaBand";
import Footer from "@/sections/Footer";

// Rutas pesadas cargadas bajo demanda: DocsPage arrastra react-markdown + todo
// el contenido .md; mantenerlas fuera del bundle inicial del Home.
const DocsPage = lazy(() => import("@/pages/DocsPage"));
const CursosPage = lazy(() => import("@/pages/CursosPage"));
const LeccionPage = lazy(() => import("@/pages/LeccionPage"));

function LandingPage() {
  return (
    <div className="min-h-screen bg-qa-base font-sans text-qa-text">
      <Header />
      <main>
        <Hero />
        <TechStrip />
        <HowItWorks />
        <StartHere />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}

function PageFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-qa-base font-mono text-sm text-qa-muted">
      Cargando…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/leccion" element={<LeccionPage />} />
          <Route path="/docs" element={<Navigate to="/docs/setup" replace />} />
          <Route path="/docs/:section" element={<DocsPage />} />
          <Route path="/docs/:section/:slug" element={<DocsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
