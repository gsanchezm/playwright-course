# US-03 — Navegación del catálogo con la cuenta `problem_user`

**Como** analista de QA,
**quiero** iniciar sesión con la cuenta `problem_user` (contraseña `pizza123`) en el mercado MX y revisar el catálogo,
**para** confirmar que un cliente con esa cuenta puede ver la información que necesita para decidir su pedido.

## Criterios de aceptación
1. El inicio de sesión con `problem_user` es exitoso y lleva a `/catalog`.
2. El catálogo muestra las 12 pizzas con su nombre y descripción.
3. Cada pizza muestra su precio, igual que para `standard_user`.
4. El carrito arranca vacío ("Tu carrito está vacío").

## Notas
- Prioridad: media. Estimación: 2 puntos.
- Ambiente: https://omnipizza-frontend.onrender.com (el primer acceso puede tardar por el arranque en frío).
