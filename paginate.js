async function paginate(apicall, start = 1, stop = 100, caughtFunc = caught) {
    const stopPage = start + stop - 1
    function helper(start) {
        if (start == stopPage) {
            return
        }
        try {
            const result = await apicall(start);
            if (!result) {
                return
            }
        }
        catch (err) {
            caughtFunc(err);
        }
        return helper(++start)
    }
    helper(start);
}

async function runAPIOnce(apicall, caughtFunc = caught) {
    try {
        if (!await apicall()) {
            return
        }
    }
    catch (err) {
        caughtFunc(err);
    }
}

function caught(err) {
    console.error(err);
}

module.exports = { paginate, runAPIOnce }