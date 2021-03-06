import template from '../views/screens/converter.hbs';
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
    deepClone,
    formatMoney,
    isMobile,
    parseMoney,
    getElementTextContent,
    truncateText,
} from '../libs/utils';
import constants from '../config/constants';
import AppUtils from '../libs/appUtils';

const rootID = 'converter-root';
const sendButtonID = 'send';
const amountSpanID = 'amount';
const resultSpanID = 'result';
const currencyFromElID = 'currencyFrom';
const currencyToElID = 'currencyTo';
const sendArrowID = 'send-arrow';
const sendLoaderID = 'send-loader';
const hamburgerID = 'hamburger';

const {
    currency: {
        types,
    },
    converter: {
        maxStoredFactors,
    },
    db: {
        stores,
        keys,
    },
    events,
} = constants;

const errorMessages = {
    convertOnline: `Oops! We were unable to get a convert with your selected currencies.
    \nPlease try again later :(`,
    convertOffline: `Oops! It seems you\'re offline and we do not have the conversion for your selected currencies.
    \nPlease try again later :(`,
};

export default class ConverterScreen {
    constructor(appRoot, idbHelper) {
        this.state = {
            currencyFrom: null,
            currencyTo: null,
            amount: 0,
            result: 0,
        };

        this.appRoot = appRoot;
        this.idbHelper = idbHelper;
        this.root = null;
        this.renderTemplate = getTemplateRenderer(template);
        this.appUtils = new AppUtils(appRoot);
    }

    init() {
        this.root = document.getElementById(rootID);
        this.render();
        this.setFocus();
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

        if (amount === 0) return Promise.resolve(0);

        try {
            const factorKey = `${currencyFrom.id}_${currencyTo.id}`;
            const inverseFactorKey = `${currencyTo.id}_${currencyFrom.id}`;

            let factor;
            let factorObj;

            if (currencyFrom.id === currencyTo.id) {
                factor = 1;
                this.appUtils.showFlashMessage('You are comparing the same currency :)');
            }

            // Check cache
            if (!factor) {
                factorObj = await this.idbHelper.get(factorKey, stores.CONVERSION_FACTORS);
                factor = factorObj && factorObj.factor;
            }

            // Try the inverse
            if (!factor) {
                factorObj = await this.idbHelper.get(inverseFactorKey, stores.CONVERSION_FACTORS);
                factor = factorObj && factorObj.factor ? 1 / parseFloat(factorObj.factor) : null;
            }

            // Cache miss: Fetch the factor && cache it
            if (!factor) {
                console.log('{{ConverterScreen.convertCurrencies}} Cache MISS for factor', factorKey);

                factor = await getConversionFactor(currencyFrom.id, currencyTo.id);
                this.setFactorInDB(factorKey, factor);
            }

            const result = parseFloat(factor) * parseFloat(amount);

            return result;
        } catch (error) {
            if (navigator.onLine) {
                this.appUtils.showFlashMessage(errorMessages.convertOnline);
            } else {
                this.appUtils.showFlashMessage(errorMessages.convertOffline);
            }


            console.log('{{ConverterScreen.convertCurrencies}}', error);
        }

    }

    async setFactorInDB(factorKey, factor) {
        const storeConfig = stores.CONVERSION_FACTORS;
        await this.idbHelper.set(factorKey, {
            factor,
            timestamp: Date.now(),
        }, storeConfig);

        // Limit the number of stored values to the config value
        // maxStoredFactors
        const index = storeConfig.indices &&
            storeConfig.indices.by_created_date && storeConfig.indices.by_created_date.name;
        const factorsCursor = await this.idbHelper.getStoreCursorByIndex(storeConfig, index, false);

        if (factorsCursor) {
            const deleteCursorItem = (cursor) => {
                if (!cursor) return;
                cursor.delete();
                return cursor.continue().then((_cursor) => deleteCursorItem(_cursor));
            };

            factorsCursor.advance(maxStoredFactors).then((_cursor) => deleteCursorItem(_cursor));
        } else {
            console.log('{{Converter.setFactorInDB}} Invalid cursor', index, factorsCursor);
        }
    }

    setLoading(loading) {
        const sendArrow = document.getElementById(sendArrowID);
        const sendLoader = document.getElementById(sendLoaderID);

        if (loading) {
            sendArrow.style.opacity = 0;
            sendLoader.style.opacity = 1;
        } else {
            sendArrow.style.opacity = 1;
            sendLoader.style.opacity = 0;
        }
    }

