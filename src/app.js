// 🇳🇬
import CurrenciesScreen from './screens/currencies';
import ConverterScreen from './screens/converter';
import SidebarScreen from './screens/sidebar';
import FlashComponent from './components/flash';

import IDBHelper from './libs/idb-helper';
import AppUtils from './libs/appUtils';

import {
    getCurrencies,
} from './libs/api-service';
import {
    getTemplateRenderer,
} from './libs/renderer';
import template from './views/app.hbs';
import constants from './config/constants';
import { initializeHbs, } from './libs/hbs';

const {
    db: {
        keys,
    },
} = constants;

export default class App {
    constructor() {
        const appRoot = document.getElementById('app');
        const idbHelper = new IDBHelper();

        this.appRoot = appRoot;
        this.idbHelper = new IDBHelper();
        this.currenciesScreen = new CurrenciesScreen(appRoot, idbHelper);
        this.converterScreen = new ConverterScreen(appRoot, idbHelper);
        this.sidebarScreen = new SidebarScreen(appRoot, idbHelper);
        this.flashComponent = new FlashComponent(appRoot);
        this.renderTemplate = getTemplateRenderer(template);
        this.utils = new AppUtils(appRoot);
        this.currencies = [];

        initializeHbs();
    }

    async start() {
        try {
            this.registerServiceWorker();

            const appContent = this.renderTemplate({});
            this.appRoot.innerHTML = appContent;

            // Initialize the Flash Component
            this.flashComponent.init();

            // MEh!
            this.idbHelper.get(keys.LAST_CURRENCY_FROM_ID).then((selectedFromID) => {
                this.utils.showFlashMessage(selectedFromID ? 'Welcome back!' : 'Welcome!');
            }),
            this.utils.listenerForNetworkChanges();

            // Fetch currencies
            const currencies = await this.getAllCurrencies();
            this.currencies = currencies;
            this.currenciesScreen.setCurrencies(currencies);

            // Set initial currencies
            const selectedCurrencies = await this.getInitialSelectedCurrencies();
            this.converterScreen.setCurrencies(selectedCurrencies);

            // Initialize screens
            this.converterScreen.init();
            this.currenciesScreen.init();
            this.sidebarScreen.init();
            this.hideLoader();

            // App Setup => Register App Listeners
            this.listen();
        } catch(error) {
            console.log('{{App.start}}', error);
        }
    }

    registerServiceWorker() {
        if (navigator && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then((registration) => {
                // Registration was successful
                console.log('{{App.registerServiceWorker}} ServiceWorker registration successful with scope: ',
                    registration.scope);
            }, (err) => {
                // registration failed :(
                console.log('{{App.registerServiceWorker}} ServiceWorker registration failed: ', err);
            });
        }
    }

    async listen() {
        this.converterScreen.listen(this.appRoot);
        this.currenciesScreen.listen(this.appRoot);
        this.sidebarScreen.listen(this.appRoot);
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

    hideLoader() {
        const loaderWrapper = document.getElementById('loader-wrapper');
        if (loaderWrapper) loaderWrapper.style.display = 'none';
    }

    showErrorView() {
        const errorWrapper = document.getElementById('error-wrapper');
        if (errorWrapper) errorWrapper.style.block = 'none';
    }
}
