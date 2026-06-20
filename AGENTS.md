# Repository Guidelines

## Project Structure & Module Organization

Gourmetia is a Parcel-powered Vanilla JavaScript SPA using an MVC-style layout. The app entry is `index.html`, with JavaScript under `src/js/`. `src/js/controller.js` coordinates routing and view updates, `src/js/model.js` owns state and data operations, and reusable UI classes live in `src/js/views/`. Configuration and API helpers are in `src/js/config.js`, `src/js/helpers.js`, and `src/js/supabase.js`.

Styles are written in Sass under `src/sass/`. `main.scss` composes vendor, utility, global, and component partials. Webfont assets are stored in `src/webfonts/`. Build output goes to `dist/` and should be treated as generated.

## Build, Test, and Development Commands

- `npm install`: install Parcel, Sass, Bootstrap, Supabase, and other dependencies.
- `npm start`: run the Parcel dev server for local development.
- `npm run build`: create a production build in `dist/`.

There is currently no `npm test` script. Before submitting changes, run `npm run build` and manually verify the affected flows in the browser.

## Coding Style & Naming Conventions

Use ES modules and keep the current MVC separation: controllers orchestrate, the model manages state/data, and views handle DOM rendering/events. Prefer named exports for shared utilities and default exports for instantiated views, matching the existing pattern.

Use 2-space indentation in JavaScript and Sass. Name JavaScript files in camelCase, such as `recipeView.js` or `searchBarView.js`. Name Sass partials with a leading underscore and kebab-case, such as `_recipe-load.scss`, then expose them through the nearest `_index.scss`.

## Testing Guidelines

No automated test framework is configured yet. For functional changes, document manual test coverage in the PR: search recipes, open recipe details, update servings, bookmark/unbookmark, paginate results, navigate home/detail routes, and add a recipe if relevant. If adding tests later, place them near the changed module or under a clear `tests/` directory and add a matching npm script.

## Commit & Pull Request Guidelines

The existing history uses short, imperative summaries such as `Added readme.md` and `Improvements to readme`. Follow that style with concise, task-focused commit messages.

Pull requests should include a brief description, the reason for the change, manual verification steps, and screenshots or screen recordings for visible UI changes. Link related issues when available and call out any new environment variables or API behavior changes.

## Security & Configuration Tips

Do not commit secrets or private Supabase credentials. Keep generated folders such as `dist/`, `.parcel-cache/`, and `node_modules/` out of source changes unless explicitly required.
