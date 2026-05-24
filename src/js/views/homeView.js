import View from "./view";
import { homeLogo } from "../icons";

class HomeView extends View {
  _parentEl = document.querySelector(".recipes__results");
  _logoContainer = document.querySelector(".home-logo");
  _pagination = document.querySelector(".pagination");

  constructor() {
    super();
    this._injectLogoImmediately();
  }

  _injectLogoImmediately() {
    if (this._logoContainer) {
      this._logoContainer.innerHTML = homeLogo("#fe571a", 700, 700);
    }
  }

  clearPagination() {
    this._pagination.innerHTML = "";
  }

  // render() {
  //   const markup = this._generateMarkup();
  //   this._clear();
  //   this._parentEl.insertAdjacentHTML("afterbegin", markup);
  // }

  _generateMarkup() {
    return `
    <div class="bg-white container">
      <div
        class="mb-5 d-flex gap-3 align-items-center justify-content-center"
      >
        <i
          class="fa-solid fa-face-laugh-beam fs-2 fw-bold text-primary"
        ></i>
        <p class="mb-0 fs-5">
          <strong class="fs-4">
            Hungry for a
            <span class="text-primary fw-bolder"
              >Masterpiece?</span
            > </strong
          ><br />
          <span class="fw-bold">
            Step into the kitchen of your dreams—search for a recipe, an
            ingredient or one of the categories above and let the magic
            begin!</span
          >
        </p>
      </div>
    </div>
    <div class="home-logo d-flex align-items-center justify-content-center">
      ${homeLogo("#fe571a", 700, 700)}
    </div>

    `;
  }
}

export default new HomeView();
