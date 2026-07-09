// ============================================================
// features/auth/auth.factory.ts — construcción de usuarios (FACTORY)
// ============================================================
// Analogía QA: el "catálogo de personas de prueba". El test pide
// "dame el usuario estándar" o "dame uno cualquiera" sin saber de
// dónde salen los datos (JSON). La fábrica encapsula esa fuente.
//
// FACTORY: centraliza la creación de objetos User a partir de
// shared/data/users.json. Si mañana cambia la fuente (otro JSON,
// una API), sólo se toca aquí (SRP + DRY).
// ============================================================

import type { User } from "../../shared/types";
import usersJson from "../../shared/data/users.json";

// resolveJsonModule tipa el import como any[]: lo afinamos a User[].
const users = usersJson as User[];

export class UserFactory {
  // Contador de módulo para random() determinista (Math.random no
  // está disponible en este harness): rota por la lista en orden.
  private static cursor = 0;

  /** El usuario happy-path estándar (standard_user). */
  static standard(): User {
    return UserFactory.byUsername("standard_user");
  }

  /** Busca un usuario por username; lanza si no existe en el JSON. */
  static byUsername(name: string): User {
    const user = users.find((u) => u.username === name);
    if (!user) {
      throw new Error(`Usuario "${name}" no encontrado en shared/data/users.json`);
    }
    return user;
  }

  /**
   * Devuelve un usuario "cualquiera" de forma DETERMINISTA: rota por
   * la lista con un cursor de módulo. Acepta un índice opcional para
   * elegir uno explícito (módulo del tamaño de la lista).
   */
  static random(index?: number): User {
    if (users.length === 0) {
      throw new Error("No hay usuarios en shared/data/users.json");
    }
    const i = index ?? UserFactory.cursor++;
    return users[((i % users.length) + users.length) % users.length];
  }
}
