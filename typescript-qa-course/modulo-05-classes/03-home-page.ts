// ============================================================
// Mini-clase 5.3: HomePage (otra hija de BasePage)
// ============================================================
// Analogía: Otra página del sitio que reutiliza navigate() y
// waitForLoad() sin tener que reimplementarlos.
// ============================================================

import { BasePage } from "./01-base-page";

export class HomePage extends BasePage {
  private searchBar: string = "#search-input";

  search(term: string): void {
    this.navigate("/home");         // heredado de BasePage
    console.log(`Typing "${term}" in ${this.searchBar}`);
    console.log(`Search executed for: ${term}`);
  }
}

console.log("\n===== 5.3 HomePage =====");
const homePageDemo = new HomePage("https://qa.myapp.com");
homePageDemo.search("wireless keyboard");
