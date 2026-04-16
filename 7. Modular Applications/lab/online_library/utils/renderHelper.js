// Render helper utilities
import { render } from './litHtml.js';

// Cache main element to avoid searching for it every time
let mainElement = null;

/**
 * Gets main element (caches it for performance)
 */
export function getMainElement() {
    if (!mainElement) {
        mainElement = document.querySelector('main');
    }
    return mainElement;
}

/**
 * Renders template into main element
 * @param {TemplateResult} template - lit-html template
 */
export function renderToMain(template) {
    render(template, getMainElement());
}

/**
 * Attaches event listener to element after rendering
 * @param {string} selector - CSS selector of the element
 * @param {string} event - Event name (e.g. 'submit')
 * @param {Function} handler - Handler function
 */
export function attachEventListener(selector, event, handler) {
    setTimeout(() => {
        const element = document.getElementById(selector) || document.querySelector(selector);
        if (element) {
            element.addEventListener(event, handler);
        }
    }, 0);
}

