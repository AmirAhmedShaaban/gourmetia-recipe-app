import View from "./view";

class AddRecipeView extends View {
  _parentEl = document.querySelector(".modal-content");
  _message = "Recipe was successfully uploaded :)";
  _modalEl = document.getElementById("addRecipeModal");
  _modalInstance = new bootstrap.Modal(this._modalEl);

  toggleWindow() {
    this._modalInstance.toggle();
  }

  hideWindow() {
    this._modalInstance.hide();
  }

  showWindow() {
    this._modalInstance.show();
  }

  addHandlerUpload(handler) {
    this._parentEl.addEventListener("submit", function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      handler(data);
    });
  }

  _generateMarkup() {
    return `
          <!-- Header -->
          <div class="modal-header">
            <h5 class="modal-title" id="addRecipeModalLabel">
              <div
                class="d-flex align-items-center justify-content-between gap-2"
              >
                <span>
                  <i class="fs-5 text-primary fa-solid fa-utensils"></i>
                </span>
                <span>Add New Recipe</span>
              </div>
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <!-- Recipe Info -->
            <p
              class="text-uppercase text-muted fw-semibold"
              style="font-size: 11px; letter-spacing: 0.08em"
            >
              Recipe Info
            </p>
            <div class="row g-3">
              <div class="col-12">
                <label for="recipeTitle" class="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  class="form-control"
                  id="recipeTitle"
                  value="Classic Carbonara"
                  placeholder="e.g. Classic Carbonara"
                />
              </div>
              <div class="col-12">
                <label for="recipeTitle" class="form-label">Category</label>
                <input
                  type="text"
                  name="category"
                  class="form-control"
                  id="recipeTitle"
                  value="Beef"
                  placeholder="e.g. Beef"
                />
              </div>
              <div class="col-12">
                <label for="recipeUrl" class="form-label">Recipe URL</label>
                <input
                  type="url"
                  name="sourceUrl"
                  class="form-control"
                  id="recipeUrl"
                  value="https://example.com/recipe"
                  placeholder="https://..."
                />
              </div>
              <div class="col-12">
                <label for="recipeImage" class="form-label">Image URL</label>
                <input
                  type="url"
                  name="image"
                  class="form-control"
                  id="recipeImage"
                  value="https://example.com/image.jpg"
                  placeholder="https://..."
                />
              </div>
              <div class="col-12">
                <label for="recipePublisher" class="form-label"
                  >Publisher</label
                >
                <input
                  type="text"
                  name="publisher"
                  class="form-control"
                  id="recipePublisher"
                  value="NYT Cooking"
                  placeholder="e.g. NYT Cooking"
                />
              </div>
              <div class="col-12">
                <label for="recipePublisher" class="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  class="form-control"
                  id="recipeCountry"
                  value="United Kingdom"
                  placeholder="e.g. United Kingdom"
                />
              </div>

              <div class="col-6">
                <label for="recipePrep" class="form-label"
                  >Prep Time (min)</label
                >
                <input
                  type="number"
                  name="cookingTime"
                  class="form-control"
                  id="recipePrep"
                  value="30"
                  placeholder="e.g. 30"
                  min="0"
                />
              </div>
              <div class="col-6">
                <label for="recipeServings" class="form-label">Servings</label>
                <input
                  type="number"
                  name="servings"
                  class="form-control"
                  id="recipeServings"
                  value="4"
                  placeholder="e.g. 4"
                  min="1"
                />
              </div>
            </div>

            <!-- Ingredients -->
            <p
              class="text-uppercase text-muted fw-semibold mt-4 mb-2"
              style="font-size: 11px; letter-spacing: 0.08em"
            >
              Ingredients
            </p>

            <!-- Column Labels -->
            <div class="d-flex gap-2 mb-1" style="padding-left: 30px">
              <span class="text-muted" style="width: 70px; font-size: 11px"
                >Quantity</span
              >
              <span class="text-muted" style="width: 90px; font-size: 11px"
                >Unit</span
              >
              <span class="text-muted" style="flex: 1; font-size: 11px"
                >Description</span
              >
            </div>

            <!-- Ingredient Rows -->
            <div id="ingredientsList">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="ing-num">1</span>
                <input
                  type="number"
                  name="quantity-1"
                  class="form-control"
                  style="width: 70px; flex-shrink: 0"
                  value="2"
                  placeholder="2"
                />
                <input
                  type="text"
                  name="unit-1"
                  class="form-control"
                  style="width: 90px; flex-shrink: 0"
                  value="cups"
                  placeholder="cups"
                />
                <input
                  type="text"
                  name="description-1"
                  class="form-control"
                  style="flex: 1"
                  value="flour"
                  placeholder="flour"
                />
              </div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="ing-num">2</span>
                <input
                  type="number"
                  name="quantity-2"
                  class="form-control"
                  style="width: 70px; flex-shrink: 0"
                  value="100"
                  placeholder="100"
                />
                <input
                  type="text"
                  name="unit-2"
                  class="form-control"
                  style="width: 90px; flex-shrink: 0"
                  value="g"
                  placeholder="g"
                />
                <input
                  type="text"
                  name="description-2"
                  class="form-control"
                  style="flex: 1"
                  value="pancetta"
                  placeholder="pancetta"
                />
              </div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="ing-num">3</span>
                <input
                  type="number"
                  name="quantity-3"
                  class="form-control"
                  style="width: 70px; flex-shrink: 0"
                  value="3"
                  placeholder="3"
                />
                <input
                  type="text"
                  name="unit-3"
                  class="form-control"
                  style="width: 90px; flex-shrink: 0"
                  value="tbsp"
                  placeholder="tbsp"
                />
                <input
                  type="text"
                  name="description-3"
                  class="form-control"
                  style="flex: 1"
                  value="olive oil"
                  placeholder="olive oil"
                />
              </div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="ing-num">4</span>
                <input
                  type="number"
                  name="quantity-4"
                  class="form-control"
                  style="width: 70px; flex-shrink: 0"
                  value="1"
                  placeholder="1"
                />
                <input
                  type="text"
                  name="unit-4"
                  class="form-control"
                  style="width: 90px; flex-shrink: 0"
                  value="tsp"
                  placeholder="tsp"
                />
                <input
                  type="text"
                  name="description-4"
                  class="form-control"
                  style="flex: 1"
                  value="salt"
                  placeholder="salt"
                />
              </div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="ing-num">5</span>
                <input
                  type="number"
                  name="quantity-5"
                  class="form-control"
                  style="width: 70px; flex-shrink: 0"
                  value="2"
                  placeholder="2"
                />
                <input
                  type="text"
                  name="unit-5"
                  class="form-control"
                  style="width: 90px; flex-shrink: 0"
                  value="cloves"
                  placeholder="cloves"
                />
                <input
                  type="text"
                  name="description-5"
                  class="form-control"
                  style="flex: 1"
                  value="garlic"
                  placeholder="garlic"
                />
              </div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="ing-num">6</span>
                <input
                  type="number"
                  name="quantity-6"
                  class="form-control"
                  style="width: 70px; flex-shrink: 0"
                  value="50"
                  placeholder="50"
                />
                <input
                  type="text"
                  name="unit-6"
                  class="form-control"
                  style="width: 90px; flex-shrink: 0"
                  value="g"
                  placeholder="g"
                />
                <input
                  type="text"
                  name="description-6"
                  class="form-control"
                  style="flex: 1"
                  value="parmesan"
                  placeholder="parmesan"
                />
              </div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="ing-num">7</span>
                <input
                  type="number"
                  name="quantity-6"
                  class="form-control"
                  style="width: 70px; flex-shrink: 0"
                  value=""
                  placeholder="3"
                />
                <input
                  type="text"
                  name="unit-6"
                  class="form-control"
                  style="width: 90px; flex-shrink: 0"
                  value="Pinch"
                  placeholder="Pinch"
                />
                <input
                  type="text"
                  name="description-6"
                  class="form-control"
                  style="flex: 1"
                  value="salt"
                  placeholder="Salt"
                />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer justify-content-between">
            <button
              type="button"
              class="btn btn-outline-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-secondary">Add Recipe</button>
          </div>
    `;
  }
}

export default new AddRecipeView();
