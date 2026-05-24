class SearchView {
  #parentEl = document.querySelector(".hero__searchbar");
  #resultsSection = document.querySelector(".recipes__results");

  getQuery() {
    const query = this.#parentEl.querySelector(".hero__searchbar__input").value;
    this.#clearInput();
    return query;
  }

  #clearInput() {
    this.#parentEl.querySelector(".hero__searchbar__input").value = "";
  }

  addHandlerSearch(handler) {
    this.#parentEl.addEventListener(
      "submit",
      function (e) {
        e.preventDefault();
        this.#resultsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        handler();
      }.bind(this),
    );
  }
}

export default new SearchView();
