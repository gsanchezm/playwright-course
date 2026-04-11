// ============================================================
// Mini-clase 6.2: Interfaces anidadas (catálogo + paginación)
// ============================================================
// Analogía: un test data-driven sobre GET /products. La interfaz
// tipa tanto la respuesta real de la API como los datos esperados
// del caso de prueba, para que el compilador nos avise si el
// contrato cambia.
// ============================================================

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface ProductListResponse {
  status: number;
  data: Product[];
  pagination: {
    page: number;
    totalPages: number;
  };
}

// Simula GET /products?page=1 (reemplaza por tu cliente HTTP real).
function fetchProducts(): ProductListResponse {
  return {
    status: 200,
    data: [
      { id: 1, name: "Wireless Mouse", price: 29.99 },
      { id: 2, name: "USB Keyboard", price: 49.99 },
    ],
    pagination: { page: 1, totalPages: 5 },
  };
}

// Datos esperados del caso de prueba — también tipados con Product.
const expectedProducts: Product[] = [
  { id: 1, name: "Wireless Mouse", price: 29.99 },
  { id: 2, name: "USB Keyboard", price: 49.99 },
];

console.log("\n===== 6.2 interfaces anidadas =====");

const actual = fetchProducts();

// Assert #1: status code
console.log(
  actual.status === 200
    ? "[PASSED] GET /products responde 200"
    : `[FAILED] GET /products responde ${actual.status}`
);

// Assert #2: cada producto esperado aparece en la respuesta real.
expectedProducts.forEach((expected) => {
  const match = actual.data.find((p) => p.id === expected.id);
  const ok =
    match !== undefined &&
    match.name === expected.name &&
    match.price === expected.price;

  console.log(
    ok
      ? `[PASSED] producto #${expected.id} (${expected.name})`
      : `[FAILED] producto #${expected.id} no coincide`
  );
});

// Assert #3: paginación
console.log(
  `[INFO] Página ${actual.pagination.page} de ${actual.pagination.totalPages}`
);
