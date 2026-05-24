import View from "./view";

class FooterCategoryView extends View {
  _parentEl = document.querySelector(".footer-categories");

  _allowedCategories = [
    { name: "Beef", emoji: "🥩" },
    { name: "Chicken", emoji: "🍗" },
    { name: "Dessert", emoji: "🎂" },
    { name: "Pasta", emoji: "🍝" },
    { name: "Seafood", emoji: "🦞" },
    { name: "Side", emoji: "🍳" },
    { name: "Vegan", emoji: "🌱" },
    { name: "Vegetarian", emoji: "🍀" },
    { name: "Breakfast", emoji: "🥐" },
  ];

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }

  addHandlerClick(handler) {
    this._parentEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".category-pill");
      if (!btn) return;

      handler(btn.dataset.category);
    });
  }

  _generateMarkup() {
    return this._data
      .filter((cat) =>
        this._allowedCategories.some(
          (item) => item.name.toLowerCase() === cat.name.toLowerCase(),
        ),
      )
      .map((cat) => this._generateMarkupCategory(cat))
      .join("");
  }

  _generateMarkupCategory(cat) {
    const categoryData = this._allowedCategories.find(
      (item) => item.name.toLowerCase() === cat.name.toLowerCase(),
    );

    const emojiMarkup = categoryData.emoji;

    return `
      <a href='#home' data-category="${cat.name}" class="category-pill">
        ${emojiMarkup} ${cat.name}
      </a>
    `;
  }
}
export default new FooterCategoryView();
