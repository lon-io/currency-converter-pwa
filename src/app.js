
import Currencies from './screens/currencies';

export default class App {
    constructor() {
        this.currenciesScreen = new Currencies();
    }

    async start() {
        const appRoot = document.getElementById('app');
        console.log('Hello World!');

        try {
            const currencyContent = await this.currenciesScreen.render();
            appRoot.innerHTML = currencyContent;
        } catch(error) {
            console.log('{{App.start}}', error);
        }
    }
}
