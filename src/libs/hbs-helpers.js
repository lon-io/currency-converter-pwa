import handlebars from 'handlebars';
import loaderTemplate from '../views/partials/loader.hbs';
import currenciesTemplate from '../views/partials/currencies.hbs';
const partialsPath = '../views/partials';

const partialsMap = {
    loader: loaderTemplate,
    currencies: currenciesTemplate,
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
    Object.keys(partialsMap).forEach((key) => {
        const template = partialsMap[key];

        if (key && template) {
            handlebars.registerPartial(
                key,
                template,
            );
        }
    });
};
