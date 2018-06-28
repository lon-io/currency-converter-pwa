
import Currencies from './screens/currencies';
import ConverterScreen from './screens/converter';

import constants from './config/constants';
const {
    events,
} = constants;
import { handleEvent, } from './libs/events';

export default class App {
    constructor() {
        this.appRoot = document.getElementById('app');
        this.currenciesScreen = new Currencies();
        this.converterScreen = new ConverterScreen();
    }

    async start() {
        console.log('Hello World!');

        try {
            const currencyContent = await this.currenciesScreen.render();
            this.appRoot.innerHTML = currencyContent;

            const selectedCurrencies = this.currenciesScreen.getSelectedCurrencies();
            console.log('Selected... ??', selectedCurrencies);

            this.converterScreen.setCurrencies(selectedCurrencies);
            const converterContent = this.converterScreen.render();
            this.appRoot.innerHTML = converterContent;

            this.listen();
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
}
