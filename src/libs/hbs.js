import Handlebars from 'handlebars';
import helpers from './hbs-helpers';

import loaderTemplate from '../views/partials/loader.hbs';
import currenciesTemplate from '../views/partials/currencies.hbs';
import flashTemplate from '../views/partials/flash.hbs';

const partialsPath = '../views/partials';

const partialsMap = {
    loader: loaderTemplate,
    currencies: currenciesTemplate,
    flash: flashTemplate,
};

// Todo: Figure out why tpl paths are not resolving
const mapPartials = () => {
    const partialsObj = {
        loader: 'loader',
        currencies: 'currencies',
    };

    return Object.keys(partialsObj).map(key => {
        let template = '';
        try {
            template = require(`${partialsPath}/${partialsObj[key]}.hbs`);
        } catch (error) {
            console.log('{{HBSHelper}} Error loading template for partial', key, error);
        }

        return {
            key,
            template,
        };
    });
};

export const initializeHbs = () => {
    Handlebars.registerHelper(helpers);

    Object.keys(partialsMap).forEach((key) => {
        const template = partialsMap[key];

        if (key && template) {
            Handlebars.registerPartial(
                key,
                template,
            );

            console.log(Handlebars.partials[key]);
        }
    });
};
