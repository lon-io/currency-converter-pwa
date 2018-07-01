import { handleEvent, } from '../libs/events';
import { getRenderedPartial, } from '../libs/renderer';
import { setTranslation, resetTranslation, } from '../libs/utils';
import AppUtils from '../libs/appUtils';
import constants from '../config/constants';

const {
    events,
    flash: {
        autoDismiss,
        lifespan,
        types,
    },
} = constants;

const wrapperID = 'flash-wrapper';
const dismissID = 'flash-dismiss';

export default class Flash {
    constructor(appRoot) {
        this.appRoot = appRoot;
        this.wrapper = null;
        this.appUtils = new AppUtils(appRoot);
    }

    registerMessageHandler() {
        const handler = (event = {}) => {
            const data = event.detail || {};
            const { type = types.SUCCESS, message, } = data;

            if (message) {
                this.show(type, message);
            }
        };

        handleEvent(events.FLASH_MESSAGE, this.appRoot, handler);
    }

    registerDismissHandler() {
        handleEvent('click', this.appRoot, () => this.hide(), `#${dismissID}`);
    }

    init() {
        this.wrapper = document.getElementById(wrapperID);
        this.registerMessageHandler();
        this.registerDismissHandler();
    }

    show(type, message) {
        this.render(type, message);

        if (this.wrapper && this.wrapper.style) {
            resetTranslation(this.wrapper);

            // Auto Dismiss
            if (autoDismiss) {
                setTimeout(() => {
                    this.hide();
                }, lifespan);
            }
        }
    }

    hide() {
        if (this.wrapper && this.wrapper.style) {
            setTranslation(this.wrapper, '500%, 0');
            this.appUtils.setAppPrimaryFocus();
        }
    }

    render(type, message) {
        const title = type === types.SUCCESS ? 'Hooray!' : 'Oops!';
        const icon = type = types.SUCCESS ? 'success' : 'error';

        try {
            if (this.wrapper) {
                const flashContent = getRenderedPartial('flash', {
                    icon,
                    message,
                    type,
                    title,
                });

                if (flashContent) this.wrapper.innerHTML = flashContent;
            } else console.log('{{FlashComponent.render}}: Wrapper is invalid', this.wrapper);
        } catch (error) {
            console.log('{{FlashComponent.render}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
