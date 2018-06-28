import template from '../views/partials/converter.hbs';
import {
    renderTemplate,
} from '../libs/renderer';

export default class ConverterScreen {
    constructor() {
        this.state = {
            currencyFrom: null,
            currencyTo: null,
            amount: 0,
            result: 0,
            loading: false,
        };
    }

    setCurrencies(selectedCurrencies) {
        this.state.currencyFrom = selectedCurrencies.currencyFrom;
        this.state.currencyTo = selectedCurrencies.currencyTo;
    }

    render() {
        console.log('State is: =>>', this.state);

        try {
            return renderTemplate(template, {
                currency_from: this.state.currencyFrom,
                currency_to: this.state.currencyTo,
                amount: this.state.amount,
                result: this.state.result,
                loading: this.state.loading,
            });
        } catch (error) {
            console.log('{{ConverterScreen}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
