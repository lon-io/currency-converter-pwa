import template from '../views/partials/loader.hbs';
import {
    getTemplateRenderer,
} from '../libs/renderer';

const renderTemplate = getTemplateRenderer(template);

const Loader = (className = '') => {
    try {
        return renderTemplate({
            class: className,
        });
    } catch (error) {
        console.log('{{ConverterScreen}}', error);

        // Re-throw the error (to be handled in the main script)
        throw error;
    }
};

export default Loader;
