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
        maxNameLengthOnMobile: 16,
    },
    events: {
        CURRENCY_SELECTED: 'CURRENCY_SELECTED',
        SELECT_CURRENCY: 'SELECT_CURRENCY',
        FLASH_MESSAGE: 'FLASH_MESSAGE',
        SET_APP_PRIMARY_FOCUS: 'SET_APP_PRIMARY_FOCUS',
        SHOW_SIDEBAR: 'SHOW_SIDEBAR',
        SWAP_CURRENCIES: 'SWAP_CURRENCIES',
    },
    db: {
        name: 'currency-converter-db',
        stores: {
            GENERAL: {
                key: 'currency-converter-store',
                indices: {},
            },
            CONVERSION_FACTORS: {
                key: 'currency-converter-factors-store',
                indices: {
                    by_created_date: {
                        name: 'by-created-date',
                        field: 'timestamp',
                    },
                },
            },
        },
        keys: {
            CURRENCIES: 'CURRENCIES',
            LAST_CURRENCY_FROM_ID: 'LAST_CURRENCY_FROM_ID',
            LAST_CURRENCY_TO_ID: 'LAST_CURRENCY_TO_ID',
        },
        version: 1,
    },
    flash: {
        types: {
            SUCCESS: 'success',
            ERROR: 'error',
        },
        autoDismiss: true,
        lifespan: 3000, // Time before self-dismissal (ms)
    },
};
