
import Currencies from './screens/currencies';
import ConverterScreen from './screens/converter';

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
    events,
} = constants;
import { handleEvent, } from './libs/events';

export default class App {
    constructor() {
        const appRoot = document.getElementById('app');
        this.appRoot = appRoot;
        this.currenciesScreen = new Currencies(appRoot);
        this.converterScreen = new ConverterScreen(appRoot);
        this.renderTemplate = getTemplateRenderer(template);
    }

    async start() {
        console.log('Hello World!');

        try {
            // Set loader
            this.registerServiceWorker();
            this.appRoot.innerHTML = Loader();

            const currenciesObj = await getCurrencies();
            const currencies = Object.values(currenciesObj);

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
