/**
 * ==========================================================================
 * MODEL MODULE - DATA LAYER & STATE MANAGEMENT
 * ==========================================================================
 * This module acts as the single source of truth for the application state
 * and manages all interactions with external APIs and databases.
 */

/**
 * Named Imports:
 * Importing specific constants from the configuration file to maintain
 * centralized control over environment variables and application settings.
 */
import {
  API_URL_ID,
  API_URL_SEARCH,
  RES_PER_PAGE,
  API_URL_CATEGORY,
  COUNTRIES,
} from "./config";

/**
 * Default Import:
 * Importing a utility function to handle network requests and JSON parsing.
 * Importing the pre-configured Supabase client instance for database operations.
 */
import { getJSON } from "./helpers";
import { supabase } from "./supabase.js";

/**
 * Application state object:
 * Serves as the central data repository for the application.
 *
 * @property {Object} recipe - The data of the currently displayed recipe.
 * @property {Object} search - Metadata and results for search queries.
 * @property {Array} categories - List of available recipe categories.
 * @property {Array} bookmarks - Collection of user-saved recipes.
 */

export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  categories: [],
  bookmarks: [],
};

/**
 * loadRecipe:
 * Asynchronously orchestrates the retrieval and normalization of recipe data.
 *
 * Logic Flow:
 * 1. Source Identification: Checks the ID length to route the request between
 *    the local Supabase database (custom recipes) or the external API.
 * 2. Data Retrieval: Executes the appropriate fetch/query operation.
 * 3. Data Normalization:
 *    - Extracts and parses ingredient lists.
 *    - Computes derived metrics (cooking time, servings, difficulty level).
 *    - Maps disparate API/Database schemas to a unified internal application state object.
 * 4. State Synchronization: Sets the 'bookmarked' status based on existing
 *    application state to ensure UI consistency.
 *
 * @param {string} id - The unique identifier used to fetch the recipe.
 * @throws {Error} - Propagates errors to the controller for UI notification if data fetch fails.
 */
export const loadRecipe = async function (id) {
  try {
    // Identify the target data source based on ID format
    const isSupabaseId = id.length < 5;

    if (isSupabaseId) {
      // --- Supabase Data Path (User-generated content) ---
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error("Couldn't find recipe in database");

      // Normalize data components
      const ingredients = extractIngredients(data);
      const cookingTime = estimateCookingTime(ingredients);
      const servings = estimateServings(ingredients);
      const difficulty = calculateDifficulty(cookingTime, ingredients.length);

      // Construct localized recipe state
      state.recipe = {
        id: data.id,
        title: data.title,
        publisher: data.publisher,
        cookingTime: data.cooking_time,
        image: data.image,
        ingredients: data.ingredients,
        servings: data.servings,
        sourceUrl: data.source_url,
        country: data.country,
        category: data.category,
        instructions: data.instructions || "No instructions provided",
        videoUrl: data.video_url || "",
        difficulty: difficulty,
        bookmarked: true,
      };
      console.log(state.recipe);
    } else {
      // --- External API Data Path (Public content) ---
      const data = await getJSON(
        `${API_URL_ID}${id}`,
        "We couldn't find that recipe! please try another one 🧑‍🍳",
      );

      const { meals } = data;
      const rawRecipe = meals[0];

      // Normalize data components for API response structure
      const ingredients = extractIngredients(rawRecipe);
      const cookingTime = estimateCookingTime(ingredients);
      const servings = estimateServings(ingredients);
      const difficulty = calculateDifficulty(cookingTime, ingredients.length);

      // Construct localized recipe state, including publisher domain extraction
      state.recipe = {
        id: rawRecipe.idMeal,
        title: rawRecipe.strMeal,
        publisher: rawRecipe.strSource
          ? new URL(rawRecipe.strSource).hostname
          : "Gourmetia Kitchen",
        cookingTime: cookingTime,
        image: rawRecipe.strMealThumb,
        ingredients: ingredients,
        servings: servings,
        instructions: rawRecipe.strInstructions,
        sourceUrl: rawRecipe.strSource,
        videoUrl: rawRecipe.strYoutube,
        country: rawRecipe.strCountry,
        difficulty: difficulty,
        category: rawRecipe.strCategory,
      };

      // Check against current state to determine bookmarked status
      if (state.bookmarks.some((bookmark) => bookmark.id === id))
        state.recipe.bookmarked = true;
      else state.recipe.bookmarked = false;

      console.log(state.recipe);
    }
  } catch (err) {
    // Log error internally and re-throw to allow controller handling
    console.error(`${err}`);
    throw err;
  }
};

