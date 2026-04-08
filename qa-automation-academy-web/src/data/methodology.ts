export type MethodStep = {
  id: string;
  title: string;
  description: string;
};

export const methodology: MethodStep[] = [
  {
    id: "hands-on",
    title: "Ejercicios prácticos",
    description:
      "Cada concepto se fija con un ejercicio que ejecutas tú, no con teoría pasiva.",
  },
  {
    id: "progresion",
    title: "Progresión guiada",
    description:
      "Una ruta clara: de tipado básico a suites E2E mantenibles, sin saltos innecesarios.",
  },
  {
    id: "contexto-real",
    title: "Contexto real de QA",
    description:
      "Ejemplos tomados del día a día de un tester automatizado, no de tutoriales genéricos.",
  },
  {
    id: "tooling-moderno",
    title: "Tooling moderno",
    description:
      "TypeScript, Git/GitHub y Playwright configurados como lo hace un equipo real.",
  },
  {
    id: "deploy-ready",
    title: "Listo para despliegue",
    description:
      "Todo el material está pensado para correr local, en CI y como sitio publicable.",
  },
];
