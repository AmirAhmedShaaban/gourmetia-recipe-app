# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Start Development Server**: `npm start` (auto-launches browser, live reload)
- **Build Production Bundle**: `npm run build`
- **Install Dependencies**: `npm install`
- **Clean Build Cache**: `rm -rf .parcel-cache`
- **Run tests**: (No test files currently configured)

## Project Architecture

### Build System

- Uses [Parcel](https://parceljs.org/) for bundling and live reloading
- `postcss.config.js` configures CSS processing with autoprefixer
- Entry point: `index.html` (bundled via Parcel)
- Source files in `src/`, output to `dist/`

### Data Flow Architecture

The app follows a vanilla JavaScript MVC pattern with:

**Model (`src/js/model.js`)**

- State management: `state.recipe`, `state.search`, `state.bookmarks`
- API interactions with TheMealDB API
- Data transformation and calculation methods:
  - `extractIngredients()` - parses recipe ingredients from API response
  - `estimateCookingTime()` - calculates prep time based on ingredient count
  - `estimateServings()` - determines recipe servings from weight measurements
  - `calculateDifficulty()` - rates recipes as Easy/Medium/Hard
  - `getCountryCode()` - converts country names to ISO codes

**Controller (`src/js/controller.js`)**

- Hash-based routing via `controlRouter()`
- Coordinates between model state and view updates
- Handles user actions (search, pagination, servings adjustment, bookmarks)

**Views (`src/js/views/`)**

- Each view manages its own DOM manipulation
- Base class in `view.js` with common methods
- Key views:
  - `homeView.js` - main recipe grid and search
  - `recipeView.js` - individual recipe page with servings controls
  - `resultsView.js` - search results display
  - `bookmarksView.js` - bookmarked recipes
  - `paginationView.js` - page navigation controls

### UI Architecture

- Component-based styling with SCSS partials
- Global styles in `src/sass/global/` (colors, typography)
- Component-specific styles in `src/sass/components/`
- Uses Bootstrap 5 grid system and Font Awesome icons
- No CSS framework beyond Bootstrap (custom components)

### API Integration

- TheMealDB API endpoints:
  - Recipe lookup: `/lookup.php?i=${id}`
  - Search: `/search.php?s=${query}`
- Error handling with timeout mechanism (`helpers.js`)
- Response normalization to consistent recipe format

## Key Files

| File                               | Purpose                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| `src/js/model.js`                  | State management and API interactions (includes 265 country codes) |
| `src/js/controller.js`             | Hash-based routing and user action handling                        |
| `src/js/views/homeView.js`         | Main recipe grid and search interface                              |
| `src/js/views/recipeView.js`       | Recipe detail page with servings calculator                        |
| `src/sass/main.scss`               | SCSS imports: vendors → util → global → components                 |
| `src/sass/components/_footer.scss` | Footer with social links and category pills                        |
| `src/sass/components/_hero.scss`   | Hero section with search bar and background image                  |
| `postcss.config.js`                | CSS processing configuration                                       |

## Development Notes

### State Management

- Global state in `model.state` is the single source of truth
- Views read state directly, not through controllers
- Bookmarks are stored in browser localStorage (not implemented yet)

### Styling Conventions

- All component styles use pixel-based units (px)
- Primary color: `$primary-color: #fe571a` (orange)
- Secondary color: `$secondary-color: #e4e4e7` (light gray)
- Font families: Roboto (main), Sansita Swashed (logo)

### Common Patterns

- View classes have `render()` methods that accept data
- Event handlers are attached in `init()` functions
- Error messages include emoji for better UX
- Pagination uses `getSearchResultsPage()` for efficient rendering

### Architecture Decisions

- No Redux or state management library - vanilla JS objects
- Hash-based routing for SPA feel without complex routing setup
- Component styles are not scoped (global CSS classes)
- Bootstrap used only for grid, not components

When working on this codebase:

1. Maintain the vanilla JavaScript MVC pattern
2. Keep error messages user-friendly with emojis
3. Follow the existing SCSS import structure
4. Use pixel units for all font sizes and spacing
5. Implement views to read directly from model state
