import axios from 'axios';
import { constants, } from '../config';

const {
    baseUrl,
    endpoints,
} = constants.api;

/**
 * Get All Currencies from the API
 */
export const getCurrencies = () => {
    return axios.get(`${baseUrl}/${endpoints.getAllCurrencies}`)
        .then(response => {
            const results = response.data && response.data.results;
            return results;
        })
        .catch(error => {
            console.log('{{ApiService.getCurrencies}}', error);
            return [];
        });
};

/**
 * Get All Currencies from the API
 */
export const getConversionFactor = (currencyFromID, currencyToID) => {
    const q = `${currencyFromID}_${currencyToID}`;

    return axios.get(`${baseUrl}/${endpoints.convertValue}/?q=${q}&compact=ultra`)
        .then(response => {
            const result = (response.data && response.data[q]) || null;

            if (result === null) {
                throw new Error('Invalid factor returned from call to get currencies');
            }

            return result;
        })
        .catch(error => {
            console.log('{{ApiService.getCurrencies}}', error);
            throw new Error(`Bad response returned from call to get currencies: ${error.message}`);
        });
};
