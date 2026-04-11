import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import PathsGrid from "@/sections/PathsGrid";
import TypescriptProgress from "@/sections/TypescriptProgress";
import Methodology from "@/sections/Methodology";
import Highlights from "@/sections/Highlights";
import Footer from "@/sections/Footer";
import DocsPage from "@/pages/DocsPage";

function LandingPage() {
  return (
    <div className="min-h-screen bg-qa-base font-sans text-qa-text">
      <Header />
      <main>
        <Hero />
        <PathsGrid />
        <TypescriptProgress />
        <Methodology />
        <Highlights />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<Navigate to="/docs/setup" replace />} />
        <Route path="/docs/:section" element={<DocsPage />} />
        <Route path="/docs/:section/:slug" element={<DocsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
