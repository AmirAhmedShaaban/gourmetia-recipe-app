import View from "./view";

class PaginationView extends View {
  _parentEl = document.querySelector(".pagination");

  addHandlerClick(handler) {
    this._parentEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn-pag");
      if (!btn) return;
      console.log(btn);
      const goToPage = +btn.dataset.goto;
      console.log(goToPage);
      handler(goToPage);
    });
  }

  _generateMarkup() {
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage,
    );
    const curPage = this._data.page;
    console.log(numPages);

    // Page 1, There are other pages
    if (curPage === 1 && numPages > 1) {
      return `
       <button data-goto='${curPage + 1}'  class="btn btn-secondary btn-pag ms-auto">
        <div
          class="d-flex align-items-center justify-content-center gap-2"
        >
          <span>Page ${curPage + 1}</span>
          <i class="fa-solid fa-arrow-right"></i>
        </div>
       </button>
      `;
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return `
      <button data-goto='${curPage - 1}' class="btn btn-secondary btn-pag me-auto">
        <div
          class="d-flex align-items-center justify-content-center gap-2"
        >
          <i class="fa-solid fa-arrow-left"></i>
          <span>Page ${curPage - 1}</span>
        </div>
      </button>
      `;
    }
    // Other pages
    if (curPage < numPages) {
      return `
      <button data-goto='${curPage - 1}' class="btn btn-secondary btn-pag me-auto">
        <div
          class="d-flex align-items-center justify-content-center gap-2"
        >
          <i class="fa-solid fa-arrow-left"></i>
          <span>Page ${curPage - 1}</span>
        </div>
      </button>
      <button data-goto='${curPage + 1}' class="btn btn-secondary btn-pag ms-auto">
        <div
          class="d-flex align-items-center justify-content-center gap-2"
        >
          <span>Page ${curPage + 1}</span>
          <i class="fa-solid fa-arrow-right"></i>
        </div>
      </button>
      `;
    }

    // Page 1, No other pages
    return ``;
  }
}

export default new PaginationView();
