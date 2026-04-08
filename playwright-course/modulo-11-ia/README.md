# Módulo 11: Introducción a la IA en Testing

> **Objetivo:** Conocer las formas en que la IA generativa (LLMs como Claude, ChatGPT, GitHub Copilot) puede acelerar tu trabajo como automatizador, y entender el nuevo concepto de **MCP (Model Context Protocol)** que permite a los agentes de IA controlar Playwright directamente.

> **Referencias:**
> - [Playwright MCP](https://github.com/microsoft/playwright-mcp) — el servidor MCP oficial de Microsoft
> - [GitHub Copilot](https://github.com/features/copilot)
> - [Claude Code](https://claude.com/claude-code)

---

## 🎯 Analogía principal

> **La IA es tu junior pair programmer 24/7.**
>
> No reemplaza al automatizador (todavía), pero:
> - Te ahorra escribir el 70% del código boilerplate.
> - Te sugiere selectores cuando estás atorado.
> - Te explica errores crípticos en lenguaje humano.
> - Te ayuda a refactorizar tests viejos.
> - Puede LEER tu app y proponer casos de prueba que tú no habías pensado.
>
> **Lo que NO hace:**
> - No entiende tu negocio (tú sí).
> - No sabe qué es "crítico" para tu empresa.
> - No prioriza casos basándose en riesgo real.
> - No reemplaza el pensamiento crítico de un QA.

---

## Archivos del módulo (todo teoría + ejemplos)

| Archivo | Tema |
|---------|------|
| [01-copilot-para-tests.md](./01-copilot-para-tests.md) | GitHub Copilot escribiendo tests con tab completion |
| [02-mcp-playwright.md](./02-mcp-playwright.md) | Playwright MCP: el LLM controla un navegador real |
| [03-prompts-para-qa.md](./03-prompts-para-qa.md) | Prompts efectivos para generar tests y casos |
| [04-aserciones-asistidas.md](./04-aserciones-asistidas.md) | Cuando el snapshot del DOM se le pasa a un LLM para validar |
| [reto.md](./reto.md) | Retos del alumno |

---

## 1. Las 4 formas en que la IA ayuda al automatizador hoy

### A. Asistente en el editor (Copilot, Cursor, Continue)

Mientras escribes código en VS Code, un LLM lee tu contexto (archivos abiertos, nombres de variables, comentarios) y **sugiere** la siguiente línea.

Ejemplo: escribes
```typescript
test('login con credenciales válidas', async ({ page }) => {
  await page.goto('https://app.com/login');
  // [aquí Copilot sugiere automáticamente:]
  await page.getByLabel('Email').fill('admin@test.com');
  await page.getByLabel('Password').fill('Test1234!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### B. Generador de casos a partir de requerimientos

Le pasas el ticket de Jira o la spec del producto y le pides:
> "Genera 5 casos de prueba en formato Gherkin para el flujo de checkout descrito arriba, incluyendo casos negativos."

El LLM te entrega 5 escenarios listos para automatizar.

### C. MCP — control del navegador en tiempo real

**MCP (Model Context Protocol)** es un estándar nuevo que permite a un LLM comunicarse con herramientas externas. **Playwright MCP** es un servidor MCP oficial de Microsoft que expone Playwright como una herramienta para LLMs.

Esto significa: **un agente de IA puede abrir un navegador real, navegar, hacer click, leer el DOM, y reportar lo que ve** — todo controlado por instrucciones humanas en lenguaje natural.

Ejemplo de prompt:
> "Abre https://demo.playwright.dev/todomvc, agrega 3 todos, marca el segundo como completado, y dime si todo funcionó."

El agente literalmente **abre el navegador, hace los clicks, lee el resultado** y te responde. Más detalles en [02-mcp-playwright.md](./02-mcp-playwright.md).

### D. Análisis y debugging de tests fallidos

Le pasas el log de error + el código del test, y le preguntas:
> "Este test falla en CI pero pasa local. ¿Por qué?"

El LLM analiza, identifica posibles causas (race condition, timeout, dependency, env var) y te sugiere fixes.

---

## 2. ¿Reemplaza la IA al automatizador?

**No. Lo amplifica.**

| Tarea | Antes (sin IA) | Ahora (con IA) | ¿La IA reemplaza al humano? |
|-------|----------------|----------------|------------------------------|
| Escribir un test simple | 15 min | 3 min | ❌ revisas la salida |
| Generar selectores | 5 min por elemento | 30 seg | ❌ validas que funcionen |
| Diseñar casos de prueba | 1 hora | 20 min | ❌ priorizas y filtras |
| Refactorizar a POM | 30 min | 10 min | ❌ verificas la lógica |
| Mantener un test flaky | 30 min de debugging | 10 min con análisis IA | ❌ aplicas el fix |
| Decidir qué probar | — | — | ✅ esto sigue siendo 100% humano |

**Regla del instructor:** la IA hace el código boring; tú haces las decisiones importantes.

---

## 📋 Pasos explícitos para explicar en clase

1. **Empieza con la pregunta provocadora:** "¿La IA va a reemplazar a los automatizadores?". Toma respuestas. Da tu opinión: **no, pero los automatizadores que usen IA reemplazarán a los que no la usen**.
2. **Demo de Copilot en vivo:** abre VS Code, crea un test vacío y deja que Copilot autocomplete. Muestra cómo a veces acierta y a veces no.
3. **Explica MCP:** muestra el repo `microsoft/playwright-mcp`. Si tienes Claude Desktop o Cursor configurado, demuestra un agente abriendo el navegador en vivo.
4. **Demo de prompt para casos de prueba:** abre Claude/ChatGPT y pega esta spec: "Tenemos una tienda online. El usuario puede agregar productos al carrito, aplicar cupones, y completar la compra. Genera 10 casos de prueba E2E priorizados por riesgo".
5. **Demo de debugging asistido:** copia el log de un test fallido y pídele al LLM que lo analice.
6. **Conclusión:** "la IA es tu compañero, no tu jefe. Tú sigues siendo el QA — la IA es tu manos rápidas".
7. **Envía al reto.**

---

## ⚠️ Riesgos y limitaciones

1. **Hallucinations:** los LLMs pueden inventar APIs que no existen. Siempre verifica.
2. **Selectores frágiles:** Copilot a veces sugiere `.locator('div > div > button')`. Reemplaza con `getByRole`.
3. **Datos sensibles:** NO copies datos reales (PII, tokens, contraseñas) a un LLM público. Usa datos sintéticos.
4. **Dependencia:** si te acostumbras a que Copilot escriba todo, **olvidas pensar**. Practica también escribir tests sin IA.
5. **Costo:** los APIs de LLMs cuestan dinero a escala. Configura límites en tu cuenta.

➡️ Lee [01-copilot-para-tests.md](./01-copilot-para-tests.md) primero.
