# Curso Express de TypeScript para QA: De Pruebas Manuales a la Automatización

**Duración Estimada:** 6 Horas (+ preparación previa del entorno)
**Público Objetivo:** Ingenieros de Pruebas Manuales sin experiencia previa en programación.
**Objetivo:** Dominar las bases de TypeScript usando el contexto del testing del día a día para comenzar a automatizar pruebas rápidamente.

---

## 0. Preparación del Entorno (Pre-curso)
*Este módulo se realiza ANTES del día del curso.*

- **Instalar Node.js (v18+):** Descargar desde https://nodejs.org/ (versión LTS).
- **Instalar Visual Studio Code:** Descargar desde https://code.visualstudio.com/
- **Extensiones recomendadas de VS Code:** Error Lens, Pretty TypeScript Errors, Material Icon Theme.
- **Instalar pnpm:** Ejecutar `npm install -g pnpm` (gestor de paquetes rápido y moderno).
- **Instalar dependencias del proyecto:** Ejecutar `pnpm install` en la carpeta del curso.
- **Verificar:** Ejecutar `pnpm tsx modulo-01-hello-world/ejemplo.ts` y confirmar que imprime un mensaje.

> 📋 Consulta el archivo `README.md` para instrucciones detalladas paso a paso.
> 📋 Consulta el archivo `cheatsheet.md` como referencia rápida de sintaxis durante el curso.

---

## 1. Hola Mundo: Ejecutando nuestro primer "Test" (30 min)
*Analogía: Escribir tu primer caso de prueba manual y ver que se ejecuta correctamente.*

- **Concepto:** Qué es TypeScript y por qué los automatizadores lo aman (es JavaScript pero con "validaciones estrictas" antes de ejecutar).
- **Implementación:**
  - Crear un archivo `test.ts`.
  - Imprimir un mensaje en consola: `console.log("Hello, Automation!");`
- **Ejecución:**
  - Ejecutar directamente con `pnpm tsx test.ts`.
  - O compilar con `tsc test.ts` y ejecutar con `node test.js`.
- **Ejercicio:** Hacer un "Hola Mundo" que imprima "Starting Test Suite Execution".

---

### 🚩 Reto QA - Módulo 1: "The First Check"
1. Crea un archivo llamado `smoke-test.ts`.
2. Declara una variable que diga "Environment: QA".
3. Imprime en consola: `Starting tests in [environment name]`.
4. Ejecuta el archivo y asegúrate de ver el mensaje.

> 📂 Archivo: `modulo-01-hello-world/reto.ts`

---

## 2. Tipos Básicos: Los "Criterios de Aceptación" de las Variables (1.5 horas)
*Analogía: Así como un campo de texto en un formulario web solo debe aceptar letras o números, en TypeScript definimos qué tipo de dato puede contener una "variable" o contenedor de información.*

- **`boolean`:** (`true` / `false`) - El resultado de tu prueba (PASSED o FAILED). `let testPassed: boolean = true;`
- **`number`:** Tiempos de respuesta, códigos de estado HTTP (200, 404). `let statusCode: number = 200;`
- **`string`:** Mensajes de error, URLs de los entornos (QA, UAT). `let baseUrl: string = "https://qa.myapp.com";`
- **`any`:** (Evitarlo). Es como decirle al desarrollador "haz lo que quieras, no voy a validar nada".
- **Arrays:** Listas de datos. Como una lista de correos para probar el login. `let users: string[] = ["test1@qa.com", "test2@qa.com"];`
- **Tuples:** Un array estricto con estructura fija. Como un combo (Código HTTP, Mensaje). `let httpResponse: [number, string] = [404, "Not Found"];`
- **Enums:** Opciones cerradas. Como los entornos de prueba (QA, STAGING, PROD) o los estados de un bug (NEW, IN_PROGRESS, CLOSED).
- **`void`:** Cuando una acción no te devuelve nada, como hacer click en un botón.
- **`null` y `undefined`:** Un campo que dejaste vacío en el formulario (`null`) o una variable a la que olvidaste asignarle valor (`undefined`).

