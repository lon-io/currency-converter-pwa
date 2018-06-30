import Handlebars, {
    compile,
} from 'handlebars';

import loaderTemplate from '../views/partials/loader.hbs';

export const renderTemplate = (template, data = {}) => {
    return compile(template)(data);
};

export const getTemplateRenderer = (template) => {
    return compile(template);
};

export const renderPage = (app, content) => {
    app.innerHTML = content;
};

export const renderLoader = () => {
    return compile(loaderTemplate)({});
};

export const getRenderedPartial = (template, context) => {
    const partialRenderer = Handlebars.partials[template];
    return typeof partialRenderer === 'function' ? partialRenderer(context) : '';
};
