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
            return Object.values(results);
        })
        .catch(error => {
            console.log('{{ApiService.getCurrencies}}', error);
            return [];
        });
};
