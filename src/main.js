require('babel-core/register');
require('babel-polyfill');

import './assets/scss/styles.scss';
import { compile, } from 'handlebars';
import template from './views/partials/loader.hbs';
import axios from 'axios';

const baseUrl = 'https://free.currencyconverterapi.com/api/v5';

const getCurrencies = async () => {
    try {
        const response = await axios.get(`${baseUrl}/currencies`);
        console.log(response.data);
    } catch(error) {
        console.log(error);
    }
};

window.onload = () => {
    console.log('Hello World!');
    getCurrencies();
    const renderedData = compile(template)({});

    const app = document.getElementById('app');
    app.innerHTML = renderedData;
};
