import View from "./view";

class ResultsView extends View {
  _parentEl = document.querySelector(".recipes__results");

  addHandlerAddBookmark(handler) {
    this._parentEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--bookmark");
      if (!btn) return;
      const { id } = btn.dataset;
      e.stopPropagation();

      handler(id);
    });
  }

  _generateMarkup() {
    console.log(this._data);
    return `
     <div class="recipes__cards container pt-3 my-5">
        <div class="recipes__cards__container row row-cols-md-4 g-4">
         ${this._data.map(this._generateMarkupPreview).join("")}
        </div>
      </div>
    `;
  }

  _generateMarkupPreview(result) {
    return `
     <div class="col-12 col-sm-6 col-md-4 col-lg-3 card-col">
       <button data-id='${result.id}'
          class="recipes__card__icon-container btn--bookmark"
        >
          <svg
            class="recipes__card__icon${result.bookmarked ? "-fill" : ""} p-1"
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
        <a href="#recipes/${result.id}">
          <div class="recipes__card rounded">
            <img
              class="recipes__img rounded"
              src="${result.image}"
              alt="${result.title}"
            />
          </div>
          <p class="text-primary mt-3 fw-bold mb-0">${result.category}</p>
          <p class="text-black fw-bolder fs-5 mt-2">
            ${result.title}
          </p>
          <div class="d-flex align-items-center gap-4">
            <div class="text-body-secondary">
              <i class="fa-regular fa-clock me-1 text-black"></i
              ><span>${result.cookingTime} min</span>
            </div>
            <div class="text-body-secondary">
              <img 
                src="https://flagcdn.com/w20/${result.countryCode}.png" 
                alt="${result.country}"
                class="mb-1 me-1"
                style="width: 18px; height: 18px; display: inline-block; border-radius: 50%; box-shadow: 0px 1px 2px rgba(0,0,0,0.2);"
              />
              <span>${result.country.length > 9 ? result.country.slice(0, 8) + ".." : result.country}</span>
            </div>
            <div class="text-body-secondary">
              <i class="fa-solid fa-crown me-1 text-black"></i
              ><span>${result.difficulty}</span>
            </div>
          </div></a
        >
      </div>
    `;
  }
}

export default new ResultsView();
