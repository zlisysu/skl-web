/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./static_src/sass/main.scss":
/*!***********************************!*\
  !*** ./static_src/sass/main.scss ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./static_src/javascript/components/header-responsive-nav.js":
/*!*******************************************************************!*\
  !*** ./static_src/javascript/components/header-responsive-nav.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HeaderResponsiveNav);


/***/ }),

/***/ "./static_src/javascript/components/header-search-panel.js":
/*!*****************************************************************!*\
  !*** ./static_src/javascript/components/header-search-panel.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./static_src/javascript/components/utils.js");


class HeaderSearch {
    static selector() {
        return '[data-toggle-search-panel]';
    }

    constructor(node) {
        this.searchToggleButton = node;

        this.searchDropdown = document.querySelector('[data-search-panel]');
        this.searchDropdownContent = document.querySelector(
            '[data-search-content]',
        );
        this.searchInput = this.searchDropdown.querySelector(
            '[data-search-input]',
        );
        this.navigationMenuItems = document.querySelectorAll(
            '[data-desktop-nav-item]',
        );

        this.bindEvents();
    }

    openSearch() {
        (0,_utils__WEBPACK_IMPORTED_MODULE_0__.showDropdownElement)(this.searchDropdown);

        // Make sure that the page is not scrollable.
        document.body.style.overflowY = 'hidden';

        // Focus on the input.
        this.searchInput.focus();
    }

    closeSearch() {
        (0,_utils__WEBPACK_IMPORTED_MODULE_0__.hideDropdownElement)(this.searchDropdown);

        // Set the page to be scrollable.
        document.body.style.overflowY = 'visible';
    }

    bindEvents() {
        this.searchToggleButton.addEventListener('click', (e) => {
            e.preventDefault();

            if (this.searchDropdown.classList.contains('invisible')) {
                this.openSearch();
            } else {
                this.closeSearch();
            }
        });

        this.searchDropdown.addEventListener('click', (e) => {
            // Close the dropdown if clicking anywhere else on the page
            if (!this.searchDropdownContent.contains(e.target)) {
                this.closeSearch();
            }
        });
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HeaderSearch);


/***/ }),

/***/ "./static_src/javascript/components/home-news-carousel.js":
/*!****************************************************************!*\
  !*** ./static_src/javascript/components/home-news-carousel.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HomeNewsCarousel);


/***/ }),

/***/ "./static_src/javascript/components/mobile-menu.js":
/*!*********************************************************!*\
  !*** ./static_src/javascript/components/mobile-menu.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./static_src/javascript/components/utils.js");


class MobileMenu {
    static selector() {
        return '[data-mobile-menu-toggle]';
    }

    constructor(node) {
        this.node = node;
        this.body = document.querySelector('body');
        this.mobileMenu = document.querySelector('[data-mobile-menu-content]');
        this.headerLogo = document.querySelector('[data-header-logo]');

        this.bindEventListeners();
    }

    bindEventListeners() {
        this.node.addEventListener('click', () => {
            if (this.mobileMenu.classList.contains('invisible')) {
                this.open();
            } else {
                this.close();
            }
        });
    }

    open() {
        // Set the menu button to be a cross.
        this.node.classList.add('mobile-menu-is-open');
        this.headerLogo.classList.add('mobile-menu-is-open');
        this.node.setAttribute('aria-expanded', 'true');
        this.node.setAttribute('aria-label', 'close navigation menu');
        this.body.classList.add('no-scroll');

        // Make sure that the page is not scrollable. Only the drawer.
        document.body.style.overflowY = 'hidden';

        // Open the mobile menu. Mobile menu slides from the right.
        this.mobileMenu.classList.remove('invisible');
        this.mobileMenu.classList.remove('translate-x-full');
        this.mobileMenu.classList.add('translate-x-0');

        // Focus on the first link in the mobile menu.
        const firstItem = this.mobileMenu.querySelector('a');
        firstItem?.focus();
    }

    close() {
        // Set the cross button to be a menu button.
        this.node.classList.remove('mobile-menu-is-open');
        this.headerLogo.classList.remove('mobile-menu-is-open');
        this.node.setAttribute('aria-expanded', 'false');
        this.node.setAttribute('aria-label', 'Open navigation menu');
        this.body.classList.remove('no-scroll');

        // Set the page to be scrollable.
        document.body.style.overflowY = 'visible';

        // Close the mobile menu.
        this.mobileMenu.classList.add('invisible');
        this.mobileMenu.classList.add('translate-x-full');
        this.mobileMenu.classList.remove('translate-x-0');
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MobileMenu);


/***/ }),

/***/ "./static_src/javascript/components/skip-link.js":
/*!*******************************************************!*\
  !*** ./static_src/javascript/components/skip-link.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class SkipLink {
    static selector() {
        return '[data-skip-link]';
    }

    constructor(node) {
        this.skipLink = node;
        this.main = document.querySelector('main');

        if (this.skipLink && this.main) {
            this.skipLink.addEventListener('click', () => this.handleClick());
        }
    }

    handleClick() {
        this.main.setAttribute('tabindex', -1);
        this.main.addEventListener('blur', () => this.handleBlur());
        this.main.addEventListener('focusout', () => this.handleBlur());
        this.main.focus();
    }

    handleBlur() {
        this.main.removeAttribute('tabindex');
        this.main.removeEventListener('blur', this.handleBlur);
        this.main.removeEventListener('focusout', this.handleBlur);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SkipLink);


/***/ }),

