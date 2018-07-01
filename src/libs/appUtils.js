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
        window.addEventListener('offline', () => {
            console.log('offline');
            this.showFlashMessage('Yaay! You\'re back online!');
        });

        window.addEventListener('online', () => {
            this.showFlashMessage('Meh! You\'ve gone offline!');
        });
    }

    setAppPrimaryFocus() {
        dispatchEvent(this.appRoot, events.SET_APP_PRIMARY_FOCUS);
    };

    showFlashMessage(message, type = types.SUCCESS) {
        dispatchEvent(this.appRoot, events.FLASH_MESSAGE, {
            message,
            type,
        });
    };
}
