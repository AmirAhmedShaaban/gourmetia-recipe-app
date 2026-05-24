import { data } from "autoprefixer";
import View from "./view";
import Fraction from "fraction.js";

class RecipeView extends View {
  _parentEl = document.getElementById("recipe-page");

  addHandlerRender(handler) {
    ["hashchange", "load"].forEach((ev) =>
      window.addEventListener(ev, handler),
    );
  }

  addHandlerUpdateServings(handler) {
    this._parentEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--update-servings");
      if (!btn) return;
      console.log(btn);
      const { updateTo } = btn.dataset;
      if (+updateTo > 0) handler(+updateTo);
    });
  }

  addHandlerAddBookmark(handler) {
    this._parentEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--bookmark");
      if (!btn) return;
      handler();
    });
  }

  _generateMarkup() {
    return `
    <div class="recipe-load">
        <div class="container my-4 py-5">
          <div class="row">
            <div class="col-12 col-lg-5">
              <img
                class="recipe-load__img rounded"
                src="${this._data.image}"
                alt="${this._data.title}"
              />
            </div>
            <div class="col-12 col-lg-7">
              <div class="recipe-load__data mx-0 mx-lg-5 my-3">
                <p class="text-primary fw-bold mb-2">${this._data.category}</p>
                <p class="text-black fs-2 fw-bold mb-4">
                  ${this._data.title}
                </p>
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div class="d-flex flex-column gap-1">
                    <div
                      class="d-flex gap-2 align-items-center justify-content-center"
                    >
                      <i class="fa-solid fa-clock text-body-secondary fs-5"></i>
                      <p class="m-0 fw-bold text-black">${this._data.cookingTime} min</p>
                    </div>
                    <p class="m-0 text-body-secondary fw-bold">Cooking Time</p>
                  </div>
                  <div class="d-flex flex-column gap-1">
                    <div
                      class="d-flex gap-2 align-items-center justify-content-center"
                    >
                      <i class="fa-solid fa-globe text-body-secondary fs-5"></i>
                      <p class="m-0 fw-bold text-black">${this._data.country}</p>
                    </div>
                    <p class="m-0 text-body-secondary fw-bold">Cuisine</p>
                  </div>
                  <div class="d-flex flex-column gap-1">
                    <div
                      class="d-flex gap-2 align-items-center justify-content-center"
                    >
                      <i
                        class="fa-solid fa-utensils text-body-secondary fs-5"
                      ></i>
                      <p class="m-0 fw-bold text-black">Serves ${this._data.servings}</p>
                    </div>
                    <p class="m-0 text-body-secondary fw-bold">Serving</p>
                  </div>
                  <div class="d-flex flex-column gap-1">
                    <div
                      class="d-flex gap-2 align-items-center justify-content-center"
                    >
                      <i class="fa-solid fa-crown text-body-secondary fs-5"></i>
                      <p class="m-0 fw-bold text-black">${this._data.difficulty}</p>
                    </div>
                    <p class="m-0 text-body-secondary fw-bold">
                      Degree of Difficulty
                    </p>
                  </div>
                </div>
                <div
                  class="mt-5 pt-4 mb-4 pb-4 d-flex justify-content-between align-items-center"
                >
                  <div>
                    <p class="mb-1 text-black fw-bold">${this._data.publisher}</p>
                    <p class="mb-0 text-body-secondary fw-bold">
                      Recipe Publisher
                    </p>
                  </div>
                  <button
                    class="recipes__card__icon-container recipe-load__icon btn--bookmark"
                  >
                    <svg
                      class="recipes__card__icon${this._data.bookmarked ? "-fill" : ""} p-1"
                      height="40px"
                      width="40px"
                      viewBox="0 -0.5 25 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        <path
                          class="recipes__card__icon"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M18.507 19.853V6.034C18.5116 5.49905 18.3034 4.98422 17.9283 4.60277C17.5532 4.22131 17.042 4.00449 16.507 4H8.50705C7.9721 4.00449 7.46085 4.22131 7.08577 4.60277C6.7107 4.98422 6.50252 5.49905 6.50705 6.034V19.853C6.45951 20.252 6.65541 20.6407 7.00441 20.8399C7.35342 21.039 7.78773 21.0099 8.10705 20.766L11.907 17.485C12.2496 17.1758 12.7705 17.1758 13.113 17.485L16.9071 20.767C17.2265 21.0111 17.6611 21.0402 18.0102 20.8407C18.3593 20.6413 18.5551 20.2522 18.507 19.853Z"
                          stroke="#fe571a"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </g>
                    </svg>
                  </button>
                </div>
                <div class="d-flex align-items-center gap-5">
                  <div>
                    <span class="text-body-secondary fs-5">Ingredients</span>
                    <span class="text-black fw-bold fs-5">${this._data.servings} Person(s)</span>
                  </div>
                  <div class="d-flex gap-2">
                    <button data-update-to =${this._data.servings - 1} class="btn btn-secondary m-0 btn--update-servings">
                      <i class="fa-solid fa-minus fw-bold"></i>
                    </button>
                    <button data-update-to =${this._data.servings + 1} class="btn btn-secondary m-0 btn--update-servings">
                      <i class="fa-solid fa-plus fw-bold"></i>
                    </button>
                  </div>
                </div>
                <div class="mt-5">
                  <div class="row row-cols-1 row-cols-md-2 g-3">
                  ${this._data.ingredients.map(this._generateMarkupIngredient).join("")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>`;
  }

  _generateMarkupIngredient(ing) {
    return `
    <div class="col">
      <div class="d-flex align-items-center p-2 border-bottom">
        <i class="fa-solid fa-check text-primary me-3"></i>

        <div
          class="d-flex justify-content-between w-100 align-items-center"
        >
          <span class="fw-bold">${ing.amount ? new Fraction(Math.round(ing.amount * 10) / 10).toFraction(true) : ""} ${ing.unit}</span>
          <span class="text-body-secondary text-end"
            >${ing.ingredient}</span
          >
        </div>
      </div>
    </div>
    `;
  }
}

export default new RecipeView();
