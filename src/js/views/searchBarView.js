class SearchBarView {
  #parentEl = document.querySelector(".searchbar-popup");
  #resultsSection = document.querySelector(".recipes__results");
  #openBtn = document.querySelector(".searchbar-glass");
  #searchPopup = document.querySelector(".searchbar-overlay");

  constructor() {
    this.#addHandlerPopupOpen();
    this.#addHandlerPopupClose();
  }

  #addHandlerPopupOpen() {
    this.#openBtn.addEventListener("click", () => {
      this.#searchPopup.classList.remove("hidden");
      document.querySelector(".searchbar-popup__input").focus();
      document.body.style.overflow = "hidden";
    });
  }

  #addHandlerPopupClose() {
    this.#searchPopup.addEventListener("click", (e) => {
      if (e.target === this.#searchPopup) {
        this.#closePopup();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        !this.#searchPopup.classList.contains("hidden")
      ) {
        this.#closePopup();
      }
    });
  }

  #closePopup() {
    this.#searchPopup.classList.add("hidden");
    document.body.style.overflow = "auto";
  }

  getQuery() {
    const query = this.#parentEl.querySelector(".searchbar-popup__input").value;
    this.#clearInput();
    return query;
  }

  #clearInput() {
    this.#parentEl.querySelector(".searchbar-popup__input").value = "";
  }

  addHandlerSearch(handler) {
    this.#parentEl.addEventListener(
      "submit",
      function (e) {
        e.preventDefault();
        window.location.hash = "home";
        this.#searchPopup.classList.add("hidden");
        document.body.style.overflow = "auto";
        setTimeout(() => {
          this.#resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
        handler();
      }.bind(this),
    );
  }
}

export default new SearchBarView();
