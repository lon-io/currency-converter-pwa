require('babel-core/register');
require('babel-polyfill');

import './assets/scss/styles.scss';
import App from './app';

window.onload = async () => {
    const app = new App();
    app.start();
};
