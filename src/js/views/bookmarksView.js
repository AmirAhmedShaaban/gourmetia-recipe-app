import View from "./view";

class BookmarksView extends View {
  _parentEl = document.querySelector(".bookmarks-drop-down__list");

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }

  _generateMarkup() {
    console.log(this._data);
    return this._data.map(this._generateMarkupPreview).join("");
  }

  _generateMarkupPreview(result) {
    return `
      <li class="preview">
        <a class="preview__link" href="#recipes/${result.id}">
          <figure class="preview__fig">
            <img
              src="${result.image}"
              alt="${result.title}"
            />
          </figure>
          <div class="preview__data">
            <h4 class="preview__name">
             ${result.title}
            </h4>
            <p class="preview__author">${result.publisher}</p>
          </div>
        </a>
      </li>
    `;
  }

  renderBookmarkError(
    message = `No bookmarks yet. Find a nice recipe and bookmark it
        :)`,
  ) {
    const markup = `
    <div
      class="d-flex align-items-center justify-content-center gap-3"
      role="alert"
    >
      <i
        class="fa-solid fa-face-laugh-beam text-primary fw-bold fs-2"
      ></i
      ><span class="fw-bold">
       ${message}</span
      >
    </div>

    `;
    this._clear();
    this._parentEl.insertAdjacentHTML("afterbegin", markup);
  }
}

export default new BookmarksView();
