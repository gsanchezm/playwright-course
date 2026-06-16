# 🚩 Reto — Módulo 3: "Parsea la línea de log"

> **Módulo 3 · Grupos, captura y alternancia**

> **Analogía QA:** una línea de log de ejecución de prueba trae media docena de datos pegados en prosa. Tu trabajo de QA es convertir ese ruido en un objeto tipado que puedas assertar. Eso es EXACTAMENTE lo que hace un reporter cuando transforma stdout en un reporte estructurado.

---

## Instrucciones

1. Tienes UNA línea de log de ejecución de prueba (`LINEA_LOG_TEST`). Tu trabajo: extraer TODOS sus campos a un objeto **tipado** usando **grupos nombrados** `(?<nombre>...)`.
2. Reemplaza el placeholder `const reLog = /CAMBIAME/;` por tu regex con un grupo nombrado por cada campo del objeto: `timestamp`, `archivo`, `linea`, `nombre`, `duracionMs`, `status`.
3. Ejecuta el archivo y verifica que el check final muestre ✅ (que tu objeto parseado sea EXACTAMENTE el objeto esperado).

Es ESPERADO que veas ❌ hasta que completes la regex: con `/CAMBIAME/` no matchea nada y el objeto sale en `null`.

La línea a parsear es:

```
2026-06-16T14:30:03Z [ERROR] test=checkout.spec.ts:42 name='checkout flow' duration=1530ms status=failed
```

---

## Plantilla

```ts
// @file regex-qa-course/modulo-03-grupos-captura/reto.ts
import { check } from "../helpers/check";
import { LINEA_LOG_TEST } from "../data/samples";

console.log("\n===== 🚩 Reto 3: Parsea la línea de log =====");
console.log("Línea:", LINEA_LOG_TEST);

// El objeto TIPADO que tu parser debe producir.
interface LogTest {
  timestamp: string;
  archivo: string;
  linea: number;
  nombre: string;
  duracionMs: number;
  status: string;
}

// ------------------------------------------------------------
// TODO: reemplaza /CAMBIAME/ por tu regex con grupos nombrados.
//   Debe tener: (?<timestamp>...) (?<archivo>...) (?<linea>...)
//               (?<nombre>...) (?<duracionMs>...) (?<status>...)
// ------------------------------------------------------------
const reLog = /CAMBIAME/; // TODO: completa esta regex con 6 grupos nombrados

// El parser: convierte la línea en LogTest, o null si no matcheó.
// (No necesitas tocar esto; solo arreglar la regex de arriba.)
function parseLineaLog(linea: string): LogTest | null {
  const m = linea.match(reLog);
  // Doble guarda: match puede ser null y .groups puede ser undefined.
  if (!m || !m.groups) return null;
  const g = m.groups;
  return {
    timestamp: g.timestamp,
    archivo: g.archivo,
    linea: Number(g.linea),
    nombre: g.nombre,
    duracionMs: Number(g.duracionMs),
    status: g.status,
  };
}

// El objeto ESPERADO (razonado leyendo la línea de log).
const esperado: LogTest = {
  timestamp: "2026-06-16T14:30:03Z",
  archivo: "checkout.spec.ts",
  linea: 42,
  nombre: "checkout flow",
  duracionMs: 1530,
  status: "failed",
};

const obtenido = parseLineaLog(LINEA_LOG_TEST);
check("objeto LogTest parseado", obtenido, esperado);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-grupos-captura/reto.ts
```

**Output esperado (cuando tu regex esté completa):**

```bash
✅ objeto LogTest parseado
```

---

## Checklist de auto-corrección

- [ ] La regex tiene **exactamente 6** grupos nombrados con los nombres del `interface`.
- [ ] `timestamp` matchea el ISO con `Z`: `\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z`.
- [ ] `archivo` captura la ruta `.ts` que va tras `test=` (p. ej. `checkout.spec.ts`).
- [ ] `linea` captura el número tras `archivo:` (y se castea a `Number`).
- [ ] `nombre` captura lo que va entre comillas simples tras `name=`.
- [ ] `duracionMs` captura el número antes de `ms` tras `duration=`.
- [ ] `status` captura la palabra tras `status=` (`failed` / `passed`).
- [ ] Al correrlo, el check final muestra ✅ y no hay errores de TypeScript.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Para "lo que está entre comillas", piensa en `[^']+` (no en `.*`): así no te comes la comilla de cierre.
- El número de línea va pegado tras los dos puntos del archivo: `archivo:42`.
- Para `duration=1530ms`, captura solo los dígitos y deja `ms` como literal fuera del grupo.
- Recuerda: `.groups` puede ser `undefined` → GUÁRDALO antes de leerlo (ya viene resuelto en la plantilla).
- Castea con `Number()` los campos `linea` y `duracionMs` (la plantilla ya lo hace por ti).

</details>

---

⬅️ Anterior: [3.5 Extraer de logs](/docs/regex/m3-extraer-de-logs) · ➡️ Siguiente: [🧠 Síntesis M3](/docs/regex/m3-sintesis)
