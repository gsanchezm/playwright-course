// ============================================================
// Mini-clase 6.2: Interfaces anidadas (listas y paginación)
// ============================================================
// Analogía: La respuesta de un endpoint /products que devuelve
// varios productos Y metadatos de paginación.
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

export const catalogResponse: ProductListResponse = {
  status: 200,
  data: [
    { id: 1, name: "Wireless Mouse", price: 29.99 },
    { id: 2, name: "USB Keyboard", price: 49.99 },
  ],
  pagination: { page: 1, totalPages: 5 },
};

console.log("\n===== 6.2 interfaces anidadas =====");
console.log(`Products found: ${catalogResponse.data.length}`);
console.log(
  `Page ${catalogResponse.pagination.page} of ${catalogResponse.pagination.totalPages}`
);
