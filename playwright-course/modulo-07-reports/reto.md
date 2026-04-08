# Reto — Módulo 7: Reports

## Reto 7.1 — Generar y abrir el HTML report

```bash
$ pnpm test modulo-02-anotaciones
$ pnpm report
```

Explora el reporte: duración, status, filtros.

---

## Reto 7.2 — Romper un test y ver el trace

1. Abre `modulo-02-anotaciones/01-test-basico.spec.ts` y rompe la assertion (ej. `toHaveTitle(/Cypress/)`).
2. Corre solo ese archivo: `pnpm test modulo-02-anotaciones/01-test-basico.spec.ts`.
3. Abre el reporte: `pnpm report`.
4. Click en el test fallido → botón **View trace**.
5. Explora el trace: timeline, snapshot del DOM, error exacto.
6. Restaura el assertion original.

---

## Reto 7.3 — Probar reporters de terminal

```bash
$ pnpm test modulo-02-anotaciones --reporter=list
$ pnpm test modulo-02-anotaciones --reporter=line
$ pnpm test modulo-02-anotaciones --reporter=dot
```

Observa la diferencia visual entre los 3.

---

## Reto 7.4 — Generar JUnit XML y JSON

Edita temporalmente `playwright.config.ts` y agrega:

```typescript
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results/results.json' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],
],
```

Corre `pnpm test modulo-02-anotaciones`. Luego abre `test-results/results.json` y `test-results/junit.xml`.

**✅ Resultado esperado:** ambos archivos existen con los resultados en los formatos correspondientes.

---

## Reto 7.5 — Preguntas

1. ¿Por qué `trace: 'on-first-retry'` es mejor que `trace: 'on'`?
2. ¿Qué reporter usarías en un pipeline de GitHub Actions?
3. ¿Qué reporter usarías en Jenkins?
4. ¿Cuál es el valor principal del Trace Viewer?

**Respuestas:**

1. Porque grabar trace en CADA test es costoso (aumenta la duración y el tamaño del disco). Con `on-first-retry` solo se graba cuando un test ya falló una vez y se está reintentando — que son los casos donde realmente necesitas el trace para depurar.
2. `github` (para anotaciones inline en PRs) combinado con `html` (para subir como artifact).
3. `junit` XML. Jenkins lo parsea automáticamente y lo muestra en el dashboard del build.
4. Te permite **reproducir visualmente** un fallo que ocurrió en CI sin tener que reproducirlo localmente. Ves el DOM, la red, los logs y los timestamps — es como viajar en el tiempo al momento del fallo.

---

## ✅ Checklist

- [ ] Abrí y exploré el reporte HTML.
- [ ] Usé el Trace Viewer en un test fallido.
- [ ] Probé los reporters `list`, `line`, `dot`.
- [ ] Generé archivos JUnit y JSON.
- [ ] Sé qué reporter usar en cada situación.
