import { dispatchEvent, } from '../libs/events';

export default class Flash {
    constructor(appRoot) {
        this.appRoot = appRoot;
    }

    registerMessageListener() {

    }

    init() {
        this.registerMessageListener();
    }
}
