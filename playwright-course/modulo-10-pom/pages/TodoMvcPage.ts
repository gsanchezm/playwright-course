// ============================================================
// TodoMvcPage — Page Object de TodoMVC
// ============================================================
// Analogía: Es el "manual de instrucciones" para la página de TodoMVC.
// Encapsula TODOS los selectores y acciones posibles.
//
// Reglas que sigue este archivo:
// ✅ Los selectores son PRIVADOS (los tests no los ven).
// ✅ Los métodos son públicos y representan ACCIONES del usuario.
// ✅ No tiene assertions (esas van en los tests).
// ✅ Hereda de BasePage.
// ============================================================

import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TodoMvcPage extends BasePage {
  // --- Selectores privados ---
  // Solo esta clase conoce los selectores. Si mañana cambian,
  // solo se modifica aquí.
  private readonly newTodoInput: Locator;
  private readonly todoItems: Locator;
  private readonly itemsLeftLabel: Locator;
  private readonly clearCompletedButton: Locator;

  constructor(page: Page) {
    super(page, 'https://demo.playwright.dev/todomvc');

    // Inicializamos los locators en el constructor.
    // Usamos los recomendados: getByPlaceholder, getByTestId, getByRole.
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.getByTestId('todo-title');
    this.itemsLeftLabel = page.getByTestId('todo-count');
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
  }

  // ============================================================
  // ACCIONES (métodos públicos)
  // ============================================================

  /**
   * Agregar un nuevo todo a la lista.
   */
  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  /**
   * Agregar varios todos de una sola vez.
   */
  async addTodos(texts: string[]): Promise<void> {
    for (const text of texts) {
      await this.addTodo(text);
    }
  }

  /**
   * Marcar un todo como completado usando su texto.
   */
  async toggleTodo(text: string): Promise<void> {
    await this.page
      .getByRole('listitem')
      .filter({ hasText: text })
      .getByRole('checkbox')
      .check();
  }

  /**
   * Borrar un todo usando su texto.
   */
  async deleteTodo(text: string): Promise<void> {
    const todoItem = this.page.getByRole('listitem').filter({ hasText: text });
    await todoItem.hover();
    await todoItem.getByRole('button', { name: 'Delete' }).click();
  }

  /**
   * Click en "Clear completed".
   */
  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  // ============================================================
  // GETTERS (devuelven datos para que el test valide)
  // ============================================================

  /**
   * Obtener la cantidad de todos visibles.
   */
  async getTodoCount(): Promise<number> {
    return await this.todoItems.count();
  }

  /**
   * Obtener el texto de todos los todos como array.
   */
  async getAllTodoTexts(): Promise<string[]> {
    return await this.todoItems.allTextContents();
  }

  /**
   * Exponer el locator de los items para assertions avanzadas.
   * (Uso controlado; prefiere los getters simples cuando sea posible.)
   */
  get items(): Locator {
    return this.todoItems;
  }
}
