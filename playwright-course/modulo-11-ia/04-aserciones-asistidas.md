# 11.4 — Aserciones asistidas por IA (concepto avanzado)

## El problema de las aserciones tradicionales

En tests E2E tradicionales, validas cosas concretas y verificables:

```typescript
await expect(page.getByRole('heading')).toHaveText('Welcome John');
await expect(page.locator('.cart-count')).toHaveText('3');
```

Pero hay casos donde **no sabes exactamente qué validar** porque el contenido es:
- **Dinámico:** un mensaje generado por IA que cambia cada vez.
- **Subjetivo:** "el layout debe verse profesional".
- **Visual:** "el banner debe estar centrado".
- **Semántico:** "el formulario debe pedirme datos personales".

## La solución emergente: assertion con LLM

La idea es: **tomar un screenshot o el HTML de la página y pasárselo a un LLM para que valide lo que TÚ describes en lenguaje natural**.

### Ejemplo conceptual

```typescript
import { test, expect } from '@playwright/test';
import { askLLM } from './ai-helpers'; // helper hipotético

test('el dashboard muestra un mensaje de bienvenida personalizado', async ({ page }) => {
  await page.goto('/dashboard');

  // Tomamos el contenido visible
  const html = await page.locator('main').innerHTML();

  // Le pedimos al LLM que valide
  const result = await askLLM({
    html,
    question: '¿Hay un mensaje de bienvenida que mencione al usuario por su nombre?',
  });

  expect(result.passed).toBe(true);
});
```

### Otro ejemplo con screenshot

```typescript
test('el carrito tiene un diseño limpio y profesional', async ({ page }) => {
  await page.goto('/cart');
  const screenshotBuffer = await page.screenshot();

  const result = await askLLM({
    image: screenshotBuffer,
    question: 'Describe el layout del carrito. ¿Hay errores visibles, elementos desalineados o solapados?',
  });

  // Si el LLM detecta algún problema, falla el test
  expect(result.issues).toHaveLength(0);
});
```

## Herramientas que ya existen

| Herramienta | Qué hace |
|-------------|----------|
| **Applitools Eyes** | Visual regression testing con IA. Compara screenshots y detecta cambios significativos ignorando pixels irrelevantes. |
| **Percy** | Similar a Applitools, integra con Playwright. |
| **Playwright + GPT-4 Vision** | Implementación custom: tomas screenshot y lo mandas a la API de OpenAI para que lo describa. |
| **Auto Playwright** | Librería experimental que permite escribir tests en lenguaje natural y los traduce a código Playwright. |

## ⚠️ Por qué esto NO está listo para producción (todavía)

1. **No determinístico:** el LLM puede dar respuestas distintas a la misma imagen.
2. **Caro:** cada assertion cuesta tokens de un LLM.
3. **Lento:** suma 2-5 segundos por assertion.
4. **Hallucinations:** el LLM puede "ver" cosas que no están.
5. **Falsos positivos/negativos:** difícil de calibrar.

## ¿Cuándo usarlo en la realidad?

✅ Como **complemento**, no como reemplazo:
- Pruebas exploratorias asistidas (sección 11.2 con MCP).
- Validar contenido generado por IA en tu propia app (chatbots, resúmenes auto-generados).
- Smoke tests visuales en preproducción (¿la página se ve rota?).
- Detección de regresiones visuales sutiles que no atrapan los pixel-by-pixel.

❌ NO para:
- Tests determinísticos de regresión.
- Validaciones críticas (carrito, pagos, login).
- Pipelines de CI con miles de tests.

## Mi predicción (instructor)

En 2-3 años, la mayoría de frameworks de testing tendrán algún componente de "assertion semántica con LLM" integrado. Por ahora, **úsalo solo si estás explorando, no como tu suite principal**.