/**
 * extractIngredients:
 * Parses a raw recipe object to extract and normalize the ingredient list.
 *
 * Logic Flow:
 * 1. Iteration: Loops through 20 potential ingredient/measure slots (standard API format).
 * 2. Filtering: Checks for valid ingredient names (non-empty strings).
 * 3. Parsing:
 *    - Converts measurements to strings and trims whitespace.
 *    - Calculates numerical amount using `parseFloat` for logic calculations.
 *    - Uses Regex to identify and extract unit types (e.g., grams, cups) from the measure string.
 * 4. Transformation: Maps valid data into a clean array of objects for consistent application use.
 *
 * @param {Object} rawRecipe - The raw API or Database object containing indexed ingredient/measure fields.
 * @returns {Array<Object>} - An array of normalized ingredient objects containing name, measure, amount, and unit.
 */
const extractIngredients = function (rawRecipe) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const measureValue = rawRecipe[`strMeasure${i}`];
    const ingredientName = rawRecipe[`strIngredient${i}`];

    if (ingredientName && ingredientName.trim() !== "") {
      const measureStr = String(measureValue || "").trim();

      ingredients.push({
        ingredient: ingredientName,
        measure: measureStr,
        amount: parseFloat(measureStr) || null,
        unit: measureStr.match(/[a-zA-Z]+/g)?.join(" ") || "",
      });
    }
  }
  return ingredients;
};

/**
 * estimateServings:
 * Infers the number of servings for a recipe based on primary ingredient weight.
 *
 * Logic Flow:
 * 1. Scanning: Searches for ingredients measured in kilograms (kg) or grams (g).
 * 2. Calculation:
 *    - Uses a baseline assumption of 150g per serving.
 *    - If a kg measurement is found, divides weight by 0.150kg.
 *    - If a gram measurement is found, divides weight by 150g.
 * 3. Fallback: Ensures a minimum return value of 1 serving; defaults to 4 servings
 *    if no weight-based measurements are identified.
 *
 * @param {Array<Object>} ingredients - Array of ingredient objects to analyze.
 * @returns {number} - The estimated number of servings.
 */
const estimateServings = function (ingredients) {
  const mainIngredientKg = ingredients.find((ing) =>
    ing.measure.trim().toLowerCase().endsWith("kg"),
  );
  const mainIngredientG = ingredients.find((ing) =>
    ing.measure.trim().toLowerCase().endsWith("g"),
  );

  if (mainIngredientKg) {
    const weight = parseInt(mainIngredientKg.measure);
    if (Number.isFinite(weight)) {
      return Math.max(1, Math.round(weight / (150 / 1000)));
    }
  }

  if (mainIngredientG) {
    const weight = parseInt(mainIngredientG.measure);
    if (Number.isFinite(weight)) {
      return Math.max(1, Math.round(weight / 150));
    }
  }
  return 4;
};

/**
 * estimateCookingTime:
 * Provides a heuristic calculation for the total time required to prepare a recipe.
 *
 * Logic Flow:
 * 1. Calculation: Uses the total number of ingredients as a proxy for complexity.
 * 2. Heuristic: Assumes an average of 5 minutes of preparation/handling time per ingredient.
 *
 * @param {Array<Object>} ingredients - Array of ingredient objects utilized in the recipe.
 * @returns {number} - The estimated total cooking/preparation time in minutes.
 */
