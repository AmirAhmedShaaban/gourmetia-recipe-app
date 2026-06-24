# QWEN.md

## Project Overview

Gourmetia is a state-driven Single Page Application (SPA) recipe platform built entirely with **Vanilla JavaScript (ES6+ modules)** — no frontend frameworks. It implements a custom **MVC architecture** with centralized state management, hash-based routing, and manual DOM reconciliation to demonstrate how reactive UIs work from first principles.

**Tech stack:** Vanilla JS (ES6+), Parcel bundler, Sass (SCSS), Bootstrap 5 (grid/layout only), Font Awesome (local), Supabase (backend persistence), TheMealDB API (recipe data), fraction.js (ingredient scaling).

## Build & Development Commands

| Command | Description |
|---|---|
| `npm start` | Start Parcel dev server with live reload (opens browser) |
| `npm run build` | Production build to `./dist` |
| `npm install` | Install dependencies |
| `rm -rf .parcel-cache` | Clear Parcel build cache |

Entry point: `index.html` → Parcel bundles JS/CSS from `src/`. No test framework is configured.

## Architecture

### MVC Pattern

```
index.html
  └── src/js/controller.js   ← entry point, imports all views + model
        ├── model.js          ← state, API calls, data normalization
        └── views/
              ├── view.js     ← base class (render, update, spinner, error)
              ├── recipeView.js, homeView.js, searchView.js, etc.
```

- **Model** (`src/js/model.js`): Global `state` object (single source of truth). Handles TheMealDB API, Supabase, data hydration (ingredients extraction, cooking time estimation, servings, difficulty, country-to-ISO mapping). Bookmark persistence in `localStorage`.
- **View** (`src/js/views/`): Each view manages its own DOM subtree. Base class `View` in `view.js` provides `render()` (full replace), `update()` (DOM reconciliation — only changed text nodes and attributes), `renderSpinner()`, `renderError()`, `renderMessage()`.
- **Controller** (`src/js/controller.js`): Orchestrates model ↔ view flow. Hash-based router (`controlRouter`) dispatches to home or recipe pages. All event bindings registered in `init()` via a subscriber pattern (views expose `addHandler*` methods).

### State Management

```js
// src/js/model.js
export const state = {
  recipe: {},
  search: { query: "", results: [], resultsPerPage: 12, page: 1 },
  categories: [],
  bookmarks: [],
};
```

Views read `model.state` directly. No Redux or external state library — just a plain object.

### Routing

Hash-based: `#home?reset=true` (home page), `#recipes/<id>` (recipe detail). `history.replaceState` / `history.pushState` used to manage browser history without full page reloads.

### Data Flow

1. User interaction → view event → controller handler
2. Controller calls model to fetch/mutate data
3. Model updates `state`, persists to localStorage if bookmarks
4. Controller calls view.render() or view.update() with state data
5. View generates HTML from `_generateMarkup()` and inserts into DOM

### API Integration

- **TheMealDB**: `lookup.php?i=<id>` and `search.php?s=<query>` via `helpers.js` (`getJSON` with 10s timeout race).
- **Supabase**: User-submitted recipes stored/retrieved via `@supabase/supabase-js` client.
- ID routing: IDs with length < 5 → Supabase; otherwise → TheMealDB.

### Key Files

| File | Purpose |
|---|---|
| `src/js/config.js` | API URLs, Supabase credentials, constants (`TIMEOUT_SEC=10`, `RES_PER_PAGE=12`, `COUNTRIES` — 265 country codes) |
| `src/js/helpers.js` | `getJSON()` with timeout race pattern |
| `src/js/supabase.js` | Supabase client initialization |
| `src/js/model.js` | State, API interaction, data normalization (~1060 lines) |
| `src/js/controller.js` | Router, event binding, orchestration |
| `src/js/views/view.js` | Base View class with DOM reconciliation `update()` |
| `src/js/views/homeView.js` | Recipe grid, categories, search trigger |
| `src/js/views/recipeView.js` | Recipe detail with servings adjustment |
| `src/js/views/resultsView.js` | Search results with bookmark toggles |
| `src/js/views/bookmarksView.js` | Bookmark dropdown and list |
| `src/js/views/paginationView.js` | Page navigation |
| `src/js/views/searchView.js` | Hero search bar |
| `src/js/views/searchBarView.js` | Sticky nav search popup |
| `src/js/views/categoryView.js` | Category pills in the nav |
| `src/js/views/footerCategoryView.js` | Category pills in the footer |
| `src/js/views/addRecipeView.js` | Modal form for user-submitted recipes |
| `src/js/views/navView.js` | Sticky header behavior |
| `src/sass/main.scss` | SCSS entry: vendors → util → global → components |
| `postcss.config.js` | Autoprefixer (last 20 versions) |

