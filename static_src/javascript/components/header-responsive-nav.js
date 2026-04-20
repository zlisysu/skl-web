class HeaderResponsiveNav {
    static selector() {
        return '[data-responsive-header]';
    }

    constructor(node) {
        this.node = node;
        this.bar = node.querySelector('[data-header-bar]');
        this.logo = node.querySelector('[data-header-logo]');
        this.primaryNav = node.querySelector('[data-header-primary-nav]');
        this.primaryNavList = this.primaryNav?.querySelector('.header-nav-list');
        this.mobileMenu = node.querySelector('[data-mobile-menu-content]');
        this.mobileMenuToggle = node.querySelector('[data-mobile-menu-toggle]');
        this.raf = null;

        if (!this.bar || !this.logo || !this.primaryNav || !this.primaryNavList) {
            return;
        }

        this.node.dataset.responsiveHeaderReady = 'true';
        this.resizeObserver = new ResizeObserver(() => this.scheduleUpdate());
        this.resizeObserver.observe(this.node);
        this.resizeObserver.observe(this.bar);
        this.resizeObserver.observe(this.logo);
        this.resizeObserver.observe(this.primaryNavList);

        if (document.fonts?.ready) {
            document.fonts.ready.then(() => this.scheduleUpdate());
        }

        window.addEventListener('resize', () => this.scheduleUpdate(), { passive: true });
        this.scheduleUpdate();
        window.setTimeout(() => this.scheduleUpdate(), 50);
        window.setTimeout(() => this.scheduleUpdate(), 250);
    }

    scheduleUpdate() {
        if (this.raf) {
            window.cancelAnimationFrame(this.raf);
        }

        this.raf = window.requestAnimationFrame(() => {
            this.raf = null;
            this.update();
        });
    }

    update() {
        const wasCollapsed = this.node.classList.contains('site-header--collapsed');
        this.setState(this.fitsPrimaryNav() ? 'normal' : 'collapsed', wasCollapsed);
    }

    setState(state, wasCollapsed = this.node.classList.contains('site-header--collapsed')) {
        this.node.dataset.responsiveHeaderState = state;
        this.node.classList.toggle('site-header--collapsed', state === 'collapsed');

        if (wasCollapsed && state !== 'collapsed') {
            this.closeMobileMenu();
        }
    }

    fitsPrimaryNav() {
        const wasCollapsed = this.node.classList.contains('site-header--collapsed');

        if (wasCollapsed) {
            this.node.classList.remove('site-header--collapsed');
        }

        try {
            const barStyle = window.getComputedStyle(this.bar);
            const paddingLeft = parseFloat(barStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(barStyle.paddingRight) || 0;
            const gap = parseFloat(barStyle.columnGap || barStyle.gap) || 0;
            const availableWidth = this.bar.clientWidth - paddingLeft - paddingRight;
            const logoWidth = this.logo.getBoundingClientRect().width;
            const navWidth = this.primaryNavList.scrollWidth;
            const requiredWidth = Math.ceil(logoWidth + navWidth + gap);

            return requiredWidth <= availableWidth + 1;
        } finally {
            if (wasCollapsed) {
                this.node.classList.add('site-header--collapsed');
            }
        }
    }

    closeMobileMenu() {
        this.mobileMenuToggle?.classList.remove('mobile-menu-is-open');
        this.logo?.classList.remove('mobile-menu-is-open');
        this.mobileMenuToggle?.setAttribute('aria-expanded', 'false');
        this.mobileMenuToggle?.setAttribute('aria-label', 'Open navigation menu');
        document.body.classList.remove('no-scroll');
        document.body.style.overflowY = 'visible';

        if (this.mobileMenu) {
            this.mobileMenu.classList.add('invisible');
            this.mobileMenu.classList.add('translate-x-full');
            this.mobileMenu.classList.remove('translate-x-0');
        }
    }
}

export default HeaderResponsiveNav;
