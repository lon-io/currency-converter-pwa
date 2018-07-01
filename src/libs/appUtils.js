import {
    dispatchEvent,
} from './events';
import constants from '../config/constants';

const {
    events,
    flash: {
        types,
    },
} = constants;

export default class AppUtils {
    constructor(appRoot) {
        this.appRoot = appRoot;
    }

    listenerForNetworkChanges() {
        window.addEventListener('online', () => {
            console.log('offline');
            this.showFlashMessage('Yaay! You\'re back online!');
        });

        window.addEventListener('offline', () => {
            this.showFlashMessage('Meh! You\'ve gone offline!');
        });
    }

    setAppPrimaryFocus() {
        dispatchEvent(this.appRoot, events.SET_APP_PRIMARY_FOCUS);
    };

    showSidebar() {
        dispatchEvent(this.appRoot, events.SHOW_SIDEBAR);
    }

    showFlashMessage(message, type = types.SUCCESS) {
        dispatchEvent(this.appRoot, events.FLASH_MESSAGE, {
            message,
            type,
        });
    };

}
