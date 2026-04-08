# TypeScript Cheat Sheet para QA

## Tipos Básicos

```typescript
let testPassed: boolean = true;
let statusCode: number = 200;
let baseUrl: string = "https://qa.myapp.com";
let users: string[] = ["user1", "user2"];
let httpResponse: [number, string] = [404, "Not Found"];  // Tuple
let empty: null = null;
let notSet: undefined = undefined;
```

## Enums

```typescript
enum Environment { QA, STAGING, PROD }
let current: Environment = Environment.QA;
```

## Funciones

```typescript
// Parámetros obligatorios y opcionales
function login(user: string, pass: string, remember?: boolean): boolean {
  return user === "admin" && pass === "1234";
}

// Arrow function
const isSuccess = (code: number): boolean => code >= 200 && code < 300;
```

## Type (Tipo personalizado)

```typescript
type TestUser = {
  username: string;
  password: string;
  role: "admin" | "viewer";   // Union Type
};
```

## Interface

```typescript
interface ApiResponse {
  status: number;
  body: string;
  headers?: Record<string, string>;   // Propiedad opcional
}
```

## type vs interface

| Característica | `type` | `interface` |
|---|---|---|
| Extender | `&` (intersección) | `extends` |
| Implementar en clase | Sí | Sí |
| Union types | Sí | No |
| Declaration merging | No | Sí |
| **Usar cuando...** | Tipos compuestos, unions | Contratos de objetos/clases |

## Clases

```typescript
class BasePage {
  constructor(protected url: string) {}

  navigate(): void {
    console.log(`Navigating to ${this.url}`);
  }
}

class LoginPage extends BasePage {
  private userInput: string = "#username";

  enterCredentials(user: string, pass: string): void {
    console.log(`Typing ${user} in ${this.userInput}`);
  }
}
```

## Modificadores de acceso

| Modificador | Acceso |
|-------------|--------|
| `public` | Desde cualquier lugar (default) |
| `private` | Solo dentro de la clase |
| `protected` | Dentro de la clase y sus hijas |

## Interfaces en clases

```typescript
interface WebActions {
  click(element: string): void;
  getText(element: string): string;
}

class MyHelper implements WebActions {
  click(element: string): void { /* ... */ }
  getText(element: string): string { return ""; }
}
```

## Comandos útiles

```bash
pnpm tsx archivo.ts        # Ejecutar directamente
tsc archivo.ts            # Compilar a JavaScript
tsc --noEmit              # Verificar sin generar archivos
```
