# Reto — Módulo 11: IA en Testing

## Reto 11.1 — Generar un test con un LLM

Abre tu LLM favorito (ChatGPT, Claude, Gemini) y dale este prompt:

```
Eres un QA automation engineer experto en Playwright + TypeScript.

Genera UN test de Playwright para https://demo.playwright.dev/todomvc que:
1. Agregue 5 todos.
2. Marque los todos pares como completados.
3. Filtre por "Active" y verifique que solo quedan visibles los impares.
4. Filtre por "Completed" y verifique que solo quedan visibles los pares.

Restricciones:
- Usa SOLO getByRole, getByPlaceholder, getByTestId.
- NO uses CSS selectors ni XPath.
- Incluye comentarios en español.
- Devuelve TypeScript listo para correr con `pnpm test`.
```

1. Copia la respuesta a un archivo `modulo-11-ia/generado-por-ia.spec.ts`.
2. Córrelo: `pnpm test modulo-11-ia/generado-por-ia.spec.ts`.
3. **¿Funcionó al primer intento?** Anota qué tuviste que arreglar.

---

## Reto 11.2 — Comparar dos LLMs

Repite el reto 11.1 con un LLM distinto (si usaste ChatGPT, ahora usa Claude o viceversa).

Compara:
- ¿Cuál escribió código más limpio?
- ¿Cuál usó mejor los locators recomendados?
- ¿Cuál dio explicaciones más útiles?

Anota tus conclusiones en un comentario en tu archivo `generado-por-ia.spec.ts`.

---

## Reto 11.3 — Refactor asistido

Toma uno de tus tests del módulo 4 (sin POM) y pásaselo a un LLM con este prompt:

```
Refactoriza este test creando un Page Object llamado "TodoMvcPage".
Reglas:
- Selectores privados con getByRole/getByPlaceholder/getByTestId.
- Métodos públicos con nombres de acciones humanas.
- Las assertions se quedan en el test, no en el POM.

[pega el código del test aquí]
```

Compáralo con el POM que escribiste tú en el módulo 10. ¿Quién lo hizo mejor?

---

## Reto 11.4 — Casos de prueba a partir de una historia

Dale este prompt a un LLM:

```
Soy QA automation engineer. Necesito casos de prueba E2E para esta feature:

"Como usuario registrado, quiero recuperar mi contraseña ingresando mi
email. Recibiré un correo con un link para crear una nueva contraseña.
El link expira en 30 minutos. Si lo uso después, debe mostrar un error."

Genera 8 casos de prueba en formato tabla:
| # | Tipo | Caso | Resultado esperado |

Incluye al menos 3 casos negativos.
```

Revisa la respuesta y marca:
- ¿Cuántos casos NO habías pensado tú?
- ¿Cuántos casos están mal o no aplican?
- ¿Cuál es el porcentaje de utilidad?

---

## Reto 11.5 — Setup de Playwright MCP (opcional/avanzado)

Si tienes Claude Desktop o Cursor instalado:

1. Sigue las instrucciones de [02-mcp-playwright.md](./02-mcp-playwright.md) para configurar Playwright MCP.
2. Pídele al agente: **"Abre https://demo.playwright.dev/todomvc, agrega 3 todos llamados A, B y C, marca el segundo como completado, y dime qué ves en la lista"**.
3. Observa cómo el agente abre un navegador real y ejecuta los pasos.
4. Compara con tu test del módulo 10: ¿es más rápido o más lento? ¿Más confiable o menos?

---

## Reto 11.6 — Reflexión

Responde por escrito (1 párrafo cada una):

1. ¿En qué partes de tu trabajo como automatizador la IA te ayudaría más?
2. ¿En qué partes la IA NO podría reemplazarte?
3. ¿Qué le dirías a un compañero que tiene miedo de que la IA lo deje sin trabajo?

---

## ✅ Checklist final

- [ ] Usé un LLM para generar al menos un test.
- [ ] Comparé las respuestas de dos LLMs distintos.
- [ ] Refactoré un test viejo con ayuda de un LLM.
- [ ] Usé un LLM para diseñar casos de prueba (no solo código).
- [ ] Entiendo qué es MCP y cómo se relaciona con Playwright.
- [ ] Tengo claro qué hace bien y qué hace mal la IA en QA hoy.

---

## 🎓 Fin del curso

Si llegaste hasta aquí: **felicidades**. Tienes las bases sólidas para empezar a trabajar como QA Automation Engineer con Playwright en cualquier equipo profesional.

**¿Qué sigue?**
1. Aplica lo aprendido en un proyecto real (ojalá el de tu trabajo).
2. Contribuye a un proyecto open source de testing (Playwright mismo acepta PRs).
3. Explora temas avanzados: visual testing, performance testing, accessibility testing.
4. Mantente al día: Playwright lanza features nuevas cada mes.

**Te recomiendo seguir:**
- [playwright.dev/blog](https://playwright.dev/blog) — anuncios oficiales
- [@playwrightweb](https://twitter.com/playwrightweb) en Twitter/X
- El canal de YouTube **Playwright Solutions**
- La comunidad de Discord oficial de Playwright

Buena suerte 🚀
