# Curso Express de TypeScript para QA: De Pruebas Manuales a la Automatización

**Duración Estimada:** 6 Horas
**Público Objetivo:** Ingenieros de Pruebas Manuales sin experiencia previa en programación.
**Objetivo:** Dominar las bases de TypeScript usando el contexto del testing del día a día para comenzar a automatizar pruebas rápidamente.

---

## 1. Hola Mundo: Ejecutando nuestro primer "Test" (30 min)
*Analogía: Escribir tu primer caso de prueba manual y ver que se ejecuta correctamente.*

- **Concepto:** Qué es TypeScript y por qué los automatizadores lo aman (es JavaScript pero con "validaciones estrictas" antes de ejecutar).
- **Implementación:**
  - Crear un archivo `test.ts`.
  - Imprimir un mensaje en consola: `console.log("¡Hola, Automatización!");`
- **Ejecución:** 
  - Compilar con `tsc test.ts` y ejecutar con `node test.js`.
- **Ejercicio:** Hacer un "Hola Mundo" que imprima "Iniciando ejecución de la Suite de Pruebas".

---

### 🚩 Reto QA - Módulo 1: "El primer Check"
1. Instala TypeScript localmente (si no lo tienes).
2. Crea un archivo llamado `smoke-test.ts`.
3. Declara una variable que diga "Ambiente: QA".
4. Imprime en consola: `Iniciando pruebas en [Nombre del ambiente]`.
5. Ejecuta el archivo y asegúrate de ver el mensaje.

---

## 2. Tipos Básicos: Los "Criterios de Aceptación" de las Variables (1.5 horas)
*Analogía: Así como un campo de texto en un formulario web solo debe aceptar letras o números, en TypeScript definimos qué tipo de dato puede contener una "variable" o contenedor de información.*

- **Booleans:** (`true` / `false`) - El resultado de tu prueba (PASSED o FAILED). `let testPassed: boolean = true;`
- **Numbers:** Tiempos de respuesta, códigos de estado HTTP (200, 404). `let statusCode: number = 200;`
- **Strings:** Mensajes de error, URLs de los entornos (QA, UAT). `let baseUrl: string = "https://qa.miapp.com";`
- **Any:** (Evitarlo). Es como decirle al desarrollador "haz lo que quieras, no voy a validar nada".
- **Arrays:** Listas de datos. Como una lista de correos para probar el login. `let usuarios: string[] = ["test1@qa.com", "test2@qa.com"];`
- **Tuples:** Un array estricto con estructura fija. Como un combo (Código HTTP, Mensaje). `let respuestaHttp: [number, string] = [404, "Not Found"];`
- **Enums:** Opciones cerradas. Como los entornos de prueba (QA, STAGING, PROD) o los estados de un bug (NUEVO, EN_PROGRESO, CERRADO).
- **Void:** Cuando una acción no te devuelve nada, como hacer click en un botón.
- **Never:** Algo que nunca debe ocurrir, como una función que lanza un error fatal de red que detiene toda la ejecución de pruebas.
- **Null y Undefined:** Un campo que dejaste vacío en el formulario (Null) o una variable a la que olvidaste asignarle valor (Undefined).

*Práctica: Crear variables que simulen los datos de un Request (petición) de un API.*

---

### 🚩 Reto QA - Módulo 2: "Definiendo el Dataset"
Crea un archivo `datos-prueba.ts` donde declares variables con el tipo explícito para los siguientes datos de un reporte de error:
1. `idBug`: Un número correlativo.
2. `descripcion`: El título del bug (texto).
3. `estaResuelto`: Un booleano.
4. `severidad`: Un Enum con opciones (LOW, MEDIUM, HIGH).
5. `pasosReproduccion`: Un array de strings.
6. `evidencia`: Una variable que acepte Null (para cuando aún no hay captura de pantalla).

---

## 3. Funciones y Objetos: Automatizando las Acciones (1 hora)
*Analogía: Una función es como un "Paso a Paso" (Steps) de tu caso de prueba, lo escribes una vez y lo puedes ejecutar varias veces.*

- **Funciones básicas:** Cómo crear una función de `login()`.
- **Parámetros obligatorios:** Los datos que SIEMPRE necesitas para tu prueba (ej: `usuario` y `password`).
- **Parámetros opcionales:** Un campo en un formulario que es opcional (se marca con `?`). Ej: `login(usuario, password, recordarUsuario?)`.
- **Tipo función:** Cómo indicar que el resultado de tu función será un booleano (si la prueba pasó o falló).

*Práctica: Escribir una función que valide si un Login es exitoso comprobando un usuario y contraseña quemados en el código.*

---

### 🚩 Reto QA - Módulo 3: "El Script de Validación"
Crea una función llamada `validarRespuestaAPI`:
1. Debe recibir un parámetro obligatorio `codigoStatus` (número).
2. Debe recibir un parámetro opcional `mensajeError` (string).
3. La función debe retornar un `boolean`.
4. **Lógica:** Si el `codigoStatus` es 200, imprime "Prueba Exitosa" y retorna `true`. Si no, imprime el `mensajeError` y retorna `false`.

---

