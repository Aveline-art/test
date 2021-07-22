/**
 * Function that performs pagination of an api, then processes the results of each page of an api call to isolate the relevant data.
 * @param {Function} apicall a function that performs an apicall
 * @param {Object} payload a object of key-value pairs representing the api payload
 * @param {Function} processor a function that combs through the results of the apicall and returns only the relevant data from the results.
 * Note: to work properly, the processor function has to **return falsy** if there is no more relevant data to retrieve. Otherwise, paginate will endlessly loop through all the pages.
 * @param {String} pageVar the name of the key that sets the page number in the payload, default 'page'
 * @param {Number} startPage the page number to start the apicall, default 1
 */
async function paginate({apicall, payload, processor, pageVar = 'page', startPage = 1}) {

    /**
     * An inner helper function that recursively performs pagination across the api in the apicall variable within paginate function's scope
     * @param {Number} page starting page for pagination
     * @param {Array} store an empty array for cacheing the results as the function recurs
     * @returns 
     */
    async function helper(page, store = []) {
        payload[pageVar] = page;
        let results;
        results = await performAPICall(apicall, payload);

        const processedResults = processor(results)

        if (processedResults) {
            store.push(processedResults);
            return helper(++page, store);
        } else {
            return store;
        }
    }

    return await helper(startPage);
}

/**
 * Helper function: Performs and returns the results of an api call.
 * @param {Function} apicall a function that performs an apicall
 * @param {Object} payload a object of key-value pairs representing the api payload
 * @returns the results of the api call with the given payload
 */
async function performAPICall(apicall, payload) {
    try {
        return await apicall(payload);
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = paginate