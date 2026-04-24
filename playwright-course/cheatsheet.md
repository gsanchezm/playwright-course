# Playwright Cheatsheet para QA

Referencia rápida del framework construido en este curso.

---

## Locators — jerarquía

```typescript
page.getByRole('button', { name: 'Pagar' })          // 1️⃣ preferido
page.getByLabel('Email')                              // 2️⃣ formularios
page.getByText('Welcome')                             // 2️⃣ contenido visible
page.getByTestId('login-button-desktop')              // 3️⃣ sticker del dev
page.locator('[data-testid^="pizza-card-"]')          // 4️⃣ CSS (testid dinámico)
page.locator('//button[@aria-label="Submit"]')        // 5️⃣ XPath (último recurso)
```

## Filtros y combinadores

```typescript
locator.filter({ hasText: 'Spicy' })
locator.first()
locator.last()
locator.nth(2)
locator.all()                                         // array para for...of
```

## Asserts comunes

```typescript
await expect(locator).toBeVisible()
await expect(locator).toHaveText('OK')
await expect(locator).toContainText('OK')
await expect(locator).toHaveValue('abc')
await expect(locator).toHaveCount(5)
await expect(page).toHaveURL(/\/catalog/)
await expect(page).toHaveTitle(/OmniPizza/)
```

## Acciones

```typescript
await locator.click()
await locator.fill('texto')
await locator.press('Enter')
await locator.check() / .uncheck()
await locator.selectOption('value')
await locator.hover()
await page.goto('/')
```

## Auto-waiting

Playwright espera automáticamente. **No uses `sleep()`.** Si necesitas esperar algo específico:

```typescript
await page.waitForURL(/\/catalog/)
await page.waitForLoadState('networkidle')
await locator.waitFor({ state: 'visible' })
await expect(locator).toBeVisible({ timeout: 10_000 })
```

---

## Fixtures

### Uso del fixture custom del curso

```typescript
import { test, expect } from '../fixtures/omnipizza';

test('ejemplo', async ({ page, loginPage, catalogPage, standardUser }) => {
  await loginPage.loginInMarket(standardUser, 'MX');
  await catalogPage.expectLoaded();
});
```

### Crear uno propio

```typescript
import { test as base } from '@playwright/test';

type MyFixtures = { authedPage: Page };

export const test = base.extend<MyFixtures>({
  authedPage: async ({ page }, use) => {
    await page.goto('/login');
    // ... login ...
    await use(page);
  },
});
```

---

## Projects y setup

```typescript
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'ui-chromium',
    use: { storageState: '.auth/user.json' },
    dependencies: ['setup'],
  },
  { name: 'api', testDir: 'tests/api' },
]
```

### setup spec (login vía API)

```typescript
import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ request, browser }) => {
  const res = await request.post('/api/auth/login', { data: {...} });
  const { access_token } = await res.json();

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.evaluate((t) => localStorage.setItem('access_token', t), access_token);
  await context.storageState({ path: '.auth/user.json' });
  await context.close();
});
```

---

## Data-driven

```typescript
for (const market of markets) {
  test(`flujo en ${market.code}`, async ({ page }) => { /* ... */ });
}
```

---

## Mocking con `page.route()`

```typescript
// Mock response 500
await page.route('**/api/pizzas*', (route) =>
  route.fulfill({ status: 500, body: JSON.stringify({ error: 'oops' }) })
);

// Simular latencia
await page.route('**/api/*', async (route) => {
  await new Promise((r) => setTimeout(r, 2_000));
  await route.continue();
});

// Modificar response del backend real
await page.route('**/api/pizzas', async (route) => {
  const response = await route.fetch();
  const body = await response.json();
  body.pizzas = body.pizzas.slice(0, 1);
  await route.fulfill({ response, body: JSON.stringify(body) });
});
```

---

## API testing con `APIRequestContext`

```typescript
const api = await request.newContext({
  baseURL: 'https://api.example.com',
  extraHTTPHeaders: { Authorization: `Bearer ${token}` },
});

const res = await api.get('/pizzas');
expect(res.ok()).toBeTruthy();
const body = await res.json();

await api.dispose();  // siempre al final
```

---

## Data isolation en paralelismo

```typescript
import { uniqueEmail, uniqueOrderId } from '../helpers/unique-data';

test('crea orden sin colisiones', async ({}, testInfo) => {
  const email = uniqueEmail(testInfo);           // customer+w0-1714000...@
  const orderId = uniqueOrderId(testInfo);       // ORD-w0-1714000-4821
  // ...
});
```

---

## Tags

```typescript
test('login @smoke', async ({ page }) => {...});
test('checkout full @regression', async ({ page }) => {...});

// Correr sólo @smoke
// pnpm exec playwright test --grep @smoke
```

---

## Comandos CLI

```bash
# Local
pnpm test                              # toda la suite
pnpm test:ui                           # UI mode
pnpm test:headed                       # browser visible
pnpm test:debug                        # Inspector
pnpm exec playwright test <path>       # archivo/carpeta
pnpm exec playwright test --project=ui-chromium
pnpm exec playwright test --grep @smoke
pnpm exec playwright test --workers=1  # 1 worker (debug)
pnpm exec playwright test --shard=1/4
pnpm exec playwright test --trace=on
pnpm exec playwright show-trace trace.zip
pnpm exec playwright show-report
pnpm exec playwright codegen <url>
pnpm typecheck                         # tsc --noEmit

# Git
git checkout -b feature/...
git add <path>
git commit -m "feat(mXX): ..."
git push -u origin <branch>

# GitHub CLI
gh secret set BASE_URL
gh secret list
gh pr create
gh pr checks
gh run list --limit 5
gh run view <run-id> --log
gh run download <run-id>
```

---

## Trace Viewer

La **caja negra del avión**. Cuando un test falla, la traza reconstruye cada paso con:

- Timeline de acciones
- DOM snapshot por paso
- Network waterfall
- Console logs
- Screenshots y video

```bash
# Forzar trace en local
pnpm exec playwright test --trace=on

# Abrir
pnpm exec playwright show-trace test-results/<test>/trace.zip

# Descargar de CI
gh run download <run-id>
pnpm exec playwright show-trace ./playwright-traces-*/trace.zip
```