const estimateCookingTime = function (ingredients) {
  const prepTime = ingredients.length * 5;
  return prepTime;
};

/**
 * calculateDifficulty:
 * Determines the skill level required to prepare a recipe based on complexity metrics.
 *
 * Logic Flow:
 * 1. Easy: Assigned if preparation time is 40 minutes or less AND ingredient count is 8 or fewer.
 * 2. Medium: Assigned if the preparation time is 70 minutes or less (assuming ingredient constraints are exceeded).
 * 3. Hard: Assigned as the default for high-complexity, time-consuming recipes.
 *
 * @param {number} time - The total estimated time in minutes.
 * @param {number} ingredientsCount - The total number of unique ingredients.
 * @returns {string} - The difficulty classification: "Easy", "Medium", or "Hard".
 */
const calculateDifficulty = function (time, ingredientsCount) {
  if (time <= 40 && ingredientsCount <= 8) return "Easy";
  if (time <= 70) return "Medium";
  return "Hard";
};

/**
 * getCountryCode:
 * Maps a country's full name to its corresponding two-letter ISO country code.
 *
 * Logic Flow:
 * 1. Search: Iterates through the imported COUNTRIES configuration array.
 * 2. Comparison: Performs a case-insensitive match against the provided area/country name.
 * 3. Return: Returns the matched lowercase ISO code if found; otherwise, defaults
 *    to "un" (United Nations) to maintain UI stability.
 *
 * @param {string} area - The full name of the country.
 * @returns {string} - The lowercase ISO country code or "un" as a fallback.
 */
export const getCountryCode = function (area) {
  const country = COUNTRIES.find(
    (country) => country.name.toLowerCase() === area.toLowerCase(),
  );

  return country ? country.code.toLowerCase() : "un";
};

/**
 * loadSearchResults
 * Handles the complete search workflow for recipes, including:
 * - Fetching recipes from the external API
 * - Searching locally stored bookmarks
 * - Merging and deduplicating results
 * - Synchronizing bookmark state
 * - Hydrating incomplete recipe data for the initial page
 *
 * @param {string} query - The search keyword or category name.
 * @param {boolean} [isCategory=false] - Determines whether the search should
 * use the category endpoint instead of the general search endpoint.
 *
 * Logic Flow:
 * 1. Build the correct API endpoint based on search type.
 * 2. Fetch recipe data from the API layer.
 * 3. Search locally bookmarked recipes for matching results.
 * 4. Normalize and map API response data into application state format.
 * 5. Merge local bookmarks with API results.
 * 6. Remove duplicate recipes to ensure state consistency.
 * 7. Persist results into the centralized search state.
 * 8. Hydrate the first visible page with complete recipe details.
 *
 * Error Handling:
 * - Logs unexpected failures to the console.
 * - Re-throws the error to allow controller-level handling.
 */
