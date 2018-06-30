
import Currencies from './screens/currencies';
import ConverterScreen from './screens/converter';

import IDBHelper from './libs/idb-helper';
import Loader from './components/loader';

import constants from './config/constants';
import {
    getCurrencies,
} from './libs/api-service';
import {
    getTemplateRenderer,
} from './libs/renderer';
import template from './views/partials/app.hbs';

const {
    keys,
} = constants.db;

export default class App {
    constructor() {
        const appRoot = document.getElementById('app');
        const idbHelper = new IDBHelper();

        this.appRoot = appRoot;
        this.idbHelper = new IDBHelper();
        this.currenciesScreen = new Currencies(appRoot, idbHelper);
        this.converterScreen = new ConverterScreen(appRoot, idbHelper);
        this.renderTemplate = getTemplateRenderer(template);
    }

    async start() {
        try {
            // Set loader
            this.registerServiceWorker();
            this.appRoot.innerHTML = Loader();

            const currencies = await this.getAllCurrencies();

            this.currencies = currencies;
            this.currenciesScreen.setCurrencies(currencies);

            const selectedCurrencies = this.getInitialSelectedCurrencies();
            this.converterScreen.setCurrencies(selectedCurrencies);

            const appContent = this.renderTemplate({});
            this.appRoot.innerHTML = appContent;

            this.converterScreen.init();
            this.currenciesScreen.init();

            this.listen();
        } catch(error) {
            console.log('{{App.start}}', error);
        }
    }

    registerServiceWorker() {
        if (navigator && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then((registration) => {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, (err) => {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        }
    }

    async listen() {
        this.converterScreen.listen(this.appRoot);
        this.currenciesScreen.listen(this.appRoot);
    }

    async getAllCurrencies() {
        let currenciesObj = await this.idbHelper.get(keys.CURRENCIES);

        // Cache miss - make request;
        if (!currenciesObj) {
            currenciesObj = await getCurrencies();

            // Cache the response
            this.idbHelper.set(keys.CURRENCIES, currenciesObj);
        }

        // Map to array
        const currencies = Object.values(currenciesObj);
        return currencies;
    }

    getInitialSelectedCurrencies() {
        console.log('A2', this.currencies);
        if (Array.isArray(this.currencies)) {
            return {
                currencyFrom: this.currencies[0],
                currencyTo: this.currencies[1],
            };
        } return {};
    }
}
