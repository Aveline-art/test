const { paginatePage } = require("./paginateAPI")

// These functions serves to demo the paginate function from paginateAPI.js

/**
 * A dummy function that mimics an api call
 * @param {Object} payload a key-value paired object
 * @returns an Object that mimics the results of a GET request, in this case, a page number, a name, and an id
 */
function apicallTest(payload) {
    return {
        page: payload.page,
        name: 'octocat',
        id: 1234
    }
}

/**
 * A function that isolates relevant data from an apicall
 * @param {Object} obj a key-value paired object that represents the results of an apicall
 * @returns isolated portions of the obj variable, in this case, the page number
 */
function processorTest(obj) {
    if (obj.page == 100) {
        return null
    } else {
        return obj.page
    }
}

// A fake payload to use for the api call
const payload = {
    page: 1
}

// Runs the paginate function and logs the result; should print an array of objects containing page numbers and results containing numbers from 1-99.
paginatePage({
    apicall: apicallTest,
    payload: payload,
    processor: processorTest,
})
    .then(results => {
        console.log(results);
    })