> 💡 **Nota sobre `never`:** Existe un tipo llamado `never` que representa algo que nunca debe ocurrir (como una función que siempre lanza un error fatal). Es un concepto avanzado que encontrarás cuando trabajes con frameworks de automatización. Por ahora, basta con saber que existe.

*Práctica: Crear variables que simulen los datos de un Request (petición) de un API.*

---

### 🚩 Reto QA - Módulo 2: "Defining the Dataset"
Crea un archivo donde declares variables con el tipo explícito para los siguientes datos de un reporte de error:
1. `bugId`: Un número correlativo.
2. `description`: El título del bug (texto).
3. `isResolved`: Un booleano.
4. `severity`: Un Enum con opciones (LOW, MEDIUM, HIGH).
5. `reproductionSteps`: Un array de strings.
6. `evidence`: Una variable que acepte `null` (para cuando aún no hay captura de pantalla).

> 📂 Archivo: `modulo-02-types/reto.ts`

---

## 3. Funciones y Objetos: Automatizando las Acciones (1 hora)
*Analogía: Una función es como un "Paso a Paso" (Steps) de tu caso de prueba, lo escribes una vez y lo puedes ejecutar varias veces.*

- **Funciones básicas:** Cómo crear una función de `login()`.
- **Parámetros obligatorios:** Los datos que SIEMPRE necesitas para tu prueba (ej: `username` y `password`).
- **Parámetros opcionales:** Un campo en un formulario que es opcional (se marca con `?`). Ej: `login(username, password, rememberMe?)`.
- **Tipo función:** Cómo indicar que el resultado de tu función será un booleano (si la prueba pasó o falló).

*Práctica: Escribir una función que valide si un Login es exitoso comprobando un usuario y contraseña escritos directamente en el código (hardcoded).*

> ⚠️ **Nota de seguridad:** En la práctica real, las credenciales NUNCA deben estar escritas directamente en el código. Se usan variables de entorno o archivos de configuración (fixtures). En este curso lo hacemos así solo con fines didácticos.

---

### 🚩 Reto QA - Módulo 3: "The Validation Script"
Crea una función llamada `validateApiResponse`:
1. Debe recibir un parámetro obligatorio `statusCode` (número).
2. Debe recibir un parámetro opcional `errorMessage` (string).
3. La función debe retornar un `boolean`.
4. **Lógica:** Si el `statusCode` es 200, imprime "Test Passed" y retorna `true`. Si no, imprime el `errorMessage` y retorna `false`.

> 📂 Archivo: `modulo-03-functions/reto.ts`

---

## 4. Objetos y Tipos Personalizados: Estructurando el Payload (1 hora)
*Analogía: Un objeto es como un JSON (payload) que envías en una prueba de API o los datos completos de un perfil de usuario.*

- **Objetos básicos:** Agrupar datos de un usuario de prueba (nombre, edad, rol).
- **Problemas con la definición en Línea:** Por qué crear objetos sin un "contrato" (reglas claras) genera bugs en tu código de automatización.
- **Tipos personalizados (`type`):** Crear nuestro propio molde. Ej: `type TestUser = { username: string, password: string }`.
- **Múltiples tipos permitidos (Union Types):** Cuando un botón puede tener el estado `"enabled" | "disabled"`.

*Práctica: Crear un tipo de dato `BugReport` y generar un objeto con esa estructura.*

---

### 🚩 Reto QA - Módulo 4: "Structuring the Cart Payload"
1. Define un `type` llamado `Product` que tenga: `id` (número), `name` (string) y `price` (número).
2. Crea una variable `myCart` que sea un **array de productos** (`Product[]`).
3. Crea un Union Type llamado `PaymentMethod` que solo permita los valores: `'CreditCard'`, `'Cash'` o `'PayPal'`.
4. Asigna un método de pago a una variable y trata de ponerle algo diferente (como `'Bitcoin'`) para ver cómo TypeScript te avisa del error.

> 📂 Archivo: `modulo-04-objects-types/reto.ts`

---

## 5. Clases en TypeScript: Diseñando el Page Object Model (POM) (1 hora)
*Analogía: Una clase es la plantilla de una página de tu aplicación (Page Object Model). Por ejemplo, la Clase LoginPage.*

