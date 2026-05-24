export default class View {
  _data;

  render(data) {
    // if (!data || (Array.isArray(data) && data.length === 0))
    //   return this.renderError("Something went wrong! Please try again later.");

    this._data = data;
    const markup = this._generateMarkup();

    this._clear();
    this._parentEl.insertAdjacentHTML("afterbegin", markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();
    const newDom = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDom.querySelectorAll("*"));
    const curElements = Array.from(this._parentEl.querySelectorAll("*"));

    newElements.forEach((newEL, i) => {
      const curEl = curElements[i];

      // Upadate changed TEXT
      if (
        !newEL.isEqualNode(curEl) &&
        newEL.firstChild?.nodeValue.trim() !== ""
      ) {
        curEl.textContent = newEL.textContent;
      }

      // Update changed ATTRIBUTES
      if (!newEL.isEqualNode(curEl))
        Array.from(newEL.attributes).forEach((attr) =>
          curEl.setAttribute(attr.name, attr.value),
        );
    });
  }

  _clear() {
    this._parentEl.innerHTML = "";
  }

  renderSpinner() {
    const markup = `
    <div class="container">
          <div class="d-flex align-items-center justify-content-center m-5 p-5">
            <div id="wifi-loader">
              <svg class="circle-outer" viewBox="0 0 86 86">
                <circle class="back" cx="43" cy="43" r="40"></circle>
                <circle class="front" cx="43" cy="43" r="40"></circle>
                <circle class="new" cx="43" cy="43" r="40"></circle>
              </svg>
              <svg class="circle-middle" viewBox="0 0 60 60">
                <circle class="back" cx="30" cy="30" r="27"></circle>
                <circle class="front" cx="30" cy="30" r="27"></circle>
              </svg>
              <svg class="circle-inner" viewBox="0 0 34 34">
                <circle class="back" cx="17" cy="17" r="14"></circle>
                <circle class="front" cx="17" cy="17" r="14"></circle>
              </svg>
              <div class="text" data-text="Loading"></div>
            </div>
          </div>
    </div>
      `;
    this._clear();
    this._parentEl.insertAdjacentHTML("afterbegin", markup);
  }

  renderError(message = "Something went wrong! Please try again later.") {
    const markup = `
    <div class="container p-5">
        <div class="mx-5 my-5" role="alert">
          <div class="d-flex align-items-center justify-content-center gap-3">
            <i
              class="fa-solid fa-triangle-exclamation text-danger fw-bold fs-3"
            ></i
            ><span class="fw-bold fs-4">
              ${message}</span
            >
          </div>
        </div>
    </div>
    `;
    this._clear();
    this._parentEl.insertAdjacentHTML("afterbegin", markup);
  }

  renderMessage(message = this._message) {
    const markup = `
    <div class="container p-5">
        <div class="mx-5 my-5" role="alert">
          <div class="d-flex align-items-center justify-content-center gap-3">
            <i
              class="fa-solid fa-face-laugh-beam text-primary fw-bold fs-3"
            ></i>
            <span class="fw-bold fs-4">
              ${message}
            </span>
          </div>
        </div>
    </div>
    `;
    this._clear();
    this._parentEl.insertAdjacentHTML("afterbegin", markup);
  }
}
