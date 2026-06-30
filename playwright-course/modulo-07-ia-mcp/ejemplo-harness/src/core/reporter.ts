// ============================================================
// core/reporter.ts — reporter de resumen (patrón OBSERVER)
// ============================================================
// Analogía QA: un "observador" en la sala que apunta cuántos
// casos pasaron y cuántos fallaron sin participar en la ejecución.
//
// OBSERVER: un Reporter de Playwright ES un observador del ciclo de
// vida de la suite. Playwright (el "subject") emite eventos —onBegin,
// onTestEnd, onEnd— y este reporter (el "observer") reacciona a cada
// uno. Agregar/quitar reporters no toca la lógica de los tests:
// observadores acoplados débilmente al subject.
// ============================================================

import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from "@playwright/test/reporter";

class SummaryReporter implements Reporter {
  private total = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;

  // El subject nos avisa que la corrida empieza y cuántos tests hay.
  onBegin(_config: FullConfig, suite: Suite): void {
    this.total = suite.allTests().length;
    console.log(`\n[harness] Iniciando corrida: ${this.total} test(s)\n`);
  }

  // Reaccionamos a cada test que termina, acumulando el conteo.
  onTestEnd(test: TestCase, result: TestResult): void {
    switch (result.status) {
      case "passed":
        this.passed++;
        break;
      case "skipped":
        this.skipped++;
        break;
      default:
        // "failed" | "timedOut" | "interrupted"
        this.failed++;
        console.log(`[harness] ✗ FAIL: ${test.title}`);
        break;
    }
  }

  // El subject cierra la corrida: imprimimos el resumen final.
  onEnd(result: FullResult): void {
    console.log(
      `\n[harness] Resumen — ${this.passed} ✓  ${this.failed} ✗  ${this.skipped} ⊘  ` +
        `(de ${this.total}) → estado: ${result.status}\n`,
    );
  }
}

export default SummaryReporter;
