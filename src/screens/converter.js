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
    parseMoney,
    formatMoney,
    getElementTextContent,
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

            // Check cache
            const factorObj = await this.idbHelper.get(factorKey, stores.CONVERSION_FACTORS);
            let factor = factorObj && factorObj.factor;
            console.log(factorObj);

            // Try the inverse
            if (!factor) {
                await this.idbHelper.get(inverseFactorKey, stores.CONVERSION_FACTORS);
                factor = factorObj && factorObj.factor ? 1 / parseFloat(factorObj.factor) : null;
            }

            // Cache miss: Fetch the factor && cache it
            if (!factor) {
                console.log('{{ConverterScreen.convertCurrencies}} Cache MISS for factor', factorKey);

                factor = await getConversionFactor(currencyFrom.id, currencyTo.id);
                this.setFactorInDB(factorKey, factor);
            }

            const result = factor * amount;
            console.log('Conversion result: %s From %s to %s => %s', amount, currencyFrom.id, currencyTo.id, result);

            return result;
        } catch (error) {
            console.log('{{Converter.convertCurrencies}}', error);
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
        const index = storeConfig.indices
            && storeConfig.indices.by_created_date && storeConfig.indices.by_created_date.name;
        const factorsCursor = await this.idbHelper.getStoreCursorByIndex(storeConfig, index, false);

        console.log(storeConfig.indices, index);
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
        const amountSpan = document.getElementById('amount');
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
        handleEvent('input', this.appRoot, () => this.validateAmountAndUpdateState(),
            `#${amountSpanID}`);
    }

    registerSendHandler() {
        const handler = () => {
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
            this.setFocus();
        };

        handleEvent('click', this.appRoot, handler, '#send');
    }

    registerSelectCurrencyHandlers() {
        const currencyFromEl = document.getElementById(currencyFromElID);
        const currencyToEl = document.getElementById(currencyToElID);

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

            if (data) {
                this.updateCurrency(data.type, data.currency);
            } else console.error('{{ConverterScreen.currencySelectedHandler}}: Invalid event data', event);
        });
    }

    registerAppPrimaryFocusHandler() {
        handleEvent(events.SET_APP_PRIMARY_FOCUS, this.appRoot, () => {
            this.setFocus();
        });
    }

    listen() {
        this.registerInputValidationHandler();
        this.registerSendHandler();
        this.registerSelectCurrencyHandlers();
        this.registerCurrencySelectedHandler();
        this.registerAppPrimaryFocusHandler();
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

    setFocus() {
        const amountElement = document.getElementById(amountSpanID);

        if (amountElement && typeof amountElement.focus === 'function') {
            amountElement.focus();
        }
    }

    render() {
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
