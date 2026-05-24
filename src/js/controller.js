/**
 * ==========================================================================
 * CONTROLLER MODULE - CORE DEPENDENCIES
 * ==========================================================================
 * The Controller acts as the orchestrator for the MVC pattern, managing
 * the flow of data between the model and the views.
 */

// Import the entire model module as a namespace object to maintain access
// to all state data and business logic functions (Named Imports/Namespace).
import * as model from "./model";

// Import view components as default exports. Each view instance is responsible
// for a specific UI component's rendering and DOM event handling.
import navView from "./views/navView";
import recipeView from "./views/recipeView";
import searchView from "./views/searchView";
import searchBarView from "./views/searchBarView";
import resultsView from "./views/resultsView";
import homeView from "./views/homeView";
import paginationView from "./views/paginationView";
import bookmarksView from "./views/bookmarksView";
import categoryView from "./views/categoryView";
import footerCategoryView from "./views/footerCategoryView";
import addRecipeView from "./views/addRecipeView";

/**
 * Polyfill imports (Side-effect imports).
 * These are executed immediately upon application startup to ensure
 * ES6+ features and async/await functionality are supported in older
 * browser environments.
 */
import "core-js/stable";
import "regenerator-runtime/runtime";

/**
 * UI Element Selectors
 * These constants hold references to the main view containers in the DOM,
 * allowing the router to toggle visibility based on the current application state.
 */
const homePage = document.querySelector("#home-page");
const recipePage = document.querySelector("#recipe-page");

/**
 * controlRouter
 * Acts as the primary navigation handler. It listens for changes in the URL hash
 * to determine which section of the application should be displayed.
 *
 * Logic flow:
 * 1. Extracts the path from the hash fragment.
 * 2. Cleans the UI state (e.g., disabling sticky headers).
 * 3. Conditional routing:
 *    - Defaults or "home" paths trigger the home page rendering.
 *    - "recipes/" paths extract the unique ID and trigger recipe page rendering.
 */
const controlRouter = async function () {
  // Get current location hash (e.g., #recipes/52771) and slice '#' to get the path
  const hash = window.location.hash;
  const path = hash.slice(1);

  // Reset navigation behavior before switching views
  navView.disableSticky();

  // ROUTE: Home / Default
  // Triggered when path is empty, starts with 'home', or explicitly routed to home
  if (!path || path.startsWith("home")) {
    const shouldReset = hash.includes("reset");
    renderHome(shouldReset);

    // Attach sticky header behavior relative to the hero section
    navView.addHandlerSticky(document.querySelector(".hero"));
    return;
  }

  // ROUTE: Specific Recipe
  // Triggered when path matches 'recipes/:id' pattern
  if (path.startsWith("recipes/")) {
    const id = path.split("/")[1];

    showRecipePage();
    await controlRecipes(id);

    // Attach sticky header behavior relative to the recipe image container
    navView.addHandlerSticky(document.querySelector(".recipe-load__img"));
  }
};

/**
 * controlRecipes
 * Orchestrates the recipe data retrieval and UI rendering process.
 *
 * @param {string} id - The unique identifier of the recipe to load.
 *
 * Flow:
 * 1. Validates the recipe ID.
 * 2. Triggers the loading spinner in the UI to improve perceived performance.
 * 3. Instructs the model to fetch and process recipe data from the source (API/DB).
 * 4. Renders the final recipe data to the recipeView upon success.
 * 5. Catches and handles potential errors by displaying an error message in the view.
 */
const controlRecipes = async function (id) {
  try {
    console.log(id);

    // Guard clause: Exit early if no ID is provided
    if (!id) return;

    // UI feedback: Display loading spinner during data transition
    recipeView.renderSpinner();

    // 1) Fetch and process the recipe data via the model layer
    await model.loadRecipe(id);

    // 2) Update the view with the newly loaded recipe data
    recipeView.render(model.state.recipe);
  } catch (err) {
    // Error Handling: Log the error and notify the user via the UI
    console.error(err);
    recipeView.renderError(err.message);
  }
};

/**
 * renderHome
 * Manages the transition to the home page state.
 *
 * @param {boolean} [reset=false] - If true, clears existing search state and re-renders
 * the home view components to provide a fresh start for the user.
 *
 * Logic:
 * 1. Toggles the visibility of DOM containers to switch views.
 * 2. If reset is requested, clears the UI pagination and resets the search state in the model.
 * 3. Updates the browser URL hash without creating a new history entry.
 */
