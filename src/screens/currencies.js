import template from '../views/screens/currencies.hbs';
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

export default class CurrenciesScreen {
    constructor(appRoot, idbHelper) {
        this.state = {
            selectedCurrency: null,
            currencies: [],
            currencyType: types.FROM,
        };

        this.appRoot = appRoot;
        this.idbHelper = idbHelper;
        this.root = null;
        this.renderTemplate = getTemplateRenderer(template);
    }

    init() {
        this.root = document.getElementById('currencies-root');
        this.render();
    }

    listen() {
        this.registerShowEventHandler();
        this.registerCurrencyClickHandler();
    }

    setCurrencies(currencies) {
        this.state.currencies = currencies;
    }

    registerSearchClickHandler() {
        // handleEvent()
    }

    registerShowEventHandler() {
        handleEvent(events.SELECT_CURRENCY, this.appRoot,  (event = {}) => {
            const data = event.detail;

            if (data && data.type) this.state.currencyType = data.type;
            this.setVisible(true);
        });
    }

    setVisible(visible) {
        const wrapper = document.getElementById('currencies-root');

        if (wrapper) {
            if (visible) {
                wrapper.style.width = '100%';
            } else wrapper.style.width = '0';
        } else console.log('{{ConverterScreen.registerShowEventHandler}}: Invalid wrapper', wrapper);
    }

    registerCurrencyClickHandler() {
        // const currencyList = document.getElementById('currencies');

        handleEvent('click', this.appRoot, (event) => {
            console.log(this.state);
            const target = getEventTarget(event);
            const { currencies, } = this.state;

            if (target) {
                const parentLi = target.nodeName === 'LI' ? target : target.parentNode;
                const codeElement = parentLi.querySelector('.currency-code');

                if (codeElement) {
                    const currencyID = codeElement.innerHTML;
                    const currency = (Array.isArray(currencies) &&
                        currencies.find(({ id, }) => id === currencyID)) || null;

                    console.log(currencies.length, currencyID, currency);

                    this.state.selectedCurrency = currency;
                }

                this.handleCurrencySelect();
            }
        }, '#currencies');
    }

    handleCurrencySelect() {
        const { selectedCurrency: currency, currencyType: type, } = this.state;

        dispatchEvent(this.appRoot, events.CURRENCY_SELECTED, {
            currency,
            type,
        });

        this.setVisible(false);
    }

    render() {
        console.log('State is: =>>', this.state);

        try {
            if (this.root) {
                this.root.innerHTML = this.renderTemplate({
                    currencies: this.state.currencies,
                });
            } else console.log('{{CurrenciesScreen.init}}: Root is invalid', this.root);
        } catch (error) {
            console.log('{{ConverterScreen}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