/***/ "./static_src/javascript/components/theme-toggle.js":
/*!**********************************************************!*\
  !*** ./static_src/javascript/components/theme-toggle.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class ThemeToggle {
    static selector() {
        return '[data-theme-toggle]';
    }
    
    constructor(node) {
        this.toggleSwitch = node;
        this.currentTheme = localStorage.getItem('theme');

        if (this.currentTheme) {
            document.documentElement.classList.add('theme', this.currentTheme);
            if (this.currentTheme === 'dark') {
                this.toggleSwitch.checked = true;
            }
        }
        this.bindEvents()
    }

    bindEvents() {
        this.toggleSwitch.addEventListener('change', this.switchTheme, false);
    }

    switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.classList.add('theme', 'dark');
            document.documentElement.classList.remove('theme', 'light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.add('theme', 'light');
            document.documentElement.classList.remove('theme', 'dark');
            localStorage.setItem('theme', 'light');
        }
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ThemeToggle);

/***/ }),

/***/ "./static_src/javascript/components/utils.js":
/*!***************************************************!*\
  !*** ./static_src/javascript/components/utils.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hideDropdownElement: () => (/* binding */ hideDropdownElement),
/* harmony export */   isMobileOperatingSystem: () => (/* binding */ isMobileOperatingSystem),
/* harmony export */   showDropdownElement: () => (/* binding */ showDropdownElement)
/* harmony export */ });
/**
 * Hides a dropdown element, used in desktop navigation dropdowns and the search dropdown.
 */
const hideDropdownElement = (element) => {
    element.classList.add('invisible');
    element.classList.add('-translate-y-2');
    element.classList.remove('translate-y-0');
};

/**
 * Shows a dropdown element, used in desktop navigation dropdowns and the search dropdown.
 */
const showDropdownElement = (element) => {
    element.classList.remove('invisible');
    element.classList.remove('-translate-y-2');
    element.classList.add('translate-y-0');
};

/**
 * Determine if the client is using a mobile operating system based off
 * regex matching OS names and the client's user agent.
 * Returns true if user agent matches 'iOS', 'Android' or 'Windows Phone'.
 *
 * @returns {boolean}
 */
const isMobileOperatingSystem = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return true;
    }

    if (/android/i.test(userAgent)) {
        return true;
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return true;
    }

    return false;
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!***************************************!*\
  !*** ./static_src/javascript/main.js ***!
  \***************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_theme_toggle__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/theme-toggle */ "./static_src/javascript/components/theme-toggle.js");
/* harmony import */ var _components_header_search_panel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/header-search-panel */ "./static_src/javascript/components/header-search-panel.js");
/* harmony import */ var _components_header_responsive_nav__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/header-responsive-nav */ "./static_src/javascript/components/header-responsive-nav.js");
/* harmony import */ var _components_home_news_carousel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/home-news-carousel */ "./static_src/javascript/components/home-news-carousel.js");
/* harmony import */ var _components_mobile_menu__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/mobile-menu */ "./static_src/javascript/components/mobile-menu.js");
/* harmony import */ var _components_skip_link__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/skip-link */ "./static_src/javascript/components/skip-link.js");
/* harmony import */ var _sass_main_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../sass/main.scss */ "./static_src/sass/main.scss");










function initComponent(ComponentClass) {
    const items = document.querySelectorAll(ComponentClass.selector());
    items.forEach((item) => {
        try {
            new ComponentClass(item);
        } catch (error) {
            console.error(`${ComponentClass.name} failed to initialise`, error);
        }
    });
}

