import template from '../views/screens/currencies.hbs';
import {
    getTemplateRenderer,
    getRenderedPartial,
} from '../libs/renderer';
import { handleEvent, dispatchEvent, getEventTarget, } from '../libs/events';
import { hideElement, showElement, } from '../libs/utils';
import constants from '../config/constants';

const {
    events,
    currency: {
        types,
    },
} = constants;

const searchHeaderWrapperID = 'currencies-header-search';
const defaultHeaderWrapperID = 'currencies-header-default';

const rootID = 'currencies-root';
const searchInputID = 'currencies-search';
const listWrapperID = 'currencies-list-wrapper';
const searchIconID = 'currency-search-icon';
const backIconID = 'currency-back-icon';
const searchCloseIconID = 'currency-search-close-icon';
const currenciesContainerID = 'currencies';
const currencyCodeSelector = '.currency-code';

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
        this.root = document.getElementById(rootID);
        this.render();
    }

    listen() {
        this.registerShowEventHandler();
        this.registerCurrencyClickHandler();
        this.registerSearchClickHandler();
        this.registerBackClickHandler();
        this.registerSearchCloseClickHandler();
        this.registerSearchChangeHandler();
    }

    setCurrencies(currencies) {
        this.state.currencies = currencies;
    }

    setVisible(visible) {
        if (this.root) {
            if (visible) {
                this.root.style.width = '100%';
            } else this.root.style.width = '0';
        } else console.log('{{ConverterScreen.registerShowEventHandler}}: Invalid root element', this.root);
    }

    setSearchVisibility(showSearch) {
        const searchHeaderWrapper = document.getElementById(searchHeaderWrapperID);
        const defaultHeaderWrapper = document.getElementById(defaultHeaderWrapperID);

        if (searchHeaderWrapper && defaultHeaderWrapper) {
            if (showSearch) {
                hideElement(defaultHeaderWrapper);
                showElement(searchHeaderWrapper);
                this.focusSearchInput();
            } else {
                hideElement(searchHeaderWrapper);
                showElement(defaultHeaderWrapper);
                this.updateCurrenciesList(this.state.currencies);
            }
        } else console.log('{{CurrenciesScreen.setSearchVisibility}} Invalid wrappers',
             searchHeaderWrapper, defaultHeaderWrapper);
    }

    registerSearchClickHandler() {
        const searchHeaderWrapper = document.getElementById(searchHeaderWrapperID);

        hideElement(searchHeaderWrapper);

        handleEvent('click', this.appRoot, () => {
            this.setSearchVisibility(true);
        }, `#${searchIconID}`);
    }

    registerSearchCloseClickHandler() {
        const handler = () => {
            const searchValue = this.getCurrentSearchValue();

            if (searchValue) this.clearSearchInput();
            else this.setSearchVisibility(false);

            this.updateCurrenciesList(this.state.currencies);
        };

        handleEvent('click', this.appRoot, handler, `#${searchCloseIconID}`);
    }

    registerBackClickHandler() {
        const handler = () => {
            this.setVisible(false);
        };

        handleEvent('click', this.appRoot, handler, `#${backIconID}`);
    }

    registerSearchChangeHandler() {
        const handler = () => {
            const searchValue = this.getCurrentSearchValue();

            if (searchValue) {
                const matchingCurrencies = this.getSearchMatches(searchValue);
                this.updateCurrenciesList(matchingCurrencies);
            } else console.log('{{CurrenciesScreen.SearchChangeHandler}} empty search value', searchValue);
        };

        handleEvent('input', this.appRoot, handler, `#${searchInputID}`);
    }

    registerShowEventHandler() {
        handleEvent(events.SELECT_CURRENCY, this.appRoot,  (event = {}) => {
            const data = event.detail;

            if (data && data.type) this.state.currencyType = data.type;
            this.setVisible(true);
        });
    }

    registerCurrencyClickHandler() {
        handleEvent('click', this.appRoot, (event) => {
            const target = getEventTarget(event);
            const { currencies, } = this.state;

            if (target) {
                const parentLi = target.nodeName === 'LI' ? target : target.parentNode;
                const codeElement = parentLi.querySelector(currencyCodeSelector);

                if (codeElement) {
                    const currencyID = codeElement.innerHTML;
                    const currency = (Array.isArray(currencies) &&
                        currencies.find(({ id, }) => id === currencyID)) || null;

                    this.state.selectedCurrency = currency;
                }

                this.handleCurrencySelect();
            }
        }, `#${currenciesContainerID}`);
    }

    handleCurrencySelect() {
        const { selectedCurrency: currency, currencyType: type, } = this.state;

        dispatchEvent(this.appRoot, events.CURRENCY_SELECTED, {
            currency,
            type,
        });

        this.setVisible(false);
    }

    getCurrentSearchValue() {
        let searchValue = '';
        const searchInputEl = document.getElementById(searchInputID);

        if (searchInputEl) {
            searchValue = searchInputEl.value;
        }

        return searchValue;
    }

    clearSearchInput() {
        const searchInputEl = document.getElementById(searchInputID);

        if (searchInputEl) {
            searchInputEl.value = '';
        }

        this.focusSearchInput();
    }

    focusSearchInput() {
        const searchInput = document.getElementById(searchInputID);

        if (searchInput && typeof searchInput.focus === 'function') searchInput.focus();
    }

    getSearchMatches(inputValue = '') {
        const allCurrencies = this.state.currencies;
        const queries = inputValue.toLowerCase().trim().split(' ') || ''; // Split by white space for multiplt values

        const getMatchingCurrencies = (haystack, needle) => {
            if (Array.isArray(haystack)) {
                return needle ? haystack.filter((currency) => {
                    if (!currency) return false;
                    let matches = false;

                    if (currency.currencyName
                        && currency.currencyName.toLocaleLowerCase().indexOf(needle) > -1) matches = true;
                    else if (currency.id
                        && currency.id.toLocaleLowerCase().indexOf(needle) > -1) matches = true;

                    return matches;
                }) : haystack;
            }

            return [];
        };

        console.log(queries);
        // We want to search on a maximum of 2 whitespace separated queries
        const filteredQueries = queries.filter((q) => !!q).slice(2);
        console.log(filteredQueries);

        // Use the result of the first search in the second
        // (so the whole list is not unnecessarily re-searched)
        return filteredQueries.reduce((prevMatchedCurrencies, query) => {
            console.log(query, prevMatchedCurrencies.length);
            // Return early
            if (prevMatchedCurrencies.length === 0) return [];
            return (getMatchingCurrencies(prevMatchedCurrencies, query));
        }, allCurrencies);
    }

    updateCurrenciesList(matchingCurrencies) {
        const listWrapper = document.getElementById(listWrapperID);

        if (listWrapper && Array.isArray(matchingCurrencies)) {
            // dispatchEvent(this.appRoot, events.FLASH_MESSAGE, {
            //     message: 'Hello',
            // });

            const currenciesContent = getRenderedPartial('currencies', {
                currencies: matchingCurrencies,
            });

            if (currenciesContent) listWrapper.innerHTML = currenciesContent;
        }
    };

    render() {
        try {
            if (this.root) {
                this.root.innerHTML = this.renderTemplate({
                    currencies: this.state.currencies,
                });
            } else console.log('{{CurrenciesScreen.render}}: Root is invalid', this.root);
        } catch (error) {
            console.log('{{CurrenciesScreen}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
