export default {
    api: {
        baseUrl: 'https://free.currencyconverterapi.com/api/v5',
        endpoints: {
            getAllCurrencies: 'currencies',
            convertValue: 'convert',
        },
    },
    currency: {
        types: {
            FROM: 'FROM',
            TO: 'TO',
        },
    },
    converter: {
        maxStoredFactors: 100,
    },
    events: {
        CURRENCY_SELECTED: 'CURRENCY_SELECTED',
        SELECT_CURRENCY: 'SELECT_CURRENCY',
    },
    db: {
        name: 'currency-converter-db',
        stores: {
            GENERAL: 'currency-converter-store',
            CONVERSION_FACTORS: 'currency-converter-factors-store',
        },
        keys: {
            CURRENCIES: 'CURRENCIES',
            LAST_CURRENCY_FROM_ID: 'LAST_CURRENCY_FROM_ID',
            LAST_CURRENCY_TO_ID: 'LAST_CURRENCY_TO_ID',
        },
        version: 1,
    },
};
