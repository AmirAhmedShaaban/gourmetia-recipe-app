import View from "./view";

class CategoryView extends View {
  _parentEl = document.querySelector(".recipes__blocks");
  _allowedCategories = [
    // تم استبدال mx-4 بـ mx-auto لتوسيط الأيقونات تماماً
    {
      cat: "Beef",
      icon: `<i class="fa-solid fa-bacon fs-2 mb-2 mx-auto"></i>`,
    },
    {
      cat: "Chicken",
      icon: `<i class="fa-solid fa-drumstick-bite fs-2 mb-2 mx-auto"></i>`,
    },
    {
      cat: "Dessert",
      icon: `<i class="fa-solid fa-cookie-bite fs-2 mb-2 mx-auto"></i>`,
    },
    {
      cat: "Seafood",
      icon: `<i class="fa-solid fa-fish-fins fs-2 mb-2 mx-auto"></i>`,
    },
    {
      cat: "Pasta",
      icon: `<i class="fa-solid fa-bowl-food fs-2 mb-2 mx-auto"></i>`,
    },
    {
      cat: "Vegan",
      icon: `<i class="fa-solid fa-seedling fs-2 mb-2 mx-auto"></i>`,
    },
    {
      cat: "Vegetarian",
      icon: `<i class="fa-solid fa-leaf fs-2 mb-2 mx-auto"></i>`,
    },
    {
      cat: "Breakfast",
      icon: `<i class="fas fa-bread-slice fs-2 mb-2 mx-auto"></i>`,
    },
    {
      cat: "Side",
      icon: `<i class="fa-solid fa-bowl-rice fs-2 mb-2 mx-auto"></i>`,
    },
  ];

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }

  addHandlerClick(handler) {
    this._parentEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".recipes__block");
      if (!btn) return;
      handler(btn.dataset.category);
    });
  }

  _generateMarkup() {
    return this._data.map((cat) => this._generateMarkupCategory(cat)).join("");
  }

  _generateMarkupCategory(cat) {
    const categoryData = this._allowedCategories.find(
      (item) => item.cat.toLowerCase() === cat.name.toLowerCase(),
    );

    const iconMarkup = categoryData ? categoryData.icon : "";

    return `
      <div data-category="${cat.name}"
        class="recipes__block border border-secondary rounded py-3 px-2 d-flex flex-column justify-content-center text-center"
        style="cursor: pointer; flex: 1 1 calc(50% - 1rem); min-width: 100px; max-width: 130px; min-height: 140px;"
      >
        ${iconMarkup}
        <p class="fs-6 fw-bold mb-0">${cat.name}</p>
        <p class="small mb-0 text-body-secondary">${cat.count} Recipes</p>
      </div>
    `;
  }
}
export default new CategoryView();
