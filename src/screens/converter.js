import template from '../views/partials/converter.hbs';
import {
    renderLoader,
    renderTemplate,
    compileTemplate,
} from '../libs/renderer';
import {
    dispatchEvent,
    handleEvent,
} from '../libs/events';
import {
    getConversionFactor,
} from '../libs/api-service';
import constants from '../config/constants';

const loader = renderLoader();
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
        this.compiledTemplate = compileTemplate(template);
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
            sendArrow.style.display = 'none';
            sendLoader.style.display = 'block';
        } else {
            sendArrow.style.display = 'block';
            sendLoader.style.display = 'none';
        }
    }

    registerSendHandler(appRoot) {
        const sendButton = document.getElementById('send');
        const resultSpan = document.getElementById('result');

        if (sendButton && resultSpan) {
            const handler = (event) => {
                event.preventDefault();

                this.setLoading(true);
                dispatchEvent(events.SEND).then((result) => {
                    this.setLoading(false);
                    resultSpan.innerHTML = result;
                });
            };

            handleEvent('onclick', appRoot, sendButton, handler);
        }
    }

    registerCurrencySelectHandlers(appRoot) {
        const currencyFromEl = document.getElementById('currencyFrom');
        const currencyToEl = document.getElementById('currencyTo');

        const handler = (async (event, type) => {
            event.preventDefault();
            dispatchEvent(events.SELECT_CURRENCY, {
                type,
            });
        });

        if (currencyFromEl) handleEvent('onclick', appRoot, currencyFromEl, handler);
        if (currencyToEl) handleEvent('onclick', appRoot, currencyToEl, handler);
    }

    registerCurrencySelectedHandler(appRoot) {
        handleEvent(events.CURRENCY_SELECTED, appRoot, (event) => {
            const data = event && event.data && event.data;

            if (data) {
                this.updateCurrency(data.type, data.currency);
            } console.log('{{ConverterScreen.currencySelectedHandler}}: Invalid event data', event);
        });
    }

    listen(appRoot) {
        this.registerSendHandler(appRoot);
        this.registerCurrencySelectHandlers();
        this.registerCurrencySelectedHandler(appRoot);
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

        const renderedData = this.render();
        dispatchEvent(events.CURRENCY_SELECTED, renderedData);
    }

    render() {
        console.log('State is: =>>', this.state);

        try {
            return this.compiledTemplate({
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
