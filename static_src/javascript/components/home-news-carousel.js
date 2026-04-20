class HomeNewsCarousel {
    static selector() {
        return '[data-home-news-carousel]';
    }

    constructor(node) {
        this.node = node;
        this.slides = [...node.querySelectorAll('[data-home-news-slide]')];
        this.items = [...node.querySelectorAll('[data-home-news-item]')];
        this.dots = [...node.querySelectorAll('[data-home-news-dot]')];
        this.activeIndex = this.items.findIndex((item) => item.classList.contains('is-active'));
        this.intervalId = null;
        this.delay = 4800;

        if (!this.slides.length || this.slides.length !== this.items.length) {
            return;
        }

        this.activeIndex = this.activeIndex >= 0 ? this.activeIndex : 0;
        this.bindEvents();
        this.setActive(this.activeIndex);
        this.startAutoPlay();
    }

    bindEvents() {
        this.items.forEach((item) => {
            item.addEventListener('mouseenter', () => {
                this.setActive(this.getIndex(item));
                this.restartAutoPlay();
            });
        });

        this.dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                this.setActive(this.getIndex(dot));
                this.restartAutoPlay();
            });
        });

        this.node.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.node.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    getIndex(node) {
        return Number.parseInt(node.dataset.slideIndex || '0', 10) || 0;
    }

    setActive(index) {
        this.activeIndex = index;

        this.slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === index;
            slide.classList.toggle('is-active', isActive);
            slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        this.items.forEach((item, itemIndex) => {
            item.classList.toggle('is-active', itemIndex === index);
        });

        this.dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === index;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    next() {
        this.setActive((this.activeIndex + 1) % this.slides.length);
    }

    startAutoPlay() {
        if (this.intervalId || this.slides.length < 2) {
            return;
        }

        this.intervalId = window.setInterval(() => this.next(), this.delay);
    }

    stopAutoPlay() {
        if (!this.intervalId) {
            return;
        }

        window.clearInterval(this.intervalId);
        this.intervalId = null;
    }

    restartAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}

export default HomeNewsCarousel;
