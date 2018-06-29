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
