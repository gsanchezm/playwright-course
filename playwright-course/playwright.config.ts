import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para el curso.
 *
 * Referencia oficial: https://playwright.dev/docs/test-configuration
 *
 * Analogía QA: Este archivo es como el "archivo maestro de configuración"
 * de cualquier herramienta de testing (como settings.xml en Maven, o
 * conftest.py en pytest). Define valores por defecto para TODO el suite:
 * navegadores, timeouts, reintentos, reportes, etc.
 */
export default defineConfig({
  // --- Dónde buscar los tests ---
  // Playwright escaneará recursivamente todos los archivos *.spec.ts
  // dentro de las carpetas modulo-*.
  testDir: '.',
  testMatch: /modulo-.*\/.*\.spec\.ts/,

  // --- Configuración global de ejecución ---
  fullyParallel: true,          // Corre archivos en paralelo
  forbidOnly: !!process.env.CI, // En CI falla si alguien dejó un .only por error
  retries: process.env.CI ? 2 : 0, // Reintenta 2 veces en CI, 0 local
  workers: process.env.CI ? 1 : undefined, // 1 worker en CI para logs limpios

  // Timeout por test. OmniPizza vive en Render free tier: la primera
  // navegación al día puede tardar 30-40s porque el servicio está dormido.
  // 60s da margen suficiente para el cold start sin ocultar tests reales lentos.
  timeout: 60_000,

  // --- Reportes ---
  // Varios reporters a la vez: HTML para humanos + lista para terminal
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  // --- Opciones globales de cada test ---
  use: {
    // URL base: se usa con page.goto('/') sin tener que repetir el dominio.
    // Todo el curso gira alrededor de OmniPizza (https://github.com/gsanchezm/OmniPizza).
    baseURL: 'https://omnipizza-frontend.onrender.com',

    // Trazas: útiles para depurar tests que fallan en CI.
    // 'on-first-retry' = solo grabar en el primer reintento.
    trace: 'on-first-retry',

    // Screenshot solo cuando falla.
    screenshot: 'only-on-failure',

    // Video solo cuando falla.
    video: 'retain-on-failure',

    // Timeouts específicos de acción y navegación (cold start de Render).
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  // --- Proyectos: correr los mismos tests en varios navegadores ---
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Emulación móvil — útil para el módulo 3
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
