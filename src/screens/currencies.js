import template from './views/partials/currencies.hbs';
import { getCurrencies, } from '../libs/api-service';
import { renderTemplate, } from '../libs/renderer';

export default async () => {
    console.log('Hello World!');

    try {
        const currencies = await getCurrencies();
        console.log(currencies);

        return renderTemplate(template, {
            currencies,
        });
    } catch (error) {
        console.log('{{CurrenciesScreen}}', error);

        // Re-throw the error (to be handled in the main script)
        throw error;
    }
};
