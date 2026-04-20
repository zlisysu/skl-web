import ThemeToggle from "./components/theme-toggle";
import HeaderSearchPanel from "./components/header-search-panel";
import HeaderResponsiveNav from "./components/header-responsive-nav";
import MobileMenu from "./components/mobile-menu";
import SkipLink from './components/skip-link';

import '../sass/main.scss';


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
    initComponent(HeaderResponsiveNav);
    initComponent(ThemeToggle);
    initComponent(SkipLink);
    initComponent(HeaderSearchPanel);
    initComponent(MobileMenu);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
    initApp();
}
