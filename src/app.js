
import Currencies from './screens/currencies';
import ConverterScreen from './screens/converter';

import constants from './config/constants';
import {
    getCurrencies,
} from './libs/api-service';
import {
    getTemplateRenderer,
} from './libs/renderer';
import template from './views/partials/app.hbs';
import loaderTemplate from './views/partials/loader.hbs';

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
            this.appRoot.innerHTML = getTemplateRenderer(loaderTemplate)({});

            // const currenciesObj = await getCurrencies();
            // const currencies = Object.values(currenciesObj);

            // this.currencies = currencies;
            // this.currenciesScreen.setCurrencies(currencies);

            // const selectedCurrencies = this.currenciesScreen.getInitialSelectedCurrencies();
            // this.converterScreen.setCurrencies(selectedCurrencies);

            // const converterContent = this.converterScreen.render();
            // const currenciesContent = this.currenciesScreen.render();

            // const appContent = this.renderTemplate({});
            // this.appRoot.innerHTML = appContent;

            // const converterRoot = document.getElementById('converter-root');
            // const currenciesRoot = document.getElementById('currencies-root');

            // converterRoot.innerHTML = converterContent;
            // currenciesRoot.innerHTML = currenciesContent;

            // this.listen();
        } catch(error) {
            console.log('{{App.start}}', error);
        }
    }

    async listen() {
        this.handleCurrencySelect();
        this.converterScreen.listen(this.appRoot);
        this.currenciesScreen.listen(this.appRoot);
    }

    handleCurrencySelect() {
        handleEvent(events.CURRENCY_SELECTED, this.appRoot, (event) => {
            const { data, } = event;
            this.appRoot.innerHTML = data;
        });
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
