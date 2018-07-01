import template from '../views/screens/sidebar.hbs';
import AppUtils from '../libs/appUtils';
import {
    getTemplateRenderer,
} from '../libs/renderer';
import { handleEvent, } from '../libs/events';
import constants from '../config/constants';

const {
    events,
} = constants;

const rootID = 'sidebar-root';
const backIconID = 'currency-back-icon';

export default class SidebarScreen {
    constructor(appRoot) {
        this.appRoot = appRoot;
        this.root = null;
        this.renderTemplate = getTemplateRenderer(template);
        this.appUtils = new AppUtils(appRoot);
    }

    init() {
        this.root = document.getElementById(rootID);
        this.render();
    }

    listen() {
        this.registerBackClickHandler();
        this.registerVisibilityHandler();
    }

    setVisible(visible) {
        if (this.root) {
            if (visible) {
                this.root.style.width = '100%';
            } else {
                this.root.style.width = '0';
                this.appUtils.setAppPrimaryFocus();
            }
        } else console.log('{{SidebarScreen.setVisible}}: Invalid root element', this.root);
    }

    registerVisibilityHandler() {
        handleEvent(events.SHOW_SIDEBAR, this.appRoot,  () => {
            this.setVisible(true);
        });
    }

    registerBackClickHandler() {
        const handler = () => {
            this.setVisible(false);
        };

        handleEvent('click', this.appRoot, handler, `#${backIconID}`);
    }

    render() {
        try {
            if (this.root) {
                this.root.innerHTML = this.renderTemplate({});
            } else console.log('{{SidebarScreen.render}}: Root is invalid', this.root);
        } catch (error) {
            console.log('{{SidebarScreen}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