export const loadSearchResults = async function (query, isCategory = false) {
  try {
    /**
     * Build API endpoint dynamically depending on search mode.
     * Category searches use the category filter endpoint,
     * while standard searches use the global search endpoint.
     */
    const url = isCategory
      ? `${API_URL_CATEGORY}${query}`
      : `${API_URL_SEARCH}${query}`;

    /**
     * Fetch recipe data from the API layer.
     * The helper function centralizes fetch logic and standardized error handling.
     */
    const data = await getJSON(
      url,
      "We couldn't find any recipe! please try another query 🧑‍🍳",
    );

    /**
     * Search through locally stored bookmarks to allow users
     * to discover saved recipes even if the API does not return them.
     *
     * Matching is performed against:
     * - Recipe title
     * - Category
     * - Country
     * - Ingredient names
     */
    const bookmarkResults = state.bookmarks
      .filter((bookmark) => {
        return (
          bookmark.title?.toLowerCase().includes(query.toLowerCase()) ||
          bookmark.category?.toLowerCase().includes(query.toLowerCase()) ||
          bookmark.country?.toLowerCase().includes(query.toLowerCase()) ||
          bookmark.ingredients?.some((ing) =>
            ing.ingredient?.toLowerCase().includes(query.toLowerCase()),
          )
        );
      })

      /**
       * Normalize bookmark objects to ensure they match
       * the structure used by API-generated recipes.
       */
      .map((bookmark) => ({
        ...bookmark,

        // Generate country code for flag rendering fallback support
        countryCode: bookmark.country ? getCountryCode(bookmark.country) : "un",

        // Bookmarks are always marked as bookmarked by definition
        bookmarked: true,
      }));

    /**
     * Prevent runtime errors when the API returns null
     * instead of an empty meals array.
     */
    const apiMeals = data.meals || [];

    /**
     * Transform raw API responses into normalized recipe objects
     * compatible with the application's internal state structure.
     */
    const apiResults = apiMeals.map((rawRecipe) => {
      /**
       * Full search endpoint responses contain detailed recipe data,
       * allowing direct ingredient extraction and metadata generation.
       */
      if (!isCategory) {
        const ingredients = extractIngredients(rawRecipe);
        const cookingTime = estimateCookingTime(ingredients);
        const difficulty = calculateDifficulty(cookingTime, ingredients.length);

        return {
          id: rawRecipe.idMeal,
          title: rawRecipe.strMeal,

          // Extract clean hostname for publisher display
          publisher: rawRecipe.strSource
            ? new URL(rawRecipe.strSource).hostname
            : "Gourmetia Kitchen",

          ingredients,
          cookingTime,

          country: rawRecipe.strCountry,
          countryCode: getCountryCode(rawRecipe.strCountry),

          image: rawRecipe.strMealThumb,
          difficulty,

          category: rawRecipe.strCategory || query,

          /**
           * Synchronize bookmark state with global bookmark storage.
           */
          bookmarked: state.bookmarks.some(
            (bookmark) => bookmark.id === rawRecipe.idMeal,
          ),
        };
      }

      /**
       * Category endpoint responses provide limited recipe data.
       * Missing fields are temporarily filled with placeholder values
       * until hydration occurs later in the workflow.
       */
      return {
        id: rawRecipe.idMeal,
        title: rawRecipe.strMeal,
        image: rawRecipe.strMealThumb,

        ingredients: [],

        bookmarked: state.bookmarks.some(
          (bookmark) => bookmark.id === rawRecipe.idMeal,
        ),

        publisher: "Gourmetia Kitchen",
        cookingTime: 0,
        difficulty: "Medium",
      };
    });

    /**
     * Merge local bookmark matches with API results
     * to create a unified searchable dataset.
     */
    const mergedResults = [...bookmarkResults, ...apiResults];

    /**
     * Remove duplicate recipes after merging.
     * Duplicate detection is based on recipe ID uniqueness.
     */
    const uniqueResults = mergedResults.filter(
      (recipe, index, self) =>
        index === self.findIndex((r) => r.id === recipe.id),
    );

    /**
     * Persist processed results into centralized application state.
     */
    state.search.results = uniqueResults;
    state.search.query = query;

    // Reset pagination whenever a new search occurs
    state.search.page = 1;

    /**
     * Hydrate the first visible page immediately to improve UX.
     *
     * Category searches return incomplete recipe objects,
     * so hydration enriches them with full metadata before rendering.
     */
    const start = 0;
    const end = state.search.resultsPerPage;

    const firstPage = state.search.results.slice(start, end);

    const hydratedFirstPage = await hydrateMeals(firstPage, query);

    /**
     * Replace placeholder recipes in state
     * with their fully hydrated counterparts.
     */
    state.search.results.splice(
      start,
      hydratedFirstPage.length,
      ...hydratedFirstPage,
    );

    console.log("Search Results Ready ✅", state.search.results);
  } catch (err) {
    /**
     * Log unexpected runtime errors for debugging
     * and re-throw them for controller-level UI handling.
     */
    console.error(err);
    throw err;
  }
};

