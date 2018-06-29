import template from '../views/partials/converter.hbs';
import {
    getTemplateRenderer,
} from '../libs/renderer';
import {
    dispatchEvent,
    handleEvent,
} from '../libs/events';
import {
    getConversionFactor,
} from '../libs/api-service';
import constants from '../config/constants';

const {
    currency: {
        types,
    },
    events,
} = constants;

export default class ConverterScreen {
    constructor(appRoot) {
        this.state = {
            currencyFrom: null,
            currencyTo: null,
            amount: 0,
            result: 0,
        };

        this.appRoot = appRoot;
        this.root = null;
        this.renderTemplate = getTemplateRenderer(template);
    }

    init() {
        this.root = document.getElementById('converter-root');
        this.render();
    }

    setCurrencies(selectedCurrencies) {
        this.state.currencyFrom = selectedCurrencies.currencyFrom;
        this.state.currencyTo = selectedCurrencies.currencyTo;
    }

    async convertCurrencies() {
        const {
            amount,
            currencyFrom,
            currencyTo,
        } = this.state;

        try {
            const factor = await getConversionFactor(currencyFrom.id, currencyTo.id);

            const result = factor * amount;
            console.log('Conversion result: %s From %s to %s => %s', amount, currencyFrom.id, currencyTo.id, result);

            return result;
        } catch(error) {
            console.log('{{Converter.convertCurrencies}}', error);
        }

    }

    setLoading(loading) {
        const sendArrow = document.getElementById('send-arrow');
        const sendLoader = document.getElementById('send-loader');

        if (loading) {
            sendArrow.style.opacity = 0;
            sendLoader.style.opacity = 1;
        } else {
            sendArrow.style.opacity = 1;
            sendLoader.style.opacity = 0;
        }
    }

    registerSendHandler() {
        const sendButton = document.getElementById('send');
        const resultSpan = document.getElementById('result');

        if (sendButton && resultSpan) {
            const handler = (event) => {
                event.preventDefault();

                this.setLoading(true);
                this.convertCurrencies().then((result) => {
                    this.setLoading(false);
                    resultSpan.innerHTML = result;
                });
            };

            handleEvent('click', this.appRoot, handler, '#send');
        } console.log('{{ConverterScreen.registerSendHandler}}: Elements missing', sendButton, resultSpan);
    }

    registerSelectCurrencyHandlers() {
        const currencyFromEl = document.getElementById('currencyFrom');
        const currencyToEl = document.getElementById('currencyTo');

        const handler = (type) => {
            console.log('{{ConverterScreen.registerSelectCurrencyHandlers}}: Selected type is:', type);

            dispatchEvent(this.appRoot, events.SELECT_CURRENCY, {
                type,
            });
        };

        if (currencyFromEl) handleEvent('click', this.appRoot, () => handler(types.FROM), '#currencyFrom');
        if (currencyToEl) handleEvent('click', this.appRoot, () => handler(types.TO), '#currencyTo');
    }

    registerCurrencySelectedHandler() {
        handleEvent(events.CURRENCY_SELECTED, this.appRoot, (event) => {
            const data = event && event.detail;
            console.log(data);

            if (data) {
                this.updateCurrency(data.type, data.currency);
            } console.log('{{ConverterScreen.currencySelectedHandler}}: Invalid event data', event);
        });
    }

    listen() {
        this.registerSendHandler();
        this.registerSelectCurrencyHandlers();
        this.registerCurrencySelectedHandler();
    }

    updateCurrency(type, currency) {
        switch (type) {
            case types.FROM:
                this.state.currencyFrom = currency;
                break;
            default:
                this.state.currencyTo = currency;
                break;
        }

        this.render();
    }

    render() {
        console.log('State is: =>>', this.state);

        try {
            if (this.root) {
                this.root.innerHTML = this.renderTemplate({
                    currency_from: this.state.currencyFrom,
                    currency_to: this.state.currencyTo,
                    amount: this.state.amount,
                    result: this.state.result,
                    loading: this.state.loading,
                });
            } else console.log('{{ConverterScreen.init}}: Root is invalid', this.root);
        } catch (error) {
            console.log('{{ConverterScreen}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
