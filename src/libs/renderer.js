import {
    compile,
} from 'handlebars';

import loaderTemplate from '../views/partials/loader.hbs';

export const renderTemplate = (template, data = {}) => {
    return compile(template)(data);
};

export const compileTemplate = (template) => {
    return compile(template);
};

export const renderPage = (app, content) => {
    app.innerHTML = content;
};

export const renderLoader = () => {
    return compile(loaderTemplate)({});
};
