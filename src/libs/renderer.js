import {
    compile,
} from 'handlebars';

export const renderTemplate = (template, data = {}) => {
    return compile(template)(data);
};

export const renderPage = (app, content) => {
    app.innerHTML = content;
};
