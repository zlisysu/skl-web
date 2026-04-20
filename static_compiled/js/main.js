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
/* harmony import */ var _components_mobile_menu__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/mobile-menu */ "./static_src/javascript/components/mobile-menu.js");
/* harmony import */ var _components_skip_link__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/skip-link */ "./static_src/javascript/components/skip-link.js");
/* harmony import */ var _sass_main_scss__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../sass/main.scss */ "./static_src/sass/main.scss");









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
    initComponent(_components_theme_toggle__WEBPACK_IMPORTED_MODULE_0__["default"]);
    initComponent(_components_skip_link__WEBPACK_IMPORTED_MODULE_4__["default"]);
    initComponent(_components_header_search_panel__WEBPACK_IMPORTED_MODULE_1__["default"]);
    initComponent(_components_mobile_menu__WEBPACK_IMPORTED_MODULE_3__["default"]);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
    initApp();
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QzNDQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOb0Q7QUFDYTtBQUNJO0FBQ25CO0FBQ0o7O0FBRW5COzs7QUFHM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDViw2QkFBNkIscUJBQXFCO0FBQ2xEO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0Esa0JBQWtCLHlFQUFtQjtBQUNyQyxrQkFBa0IsZ0VBQVc7QUFDN0Isa0JBQWtCLDZEQUFRO0FBQzFCLGtCQUFrQix1RUFBaUI7QUFDbkMsa0JBQWtCLCtEQUFVO0FBQzVCOztBQUVBO0FBQ0EsNkRBQTZELFlBQVk7QUFDekUsRUFBRTtBQUNGO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93YWd0YWlsLXN0YXJ0ZXIta2l0Ly4vc3RhdGljX3NyYy9zYXNzL21haW4uc2Nzcz9hYzNhIiwid2VicGFjazovL3dhZ3RhaWwtc3RhcnRlci1raXQvLi9zdGF0aWNfc3JjL2phdmFzY3JpcHQvY29tcG9uZW50cy9oZWFkZXItcmVzcG9uc2l2ZS1uYXYuanMiLCJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC8uL3N0YXRpY19zcmMvamF2YXNjcmlwdC9jb21wb25lbnRzL2hlYWRlci1zZWFyY2gtcGFuZWwuanMiLCJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC8uL3N0YXRpY19zcmMvamF2YXNjcmlwdC9jb21wb25lbnRzL21vYmlsZS1tZW51LmpzIiwid2VicGFjazovL3dhZ3RhaWwtc3RhcnRlci1raXQvLi9zdGF0aWNfc3JjL2phdmFzY3JpcHQvY29tcG9uZW50cy9za2lwLWxpbmsuanMiLCJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC8uL3N0YXRpY19zcmMvamF2YXNjcmlwdC9jb21wb25lbnRzL3RoZW1lLXRvZ2dsZS5qcyIsIndlYnBhY2s6Ly93YWd0YWlsLXN0YXJ0ZXIta2l0Ly4vc3RhdGljX3NyYy9qYXZhc2NyaXB0L2NvbXBvbmVudHMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93YWd0YWlsLXN0YXJ0ZXIta2l0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93YWd0YWlsLXN0YXJ0ZXIta2l0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2FndGFpbC1zdGFydGVyLWtpdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dhZ3RhaWwtc3RhcnRlci1raXQvLi9zdGF0aWNfc3JjL2phdmFzY3JpcHQvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCJjbGFzcyBIZWFkZXJSZXNwb25zaXZlTmF2IHtcbiAgICBzdGF0aWMgc2VsZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiAnW2RhdGEtcmVzcG9uc2l2ZS1oZWFkZXJdJztcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihub2RlKSB7XG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuYmFyID0gbm9kZS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1oZWFkZXItYmFyXScpO1xuICAgICAgICB0aGlzLmxvZ28gPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWhlYWRlci1sb2dvXScpO1xuICAgICAgICB0aGlzLnByaW1hcnlOYXYgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWhlYWRlci1wcmltYXJ5LW5hdl0nKTtcbiAgICAgICAgdGhpcy5wcmltYXJ5TmF2TGlzdCA9IHRoaXMucHJpbWFyeU5hdj8ucXVlcnlTZWxlY3RvcignLmhlYWRlci1uYXYtbGlzdCcpO1xuICAgICAgICB0aGlzLm1vYmlsZU1lbnUgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1vYmlsZS1tZW51LWNvbnRlbnRdJyk7XG4gICAgICAgIHRoaXMubW9iaWxlTWVudVRvZ2dsZSA9IG5vZGUucXVlcnlTZWxlY3RvcignW2RhdGEtbW9iaWxlLW1lbnUtdG9nZ2xlXScpO1xuICAgICAgICB0aGlzLnJhZiA9IG51bGw7XG5cbiAgICAgICAgaWYgKCF0aGlzLmJhciB8fCAhdGhpcy5sb2dvIHx8ICF0aGlzLnByaW1hcnlOYXYgfHwgIXRoaXMucHJpbWFyeU5hdkxpc3QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubm9kZS5kYXRhc2V0LnJlc3BvbnNpdmVIZWFkZXJSZWFkeSA9ICd0cnVlJztcbiAgICAgICAgdGhpcy5yZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB0aGlzLnNjaGVkdWxlVXBkYXRlKCkpO1xuICAgICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5yZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMuYmFyKTtcbiAgICAgICAgdGhpcy5yZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMubG9nbyk7XG4gICAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLnByaW1hcnlOYXZMaXN0KTtcblxuICAgICAgICBpZiAoZG9jdW1lbnQuZm9udHM/LnJlYWR5KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5mb250cy5yZWFkeS50aGVuKCgpID0+IHRoaXMuc2NoZWR1bGVVcGRhdGUoKSk7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4gdGhpcy5zY2hlZHVsZVVwZGF0ZSgpLCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVVcGRhdGUoKTtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gdGhpcy5zY2hlZHVsZVVwZGF0ZSgpLCA1MCk7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHRoaXMuc2NoZWR1bGVVcGRhdGUoKSwgMjUwKTtcbiAgICB9XG5cbiAgICBzY2hlZHVsZVVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucmFmKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yYWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmFmID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgY29uc3Qgd2FzQ29sbGFwc2VkID0gdGhpcy5ub2RlLmNsYXNzTGlzdC5jb250YWlucygnc2l0ZS1oZWFkZXItLWNvbGxhcHNlZCcpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMuZml0c1ByaW1hcnlOYXYoKSA/ICdub3JtYWwnIDogJ2NvbGxhcHNlZCcsIHdhc0NvbGxhcHNlZCk7XG4gICAgfVxuXG4gICAgc2V0U3RhdGUoc3RhdGUsIHdhc0NvbGxhcHNlZCA9IHRoaXMubm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ3NpdGUtaGVhZGVyLS1jb2xsYXBzZWQnKSkge1xuICAgICAgICB0aGlzLm5vZGUuZGF0YXNldC5yZXNwb25zaXZlSGVhZGVyU3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgdGhpcy5ub2RlLmNsYXNzTGlzdC50b2dnbGUoJ3NpdGUtaGVhZGVyLS1jb2xsYXBzZWQnLCBzdGF0ZSA9PT0gJ2NvbGxhcHNlZCcpO1xuXG4gICAgICAgIGlmICh3YXNDb2xsYXBzZWQgJiYgc3RhdGUgIT09ICdjb2xsYXBzZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlTW9iaWxlTWVudSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZml0c1ByaW1hcnlOYXYoKSB7XG4gICAgICAgIGNvbnN0IHdhc0NvbGxhcHNlZCA9IHRoaXMubm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ3NpdGUtaGVhZGVyLS1jb2xsYXBzZWQnKTtcblxuICAgICAgICBpZiAod2FzQ29sbGFwc2VkKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnc2l0ZS1oZWFkZXItLWNvbGxhcHNlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJhclN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5iYXIpO1xuICAgICAgICAgICAgY29uc3QgcGFkZGluZ0xlZnQgPSBwYXJzZUZsb2F0KGJhclN0eWxlLnBhZGRpbmdMZWZ0KSB8fCAwO1xuICAgICAgICAgICAgY29uc3QgcGFkZGluZ1JpZ2h0ID0gcGFyc2VGbG9hdChiYXJTdHlsZS5wYWRkaW5nUmlnaHQpIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBnYXAgPSBwYXJzZUZsb2F0KGJhclN0eWxlLmNvbHVtbkdhcCB8fCBiYXJTdHlsZS5nYXApIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBhdmFpbGFibGVXaWR0aCA9IHRoaXMuYmFyLmNsaWVudFdpZHRoIC0gcGFkZGluZ0xlZnQgLSBwYWRkaW5nUmlnaHQ7XG4gICAgICAgICAgICBjb25zdCBsb2dvV2lkdGggPSB0aGlzLmxvZ28uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgICAgICBjb25zdCBuYXZXaWR0aCA9IHRoaXMucHJpbWFyeU5hdkxpc3Quc2Nyb2xsV2lkdGg7XG4gICAgICAgICAgICBjb25zdCByZXF1aXJlZFdpZHRoID0gTWF0aC5jZWlsKGxvZ29XaWR0aCArIG5hdldpZHRoICsgZ2FwKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlcXVpcmVkV2lkdGggPD0gYXZhaWxhYmxlV2lkdGggKyAxO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKHdhc0NvbGxhcHNlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKCdzaXRlLWhlYWRlci0tY29sbGFwc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbG9zZU1vYmlsZU1lbnUoKSB7XG4gICAgICAgIHRoaXMubW9iaWxlTWVudVRvZ2dsZT8uY2xhc3NMaXN0LnJlbW92ZSgnbW9iaWxlLW1lbnUtaXMtb3BlbicpO1xuICAgICAgICB0aGlzLmxvZ28/LmNsYXNzTGlzdC5yZW1vdmUoJ21vYmlsZS1tZW51LWlzLW9wZW4nKTtcbiAgICAgICAgdGhpcy5tb2JpbGVNZW51VG9nZ2xlPy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgdGhpcy5tb2JpbGVNZW51VG9nZ2xlPy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnT3BlbiBuYXZpZ2F0aW9uIG1lbnUnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCduby1zY3JvbGwnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSc7XG5cbiAgICAgICAgaWYgKHRoaXMubW9iaWxlTWVudSkge1xuICAgICAgICAgICAgdGhpcy5tb2JpbGVNZW51LmNsYXNzTGlzdC5hZGQoJ2ludmlzaWJsZScpO1xuICAgICAgICAgICAgdGhpcy5tb2JpbGVNZW51LmNsYXNzTGlzdC5hZGQoJ3RyYW5zbGF0ZS14LWZ1bGwnKTtcbiAgICAgICAgICAgIHRoaXMubW9iaWxlTWVudS5jbGFzc0xpc3QucmVtb3ZlKCd0cmFuc2xhdGUteC0wJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEhlYWRlclJlc3BvbnNpdmVOYXY7XG4iLCJpbXBvcnQgeyBoaWRlRHJvcGRvd25FbGVtZW50LCBzaG93RHJvcGRvd25FbGVtZW50IH0gZnJvbSAnLi91dGlscyc7XG5cbmNsYXNzIEhlYWRlclNlYXJjaCB7XG4gICAgc3RhdGljIHNlbGVjdG9yKCkge1xuICAgICAgICByZXR1cm4gJ1tkYXRhLXRvZ2dsZS1zZWFyY2gtcGFuZWxdJztcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihub2RlKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoVG9nZ2xlQnV0dG9uID0gbm9kZTtcblxuICAgICAgICB0aGlzLnNlYXJjaERyb3Bkb3duID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtc2VhcmNoLXBhbmVsXScpO1xuICAgICAgICB0aGlzLnNlYXJjaERyb3Bkb3duQ29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnW2RhdGEtc2VhcmNoLWNvbnRlbnRdJyxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zZWFyY2hJbnB1dCA9IHRoaXMuc2VhcmNoRHJvcGRvd24ucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICdbZGF0YS1zZWFyY2gtaW5wdXRdJyxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5uYXZpZ2F0aW9uTWVudUl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICdbZGF0YS1kZXNrdG9wLW5hdi1pdGVtXScsXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5iaW5kRXZlbnRzKCk7XG4gICAgfVxuXG4gICAgb3BlblNlYXJjaCgpIHtcbiAgICAgICAgc2hvd0Ryb3Bkb3duRWxlbWVudCh0aGlzLnNlYXJjaERyb3Bkb3duKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgcGFnZSBpcyBub3Qgc2Nyb2xsYWJsZS5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJztcblxuICAgICAgICAvLyBGb2N1cyBvbiB0aGUgaW5wdXQuXG4gICAgICAgIHRoaXMuc2VhcmNoSW5wdXQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBjbG9zZVNlYXJjaCgpIHtcbiAgICAgICAgaGlkZURyb3Bkb3duRWxlbWVudCh0aGlzLnNlYXJjaERyb3Bkb3duKTtcblxuICAgICAgICAvLyBTZXQgdGhlIHBhZ2UgdG8gYmUgc2Nyb2xsYWJsZS5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSc7XG4gICAgfVxuXG4gICAgYmluZEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5zZWFyY2hUb2dnbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zZWFyY2hEcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoJ2ludmlzaWJsZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuU2VhcmNoKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VTZWFyY2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZWFyY2hEcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICAvLyBDbG9zZSB0aGUgZHJvcGRvd24gaWYgY2xpY2tpbmcgYW55d2hlcmUgZWxzZSBvbiB0aGUgcGFnZVxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlYXJjaERyb3Bkb3duQ29udGVudC5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlU2VhcmNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSGVhZGVyU2VhcmNoO1xuIiwiaW1wb3J0IHsgaGlkZURyb3Bkb3duRWxlbWVudCB9IGZyb20gJy4vdXRpbHMnO1xuXG5jbGFzcyBNb2JpbGVNZW51IHtcbiAgICBzdGF0aWMgc2VsZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiAnW2RhdGEtbW9iaWxlLW1lbnUtdG9nZ2xlXSc7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3Iobm9kZSkge1xuICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgICAgICB0aGlzLmJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG4gICAgICAgIHRoaXMubW9iaWxlTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1vYmlsZS1tZW51LWNvbnRlbnRdJyk7XG4gICAgICAgIHRoaXMuaGVhZGVyTG9nbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWhlYWRlci1sb2dvXScpO1xuXG4gICAgICAgIHRoaXMuYmluZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gICAgYmluZEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLm5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5tb2JpbGVNZW51LmNsYXNzTGlzdC5jb250YWlucygnaW52aXNpYmxlJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvcGVuKCkge1xuICAgICAgICAvLyBTZXQgdGhlIG1lbnUgYnV0dG9uIHRvIGJlIGEgY3Jvc3MuXG4gICAgICAgIHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKCdtb2JpbGUtbWVudS1pcy1vcGVuJyk7XG4gICAgICAgIHRoaXMuaGVhZGVyTG9nby5jbGFzc0xpc3QuYWRkKCdtb2JpbGUtbWVudS1pcy1vcGVuJyk7XG4gICAgICAgIHRoaXMubm9kZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICAgICAgICB0aGlzLm5vZGUuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ2Nsb3NlIG5hdmlnYXRpb24gbWVudScpO1xuICAgICAgICB0aGlzLmJvZHkuY2xhc3NMaXN0LmFkZCgnbm8tc2Nyb2xsJyk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgdGhlIHBhZ2UgaXMgbm90IHNjcm9sbGFibGUuIE9ubHkgdGhlIGRyYXdlci5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJztcblxuICAgICAgICAvLyBPcGVuIHRoZSBtb2JpbGUgbWVudS4gTW9iaWxlIG1lbnUgc2xpZGVzIGZyb20gdGhlIHJpZ2h0LlxuICAgICAgICB0aGlzLm1vYmlsZU1lbnUuY2xhc3NMaXN0LnJlbW92ZSgnaW52aXNpYmxlJyk7XG4gICAgICAgIHRoaXMubW9iaWxlTWVudS5jbGFzc0xpc3QucmVtb3ZlKCd0cmFuc2xhdGUteC1mdWxsJyk7XG4gICAgICAgIHRoaXMubW9iaWxlTWVudS5jbGFzc0xpc3QuYWRkKCd0cmFuc2xhdGUteC0wJyk7XG5cbiAgICAgICAgLy8gRm9jdXMgb24gdGhlIGZpcnN0IGxpbmsgaW4gdGhlIG1vYmlsZSBtZW51LlxuICAgICAgICBjb25zdCBmaXJzdEl0ZW0gPSB0aGlzLm1vYmlsZU1lbnUucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICBmaXJzdEl0ZW0/LmZvY3VzKCk7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIC8vIFNldCB0aGUgY3Jvc3MgYnV0dG9uIHRvIGJlIGEgbWVudSBidXR0b24uXG4gICAgICAgIHRoaXMubm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdtb2JpbGUtbWVudS1pcy1vcGVuJyk7XG4gICAgICAgIHRoaXMuaGVhZGVyTG9nby5jbGFzc0xpc3QucmVtb3ZlKCdtb2JpbGUtbWVudS1pcy1vcGVuJyk7XG4gICAgICAgIHRoaXMubm9kZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgdGhpcy5ub2RlLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdPcGVuIG5hdmlnYXRpb24gbWVudScpO1xuICAgICAgICB0aGlzLmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8tc2Nyb2xsJyk7XG5cbiAgICAgICAgLy8gU2V0IHRoZSBwYWdlIHRvIGJlIHNjcm9sbGFibGUuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3dZID0gJ3Zpc2libGUnO1xuXG4gICAgICAgIC8vIENsb3NlIHRoZSBtb2JpbGUgbWVudS5cbiAgICAgICAgdGhpcy5tb2JpbGVNZW51LmNsYXNzTGlzdC5hZGQoJ2ludmlzaWJsZScpO1xuICAgICAgICB0aGlzLm1vYmlsZU1lbnUuY2xhc3NMaXN0LmFkZCgndHJhbnNsYXRlLXgtZnVsbCcpO1xuICAgICAgICB0aGlzLm1vYmlsZU1lbnUuY2xhc3NMaXN0LnJlbW92ZSgndHJhbnNsYXRlLXgtMCcpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW9iaWxlTWVudTtcbiIsImNsYXNzIFNraXBMaW5rIHtcbiAgICBzdGF0aWMgc2VsZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiAnW2RhdGEtc2tpcC1saW5rXSc7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3Iobm9kZSkge1xuICAgICAgICB0aGlzLnNraXBMaW5rID0gbm9kZTtcbiAgICAgICAgdGhpcy5tYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWFpbicpO1xuXG4gICAgICAgIGlmICh0aGlzLnNraXBMaW5rICYmIHRoaXMubWFpbikge1xuICAgICAgICAgICAgdGhpcy5za2lwTGluay5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuaGFuZGxlQ2xpY2soKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVDbGljaygpIHtcbiAgICAgICAgdGhpcy5tYWluLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAtMSk7XG4gICAgICAgIHRoaXMubWFpbi5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4gdGhpcy5oYW5kbGVCbHVyKCkpO1xuICAgICAgICB0aGlzLm1haW4uYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCAoKSA9PiB0aGlzLmhhbmRsZUJsdXIoKSk7XG4gICAgICAgIHRoaXMubWFpbi5mb2N1cygpO1xuICAgIH1cblxuICAgIGhhbmRsZUJsdXIoKSB7XG4gICAgICAgIHRoaXMubWFpbi5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgICAgIHRoaXMubWFpbi5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5oYW5kbGVCbHVyKTtcbiAgICAgICAgdGhpcy5tYWluLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5oYW5kbGVCbHVyKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNraXBMaW5rO1xuIiwiY2xhc3MgVGhlbWVUb2dnbGUge1xuICAgIHN0YXRpYyBzZWxlY3RvcigpIHtcbiAgICAgICAgcmV0dXJuICdbZGF0YS10aGVtZS10b2dnbGVdJztcbiAgICB9XG4gICAgXG4gICAgY29uc3RydWN0b3Iobm9kZSkge1xuICAgICAgICB0aGlzLnRvZ2dsZVN3aXRjaCA9IG5vZGU7XG4gICAgICAgIHRoaXMuY3VycmVudFRoZW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RoZW1lJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFRoZW1lKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndGhlbWUnLCB0aGlzLmN1cnJlbnRUaGVtZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VGhlbWUgPT09ICdkYXJrJykge1xuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlU3dpdGNoLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYmluZEV2ZW50cygpXG4gICAgfVxuXG4gICAgYmluZEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy50b2dnbGVTd2l0Y2guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5zd2l0Y2hUaGVtZSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHN3aXRjaFRoZW1lKGUpIHtcbiAgICAgICAgaWYgKGUudGFyZ2V0LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCd0aGVtZScsICdkYXJrJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndGhlbWUnLCAnbGlnaHQnKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0aGVtZScsICdkYXJrJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndGhlbWUnLCAnbGlnaHQnKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd0aGVtZScsICdkYXJrJyk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGhlbWUnLCAnbGlnaHQnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGhlbWVUb2dnbGU7IiwiLyoqXG4gKiBIaWRlcyBhIGRyb3Bkb3duIGVsZW1lbnQsIHVzZWQgaW4gZGVza3RvcCBuYXZpZ2F0aW9uIGRyb3Bkb3ducyBhbmQgdGhlIHNlYXJjaCBkcm9wZG93bi5cbiAqL1xuZXhwb3J0IGNvbnN0IGhpZGVEcm9wZG93bkVsZW1lbnQgPSAoZWxlbWVudCkgPT4ge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaW52aXNpYmxlJyk7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCctdHJhbnNsYXRlLXktMicpO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndHJhbnNsYXRlLXktMCcpO1xufTtcblxuLyoqXG4gKiBTaG93cyBhIGRyb3Bkb3duIGVsZW1lbnQsIHVzZWQgaW4gZGVza3RvcCBuYXZpZ2F0aW9uIGRyb3Bkb3ducyBhbmQgdGhlIHNlYXJjaCBkcm9wZG93bi5cbiAqL1xuZXhwb3J0IGNvbnN0IHNob3dEcm9wZG93bkVsZW1lbnQgPSAoZWxlbWVudCkgPT4ge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaW52aXNpYmxlJyk7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCctdHJhbnNsYXRlLXktMicpO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndHJhbnNsYXRlLXktMCcpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgdGhlIGNsaWVudCBpcyB1c2luZyBhIG1vYmlsZSBvcGVyYXRpbmcgc3lzdGVtIGJhc2VkIG9mZlxuICogcmVnZXggbWF0Y2hpbmcgT1MgbmFtZXMgYW5kIHRoZSBjbGllbnQncyB1c2VyIGFnZW50LlxuICogUmV0dXJucyB0cnVlIGlmIHVzZXIgYWdlbnQgbWF0Y2hlcyAnaU9TJywgJ0FuZHJvaWQnIG9yICdXaW5kb3dzIFBob25lJy5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGNvbnN0IGlzTW9iaWxlT3BlcmF0aW5nU3lzdGVtID0gKCkgPT4ge1xuICAgIGNvbnN0IHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQgfHwgbmF2aWdhdG9yLnZlbmRvciB8fCB3aW5kb3cub3BlcmE7XG5cbiAgICAvLyBXaW5kb3dzIFBob25lIG11c3QgY29tZSBmaXJzdCBiZWNhdXNlIGl0cyBVQSBhbHNvIGNvbnRhaW5zIFwiQW5kcm9pZFwiXG4gICAgaWYgKC93aW5kb3dzIHBob25lL2kudGVzdCh1c2VyQWdlbnQpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICgvYW5kcm9pZC9pLnRlc3QodXNlckFnZW50KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBpT1MgZGV0ZWN0aW9uIGZyb206IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzkwMzk4ODUvMTc3NzEwXG4gICAgaWYgKC9pUGFkfGlQaG9uZXxpUG9kLy50ZXN0KHVzZXJBZ2VudCkgJiYgIXdpbmRvdy5NU1N0cmVhbSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgVGhlbWVUb2dnbGUgZnJvbSBcIi4vY29tcG9uZW50cy90aGVtZS10b2dnbGVcIjtcbmltcG9ydCBIZWFkZXJTZWFyY2hQYW5lbCBmcm9tIFwiLi9jb21wb25lbnRzL2hlYWRlci1zZWFyY2gtcGFuZWxcIjtcbmltcG9ydCBIZWFkZXJSZXNwb25zaXZlTmF2IGZyb20gXCIuL2NvbXBvbmVudHMvaGVhZGVyLXJlc3BvbnNpdmUtbmF2XCI7XG5pbXBvcnQgTW9iaWxlTWVudSBmcm9tIFwiLi9jb21wb25lbnRzL21vYmlsZS1tZW51XCI7XG5pbXBvcnQgU2tpcExpbmsgZnJvbSAnLi9jb21wb25lbnRzL3NraXAtbGluayc7XG5cbmltcG9ydCAnLi4vc2Fzcy9tYWluLnNjc3MnO1xuXG5cbmZ1bmN0aW9uIGluaXRDb21wb25lbnQoQ29tcG9uZW50Q2xhc3MpIHtcbiAgICBjb25zdCBpdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoQ29tcG9uZW50Q2xhc3Muc2VsZWN0b3IoKSk7XG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmV3IENvbXBvbmVudENsYXNzKGl0ZW0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtDb21wb25lbnRDbGFzcy5uYW1lfSBmYWlsZWQgdG8gaW5pdGlhbGlzZWAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBpbml0QXBwKCkge1xuICAgIGluaXRDb21wb25lbnQoSGVhZGVyUmVzcG9uc2l2ZU5hdik7XG4gICAgaW5pdENvbXBvbmVudChUaGVtZVRvZ2dsZSk7XG4gICAgaW5pdENvbXBvbmVudChTa2lwTGluayk7XG4gICAgaW5pdENvbXBvbmVudChIZWFkZXJTZWFyY2hQYW5lbCk7XG4gICAgaW5pdENvbXBvbmVudChNb2JpbGVNZW51KTtcbn1cblxuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0QXBwLCB7IG9uY2U6IHRydWUgfSk7XG59IGVsc2Uge1xuICAgIGluaXRBcHAoKTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==