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
    events: {
        CURRENCY_SELECTED: 'CURRENCY_SELECTED',
        SELECT_CURRENCY: 'SELECT_CURRENCY',
    },
};
