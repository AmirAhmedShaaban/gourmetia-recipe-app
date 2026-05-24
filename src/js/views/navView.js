class NavView {
  _parentEl = document.querySelector(".nav");
  _observer;

  addHandlerSticky(targetEl) {
    if (!targetEl) return;

    const navHeight = this._parentEl.getBoundingClientRect().height;

    const obsCallback = function (entries) {
      const [entry] = entries;
      if (!entry.isIntersecting) this._parentEl.classList.add("sticky");
      else this._parentEl.classList.remove("sticky");
    };

    this._observer = new IntersectionObserver(obsCallback.bind(this), {
      root: null,
      threshold: 0,
      rootMargin: `-${navHeight}px`,
    });

    this._observer.observe(targetEl);
  }

  disableSticky() {
    this._parentEl.classList.remove("sticky");
    if (this._observer) this._observer.disconnect();
  }
}

export default new NavView();