/**
 * loadCategories
 * Fetches, filters, and normalizes recipe categories from the API layer.
 *
 * /Logic Flow:
 * 1. Request all available categories from the external API.
 * 2. Filter categories to include only those supported by the application UI.
 * 3. Fetch recipe counts for each category in parallel.
 * 4. Normalize category data into a lightweight UI-friendly structure.
 * 5. Persist the processed categories into centralized application state.
 *
 * Performance Notes:
 * - Promise.all() is used to perform all category count requests concurrently,
 *   significantly reducing total loading time compared to sequential requests.
 *
 * Error Handling:
 * - Logs unexpected runtime errors for debugging purposes.
 * - Re-throws errors to allow controller-level handling and UI feedback.
 */
export const loadCategories = async function () {
  try {
    /**
     * Fetch all available categories from the API.
     */
    const data = await getJSON(
      `https://www.themealdb.com/api/json/v1/1/categories.php`,
    );

    /**
     * Define the categories officially supported by the application.
     *
     * This filtering step prevents unsupported or visually inconsistent
     * categories from appearing in the UI.
     */
    const allowedCategories = [
      "Beef",
      "Chicken",
      "Dessert",
      "Seafood",
      "Pasta",
      "Vegan",
      "Vegetarian",
      "Breakfast",
      "Side",
    ];

    /**
     * Filter raw API categories to retain only supported entries.
     */
    const rawCategories = data.categories.filter((cat) =>
      allowedCategories.includes(cat.strCategory),
    );

    /**
     * Fetch category recipe counts in parallel and normalize
     * the resulting data into a UI-friendly structure.
     */
    state.categories = await Promise.all(
      rawCategories.map(async (cat) => {
        /**
         * Request all meals belonging to the current category
         * in order to calculate the total recipe count.
         */
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat.strCategory}`,
        );

        const categoryData = await res.json();

        /**
         * Normalize category data before storing it in state.
         */
        return {
          name: cat.strCategory,

          // Category thumbnail image used for UI cards/navigation
          image: cat.strCategoryThumb,

          // Safe fallback in case the API returns null
          count: categoryData.meals ? categoryData.meals.length : 0,
        };
      }),
    );

    console.log(state.categories);
  } catch (err) {
    /**
     * Log unexpected runtime errors and propagate them upward
     * for centralized controller-level handling.
     */
    console.error(`${err}`);
    throw err;
  }
};

/**
 * hydrateMeals
 * Enriches incomplete recipe objects with full recipe details from the API.
 *
 * Purpose:
 * Some API endpoints (such as category filters) return only partial recipe data.
 * This function performs a secondary lookup request for each incomplete recipe
 * to retrieve the missing metadata required by the application UI.
 *
 * Hydration adds:
 * - Ingredients
 * - Cooking time estimation
 * - Difficulty calculation
 * - Publisher information
 * - Country metadata
 * - Bookmark synchronization
 *
 * @param {Array<Object>} meals - Array of recipe objects that may contain
 * incomplete data structures.
 *
 * @param {string} [query] - Optional fallback category/query value used when
 * category information is unavailable from the API response.
 *
 * @returns {Promise<Array<Object>>}
 * Returns a fully hydrated array of recipe objects.
 *
 * Performance Notes:
 * - Promise.all() enables concurrent hydration requests,
 *   significantly reducing total loading time.
 *
 * Fault Tolerance:
 * - If hydration for a specific recipe fails, the original recipe object
 *   is returned instead of interrupting the entire batch process.
 */
const hydrateMeals = async function (meals, query) {
  return await Promise.all(
    meals.map(async (meal) => {
      /**
       * Skip hydration if the recipe already contains ingredient data.
       *
       * This prevents unnecessary API requests and improves performance.
       */
      if (meal.ingredients && meal.ingredients.length > 0) return meal;

      try {
        /**
         * Fetch complete recipe details using the recipe lookup endpoint.
         */
        const data = await getJSON(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.id}`,
        );

        const rawRecipe = data.meals[0];

        /**
         * Generate derived recipe metadata from raw API data.
         */
        const ingredients = extractIngredients(rawRecipe);

        const cookingTime = estimateCookingTime(ingredients);

        const difficulty = calculateDifficulty(cookingTime, ingredients.length);

        /**
         * Normalize hydrated recipe data into the application's
         * internal state structure.
         */
        return {
          id: rawRecipe.idMeal,

          title: rawRecipe.strMeal,

          // Extract hostname for cleaner publisher presentation
          publisher: rawRecipe.strSource
            ? new URL(rawRecipe.strSource).hostname
            : "Gourmetia Kitchen",

          ingredients: ingredients,

          cookingTime: cookingTime,

          country: rawRecipe.strCountry,

          // Generate country code for flag rendering support
          countryCode: getCountryCode(rawRecipe.strCountry),

          image: rawRecipe.strMealThumb,

          difficulty: difficulty,

          // Fallback to current query if category is missing
          category: rawRecipe.strCategory || query,

          /**
           * Synchronize bookmark state with persisted bookmarks storage.
           */
          bookmarked: state.bookmarks.some(
            (bookmark) => bookmark.id === rawRecipe.idMeal,
          ),
        };
      } catch (err) {
        /**
         * Fail gracefully by returning the original recipe object.
         *
         * This prevents a single hydration failure from breaking
         * the entire rendering pipeline.
         */
        return meal;
      }
    }),
  );
};

