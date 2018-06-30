import handlebars from 'handlebars';
import loaderPartial from '../views/partials/loader.hbs';

export const initializeHbs = () => {
    // handlebars.registerHelper('svg', svgHelper);

    handlebars.registerPartial(
        'loader',
        loaderPartial,
      );
};
