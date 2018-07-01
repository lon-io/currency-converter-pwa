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
const overlayID = 'sidebar-overlay';
const mainID = 'sidebar-main';
const backIconID = 'sidebar-close-icon';

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

    registerVisibilityHandler() {
        handleEvent(events.SHOW_SIDEBAR, () => {
            this.setVisible(true);
        }, this.appRoot);
    }

    registerBackClickHandler() {
        const handler = () => {
            this.setVisible(false);
        };

        handleEvent('click', handler, this.appRoot, `#${backIconID}`);
    }

    listen() {
        this.registerBackClickHandler();
        this.registerVisibilityHandler();
    }

    setVisible(visible) {
        if (this.root) {
            const overlayEl = document.getElementById(overlayID);
            const mainEl = document.getElementById(mainID);

            if (visible) {
                this.root.style.width = '100%';
                if (overlayEl) overlayEl.style.opacity = 0.7;
                if (mainEl) mainEl.style.width = '85%';
            } else {
                this.root.style.width = '0';
                if (overlayEl) overlayEl.style.opacity = 0;
                if (mainEl) mainEl.style.width = 0;

                this.appUtils.setAppPrimaryFocus(true);
            }
        } else console.log('{{SidebarScreen.setVisible}}: Invalid root element', this.root);
    }

    render() {
        try {
            if (this.root) {
                this.root.innerHTML = this.renderTemplate({});
            } else console.log('{{SidebarScreen.render}}: Root is invalid', this.root);
        } catch (error) {
            console.log('{{SidebarScreen.render}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
