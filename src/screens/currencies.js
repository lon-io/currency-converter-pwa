import template from '../views/partials/currencies.hbs';
import {
    getTemplateRenderer,
} from '../libs/renderer';
import { handleEvent, dispatchEvent, getEventTarget, } from '../libs/events';

import constants from '../config/constants';

const {
    events,
    currency: {
        types,
    },
} = constants;

export default class Currencies {
    constructor() {
        this.state = {
            selectedCurrency: null,
            currencies: [],
            currencyType: types.FROM,
        };

        this.renderTemplate = getTemplateRenderer(template);
        this.wrapper = document.getElementById('currencies-root');
    }

    listen() {
        this.registerShowEventHandler();
        this.registerCurrencyClickHandler();
    }

    setCurrencies(currencies) {
        this.state.currencies = currencies;
    }

    registerShowEventHandler() {
        handleEvent(events.SELECT_CURRENCY, this.appRoot,  (event = {}) => {
            const {
                type,
            } = event;
            this.state.currencyType = type;

            if (this.wrapper) {
                this.wrapper.style.width = 0;
            }
        });
    }

    registerCurrencyClickHandler() {
        const currencyList = document.getElementById('currencies');

        handleEvent('onclick', this.appRoot, (event) => {
            const target = getEventTarget(event);

            const element = target.querySelector('.currency-code');
            const currencyID = element.innerHTML;
            const currency = Array.isArray(this.currencies) && this.currencies.find(({ id, }) => id === currencyID);
            this.state.selectedCurrency = currency;

            this.handleCurrencySelect();
        }, currencyList);
    }

    handleCurrencySelect() {
        const { currency, currencyType: type, } = this.state;

        dispatchEvent(this.appRoot, events.CURRENCY_SELECTED, {
            currency,
            type,
        });
    }

    render() {
        console.log('State is: =>>', this.state);

        try {
            return this.renderTemplate({
                currencies: this.state.currencies,
            });
        } catch (error) {
            console.log('{{ConverterScreen}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }

    // async render() {
    //     try {
    //         const currenciesObj = await getCurrencies();

    //         const currencies = Object.values(currenciesObj).map((currency, index) => {
    //             if (!this.selected && index === 0) currency.isSelected = true;
    //             if (this.selected === currency.id) currency.isSelected = true;

    //             return currency;
    //         });

    //         this.currencies = currencies;

    //         console.log('A1', this.currencies);

    //         return renderTemplate(template, {
    //             currencies,
    //         });
    //     } catch (error) {
    //         console.log('{{CurrenciesScreen}}', error);

    //         // Re-throw the error (to be handled in the main script)
    //         throw error;
    //     }
    // }
}
