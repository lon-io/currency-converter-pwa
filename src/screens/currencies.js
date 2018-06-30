import template from '../views/screens/currencies.hbs';
import {
    getTemplateRenderer,
} from '../libs/renderer';
import { handleEvent, dispatchEvent, getEventTarget, } from '../libs/events';
import { hideElement, } from '../libs/utils';

import constants from '../config/constants';

const {
    events,
    currency: {
        types,
    },
} = constants;

const searchWrapperID = 'currencies-search-wrapper';
const headerWrapperID = 'currencies-header';

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
        this.searchWrapperInitialStyle = null;
        this.headerInitialStyle = null;
    }

    init() {
        this.root = document.getElementById('currencies-root');
        this.render();
    }

    listen() {
        this.registerShowEventHandler();
        this.registerCurrencyClickHandler();
        this.registerSearchClickHandler();
        this.registerSearchCloseClickHandler();
    }

    setCurrencies(currencies) {
        this.state.currencies = currencies;
    }

    setVisible(visible) {
        const wrapper = document.getElementById('currencies-root');

        if (wrapper) {
            if (visible) {
                wrapper.style.width = '100%';
            } else wrapper.style.width = '0';
        } else console.log('{{ConverterScreen.registerShowEventHandler}}: Invalid wrapper', wrapper);
    }

    setSearchVibility(showSearch) {
        console.log('Here ->', showSearch);
        const searchWrapper = document.getElementById(searchWrapperID);
        const headerWrapper = document.getElementById(headerWrapperID);
        // const

        if (searchWrapper && headerWrapper
            && this.searchWrapperInitialStyle && this.headerInitialStyle) {
            if (showSearch) {
                hideElement(headerWrapper);
                searchWrapper.style = this.searchWrapperInitialStyle;
            } else {
                hideElement(searchWrapper);
                headerWrapper.style = this.headerInitialStyle;
            }
        } else console.log('{{CurrenciesScreen.setSearchVibility}} Invalid wrappers', searchWrapper, headerWrapper);
    }

    registerSearchClickHandler() {
        const searchIconID = 'currency-search-icon';

        const searchWrapper = document.getElementById(searchWrapperID);
        const headerWrapper = document.getElementById(headerWrapperID);

        hideElement(searchWrapper);

        if (searchWrapper && headerWrapper) {
            this.searchWrapperInitialStyle = searchWrapper.style;
            this.headerInitialStyle = headerWrapper.style;
        }

        const handler = () => {
            this.setSearchVibility(true);

            // Todo: Render partial update;
        };

        handleEvent('click', this.appRoot, handler, `#${searchIconID}`);
    }

    registerSearchCloseClickHandler() {
        const searchCloseIconID = 'currency-search-close-icon';

        const handler = () => {
            this.setSearchVibility(false);
        };

        handleEvent('click', this.appRoot, handler, `#${searchCloseIconID}`);
    }

    registerShowEventHandler() {
        handleEvent(events.SELECT_CURRENCY, this.appRoot,  (event = {}) => {
            const data = event.detail;

            if (data && data.type) this.state.currencyType = data.type;
            this.setVisible(true);
        });
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
