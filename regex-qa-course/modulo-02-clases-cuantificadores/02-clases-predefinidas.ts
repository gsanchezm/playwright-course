// ============================================================
// Mini-clase 2.2: Clases predefinidas — \d \w \s y sus negaciones
// ============================================================
// Analogía: son "atajos de teclado" del regex. En vez de escribir a mano
// [0-9] o [A-Za-z0-9_], usas \d y \w. Como cualquier atajo, son cómodos
// PERO hay que conocer su letra chica: \d y \w son ASCII (no entienden
// acentos ni alfabetos no latinos). En QA eso es una bomba de tiempo si tu
// app es multi-mercado (OmniPizza: MX/US/CH/JP).
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 2.2 Clases predefinidas =====");

// ------------------------------------------------------------
// 1) \d = dígito ASCII  ≡  [0-9]
// ------------------------------------------------------------
checkMatch(/^\d$/, "5", true);
checkMatch(/^\d$/, "a", false);
// Equivalencia: \d se comporta igual que [0-9] en estos casos.
checkMatch(/^[0-9]$/, "5", true);

// ------------------------------------------------------------
// 2) \w = "word char" ASCII  ≡  [A-Za-z0-9_]
// ------------------------------------------------------------
// ⚠️ Trampa #1: \w INCLUYE el guion bajo '_' pero NO el guion '-'.
checkMatch(/^\w$/, "a", true);
checkMatch(/^\w$/, "_", true);  // el guion BAJO sí es \w
checkMatch(/^\w$/, "-", false); // el guion MEDIO NO es \w
checkMatch(/^\w$/, " ", false);
// Equivalencia explícita con la clase larga:
checkMatch(/^[A-Za-z0-9_]$/, "_", true);

// ------------------------------------------------------------
// 3) \s = espacio en blanco (espacio, tab, salto de línea, etc.)
// ------------------------------------------------------------
checkMatch(/^\s$/, " ", true);
checkMatch(/^\s$/, "\t", true);
checkMatch(/^\s$/, "x", false);
// Nota: a diferencia de \d y \w, \s SÍ reconoce algunos espacios Unicode
// (p.ej. el espacio duro NBSP  ). Por eso NO digas "todo lo predefinido
// es ASCII": la regla ASCII aplica a \d y \w, no a \s.
checkMatch(/^\s$/, " ", true); // NBSP cuenta como espacio en blanco

// ------------------------------------------------------------
// 4) NEGACIONES — \D \W \S = "lo contrario" de su versión minúscula
// ------------------------------------------------------------
// \D = NO-dígito,  \W = NO-word-char,  \S = NO-espacio. Mnemotecnia:
// MAYÚSCULA = NEGACIÓN. Útiles para afirmar "aquí NO debe haber X".
checkMatch(/^\D$/, "a", true);   // 'a' no es dígito
checkMatch(/^\D$/, "5", false);  // '5' es dígito → \D lo rechaza
checkMatch(/^\W$/, "-", true);   // '-' no es word-char → es \W
checkMatch(/^\W$/, "a", false);
checkMatch(/^\S$/, "x", true);   // 'x' no es espacio
checkMatch(/^\S$/, " ", false);  // ' ' es espacio → \S lo rechaza

// Relación de complemento: para CUALQUIER caracter, o es \d o es \D
// (nunca ambos, nunca ninguno). Lo verificamos como propiedad:
const muestra = ["7", "a", " ", "_", "-"];
const todoEsDoDmayus = muestra.every((c) => /\d/.test(c) !== /\D/.test(c));
check("\\d y \\D son complementarios (XOR) para cada caracter", todoEsDoDmayus, true);

// ------------------------------------------------------------
// 5) 🪤 LA TRAMPA GRANDE: \w y \d son ASCII — y la flag 'u' NO los arregla
// ------------------------------------------------------------
// Esto sorprende a casi todos: mucha gente cree que poner la flag 'u'
// (Unicode) hace que \w entienda acentos. NO ES ASÍ. \w sigue siendo
// [A-Za-z0-9_] incluso con 'u'. Lo demostramos con "café" (la é no es \w):
checkMatch(/^\w+$/, "café", false);  // sin flag: la 'é' rompe → NO coincide
checkMatch(/^\w+$/u, "café", false); // CON flag u: ¡SIGUE sin coincidir!
// 👆 Esa segunda línea es el punchline: 'u' no rescata a \w.

// Lo mismo con \d y dígitos no-ASCII (arábigo-índicos ٠١). \d ignora estos:
checkMatch(/^\d+$/, "٠١", false);
checkMatch(/^\d+$/u, "٠١", false); // 'u' tampoco rescata a \d

// ✅ El arreglo REAL (gancho a M07) son las PROPIEDADES Unicode \p{...},
//    que EXIGEN la flag 'u'. \p{L} = "cualquier letra Unicode" (con acentos
//    y todos los alfabetos). Aquí "café" SÍ coincide:
checkMatch(/^\p{L}+$/u, "café", true);      // letras Unicode reales
checkMatch(/^\p{L}+$/u, "México", true);    // acento incluido
checkMatch(/^\p{L}+$/u, "Tōkyō", true);     // macrones también
// 🔭 En M07 (avanzado) profundizamos en \p{...}, \p{N}, scripts, etc.
//    Por ahora: si tu app es internacional, \w/\d ASCII NO bastan.
