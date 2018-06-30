
import Currencies from './screens/currencies';
import ConverterScreen from './screens/converter';

import IDBHelper from './libs/idb-helper';
import Loader from './components/loader';

import {
    getCurrencies,
} from './libs/api-service';
import {
    getTemplateRenderer,
} from './libs/renderer';
import template from './views/partials/app.hbs';
import constants from './config/constants';

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
        this.currencies = [];
    }

    async start() {
        try {
            // Set loader
            this.registerServiceWorker();
            this.appRoot.innerHTML = Loader();

            const currencies = await this.getAllCurrencies();

            this.currencies = currencies;
            this.currenciesScreen.setCurrencies(currencies);

            const selectedCurrencies = await this.getInitialSelectedCurrencies();
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
        const currencies = this.currencies;

        // Unlikely edge-case
        if (!Array.isArray(this.currencies) || this.currencies.length < 2) return {};

        return Promise.all([
            this.idbHelper.get(keys.LAST_CURRENCY_FROM_ID),
            this.idbHelper.get(keys.LAST_CURRENCY_TO_ID),
        ]).then(([selectedFromID, selectedToID,]) => {
            // Find matches
            let currencyFrom = currencies.find(({ id, }) => id === selectedFromID);
            let currencyTo = currencies.find(({ id, }) => id === selectedToID);

            // Else the first and second currencies && set them in idb
            if (!currencyFrom) {
                currencyFrom = currencies[0];
                this.idbHelper.set(keys.LAST_CURRENCY_FROM_ID, currencyFrom.id);
            }

            if (!currencyTo) {
                currencyTo = currencies[1];
                this.idbHelper.set(keys.LAST_CURRENCY_TO_ID, currencyTo.id);
            }

            return {
                currencyFrom,
                currencyTo,
            };
        });
    }
}
