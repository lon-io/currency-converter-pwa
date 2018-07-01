import { handleEvent, } from '../libs/events';
import { getRenderedPartial, } from '../libs/renderer';
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
    }

    registerMessageHandler() {
        const handler = (event = {}) => {
            const data = event.detail || {};
            const { type = types.SUCCESS, message, } = data;

            if (message) {
                this.show(type, message);
            }
        };

        handleEvent(this.appRoot, events.FLASH_MESSAGE, handler);
    }

    registerDismissHandler() {
        handleEvent('click', events.FLASH_MESSAGE, () => this.hide(), `#${dismissID}`);
    }

    init() {
        this.wrapper = document.getElementById(wrapperID);
        this.registerMessageHandler();
        this.registerDismissHandler();
    }

    show(type, message) {
        this.render(type, message);

        if (this.wrapper && this.wrapper.style) {
            this.wrapper.style.width = '100%';

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
            this.wrapper.style.width = 0;
        }
    }

    render(type, message) {
        console.log('State is: =>>', this.state);

        try {
            if (this.wrapper) {
                const flashContent = getRenderedPartial('flash', {
                    type,
                    message,
                });

                if (flashContent) this.wrapper.innerHTML = flashContent;
            } else console.log('{{FlashComponent.render}}: Wrapper is invalid', this.wrapper);
        } catch (error) {
            console.log('{{FlashComponent}}', error);

            // Re-throw the error (to be handled in the main script)
            throw error;
        }
    }
}
