# Curso Express de TypeScript para QA

**De Pruebas Manuales a la Automatización**

> Este curso es la base para el siguiente nivel: **Automatización con Playwright**.

---

## Módulo 0: Preparación del Entorno (Pre-requisitos)

Antes de comenzar el curso, asegúrate de tener instaladas las siguientes herramientas.

### 1. Instalar Node.js

Node.js es el motor que ejecuta JavaScript/TypeScript fuera del navegador.

- Descarga la versión **LTS** desde: https://nodejs.org/
- Verifica la instalación abriendo una terminal:

```bash
node --version    # Debe mostrar v18.x.x o superior
```

### 2. Instalar pnpm

pnpm es un gestor de paquetes rápido y eficiente (alternativa moderna a npm).

```bash
npm install -g pnpm
pnpm --version    # Debe mostrar 9.x.x o superior
```

### 3. Instalar Visual Studio Code

Es el editor recomendado para trabajar con TypeScript.

- Descarga desde: https://code.visualstudio.com/

#### Extensiones recomendadas

Abre VS Code y ve a la pestaña de extensiones (`Ctrl+Shift+X` / `Cmd+Shift+X`):

| Extensión | Para qué sirve |
|-----------|----------------|
| **Error Lens** | Muestra los errores de TypeScript directamente en la línea de código |
| **Pretty TypeScript Errors** | Hace más legibles los mensajes de error de TypeScript |
| **Playwright Test for VSCode** | Soporte para ejecutar y depurar pruebas de Playwright (lo usarás en el siguiente curso) |
| **Material Icon Theme** | Iconos visuales para cada tipo de archivo |

### 4. Instalar las dependencias del curso

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
pnpm install
```

Esto instalará TypeScript y tsx (un ejecutor rápido de TypeScript).

### 5. Verificar que todo funciona

```bash
pnpm tsx modulo-01-hello-world/ejemplo.ts
```

Deberías ver: `Hello, Automation!`

---

## Cómo ejecutar los ejemplos

Cada módulo tiene un archivo `ejemplo.ts` (código del instructor) y un `reto.ts` (plantilla para el alumno).

```bash
# Ejecutar un ejemplo directamente (sin compilar)
pnpm tsx modulo-01-hello-world/ejemplo.ts

# O usar los scripts del proyecto
pnpm m1    # Módulo 1
pnpm m2    # Módulo 2
pnpm m3    # Módulo 3
pnpm m4    # Módulo 4
pnpm m5    # Módulo 5
pnpm m6    # Módulo 6

# Ejecutar tu reto
pnpm tsx modulo-01-hello-world/reto.ts

# Compilar todos los archivos a JavaScript (opcional)
pnpm build
```

---

## Estructura del Curso

| Módulo | Tema | Duración |
|--------|------|----------|
| 0 | Preparación del Entorno | Pre-curso |
| 1 | Hola Mundo: Tu primer "Test" | 30 min |
| 2 | Tipos Básicos: Criterios de Aceptación de las Variables | 1.5 horas |
| 3 | Funciones: Automatizando las Acciones | 1 hora |
| 4 | Objetos y Tipos Personalizados: Estructurando el Payload | 1 hora |
| 5 | Clases: Diseñando el Page Object Model | 1 hora |
| 6 | Interfaces: Los Contratos de las Pruebas | 1 hora |

> **Siguiente nivel:** Una vez completado este curso, tendrás las bases para el curso de **Automatización con Playwright**, donde aplicarás estos conceptos para escribir pruebas E2E reales.

Consulta el archivo `cheatsheet.md` como referencia rápida durante el curso.
