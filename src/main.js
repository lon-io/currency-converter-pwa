require('babel-core/register');
require('babel-polyfill');

import './assets/scss/styles.scss';
import {
    compile,
} from 'handlebars';
import currencyTemplate from './views/partials/currencies.hbs';
import axios from 'axios';

const baseUrl = 'https://free.currencyconverterapi.com/api/v5';

const getCurrencies = () => {
    return axios.get(`${baseUrl}/currencies`)
        .then(response => {
            const results = response.data && response.data.results;
            return Object.values(results);
        })
        .catch(error => {
            console.log(error);
            return [];
        });
};

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