const renderHome = function (reset = false) {
  // Toggle visibility: Display home container, hide recipe container
  homePage.classList.remove("hidden");
  recipePage.classList.add("hidden");

  // Conditional state reset
  if (reset) {
    homeView.render();
    homeView.clearPagination();
    model.resetSearch();
  }

  // Update URL history to reflect home state without adding to back button stack
  history.replaceState(null, null, "#home");
};

/**
 * showRecipePage
 * Handles the UI transition to the recipe details view.
 *
 * Logic:
 * 1. Hides the home page container and displays the recipe page container.
 * 2. Resets the scroll position to the top of the viewport to ensure
 *    the user starts reading the recipe from the beginning.
 */
const showRecipePage = function () {
  // Toggle visibility: Hide the home container and show the recipe details section
  homePage.classList.add("hidden");
  recipePage.classList.remove("hidden");

  // Reset scroll position to ensure a clean user experience when navigating to a new recipe
  window.scrollTo(0, 0);
};

/**
 * controlSearchResults
 * Handles the end-to-end flow for performing a recipe search.
 *
 * Flow:
 * 1. Extracts the search query from either the primary search view or the search bar popup.
 * 2. Displays a loading spinner to provide visual feedback during the network request.
 * 3. Instructs the model to fetch search results from the data source (API/DB).
 * 4. Retrieves the first page of results from the model and renders them to the results view.
 * 5. Generates the pagination interface based on the search state.
 *
 * Error Handling:
 * - Logs the error with a visual identifier for debugging.
 * - Displays an error message to the user via the resultsView.
 * - Clears any existing pagination to ensure a clean state upon search failure.
 */
const controlSearchResults = async function () {
  try {
    // 1) Get query from active input source
    const query = searchView.getQuery() || searchBarView.getQuery();
    if (!query) return;

    // 2) UI feedback: Indicate background processing
    resultsView.renderSpinner();

    // 3) Load search results via the model
    await model.loadSearchResults(query);

    // 4) Fetch and render the initial page of results
    const resultsPage = await model.getSearchResultsPage();
    resultsView.render(resultsPage);

    // 5) Update pagination UI components
    paginationView.render(model.state.search);
  } catch (err) {
    // Error Logging and UI Notification
    console.error(`${err} 💥💥💥`);
    resultsView.renderError(err.message);
    homeView.clearPagination();
  }
};

/**
 * controlCategories
 * Orchestrates the fetching and rendering of recipe categories throughout the application.
 *
 * Flow:
 * 1. Requests the model to fetch category data (typically from the API or database).
 * 2. Renders the fetched data into the primary category display (e.g., navigation/sidebar).
 * 3. Renders the same data into the footer component to ensure category accessibility
 *    across different page sections.
 *
 * Error Handling:
 * - Logs any failure during category retrieval to the console for debugging purposes.
 */
const controlCategories = async function () {
  try {
    // 1) Request category data from the model layer
    await model.loadCategories();

    // 2) Populate category components in both the main body and the footer
    categoryView.render(model.state.categories);
    footerCategoryView.render(model.state.categories);
  } catch (err) {
    // Error Logging: Capture and report failures without disrupting the overall UI flow
    console.error("Error loading categories:", err);
  }
};

/**
 * controlCategoryResults
 * Manages the data flow and UI synchronization for filtering recipes by category.
 *
 * @param {string} category - The category identifier used to filter recipes.
 *
 * Flow:
 * 1. Shows a loading spinner in the results view to indicate active data retrieval.
 * 2. Fetches results from the model, passing 'true' as a flag for category-specific
 *    logic (e.g., triggering data hydration/detail enrichment).
 * 3. Retrieves the current page of result data, ensuring all necessary details
 *    are fully hydrated before rendering.
 * 4. Updates the results view with the filtered recipe list.
 * 5. Generates the pagination interface to allow navigation through the result set.
 *
 * Error Handling:
 * - Logs the error for debugging.
 * - Displays a generic error state in the resultsView to notify the user.
 */
