import template from '../views/partials/currencies.hbs';
import {
    getCurrencies,
} from '../libs/api-service';
import {
    renderTemplate,
} from '../libs/renderer';

export default class Currencies {
    constructor() {
        this.selected = null;
        this.currencies = null;
    }

    getSelectedCurrencies() {
        console.log('A2', this.currencies);
        if (Array.isArray(this.currencies)) {
            return {
                currencyFrom: this.currencies[0],
                currencyTo: this.currencies[1],
            };
        } return {};
    }

    async render() {
        try {
            const currenciesObj = await getCurrencies();

            const currencies = Object.values(currenciesObj).map((currency, index) => {
                if (!this.selected && index === 0) currency.isSelected = true;
                if (this.selected === currency.id) currency.isSelected = true;

                return currency;
            });

            this.currencies = currencies;

            console.log('A1', this.currencies);

            return renderTemplate(template, {
                currencies,
            });
        } catch (error) {
            console.log('{{CurrenciesScreen}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
