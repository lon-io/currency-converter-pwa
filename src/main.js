import './assets/scss/styles.scss';
import { compile, } from 'handlebars';
import template from './views/partials/loader.hbs';

window.onload = () => {
    console.log('Hello World!');
    const renderedData = compile(template)({});

    const app = document.getElementById('app');
    app.innerHTML = renderedData;
};
