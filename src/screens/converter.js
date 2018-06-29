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
import {
    parseMoney,
    formatMoney,
} from '../libs/utils';
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

        if(amount === 0) return Promise.resolve(0);

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

    validateAmountAndUpdateState() {
        const amountSpan = document.getElementById('amount');
        const inputValue = amountSpan.textContent || amountSpan.innerText;

        const parsedAmount = parseMoney(inputValue);

        if (parsedAmount !== 0 && !parsedAmount) {
            // Todo: Flash error
            console.error('{{Converter.validateAmountAndUpdateState}} amount is invalid', inputValue, parsedAmount);

            // Reset the amount
            amountSpan.innerHTML = formatMoney(this.state.amount) || 0;
            return false;
        }

        this.state.amount = parsedAmount;
        return true;
    }

    registerInputValidationHandler() {
        handleEvent('input', this.appRoot, () => this.validateAmountAndUpdateState(),
            '#amount');
    }

    registerSendHandler() {
        const handler = () => {
            const sendButton = document.getElementById('send');
            const amountSpan = document.getElementById('amount');
            const resultSpan = document.getElementById('result');

            if (sendButton && resultSpan && amountSpan) {
                const isValid = this.validateAmountAndUpdateState();

                if (isValid) {
                    // Re-format the input
                    amountSpan.innerHTML = formatMoney(this.state.amount);

                    this.setLoading(true);
                    this.convertCurrencies().then((result) => {
                        this.setLoading(false);
                        resultSpan.innerHTML = formatMoney(result);
                    });
                } else {
                    console.error('{{ConverterScreen.sendHandler}}: Invalid amount');
                }

            } else {
                console.error('{{ConverterScreen.sendHandler}}: Elements missing', sendButton, resultSpan);
            }
        };

        handleEvent('click', this.appRoot, handler, '#send');
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
            } console.error('{{ConverterScreen.currencySelectedHandler}}: Invalid event data', event);
        });
    }

    listen() {
        this.registerInputValidationHandler();
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