## Development Conventions

### JavaScript

- **ES modules** (`"type": "module"` in package.json) — all imports/exports use ES module syntax.
- **Polyfills**: `core-js/stable` and `regenerator-runtime/runtime` imported at the top of `controller.js` for older browser support.
- **View pattern**: Each view class extends the base `View`. Subclasses define `_parentEl` (DOM element) and `_generateMarkup()` (returns HTML string). Call `this._data` to access the data passed to `render()`/`update()`.
- **Event binding**: Views expose `addHandlerX(handler)` methods. The controller's `init()` registers all handlers. This keeps DOM event listeners in views and business logic in the controller.
- **DOM reconciliation**: `view.update()` compares old and new DOM node-by-node and only mutates changed text content and attributes — no full re-render.
- **Error handling**: Errors caught in controller, logged with `💥` emoji for visual grep-ability, surfaced to user via `view.renderError(message)`.
- **Model imports**: Controller uses `import * as model from "./model"` (namespace import) to access all state and functions. Views use default export per-file pattern.
- **2-space indentation** throughout JS files.

### SCSS

- **Import order** (defined in `main.scss`): vendors → util → global → components.
- **Units**: All font sizes and spacing use `px` values converted via `rem()` function (`calc($pixel / 16) + rem`). No raw `rem`/`em` values — always go through the helper function.
- **Colors**: `$primary-color: #fe571a` (orange), `$secondary-color: #e4e4e7` (light gray).
- **Fonts**: `$app-font-main: "Roboto", sans-serif`, `$app-logo-font: "Sansita Swashed", system-ui` (loaded from Google Fonts in `index.html`).
- **Bootstrap**: Used only for grid and utilities — not for components. Bootstrap variables are customized via `src/sass/vendors/_bootstrap.scss` using `@forward ... with ($primary, $secondary, $font-family-sans-serif, $btn-font-weight)`.
- **Font Awesome**: Compiled locally from `node_modules/@fortawesome/fontawesome-free` into `src/webfonts/` — no CDN dependency. Configured in `src/sass/vendors/_fontawesome.scss`.
- **Component styles** in `src/sass/components/` are not CSS-scoped (global CSS class names).
- **Partials**: Use leading underscore and kebab-case naming (e.g., `_recipe-load.scss`). Each directory has an `_index.scss` that `@forward`'s its members.
- **2-space indentation** in SCSS files.

### HTML/DOM

- Views toggle via CSS class `hidden` (`display: none !important`) — elements remain in DOM, visibility toggled.
- Scroll position reset to top when navigating to a recipe page.
- Sticky header behavior attached per-page-section (hero vs recipe image).
- Static HTML in `index.html` serves as initial DOM skeleton; views replace inner content via `_clear()` + `insertAdjacentHTML`.

### Git

- `.gitignore` excludes: `node_modules/`, `dist/`, `.parcel-cache/`, `.env/`, `.idea/`.
- Commit style: short, imperative summaries (e.g., `Added readme.md`, `Improvements to readme`).
- Commitizen configured with `cz-conventional-changelog` in package.json.

## Notes

- No test framework or test files exist in the project.
- The `CLAUDE.md` and `AGENTS.md` files contain equivalent guidance for other AI tools and should be kept in sync with this file for overlapping conventions.
- The project is a portfolio/demonstration piece focused on architectural patterns rather than production deployment.
- `src/js/icons.js` exists but appears to be unused (Font Awesome is loaded via SCSS/webfonts).
- `src/js/bootstrap.bundle.min.js` is loaded as a non-module script in `index.html` (pre-bundled Bootstrap JS for modal/tooltip behavior).
