/**
 * Function that performs pagination of an api, then processes the results of each page of an api call to isolate the relevant data.
 * @param {Function} apicall a function that performs an apicall given a payload
 * @param {Object} payload a object of key-value pairs representing the payload of the apicall
 * @param {Function} processor a function that combs through the results of the apicall function and returns only the relevant data from the results.
 * Note: to work properly, the processor function at **MINIMUM** has to **return falsy when the pagination needs to stop**. Otherwise, paginate will endlessly loop through all the pages.
 * @param {String} pageVar the name of the key that sets the page number in the payload, default 'page'
 * @param {Number} startPage the page number to start the apicall, default 1
 * @param {Number} stopPage the page number to end the api call, default 100
 * @param {Function} failure determines the results an error when performing the apicall, default to throwing the error
 * @returns a recursive function that itself returns an Array of the processed results by page
 */
async function paginatePage({ apicall, payload, processor, pageVar = 'page', startPage = 1, stopPage = 100, failure = err => { throw new Error(err) }}) {

    /**
     * An inner helper function that recursively performs pagination across the api in the apicall variable within paginate function's scope
     * @param {Number} page starting page for pagination
     * @param {Array} store an empty array for cacheing the results as the function recurs
     * @returns 
     */
    async function helper(page, store = []) {
        if (page == stopPage + 1) {
            console.error(`You have reached the emergency stopPage to prevent infinite loops. You are currently on page, ${page}. To go beyond this, set the stopPage key in the parameter above this number.`);
            return store
        }

        payload[pageVar] = page;
        let results;
        results = await performAPICall(apicall, payload, failure);

        const processedResults = processor(results)

        if (processedResults) {
            store.push({
                page: page,
                result: processedResults
            });
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
async function performAPICall(apicall, payload, failure) {
    try {
        return await apicall(payload);
    } catch (err) {
        failure(err);
    }
}

module.exports = {
    paginatePage
}