// ============================================================
// Rutas de los dos "badges" de M07 — una sola fuente de verdad
// ============================================================
// Dos setups, dos archivos DISTINTOS: así puedes comparar qué deja
// cada camino de login (UI vs API) sin que uno pise al otro.
// ============================================================

export const UI_AUTH_FILE = ".auth/user.ui.json";
export const API_AUTH_FILE = ".auth/user.api.json";

// 🚩 Reto M07 — badges del SEGUNDO usuario (performance_glitch_user).
// Las rutas ya están aquí para que setups y tests apunten a la misma
// fuente de verdad; los setups que las escriben los creas tú.
export const GLITCH_UI_FILE = ".auth/glitch.ui.json";
export const GLITCH_API_FILE = ".auth/glitch.api.json";