## 4. Objetos y Tipos Personalizados: Estructurando el Payload (1 hora)
*Analogía: Un objeto es como un JSON (payload) que envías en una prueba de API o los datos completos de un perfil de usuario.*

- **Objetos básicos:** Agrupar datos de un usuario de prueba (nombre, edad, rol).
- **Problemas con la definición en Línea:** Por qué crear objetos sin un "contrato" (reglas claras) genera bugs en tu código de automatización.
- **Tipos personalizados (`type`):** Crear nuestro propio molde. Ej: `type UsuarioPrueba = { user: string, pass: string }`.
- **Múltiples tipos permitidos (Union Types):** Cuando un botón puede tener el estado `"activo" | "inactivo"`. 

*Práctica: Crear un tipo de dato `BugReport` y generar un objeto con esa estructura.*

---

### 🚩 Reto QA - Módulo 4: "Estructurando el Payload del Carrito"
1. Define un `type` llamado `Producto` que tenga: `id` (número), `nombre` (string) y `precio` (número).
2. Crea una variable `miCarrito` que sea un objeto que use el tipo `Producto`.
3. Crea un Union Type llamado `MetodoPago` que solo permita los valores: `'Tarjeta'`, `'Efectivo'` o `'PayPal'`.
4. Asigna un método de pago a una variable y trata de ponerle algo diferente (como `'Bitcoin'`) para ver cómo TypeScript te avisa del error.

---

## 5. Clases en TypeScript: Diseñando el Page Object Model (POM) (1 hora)
*Analogía: Una clase es la plantilla de una página de tu aplicación (Page Object Model). Por ejemplo, la Clase LoginPage.*

- **Definición de una Clase básica:** `class LoginPage { ... }`
- **Forma corta de asignar propiedades:** Cómo ahorrar código en el constructor.
- **Métodos públicos y privados:** 
  - *Privados:* Localizadores web (ej: el ID de un botón que no debe modificarse desde otro archivo).
  - *Públicos:* Las acciones (ej: `hacerClickEnLogin()`).
- **Herencia (`extends` y `super`):** Todas las páginas comparten una validación de carga (`waitForLoad`). Creamos una clase `BasePage` de la cual `LoginPage` y `HomePage` heredan.
- **Get y Sets:** Validar datos antes de asignarlos, como verificar que el timeout de la prueba no sea negativo.
- **Clases Abstractas:** Plantillas genéricas que no se usan directamente, como un "NavegadorBase" que obliga a definir cómo hacer click en Chrome o Firefox.
- **Constructores Privados:** Patrón Singleton. Como cuando necesitas una única conexión a la Base de Datos para limpiar los datos de prueba.

*Práctica: Programar una clase `LoginPage` con propiedades privadas para los localizadores y métodos públicos para `ingresarCredenciales`.*

---

### 🚩 Reto QA - Módulo 5: "Mi primer Page Object"
1. Crea una clase llamada `BaseTest`. Debe tener una propiedad protegida `urlBase` y un método que diga `navegar(url: string)`.
2. Crea una clase `SearchTest` que herede de `BaseTest`.
3. En `SearchTest`, agrega un método privado `botonBuscarID` (string).
4. Agrega un método público `ejecutarBusqueda(termino: string)` que use el método de la clase padre para navegar a la URL y luego imprima "Buscando [termino] usando el botón [botonBuscarID]".

---

## 6. Interfaces: Los "Contratos" de las Pruebas (1 hora)
*Analogía: Una interfaz es como la "Especificación de Requerimientos" (SRS) o el contrato Swagger de un API. Obliga a que tu código cumpla ciertas reglas exactas.*

- **Interfaz básica:** `interface RespuestaAPI { status: number, body: string }`
- **Estructuras complejas:** APIs que devuelven listas de datos dentro de otros objetos.
- **Métodos de la interfaz:** Obligar a que tu Page Object tenga sí o sí ciertos métodos (ej: `validarTitulo()`).
- **Interfaces en clases (`implements`):** Hacer que nuestra clase `ChromeTest` respete el contrato de la interfaz `Navegador`.
- **Interfaces para las funciones:** Validar que la función de aserciones (`expectToEqual`) reciba siempre la firma correcta.

*Práctica: Crear una Interfaz para mapear la respuesta de la API de un eCommerce donde se validan los precios y productos devueltos en el JSON.*

---

### 🚩 Reto FINAL QA - Módulo 6: "El Contrato de Automatización"
1. Crea una Interfaz llamada `AccionesWeb` que obligue a tener los métodos: `hacerClick(elemento: string): void` y `obtenerTexto(elemento: string): string`.
2. Crea una clase llamada `CypressHelper` que **implemente** esa interfaz.
3. Dentro de la clase, haz que los métodos impriman mensajes como "Simulando click en Cypress sobre: [elemento]".
4. **Extra:** Crea una interfaz `UserResponse` para un API que devuelva un `id` y un `token`. Crea una función que reciba un objeto que cumpla con esa interfaz e imprima "Sesión iniciada con token: [token]".

🎉 **¡Felicidades! Has pasado de manual a tener las bases técnicas de un Automation Engineer.**