const controlCategoryResults = async function (category) {
  try {
    // 1) UI feedback: Indicate background processing
    resultsView.renderSpinner();

    // 2) Load search results by category via the model layer
    // The boolean flag signals the model to initiate data hydration for this specific category
    await model.loadSearchResults(category, true);

    // 3) Extract the specific page of data after hydration is complete
    const results = await model.getSearchResultsPage();

    // 4) Update UI with the filtered recipe results
    resultsView.render(results);

    // 5) Update pagination UI based on the new search state
    paginationView.render(model.state.search);
  } catch (err) {
    // Error Logging and UI Notification
    console.error(`Category Control Error: ${err} 💥`);
    resultsView.renderError();
  }
};

/**
 * controlPagination
 * Manages the transition between pages of search results.
 *
 * @param {number} goToPage - The specific page index requested by the user.
 *
 * Flow:
 * 1. Displays a loading spinner in the results area to maintain UI consistency
 *    during the transition.
 * 2. Fetches the results for the requested page from the model layer.
 *    'await' ensures that any asynchronous data hydration (e.g., fetching
 *    missing recipe details) is completed before proceeding.
 * 3. Updates the results view with the newly retrieved page data.
 * 4. Re-renders the pagination buttons to reflect the updated state
 *    (e.g., updating active page status and availability of prev/next buttons).
 *
 * Error Handling:
 * - Catches and logs any errors encountered during the page navigation process.
 */
const controlPagination = async function (goToPage) {
  try {
    // 1) UI feedback: Indicate loading state for the new page
    resultsView.renderSpinner();

    // 2) Retrieve results for the target page from the model
    // This call is asynchronous to allow for potential data hydration
    const results = await model.getSearchResultsPage(goToPage);

    // 3) Update the main results container with the new page content
    resultsView.render(results);

    // 4) Refresh the pagination controls based on current search state
    paginationView.render(model.state.search);
  } catch (err) {
    // Error Logging: Standard console error for debugging purposes
    console.error(`${err} 💥💥💥`);
  }
};

/**
 * controlServings
 * Handles the logic for resizing recipe ingredients based on the number of servings.
 *
 * @param {number} newServings - The updated number of servings requested by the user.
 *
 * Flow:
 * 1. Invokes the model to update the serving count and recalculate the
 *    proportions of all ingredients within the recipe state.
 * 2. Instructs the recipe view to perform a DOM update. Note: The use of
 *    'recipeView.update()' implies a DOM reconciliation process that updates
 *    only the changed text elements rather than re-rendering the entire recipe page.
 */
const controlServings = function (newServings) {
  // 1) Update the recipe state with new serving counts and recalculated ingredients
  model.updateServings(newServings);

  // 2) Update the recipe view UI to reflect the recalculated ingredient quantities
  recipeView.update(model.state.recipe);
};

/**
 * controlAddBookmark
 * Manages the toggling of recipe bookmarks and synchronizes the UI state.
 *
 * @param {string} id - The unique identifier of the recipe being bookmarked/unbookmarked.
 *
 * Flow:
 * 1. Identifies the target recipe from either the search results list or the currently loaded recipe state.
 * 2. Toggles the bookmark status: invokes model functions to add or delete based on current status.
 * 3. Syncs the main recipe view if the active recipe was modified.
 * 4. Refreshes the search results UI to reflect the bookmark status change (e.g., heart icon updates).
 *    Uses 'await' because result rendering may require asynchronous data hydration.
 * 5. Updates the persistent bookmarks dropdown menu or renders an empty state message if no bookmarks exist.
 *
 * Error Handling:
 * - Logs any failure during the bookmarking process to the console.
 */
const controlAddBookmark = async function (id) {
  try {
    // 1) Locate the recipe object in the model state
    const recipe =
      model.state.search.results.find((res) => res.id === id) ||
      model.state.recipe;

    // 2) Toggle bookmark status in the model
    if (!recipe.bookmarked) {
      model.addBookmark(recipe);
    } else {
      model.deleteBookmark(recipe.id);
    }

    // 3) Update the main recipe view if this is the recipe currently being viewed
    if (model.state.recipe.id === id) recipeView.update(model.state.recipe);

    // 4) Synchronize the results list UI to reflect updated bookmark icons
    // 'await' ensures that hydrated data is ready before the UI update
    const currentResultsPage = await model.getSearchResultsPage();
    resultsView.update(currentResultsPage);

    // 5) Render the updated list of bookmarks in the UI, or show a fallback message
    if (model.state.bookmarks.length === 0) {
      bookmarksView.renderBookmarkError();
    } else {
      bookmarksView.render(model.state.bookmarks);
    }
  } catch (err) {
    // Error Logging for debugging purposes
    console.error(`Bookmark Control Error: ${err} 💥`);
  }
};

