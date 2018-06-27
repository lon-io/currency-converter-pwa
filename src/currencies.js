require('babel-core/register');
require('babel-polyfill');

import './assets/scss/styles.scss';
import {
    compile,
} from 'handlebars';
import template from './views/partials/currencies.hbs';

window.onload = async () => {
    console.log('Hello World!');
    const app = document.getElementById('app');

    try {
        const currencies = await getCurrencies();
        console.log(currencies);

        const renderedData = compile(currencyTemplate)({
            currencies,
        });

        app.innerHTML = renderedData;
    } catch (error) {
        console.log(error);
        app.innerHTML = 'An error occurred';
    }
};