- **Definición de una Clase básica:** `class LoginPage { ... }`
- **Forma corta de asignar propiedades:** Cómo ahorrar código en el constructor.
- **Métodos públicos y privados:**
  - *Privados:* Localizadores web (ej: el ID de un botón que no debe modificarse desde otro archivo).
  - *Públicos:* Las acciones (ej: `clickLogin()`).
- **Herencia (`extends` y `super`):** Todas las páginas comparten una validación de carga (`waitForLoad`). Creamos una clase `BasePage` de la cual `LoginPage` y `HomePage` heredan.
- **Get y Sets:** Validar datos antes de asignarlos, como verificar que el timeout de la prueba no sea negativo.

> 📚 **Material complementario (avanzado):** Las clases abstractas y el patrón Singleton (constructores privados) son conceptos avanzados que se cubren en cursos posteriores. Los ejemplos están disponibles como comentarios al final del archivo `modulo-05-classes/ejemplo.ts`.

*Práctica: Programar una clase `LoginPage` con propiedades privadas para los localizadores y métodos públicos para `enterCredentials`.*

---

### 🚩 Reto QA - Módulo 5: "My First Page Object"
1. Crea una clase llamada `BaseTest`. Debe tener una propiedad protegida `baseUrl` y un método que diga `navigate(url: string)`.
2. Crea una clase `SearchTest` que herede de `BaseTest`.
3. En `SearchTest`, agrega una **propiedad privada** `searchButtonId` (string) con un valor de localizador.
4. Agrega un método público `executeSearch(term: string)` que use el método de la clase padre para navegar a la URL y luego imprima "Searching for [term] using button [searchButtonId]".

> 📂 Archivo: `modulo-05-classes/reto.ts`

---

## 6. Interfaces: Los "Contratos" de las Pruebas (1 hora)
*Analogía: Una interfaz es como la "Especificación de Requerimientos" (SRS) o el contrato Swagger de un API. Obliga a que tu código cumpla ciertas reglas exactas.*

- **Interfaz básica:** `interface ApiResponse { status: number, body: string }`
- **Estructuras complejas:** APIs que devuelven listas de datos dentro de otros objetos.
- **Métodos de la interfaz:** Obligar a que tu Page Object tenga sí o sí ciertos métodos (ej: `validateTitle()`).
- **Interfaces en clases (`implements`):** Hacer que nuestra clase `PlaywrightHelper` respete el contrato de la interfaz `WebActions`.
- **Interfaces para las funciones:** Validar que la función de aserciones (`expectToEqual`) reciba siempre la firma correcta.

> 📝 **¿Cuándo usar `type` vs `interface`?**
> - Usa `interface` para definir la forma de objetos y contratos de clases. Soporta herencia con `extends` y se puede implementar en clases.
> - Usa `type` para Union Types (`"active" | "inactive"`), intersecciones (`&`), y tipos compuestos.
> - **Regla práctica:** Si defines la forma de un objeto o clase → `interface`. Para todo lo demás → `type`.

*Práctica: Crear una Interfaz para mapear la respuesta de la API de un eCommerce donde se validan los precios y productos devueltos en el JSON.*

---

### 🚩 Reto FINAL QA - Módulo 6: "The Automation Contract"
1. Crea una Interfaz llamada `WebActions` que obligue a tener los métodos: `click(element: string): void` y `getText(element: string): string`.
2. Crea una clase llamada `PlaywrightHelper` que **implemente** esa interfaz.
3. Dentro de la clase, haz que los métodos impriman mensajes como "Simulating click in Playwright on: [element]".
4. **Extra:** Crea una interfaz `UserResponse` para un API que devuelva un `id` y un `token`. Crea una función que reciba un objeto que cumpla con esa interfaz e imprima "Session started with token: [token]".

> 📂 Archivo: `modulo-06-interfaces/reto.ts`

---

**Felicidades! Has pasado de manual a tener las bases técnicas de un Automation Engineer.**

> **Siguiente paso:** Ahora estás listo para el curso de **Automatización con Playwright**, donde aplicarás todo lo aprendido aquí para escribir pruebas E2E reales.
