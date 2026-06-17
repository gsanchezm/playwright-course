import Container from "@/components/Container";
import BrandMark from "@/components/BrandMark";

export default function Footer() {
  return (
    <footer className="border-t border-qa-line bg-qa-base py-10">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <BrandMark />
          <p className="font-mono text-xs text-qa-muted">
            © {new Date().getFullYear()} QA Automation Academy · Hecho por
            Gilberto Sánchez Mares
          </p>
        </div>
      </Container>
    </footer>
  );
}