/**
 * resetSearch
 * Resets the search-related state to its initial empty condition.
 *
 * Purpose:
 * - Clears previously loaded search results.
 * - Removes the active search query from state.
 *
 * Common Use Cases:
 * - Navigating back to the home page
 * - Starting a fresh search session
 * - Resetting UI state after route transitions
 *
 * State Mutations:
 * - state.search.results → emptied
 * - state.search.query → cleared
 */
export const resetSearch = function () {
  // Remove all currently stored search results
  state.search.results = [];

  // Clear the active search query
  state.search.query = "";
};

/**
 * getSearchResultsPage
 * Retrieves and hydrates a specific page of search results.
 *
 * Purpose:
 * - Handles pagination logic for the search system.
 * - Extracts the correct slice of recipes for the requested page.
 * - Ensures all visible recipes are fully hydrated before rendering.
 * - Synchronizes hydrated data back into the centralized state.
 *
 * @param {number} [page=state.search.page]
 * The target page index to retrieve.
 * Defaults to the currently active page stored in state.
 *
 * @returns {Promise<Array<Object>>}
 * Returns a fully hydrated array of recipes for the requested page.
 *
 * Logic Flow:
 * 1. Update the active page in state.
 * 2. Calculate slice boundaries for pagination.
 * 3. Extract the recipes belonging to the requested page.
 * 4. Hydrate incomplete recipes with full metadata.
 * 5. Replace placeholder recipes inside state with hydrated versions.
 * 6. Return the final hydrated page data.
 */
export const getSearchResultsPage = async function (page = state.search.page) {
  /**
   * Synchronize the active page index with application state.
   */
  state.search.page = page;

  /**
   * Calculate pagination boundaries.
   */
  const start = (page - 1) * state.search.resultsPerPage;

  const end = page * state.search.resultsPerPage;

  /**
   * Extract the recipes belonging to the requested page.
   */
  const pageMeals = state.search.results.slice(start, end);

  /**
   * Hydrate incomplete recipes before rendering.
   *
   * This guarantees that all visible recipes contain
   * complete metadata and ingredient information.
   */
  const hydratedPage = await hydrateMeals(pageMeals);

  /**
   * Synchronize hydrated recipes back into the centralized state.
   *
   * This prevents redundant hydration requests during future renders.
   */
  state.search.results.splice(start, hydratedPage.length, ...hydratedPage);

  /**
   * Return the fully hydrated page data.
   */
  return hydratedPage;
};

