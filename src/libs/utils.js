import {
    dispatchEvent,
} from '../libs/events';
import constants from '../config/constants';

const {
    events,
} = constants;

/**
 *
 */
export const selectorMatches = (el, selector) => {
    const p = Element.prototype;
    const f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
        return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
    };
    return f.call(el, selector);
};

export const isDescendant = (target, parentSelector) => {
    const parent = document.querySelector(parentSelector);

    if (parent && typeof parent.contains === 'function') {
        return parent.contains(target);
    } else return false;
};

export const formatMoney = (amount) => {
    if (!amount || isNaN(amount)) {
        return 0;
    }

    return amount.toLocaleString();
};

export const parseMoney = (amountString) => {
    const amount = amountString && typeof amountString.replace === 'function' ?
        amountString.replace(',', '') : NaN;

    return parseFloat(amount) === 0 ? 0 : (parseFloat(amount) || null);
};

export const hideElement = (element) => {
    if (element && element.style) {
        element.style.height = 0;
        element.style.padding = 0;
        element.style.overflow = 'hidden';
    }
};

export const showElement = (element) => {
    if (element && element.style) {
        element.style.height = 'initial';
        element.style.overflow = 'initial';
    }
};

export const getElementTextContent = (element) => {
    return element ? element.textContent || element.innerText : '';
};

export const setTranslation = (element, value) => {
    if (element && element.style && value) {
        element.style['-webkit-transform'] = `translate(${value})`;
        element.style['-moz-transform'] = `translate(${value})`;
        element.style['-ms-transform'] = `translate(${value})`;
        element.style['-o-transform'] = `translate(${value})`;
        element.style.transform = `translate(${value})`;
    }
};

export const resetTranslation = (element) => {
    setTranslation(element, '0, 0');
};

export const setAppPrimaryFocus = (appRoot) => {
    dispatchEvent(appRoot, events.SET_APP_PRIMARY_FOCUS);
};
