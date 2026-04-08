import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import PathsGrid from "@/sections/PathsGrid";
import Methodology from "@/sections/Methodology";
import Highlights from "@/sections/Highlights";
import Footer from "@/sections/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-qa-base font-sans text-qa-text">
      <Header />
      <main>
        <Hero />
        <PathsGrid />
        <Methodology />
        <Highlights />
      </main>
      <Footer />
    </div>
  );
}