function initApp() {
    initComponent(_components_header_responsive_nav__WEBPACK_IMPORTED_MODULE_2__["default"]);
    initComponent(_components_home_news_carousel__WEBPACK_IMPORTED_MODULE_3__["default"]);
    initComponent(_components_theme_toggle__WEBPACK_IMPORTED_MODULE_0__["default"]);
    initComponent(_components_skip_link__WEBPACK_IMPORTED_MODULE_5__["default"]);
    initComponent(_components_header_search_panel__WEBPACK_IMPORTED_MODULE_1__["default"]);
    initComponent(_components_mobile_menu__WEBPACK_IMPORTED_MODULE_4__["default"]);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
    initApp();
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMvbWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEseUVBQXlFLGVBQWU7QUFDeEY7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxtQkFBbUIsRUFBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ3RHZ0M7O0FBRW5FO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLFFBQVEsMkRBQW1COztBQUUzQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFFBQVEsMkRBQW1COztBQUUzQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBLGlFQUFlLFlBQVksRUFBQzs7Ozs7Ozs7Ozs7Ozs7O0FDN0Q1QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTOztBQUVUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUVBQWUsZ0JBQWdCLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5RmM7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUVBQWUsVUFBVSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNqRTFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlFQUFlLFFBQVEsRUFBQzs7Ozs7Ozs7Ozs7Ozs7O0FDNUJ4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlFQUFlLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuQzFCO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ087QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztVQzNDQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTm9EO0FBQ2E7QUFDSTtBQUNOO0FBQ2I7QUFDSjs7QUFFbkI7OztBQUczQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLDZCQUE2QixxQkFBcUI7QUFDbEQ7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQSxrQkFBa0IseUVBQW1CO0FBQ3JDLGtCQUFrQixzRUFBZ0I7QUFDbEMsa0JBQWtCLGdFQUFXO0FBQzdCLGtCQUFrQiw2REFBUTtBQUMxQixrQkFBa0IsdUVBQWlCO0FBQ25DLGtCQUFrQiwrREFBVTtBQUM1Qjs7QUFFQTtBQUNBLDZEQUE2RCxZQUFZO0FBQ3pFLEVBQUU7QUFDRjtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC8uL3N0YXRpY19zcmMvc2Fzcy9tYWluLnNjc3M/YWMzYSIsIndlYnBhY2s6Ly93YWd0YWlsLXN0YXJ0ZXIta2l0Ly4vc3RhdGljX3NyYy9qYXZhc2NyaXB0L2NvbXBvbmVudHMvaGVhZGVyLXJlc3BvbnNpdmUtbmF2LmpzIiwid2VicGFjazovL3dhZ3RhaWwtc3RhcnRlci1raXQvLi9zdGF0aWNfc3JjL2phdmFzY3JpcHQvY29tcG9uZW50cy9oZWFkZXItc2VhcmNoLXBhbmVsLmpzIiwid2VicGFjazovL3dhZ3RhaWwtc3RhcnRlci1raXQvLi9zdGF0aWNfc3JjL2phdmFzY3JpcHQvY29tcG9uZW50cy9ob21lLW5ld3MtY2Fyb3VzZWwuanMiLCJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC8uL3N0YXRpY19zcmMvamF2YXNjcmlwdC9jb21wb25lbnRzL21vYmlsZS1tZW51LmpzIiwid2VicGFjazovL3dhZ3RhaWwtc3RhcnRlci1raXQvLi9zdGF0aWNfc3JjL2phdmFzY3JpcHQvY29tcG9uZW50cy9za2lwLWxpbmsuanMiLCJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC8uL3N0YXRpY19zcmMvamF2YXNjcmlwdC9jb21wb25lbnRzL3RoZW1lLXRvZ2dsZS5qcyIsIndlYnBhY2s6Ly93YWd0YWlsLXN0YXJ0ZXIta2l0Ly4vc3RhdGljX3NyYy9qYXZhc2NyaXB0L2NvbXBvbmVudHMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93YWd0YWlsLXN0YXJ0ZXIta2l0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93YWd0YWlsLXN0YXJ0ZXIta2l0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dhZ3RhaWwtc3RhcnRlci1raXQvLi9zdGF0aWNfc3JjL2phdmFzY3JpcHQvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCJjbGFzcyBIZWFkZXJSZXNwb25zaXZlTmF2IHtcbiAgICBzdGF0aWMgc2VsZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiAnW2RhdGEtcmVzcG9uc2l2ZS1oZWFkZXJdJztcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihub2RlKSB7XG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuYmFyID0gbm9kZS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1oZWFkZXItYmFyXScpO1xuICAgICAgICB0aGlzLmxvZ28gPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWhlYWRlci1sb2dvXScpO1xuICAgICAgICB0aGlzLnByaW1hcnlOYXYgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWhlYWRlci1wcmltYXJ5LW5hdl0nKTtcbiAgICAgICAgdGhpcy5wcmltYXJ5TmF2TGlzdCA9IHRoaXMucHJpbWFyeU5hdj8ucXVlcnlTZWxlY3RvcignLmhlYWRlci1uYXYtbGlzdCcpO1xuICAgICAgICB0aGlzLm1vYmlsZU1lbnUgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1vYmlsZS1tZW51LWNvbnRlbnRdJyk7XG4gICAgICAgIHRoaXMubW9iaWxlTWVudVRvZ2dsZSA9IG5vZGUucXVlcnlTZWxlY3RvcignW2RhdGEtbW9iaWxlLW1lbnUtdG9nZ2xlXScpO1xuICAgICAgICB0aGlzLnJhZiA9IG51bGw7XG5cbiAgICAgICAgaWYgKCF0aGlzLmJhciB8fCAhdGhpcy5sb2dvIHx8ICF0aGlzLnByaW1hcnlOYXYgfHwgIXRoaXMucHJpbWFyeU5hdkxpc3QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubm9kZS5kYXRhc2V0LnJlc3BvbnNpdmVIZWFkZXJSZWFkeSA9ICd0cnVlJztcbiAgICAgICAgdGhpcy5yZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB0aGlzLnNjaGVkdWxlVXBkYXRlKCkpO1xuICAgICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5yZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMuYmFyKTtcbiAgICAgICAgdGhpcy5yZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMubG9nbyk7XG4gICAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLnByaW1hcnlOYXZMaXN0KTtcblxuICAgICAgICBpZiAoZG9jdW1lbnQuZm9udHM/LnJlYWR5KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5mb250cy5yZWFkeS50aGVuKCgpID0+IHRoaXMuc2NoZWR1bGVVcGRhdGUoKSk7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4gdGhpcy5zY2hlZHVsZVVwZGF0ZSgpLCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVVcGRhdGUoKTtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gdGhpcy5zY2hlZHVsZVVwZGF0ZSgpLCA1MCk7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHRoaXMuc2NoZWR1bGVVcGRhdGUoKSwgMjUwKTtcbiAgICB9XG5cbiAgICBzY2hlZHVsZVVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucmFmKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yYWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmFmID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgY29uc3Qgd2FzQ29sbGFwc2VkID0gdGhpcy5ub2RlLmNsYXNzTGlzdC5jb250YWlucygnc2l0ZS1oZWFkZXItLWNvbGxhcHNlZCcpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMuZml0c1ByaW1hcnlOYXYoKSA/ICdub3JtYWwnIDogJ2NvbGxhcHNlZCcsIHdhc0NvbGxhcHNlZCk7XG4gICAgfVxuXG4gICAgc2V0U3RhdGUoc3RhdGUsIHdhc0NvbGxhcHNlZCA9IHRoaXMubm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ3NpdGUtaGVhZGVyLS1jb2xsYXBzZWQnKSkge1xuICAgICAgICB0aGlzLm5vZGUuZGF0YXNldC5yZXNwb25zaXZlSGVhZGVyU3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgdGhpcy5ub2RlLmNsYXNzTGlzdC50b2dnbGUoJ3NpdGUtaGVhZGVyLS1jb2xsYXBzZWQnLCBzdGF0ZSA9PT0gJ2NvbGxhcHNlZCcpO1xuXG4gICAgICAgIGlmICh3YXNDb2xsYXBzZWQgJiYgc3RhdGUgIT09ICdjb2xsYXBzZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlTW9iaWxlTWVudSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZml0c1ByaW1hcnlOYXYoKSB7XG4gICAgICAgIGNvbnN0IHdhc0NvbGxhcHNlZCA9IHRoaXMubm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ3NpdGUtaGVhZGVyLS1jb2xsYXBzZWQnKTtcblxuICAgICAgICBpZiAod2FzQ29sbGFwc2VkKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnc2l0ZS1oZWFkZXItLWNvbGxhcHNlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJhclN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5iYXIpO1xuICAgICAgICAgICAgY29uc3QgcGFkZGluZ0xlZnQgPSBwYXJzZUZsb2F0KGJhclN0eWxlLnBhZGRpbmdMZWZ0KSB8fCAwO1xuICAgICAgICAgICAgY29uc3QgcGFkZGluZ1JpZ2h0ID0gcGFyc2VGbG9hdChiYXJTdHlsZS5wYWRkaW5nUmlnaHQpIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBnYXAgPSBwYXJzZUZsb2F0KGJhclN0eWxlLmNvbHVtbkdhcCB8fCBiYXJTdHlsZS5nYXApIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBhdmFpbGFibGVXaWR0aCA9IHRoaXMuYmFyLmNsaWVudFdpZHRoIC0gcGFkZGluZ0xlZnQgLSBwYWRkaW5nUmlnaHQ7XG4gICAgICAgICAgICBjb25zdCBsb2dvV2lkdGggPSB0aGlzLmxvZ28uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgICAgICBjb25zdCBuYXZXaWR0aCA9IHRoaXMucHJpbWFyeU5hdkxpc3Quc2Nyb2xsV2lkdGg7XG4gICAgICAgICAgICBjb25zdCByZXF1aXJlZFdpZHRoID0gTWF0aC5jZWlsKGxvZ29XaWR0aCArIG5hdldpZHRoICsgZ2FwKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlcXVpcmVkV2lkdGggPD0gYXZhaWxhYmxlV2lkdGggKyAxO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKHdhc0NvbGxhcHNlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKCdzaXRlLWhlYWRlci0tY29sbGFwc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbG9zZU1vYmlsZU1lbnUoKSB7XG4gICAgICAgIHRoaXMubW9iaWxlTWVudVRvZ2dsZT8uY2xhc3NMaXN0LnJlbW92ZSgnbW9iaWxlLW1lbnUtaXMtb3BlbicpO1xuICAgICAgICB0aGlzLmxvZ28/LmNsYXNzTGlzdC5yZW1vdmUoJ21vYmlsZS1tZW51LWlzLW9wZW4nKTtcbiAgICAgICAgdGhpcy5tb2JpbGVNZW51VG9nZ2xlPy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgdGhpcy5tb2JpbGVNZW51VG9nZ2xlPy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnT3BlbiBuYXZpZ2F0aW9uIG1lbnUnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCduby1zY3JvbGwnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSc7XG5cbiAgICAgICAgaWYgKHRoaXMubW9iaWxlTWVudSkge1xuICAgICAgICAgICAgdGhpcy5tb2JpbGVNZW51LmNsYXNzTGlzdC5hZGQoJ2ludmlzaWJsZScpO1xuICAgICAgICAgICAgdGhpcy5tb2JpbGVNZW51LmNsYXNzTGlzdC5hZGQoJ3RyYW5zbGF0ZS14LWZ1bGwnKTtcbiAgICAgICAgICAgIHRoaXMubW9iaWxlTWVudS5jbGFzc0xpc3QucmVtb3ZlKCd0cmFuc2xhdGUteC0wJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEhlYWRlclJlc3BvbnNpdmVOYXY7XG4iLCJpbXBvcnQgeyBoaWRlRHJvcGRvd25FbGVtZW50LCBzaG93RHJvcGRvd25FbGVtZW50IH0gZnJvbSAnLi91dGlscyc7XG5cbmNsYXNzIEhlYWRlclNlYXJjaCB7XG4gICAgc3RhdGljIHNlbGVjdG9yKCkge1xuICAgICAgICByZXR1cm4gJ1tkYXRhLXRvZ2dsZS1zZWFyY2gtcGFuZWxdJztcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihub2RlKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoVG9nZ2xlQnV0dG9uID0gbm9kZTtcblxuICAgICAgICB0aGlzLnNlYXJjaERyb3Bkb3duID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtc2VhcmNoLXBhbmVsXScpO1xuICAgICAgICB0aGlzLnNlYXJjaERyb3Bkb3duQ29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnW2RhdGEtc2VhcmNoLWNvbnRlbnRdJyxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zZWFyY2hJbnB1dCA9IHRoaXMuc2VhcmNoRHJvcGRvd24ucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICdbZGF0YS1zZWFyY2gtaW5wdXRdJyxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5uYXZpZ2F0aW9uTWVudUl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICdbZGF0YS1kZXNrdG9wLW5hdi1pdGVtXScsXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5iaW5kRXZlbnRzKCk7XG4gICAgfVxuXG4gICAgb3BlblNlYXJjaCgpIHtcbiAgICAgICAgc2hvd0Ryb3Bkb3duRWxlbWVudCh0aGlzLnNlYXJjaERyb3Bkb3duKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgcGFnZSBpcyBub3Qgc2Nyb2xsYWJsZS5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJztcblxuICAgICAgICAvLyBGb2N1cyBvbiB0aGUgaW5wdXQuXG4gICAgICAgIHRoaXMuc2VhcmNoSW5wdXQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBjbG9zZVNlYXJjaCgpIHtcbiAgICAgICAgaGlkZURyb3Bkb3duRWxlbWVudCh0aGlzLnNlYXJjaERyb3Bkb3duKTtcblxuICAgICAgICAvLyBTZXQgdGhlIHBhZ2UgdG8gYmUgc2Nyb2xsYWJsZS5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSc7XG4gICAgfVxuXG4gICAgYmluZEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5zZWFyY2hUb2dnbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zZWFyY2hEcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoJ2ludmlzaWJsZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuU2VhcmNoKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VTZWFyY2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZWFyY2hEcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICAvLyBDbG9zZSB0aGUgZHJvcGRvd24gaWYgY2xpY2tpbmcgYW55d2hlcmUgZWxzZSBvbiB0aGUgcGFnZVxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlYXJjaERyb3Bkb3duQ29udGVudC5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlU2VhcmNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSGVhZGVyU2VhcmNoO1xuIiwiY2xhc3MgSG9tZU5ld3NDYXJvdXNlbCB7XG4gICAgc3RhdGljIHNlbGVjdG9yKCkge1xuICAgICAgICByZXR1cm4gJ1tkYXRhLWhvbWUtbmV3cy1jYXJvdXNlbF0nO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICAgICAgdGhpcy5zbGlkZXMgPSBbLi4ubm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1ob21lLW5ld3Mtc2xpZGVdJyldO1xuICAgICAgICB0aGlzLml0ZW1zID0gWy4uLm5vZGUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtaG9tZS1uZXdzLWl0ZW1dJyldO1xuICAgICAgICB0aGlzLmRvdHMgPSBbLi4ubm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1ob21lLW5ld3MtZG90XScpXTtcbiAgICAgICAgdGhpcy5hY3RpdmVJbmRleCA9IHRoaXMuaXRlbXMuZmluZEluZGV4KChpdGVtKSA9PiBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpO1xuICAgICAgICB0aGlzLmludGVydmFsSWQgPSBudWxsO1xuICAgICAgICB0aGlzLmRlbGF5ID0gNDgwMDtcblxuICAgICAgICBpZiAoIXRoaXMuc2xpZGVzLmxlbmd0aCB8fCB0aGlzLnNsaWRlcy5sZW5ndGggIT09IHRoaXMuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gdGhpcy5hY3RpdmVJbmRleCA+PSAwID8gdGhpcy5hY3RpdmVJbmRleCA6IDA7XG4gICAgICAgIHRoaXMuYmluZEV2ZW50cygpO1xuICAgICAgICB0aGlzLnNldEFjdGl2ZSh0aGlzLmFjdGl2ZUluZGV4KTtcbiAgICAgICAgdGhpcy5zdGFydEF1dG9QbGF5KCk7XG4gICAgfVxuXG4gICAgYmluZEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmUodGhpcy5nZXRJbmRleChpdGVtKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0YXJ0QXV0b1BsYXkoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmRvdHMuZm9yRWFjaCgoZG90KSA9PiB7XG4gICAgICAgICAgICBkb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmUodGhpcy5nZXRJbmRleChkb3QpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RhcnRBdXRvUGxheSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gdGhpcy5zdG9wQXV0b1BsYXkoKSk7XG4gICAgICAgIHRoaXMubm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4gdGhpcy5zdGFydEF1dG9QbGF5KCkpO1xuICAgIH1cblxuICAgIGdldEluZGV4KG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIE51bWJlci5wYXJzZUludChub2RlLmRhdGFzZXQuc2xpZGVJbmRleCB8fCAnMCcsIDEwKSB8fCAwO1xuICAgIH1cblxuICAgIHNldEFjdGl2ZShpbmRleCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgdGhpcy5zbGlkZXMuZm9yRWFjaCgoc2xpZGUsIHNsaWRlSW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzQWN0aXZlID0gc2xpZGVJbmRleCA9PT0gaW5kZXg7XG4gICAgICAgICAgICBzbGlkZS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnLCBpc0FjdGl2ZSk7XG4gICAgICAgICAgICBzbGlkZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgaXNBY3RpdmUgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJywgaXRlbUluZGV4ID09PSBpbmRleCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZG90cy5mb3JFYWNoKChkb3QsIGRvdEluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpc0FjdGl2ZSA9IGRvdEluZGV4ID09PSBpbmRleDtcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnLCBpc0FjdGl2ZSk7XG4gICAgICAgICAgICBkb3Quc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBpc0FjdGl2ZSA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBuZXh0KCkge1xuICAgICAgICB0aGlzLnNldEFjdGl2ZSgodGhpcy5hY3RpdmVJbmRleCArIDEpICUgdGhpcy5zbGlkZXMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBzdGFydEF1dG9QbGF5KCkge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnZhbElkIHx8IHRoaXMuc2xpZGVzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB0aGlzLm5leHQoKSwgdGhpcy5kZWxheSk7XG4gICAgfVxuXG4gICAgc3RvcEF1dG9QbGF5KCkge1xuICAgICAgICBpZiAoIXRoaXMuaW50ZXJ2YWxJZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgdGhpcy5pbnRlcnZhbElkID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXN0YXJ0QXV0b1BsYXkoKSB7XG4gICAgICAgIHRoaXMuc3RvcEF1dG9QbGF5KCk7XG4gICAgICAgIHRoaXMuc3RhcnRBdXRvUGxheSgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSG9tZU5ld3NDYXJvdXNlbDtcbiIsImltcG9ydCB7IGhpZGVEcm9wZG93bkVsZW1lbnQgfSBmcm9tICcuL3V0aWxzJztcblxuY2xhc3MgTW9iaWxlTWVudSB7XG4gICAgc3RhdGljIHNlbGVjdG9yKCkge1xuICAgICAgICByZXR1cm4gJ1tkYXRhLW1vYmlsZS1tZW51LXRvZ2dsZV0nO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICAgICAgdGhpcy5ib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgICAgICB0aGlzLm1vYmlsZU1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1tb2JpbGUtbWVudS1jb250ZW50XScpO1xuICAgICAgICB0aGlzLmhlYWRlckxvZ28gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1oZWFkZXItbG9nb10nKTtcblxuICAgICAgICB0aGlzLmJpbmRFdmVudExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIGJpbmRFdmVudExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMubW9iaWxlTWVudS5jbGFzc0xpc3QuY29udGFpbnMoJ2ludmlzaWJsZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3BlbigpIHtcbiAgICAgICAgLy8gU2V0IHRoZSBtZW51IGJ1dHRvbiB0byBiZSBhIGNyb3NzLlxuICAgICAgICB0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCgnbW9iaWxlLW1lbnUtaXMtb3BlbicpO1xuICAgICAgICB0aGlzLmhlYWRlckxvZ28uY2xhc3NMaXN0LmFkZCgnbW9iaWxlLW1lbnUtaXMtb3BlbicpO1xuICAgICAgICB0aGlzLm5vZGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy5ub2RlLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdjbG9zZSBuYXZpZ2F0aW9uIG1lbnUnKTtcbiAgICAgICAgdGhpcy5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLXNjcm9sbCcpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBwYWdlIGlzIG5vdCBzY3JvbGxhYmxlLiBPbmx5IHRoZSBkcmF3ZXIuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3dZID0gJ2hpZGRlbic7XG5cbiAgICAgICAgLy8gT3BlbiB0aGUgbW9iaWxlIG1lbnUuIE1vYmlsZSBtZW51IHNsaWRlcyBmcm9tIHRoZSByaWdodC5cbiAgICAgICAgdGhpcy5tb2JpbGVNZW51LmNsYXNzTGlzdC5yZW1vdmUoJ2ludmlzaWJsZScpO1xuICAgICAgICB0aGlzLm1vYmlsZU1lbnUuY2xhc3NMaXN0LnJlbW92ZSgndHJhbnNsYXRlLXgtZnVsbCcpO1xuICAgICAgICB0aGlzLm1vYmlsZU1lbnUuY2xhc3NMaXN0LmFkZCgndHJhbnNsYXRlLXgtMCcpO1xuXG4gICAgICAgIC8vIEZvY3VzIG9uIHRoZSBmaXJzdCBsaW5rIGluIHRoZSBtb2JpbGUgbWVudS5cbiAgICAgICAgY29uc3QgZmlyc3RJdGVtID0gdGhpcy5tb2JpbGVNZW51LnF1ZXJ5U2VsZWN0b3IoJ2EnKTtcbiAgICAgICAgZmlyc3RJdGVtPy5mb2N1cygpO1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICAvLyBTZXQgdGhlIGNyb3NzIGJ1dHRvbiB0byBiZSBhIG1lbnUgYnV0dG9uLlxuICAgICAgICB0aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnbW9iaWxlLW1lbnUtaXMtb3BlbicpO1xuICAgICAgICB0aGlzLmhlYWRlckxvZ28uY2xhc3NMaXN0LnJlbW92ZSgnbW9iaWxlLW1lbnUtaXMtb3BlbicpO1xuICAgICAgICB0aGlzLm5vZGUuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG4gICAgICAgIHRoaXMubm9kZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnT3BlbiBuYXZpZ2F0aW9uIG1lbnUnKTtcbiAgICAgICAgdGhpcy5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ25vLXNjcm9sbCcpO1xuXG4gICAgICAgIC8vIFNldCB0aGUgcGFnZSB0byBiZSBzY3JvbGxhYmxlLlxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93WSA9ICd2aXNpYmxlJztcblxuICAgICAgICAvLyBDbG9zZSB0aGUgbW9iaWxlIG1lbnUuXG4gICAgICAgIHRoaXMubW9iaWxlTWVudS5jbGFzc0xpc3QuYWRkKCdpbnZpc2libGUnKTtcbiAgICAgICAgdGhpcy5tb2JpbGVNZW51LmNsYXNzTGlzdC5hZGQoJ3RyYW5zbGF0ZS14LWZ1bGwnKTtcbiAgICAgICAgdGhpcy5tb2JpbGVNZW51LmNsYXNzTGlzdC5yZW1vdmUoJ3RyYW5zbGF0ZS14LTAnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1vYmlsZU1lbnU7XG4iLCJjbGFzcyBTa2lwTGluayB7XG4gICAgc3RhdGljIHNlbGVjdG9yKCkge1xuICAgICAgICByZXR1cm4gJ1tkYXRhLXNraXAtbGlua10nO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICAgICAgdGhpcy5za2lwTGluayA9IG5vZGU7XG4gICAgICAgIHRoaXMubWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21haW4nKTtcblxuICAgICAgICBpZiAodGhpcy5za2lwTGluayAmJiB0aGlzLm1haW4pIHtcbiAgICAgICAgICAgIHRoaXMuc2tpcExpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmhhbmRsZUNsaWNrKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2soKSB7XG4gICAgICAgIHRoaXMubWFpbi5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgLTEpO1xuICAgICAgICB0aGlzLm1haW4uYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHRoaXMuaGFuZGxlQmx1cigpKTtcbiAgICAgICAgdGhpcy5tYWluLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgKCkgPT4gdGhpcy5oYW5kbGVCbHVyKCkpO1xuICAgICAgICB0aGlzLm1haW4uZm9jdXMoKTtcbiAgICB9XG5cbiAgICBoYW5kbGVCbHVyKCkge1xuICAgICAgICB0aGlzLm1haW4ucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgICAgICB0aGlzLm1haW4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuaGFuZGxlQmx1cik7XG4gICAgICAgIHRoaXMubWFpbi5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuaGFuZGxlQmx1cik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTa2lwTGluaztcbiIsImNsYXNzIFRoZW1lVG9nZ2xlIHtcbiAgICBzdGF0aWMgc2VsZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiAnW2RhdGEtdGhlbWUtdG9nZ2xlXSc7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICAgICAgdGhpcy50b2dnbGVTd2l0Y2ggPSBub2RlO1xuICAgICAgICB0aGlzLmN1cnJlbnRUaGVtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0aGVtZScpO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRUaGVtZSkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RoZW1lJywgdGhpcy5jdXJyZW50VGhlbWUpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFRoZW1lID09PSAnZGFyaycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZVN3aXRjaC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJpbmRFdmVudHMoKVxuICAgIH1cblxuICAgIGJpbmRFdmVudHMoKSB7XG4gICAgICAgIHRoaXMudG9nZ2xlU3dpdGNoLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuc3dpdGNoVGhlbWUsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBzd2l0Y2hUaGVtZShlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC5jaGVja2VkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndGhlbWUnLCAnZGFyaycpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3RoZW1lJywgJ2xpZ2h0Jyk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGhlbWUnLCAnZGFyaycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RoZW1lJywgJ2xpZ2h0Jyk7XG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUnLCAnZGFyaycpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RoZW1lJywgJ2xpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRoZW1lVG9nZ2xlOyIsIi8qKlxuICogSGlkZXMgYSBkcm9wZG93biBlbGVtZW50LCB1c2VkIGluIGRlc2t0b3AgbmF2aWdhdGlvbiBkcm9wZG93bnMgYW5kIHRoZSBzZWFyY2ggZHJvcGRvd24uXG4gKi9cbmV4cG9ydCBjb25zdCBoaWRlRHJvcGRvd25FbGVtZW50ID0gKGVsZW1lbnQpID0+IHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ludmlzaWJsZScpO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnLXRyYW5zbGF0ZS15LTInKTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3RyYW5zbGF0ZS15LTAnKTtcbn07XG5cbi8qKlxuICogU2hvd3MgYSBkcm9wZG93biBlbGVtZW50LCB1c2VkIGluIGRlc2t0b3AgbmF2aWdhdGlvbiBkcm9wZG93bnMgYW5kIHRoZSBzZWFyY2ggZHJvcGRvd24uXG4gKi9cbmV4cG9ydCBjb25zdCBzaG93RHJvcGRvd25FbGVtZW50ID0gKGVsZW1lbnQpID0+IHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ludmlzaWJsZScpO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnLXRyYW5zbGF0ZS15LTInKTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RyYW5zbGF0ZS15LTAnKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHRoZSBjbGllbnQgaXMgdXNpbmcgYSBtb2JpbGUgb3BlcmF0aW5nIHN5c3RlbSBiYXNlZCBvZmZcbiAqIHJlZ2V4IG1hdGNoaW5nIE9TIG5hbWVzIGFuZCB0aGUgY2xpZW50J3MgdXNlciBhZ2VudC5cbiAqIFJldHVybnMgdHJ1ZSBpZiB1c2VyIGFnZW50IG1hdGNoZXMgJ2lPUycsICdBbmRyb2lkJyBvciAnV2luZG93cyBQaG9uZScuXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBjb25zdCBpc01vYmlsZU9wZXJhdGluZ1N5c3RlbSA9ICgpID0+IHtcbiAgICBjb25zdCB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgd2luZG93Lm9wZXJhO1xuXG4gICAgLy8gV2luZG93cyBQaG9uZSBtdXN0IGNvbWUgZmlyc3QgYmVjYXVzZSBpdHMgVUEgYWxzbyBjb250YWlucyBcIkFuZHJvaWRcIlxuICAgIGlmICgvd2luZG93cyBwaG9uZS9pLnRlc3QodXNlckFnZW50KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoL2FuZHJvaWQvaS50ZXN0KHVzZXJBZ2VudCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gaU9TIGRldGVjdGlvbiBmcm9tOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS85MDM5ODg1LzE3NzcxMFxuICAgIGlmICgvaVBhZHxpUGhvbmV8aVBvZC8udGVzdCh1c2VyQWdlbnQpICYmICF3aW5kb3cuTVNTdHJlYW0pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IFRoZW1lVG9nZ2xlIGZyb20gXCIuL2NvbXBvbmVudHMvdGhlbWUtdG9nZ2xlXCI7XG5pbXBvcnQgSGVhZGVyU2VhcmNoUGFuZWwgZnJvbSBcIi4vY29tcG9uZW50cy9oZWFkZXItc2VhcmNoLXBhbmVsXCI7XG5pbXBvcnQgSGVhZGVyUmVzcG9uc2l2ZU5hdiBmcm9tIFwiLi9jb21wb25lbnRzL2hlYWRlci1yZXNwb25zaXZlLW5hdlwiO1xuaW1wb3J0IEhvbWVOZXdzQ2Fyb3VzZWwgZnJvbSBcIi4vY29tcG9uZW50cy9ob21lLW5ld3MtY2Fyb3VzZWxcIjtcbmltcG9ydCBNb2JpbGVNZW51IGZyb20gXCIuL2NvbXBvbmVudHMvbW9iaWxlLW1lbnVcIjtcbmltcG9ydCBTa2lwTGluayBmcm9tICcuL2NvbXBvbmVudHMvc2tpcC1saW5rJztcblxuaW1wb3J0ICcuLi9zYXNzL21haW4uc2Nzcyc7XG5cblxuZnVuY3Rpb24gaW5pdENvbXBvbmVudChDb21wb25lbnRDbGFzcykge1xuICAgIGNvbnN0IGl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChDb21wb25lbnRDbGFzcy5zZWxlY3RvcigpKTtcbiAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXcgQ29tcG9uZW50Q2xhc3MoaXRlbSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke0NvbXBvbmVudENsYXNzLm5hbWV9IGZhaWxlZCB0byBpbml0aWFsaXNlYCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGluaXRBcHAoKSB7XG4gICAgaW5pdENvbXBvbmVudChIZWFkZXJSZXNwb25zaXZlTmF2KTtcbiAgICBpbml0Q29tcG9uZW50KEhvbWVOZXdzQ2Fyb3VzZWwpO1xuICAgIGluaXRDb21wb25lbnQoVGhlbWVUb2dnbGUpO1xuICAgIGluaXRDb21wb25lbnQoU2tpcExpbmspO1xuICAgIGluaXRDb21wb25lbnQoSGVhZGVyU2VhcmNoUGFuZWwpO1xuICAgIGluaXRDb21wb25lbnQoTW9iaWxlTWVudSk7XG59XG5cbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdEFwcCwgeyBvbmNlOiB0cnVlIH0pO1xufSBlbHNlIHtcbiAgICBpbml0QXBwKCk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=