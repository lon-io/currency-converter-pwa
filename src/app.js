
import Currencies from './screens/currencies';
import ConverterScreen from './screens/converter';

export default class App {
    constructor() {
        this.currenciesScreen = new Currencies();
        this.converterScreen = new ConverterScreen();
    }

    async start() {
        const appRoot = document.getElementById('app');
        console.log('Hello World!');

        try {
            const currencyContent = await this.currenciesScreen.render();
            appRoot.innerHTML = currencyContent;

            const selectedCurrencies = this.currenciesScreen.getSelectedCurrencies();
            console.log('Selected... ??', selectedCurrencies);

            this.converterScreen.setCurrencies(selectedCurrencies);
            const converterContent = this.converterScreen.render();
            appRoot.innerHTML = converterContent;
        } catch(error) {
            console.log('{{App.start}}', error);
        }
    }
}