    validateAmountAndUpdateState() {
        const amountSpan = document.getElementById(amountSpanID);
        const inputValue = getElementTextContent(amountSpan);

        const parsedAmount = parseMoney(inputValue);

        // Allow the user to clear the input or set it to zero, but disallow any other wrong input
        if (inputValue !== '' && parsedAmount !== 0 && !parsedAmount) {
            // Todo: Flash error
            console.error('{{Converter.validateAmountAndUpdateState}} amount is invalid', inputValue, parsedAmount);
            this.appUtils.showFlashMessage('Please enter a valid amount');

            // Reset the amount
            if (parsedAmount !== '') amountSpan.innerHTML = formatMoney(this.state.amount) || 0;
            return false;
        }

        this.state.amount = parsedAmount;
        return true;
    }

    registerInputValidationHandler() {
        handleEvent('input', () => this.validateAmountAndUpdateState(),
            this.appRoot, `#${amountSpanID}`);
    }

    registerSendHandler() {
        handleEvent('click', () => this.handleConvertAction(), this.appRoot, `#${sendButtonID}`);
    }

    registerSelectCurrencyHandlers() {
        const currencyFromEl = document.getElementById(currencyFromElID);
        const currencyToEl = document.getElementById(currencyToElID);

        const handler = (type) => {
            dispatchEvent(this.appRoot, events.SELECT_CURRENCY, {
                type,
            });
        };

        if (currencyFromEl) handleEvent('click', () => handler(types.FROM), this.appRoot, '#currencyFrom');
        if (currencyToEl) handleEvent('click', () => handler(types.TO), this.appRoot, '#currencyTo');
    }

    registerCurrencySelectedHandler() {
        handleEvent(events.CURRENCY_SELECTED, (event) => {
            const data = event && event.detail;

            if (data) {
                this.updateCurrency(data.type, data.currency);
            } else console.error('{{ConverterScreen.currencySelectedHandler}}: Invalid event data', event);
        }, this.appRoot);
    }

    registerAppPrimaryFocusHandler() {
        handleEvent(events.SET_APP_PRIMARY_FOCUS, (event) => {
            const data = event && event.detail;
            const checkMobile = data && data.checkMobile;
            this.setFocus(checkMobile);
        }, this.appRoot);
    }

    registerHamburgerClickHandler() {
        handleEvent('click', () => {
            this.appUtils.showSidebar();
        }, this.appRoot, `#${hamburgerID}`);
    }

    registerWindowResizeListener() {
        handleEvent('resize', () => {
            this.render();
        });
    }

    registerSwapCurrenciesHandler() {
        handleEvent(events.SWAP_CURRENCIES, () => {
            // Clone Current state
            const currencyFrom = deepClone(this.state.currencyTo);
            const currencyTo = deepClone(this.state.currencyFrom);

            // Update State
            this.state.currencyFrom = currencyFrom;
            this.state.currencyTo = currencyTo;

            // Update IDB
            this.idbHelper.set(keys.LAST_CURRENCY_FROM_ID, currencyFrom);
            this.idbHelper.set(keys.LAST_CURRENCY_TO_ID, currencyTo);

            // Re-render
            this.render();
            this.handleConvertAction();
        }, this.appRoot);
    }

    listen() {
        this.registerInputValidationHandler();
        this.registerSendHandler();
        this.registerSelectCurrencyHandlers();
        this.registerCurrencySelectedHandler();
        this.registerAppPrimaryFocusHandler();
        this.registerHamburgerClickHandler();
        this.registerWindowResizeListener();
        this.registerSwapCurrenciesHandler();
    }

    handleConvertAction() {
        const sendButton = document.getElementById(sendButtonID);
        const amountSpan = document.getElementById(amountSpanID);
        const resultSpan = document.getElementById(resultSpanID);

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

        // Reset the focus on the amount input
        this.setFocus(true);
    }

    updateCurrency(type, currency) {
        switch (type) {
            case types.FROM:
                this.state.currencyFrom = currency;
                this.idbHelper.set(keys.LAST_CURRENCY_FROM_ID, currency.id);
                break;
            default:
                this.state.currencyTo = currency;
                this.idbHelper.set(keys.LAST_CURRENCY_TO_ID, currency.id);
                break;
        }

        this.render();
        this.setFocus();
    }

    setFocus(checkMobile) {
        // Don't reset on Mobile to avoid showing the text keyboard on mobile)
        if (checkMobile && isMobile()) return;

        const amountElement = document.getElementById(amountSpanID);

        if (amountElement && typeof amountElement.focus === 'function') {
            amountElement.focus();
        }
    }

    render() {
        try {
            if (this.root) {
                // Clone to prevent mutation
                const currencyFrom = deepClone(this.state.currencyFrom);
                if (isMobile()) currencyFrom.currencyName = truncateText(currencyFrom.currencyName);

                this.root.innerHTML = this.renderTemplate({
                    currency_from: currencyFrom,
                    currency_to: this.state.currencyTo,
                    amount: this.state.amount,
                    result: this.state.result,
                    loading: this.state.loading,
                });
            } else console.log('{{ConverterScreen.render}}: Root is invalid', this.root);
        } catch (error) {
            console.log('{{ConverterScreen.render}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