/**
 * updateServings
 * Recalculates ingredient quantities based on a new serving size.
 *
 * Purpose:
 * - Dynamically scales recipe ingredient amounts.
 * - Keeps ingredient proportions mathematically consistent
 *   when the user increases or decreases servings.
 *
 * @param {number} newServings
 * The updated serving count selected by the user.
 *
 * Workflow:
 * 1. Iterate through all recipe ingredients.
 * 2. Skip ingredients without numeric quantities.
 * 3. Recalculate each ingredient amount proportionally.
 * 4. Update the recipe serving count in state.
 *
 * Formula:
 * newAmount = (currentAmount * newServings) / currentServings
 *
 * State Mutations:
 * - state.recipe.ingredients[].amount
 * - state.recipe.servings
 */
export const updateServings = function (newServings) {
  /**
   * Recalculate ingredient quantities proportionally
   * based on the updated serving size.
   */
  state.recipe.ingredients.forEach((ing) => {
    /**
     * Skip ingredients that do not contain
     * measurable numeric quantities.
     */
    if (ing.amount === null) return;

    /**
     * Scale ingredient quantity relative
     * to the previous serving count.
     */
    ing.amount = (ing.amount * newServings) / state.recipe.servings;
  });

  /**
   * Synchronize the updated serving count
   * with the centralized recipe state.
   */
  state.recipe.servings = newServings;
};

/**
 * persistBookmarks
 * Saves the current bookmarks state to the browser's localStorage.
 *
 * Storage Strategy:
 * - Serializes the bookmarks array into a JSON string.
 * - Stores it under a fixed localStorage key.
 *
 * Side Effects:
 * - Writes to browser localStorage (synchronous operation).
 */