/**
 * controlBookmarks
 * Initializes and synchronizes the bookmarks UI component.
 *
 * Logic:
 * 1. Checks the current application state for existing bookmarks.
 * 2. If no bookmarks are stored, displays a default empty/error state message via the view.
 * 3. If bookmarks exist, populates the bookmarks dropdown/list with the current data.
 */
const controlBookmarks = function () {
  // Guard clause: If the bookmarks array is empty, render the empty state view
  if (model.state.bookmarks.length === 0)
    return bookmarksView.renderBookmarkError();

  // Render the list of bookmarked recipes
  bookmarksView.render(model.state.bookmarks);
};

/**
 * controlAddRecipe
 * Orchestrates the submission, processing, and UI feedback for adding a new user-generated recipe.
 *
 * @param {Object} newRecipe - The raw recipe data object captured from the form.
 *
 * Flow:
 * 1. Displays a loading spinner in the modal to indicate the upload process is active.
 * 2. Instructs the model to validate, upload, and persist the new recipe data.
 * 3. Renders the newly created recipe in the main view and notifies the user with a success message.
 * 4. Synchronizes the bookmarks view to reflect the updated state.
 * 5. Manages UI transitions: closes the modal after a delay and resets the form to a fresh state.
 * 6. Updates the URL hash and browser history to point to the new recipe page.
 *
 * Error Handling:
 * - Logs errors for debugging and displays a user-friendly error message within the modal view.
 */
const controlAddRecipe = async function (newRecipe) {
  try {
    // 1) UI feedback: Start loading sequence
    addRecipeView.renderSpinner();

    // 2) Upload the recipe data via the model layer
    await model.uploadRecipe(newRecipe);

    // Debugging output for development tracking
    console.log("FULL STATE BEFORE RENDER:", model.state.recipe);
    console.log(model.state.recipe);

    // 3) Render the new recipe and confirm success to the user
    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();

    // 4) Update bookmarks list with the newly added recipe
    bookmarksView.render(model.state.bookmarks);

    // 5) UI Transition: Close the add-recipe modal and reset the form
    // Delayed to ensure the success message is readable by the user
    setTimeout(() => {
      addRecipeView.toggleWindow();

      // Secondary delay to prepare the form for subsequent use
      setTimeout(() => {
        addRecipeView.render();
      }, 500);
    }, 2000);

    // 6) Navigation: Update browser history and URL to the new recipe ID
    window.location.hash = `#recipes/${model.state.recipe.id}`;
    window.history.pushState(null, "", `#recipes/${model.state.recipe.id}`);
  } catch (err) {
    // Error Logging and UI Notification
    console.error("💥", `${err}`);
    addRecipeView.renderError(err.message);
  }
};

/**
 * init
 * Application initialization function.
 *
 * This function serves as the central entry point for setting up event listeners
 * across the entire application (Subscriber pattern). It binds the controller's
 * business logic to the DOM events handled by the various view components.
 *
 * Each handler is registered to bridge the gap between user interaction (in the views)
 * and state manipulation/process orchestration (in the controller).
 */
const init = function () {
  // Bookmark view events
  bookmarksView.addHandlerRender(controlBookmarks);

  // Main recipe view events
  recipeView.addHandlerRender(controlRouter);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(() =>
    controlAddBookmark(model.state.recipe.id),
  );

  // Results sidebar events
  resultsView.addHandlerAddBookmark(controlAddBookmark);

  // Search input events
  searchView.addHandlerSearch(controlSearchResults);
  searchBarView.addHandlerSearch(controlSearchResults);

  // Category navigation events (Header and Footer)
  categoryView.addHandlerRender(controlCategories);
  categoryView.addHandlerClick(controlCategoryResults);
  footerCategoryView.addHandlerRender(controlCategories);
  footerCategoryView.addHandlerClick(controlCategoryResults);

  // Pagination navigation events
  paginationView.addHandlerClick(controlPagination);

  // Recipe submission events
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

// Initialize the application event bindings
init();
