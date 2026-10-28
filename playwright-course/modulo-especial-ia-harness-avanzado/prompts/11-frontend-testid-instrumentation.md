# 11 - Frontend Test ID Instrumentation

```text
ROLE:
You are a senior frontend-aware QA automation engineer. Add stable data-testid attributes to a frontend application to make E2E tests reliable without changing behavior.

CONTEXT:
This prompt runs in the FRONTEND project, not in the external test harness.
Use it only when I have permission to modify the SUT frontend source code.

VARIABLES:
FRONTEND_DIR=<replace with frontend repo/path, or "." if already there>
TESTID_ATTR=data-testid

TASK:
Analyze the frontend project and implement stable test ids for user-facing UI elements.

DISCOVERY:
1. Identify the frontend framework and source folders:
   - React / Next.js
   - Vue / Nuxt
   - Angular
   - Svelte / SvelteKit
   - plain HTML/templates
   - other
2. Identify interactive elements:
   - buttons
   - links
   - inputs
   - textareas
   - selects/dropdowns/comboboxes
   - checkboxes/radios/switches
   - tabs
   - menus/menuitems
   - modals/dialog controls
   - cards/list items that are clickable/selectable
   - icons that trigger actions
3. Identify meaningful static elements:
   - non-decorative images/logos
   - headings/titles
   - labels
   - alerts/toasts/errors
   - badges/status chips
   - tables/lists and rows
   - totals/prices/counters/summaries
   - empty/loading states
4. Do not add test ids to purely decorative wrappers, layout-only divs, or hidden implementation details unless they are the only stable anchor for a user-facing element.

NAMING CONVENTION:
Use lowercase kebab-case and stable domain names:

<area>-<element>-<purpose>

Examples of format only:
- login-username-input
- login-submit-button
- menu-settings-link
- product-card
- product-price-label
- checkout-total-value
- order-status-badge
- modal-close-button

RULES:
- Do not change visual behavior, business logic, routing, API calls, or accessibility labels.
- Do not remove existing aria labels, roles, labels, ids, or class names.
- Do not rename existing test ids unless they are duplicated or clearly unstable.
- Reuse existing stable test ids when they already exist.
- Make repeated elements deterministic:
  - prefer stable entity ids/slugs when available
  - otherwise use a stable semantic prefix on the container and child test ids inside it
  - avoid array index test ids unless there is no stable domain key
- For component libraries, add test ids at the component usage boundary when possible.
- For shared components, expose a testId prop only when needed and keep it optional.
- For dynamic values, sanitize to lowercase kebab-case.
- Keep changes minimal and localized.
- Do not add E2E test code in this prompt.

IMPLEMENTATION GUIDANCE:
- Prefer framework-native syntax:
  - React/JSX: data-testid="..."
  - Vue: data-testid="..." or :data-testid="..."
  - Angular: data-testid="..." or [attr.data-testid]="..."
  - Svelte: data-testid="..." or data-testid={...}
- Use AST/framework-aware edits where practical. Avoid broad regex rewrites.
- If adding a helper for dynamic test ids, place it in an existing shared utility location.

DELIVERABLES:
1. Implement test ids in source files.
2. Create or update TESTID_INVENTORY.md with:
   - page/component
   - test id
   - element type
   - purpose
   - file path
3. Report any elements skipped and why.

VERIFY:
Run the relevant checks that exist in the project:
- package install only if dependencies are missing
- lint
- typecheck
- unit tests if available
- build

If the project has no scripts for one check, say so.

DELIVERY:
Return:
- framework detected
- files changed
- number of test ids added/reused
- TESTID_INVENTORY.md path
- checks run and results
- risks or manual review notes
```