const persistBookmarks = function () {
  /**
   * Convert bookmarks array into a JSON string
   * and store it in localStorage for persistence.
   */
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

/**
 * addBookmark
 * Adds a recipe to the bookmarks list and synchronizes bookmark state
 * across all relevant parts of the application.
 * @param {Object} recipe
 * The recipe object to be bookmarked.
 *
 * State Synchronization:
 * - Updates global bookmarks array
 * - Updates current recipe bookmark flag (if applicable)
 * - Updates search results bookmark status (if present)
 *
 * Side Effects:
 * - Triggers persistence layer update (localStorage)
 */
export const addBookmark = function (recipe) {
  // Add recipe to global bookmarks state.
  state.bookmarks.push(recipe);
  // If the bookmarked recipe is currently being viewed,
  // mark it as bookmarked in the active recipe state.
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // Synchronize bookmark status inside search results.
  // This ensures UI icons remain consistent.
  const searchIndex = state.search.results.findIndex(
    (res) => res.id === recipe.id,
  );

  if (searchIndex !== -1) {
    state.search.results[searchIndex].bookmarked = true;
  }

  // Persist updated bookmarks to localStorage.
  persistBookmarks();
};

/**
 * deleteBookmark
 * Removes a recipe from the bookmarks list and synchronizes
 * bookmark state across the application.
 * @param {string} id
 * The unique identifier of the recipe to be removed from bookmarks.
 *
 * State Synchronization:
 * - Removes item from state.bookmarks
 * - Updates current recipe bookmark flag (if applicable)
 * - Updates search results bookmark status (if present)
 *
 * Side Effects:
 * - Updates browser localStorage via persistBookmarks()
 */
export const deleteBookmark = function (id) {
  // Find the bookmark index inside global state.
  const index = state.bookmarks.findIndex((el) => el.id === id);

  // Remove bookmark if it exists in state.
  if (index !== -1) state.bookmarks.splice(index, 1);

  // Update active recipe bookmark state if needed.
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  // Synchronize bookmark status inside search results.
  const searchIndex = state.search.results.findIndex((el) => el.id === id);

  if (searchIndex !== -1) {
    state.search.results[searchIndex].bookmarked = false;
  }

  // Persist updated bookmarks to localStorage.
  persistBookmarks();
};

/**
 * init
 * Initializes the application bookmarks state from persistent storage.
 *
 * Logic Flow:
 * 1. Read stored bookmarks from localStorage.
 * 2. Validate existence of stored data.
 * 3. Parse JSON string into usable JavaScript objects.
 * 4. Inject restored data into application state.
 *
 * Side Effects:
 * - Mutates state.bookmarks during application startup.
 */
const init = function () {
  // Retrieve persisted bookmarks from localStorage.
  const storage = localStorage.getItem("bookmarks");

  // If stored data exists, parse and restore it into state.
  if (storage) state.bookmarks = JSON.parse(storage);
};

// Immediately initialize bookmarks state on module load.
init();

/**
 * uploadRecipe
 * Handles creation and upload of a new user-generated recipe to the backend,
 * then synchronizes the result into application state and bookmarks.
 * @param {Object} newRecipe
 * Raw recipe object coming from the form submission layer.
 *
 * Logic Flow:
 * 1. Transform dynamic ingredient fields into structured array format.
 * 2. Build a database-compatible recipe object.
 * 3. Insert recipe into Supabase database.
 * 4. Map returned database record into application state format.
 * 5. Update global recipe state.
 * 6. Automatically add the new recipe to bookmarks.
 *
 * Error Handling:
 * - Propagates errors to controller layer for UI handling.
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    /**
     * Transform form-based ingredient inputs into structured array format.
     *
     * Expected input format:
     * @param {Object} newRecipe
     * Raw recipe object coming from the form submission layer.
     *
     * Logic Flow:
     * 1. Transform dynamic ingredient fields into structured array format.
     *
     * quantity-1, unit-1, description-1 ...
     *
     * Output format:
     * [{ amount, unit, ingredient }, ...]
     */
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => entry[0].startsWith("quantity") && entry[1] !== "")
      .map((entry) => {
        const ingNum = entry[0].split("-")[1];

        return {
          amount: entry[1] ? +entry[1] : null,
          unit: newRecipe[`unit-${ingNum}`],
          ingredient: newRecipe[`description-${ingNum}`],
        };
      });

    // Build database-compatible recipe object.
    // Field names must match Supabase schema.
    const recipe = {
      title: newRecipe.title,
      category: newRecipe.category,
      source_url: newRecipe.sourceUrl,
      image: newRecipe.image,
      publisher: newRecipe.publisher,
      country: newRecipe.country,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    // Insert new recipe into Supabase database.
    const { data, error } = await supabase
      .from("recipes")
      .insert([recipe])
      .select();

    if (error) throw error;
    // Extract returned database record.
    const rawRecipe = data[0];
    // Normalize database response into application state format.
    state.recipe = {
      id: rawRecipe.id,
      title: rawRecipe.title,
      publisher: rawRecipe.publisher,
      cookingTime: rawRecipe.cooking_time,
      image: rawRecipe.image,
      ingredients: rawRecipe.ingredients,
      servings: rawRecipe.servings,
      sourceUrl: rawRecipe.source_url,
      country: rawRecipe.country,
      category: rawRecipe.category,
      instructions: rawRecipe.instructions || "No instructions provided",
      videoUrl: rawRecipe.video_url || "",
      difficulty: "Medium",
    };
    // Automatically add newly created recipe to bookmarks.
    addBookmark(state.recipe);
    // Debug logs for development monitoring.
    console.log("State Bookmark status:", state.recipe.bookmarked);
    console.log("Bookmarks Array:", state.bookmarks);
  } catch (error) {
    throw error;
  }
};
