function paginate(apicall, start = 1, stop = 100, caughtFunc = caught) {
    if (start == stop) {
        return
    }
    runAPI(apicall, caughtFunc);
    return paginate(apicall, ++start, stop, shouldContinue)
}

function runAPI(apicall, caughtFunc = caught) {
    try {
        if (!apicall(start)) {
            return
        }
    }
    catch (err) {
        caught(err);
    }
}

function caught(err) {
    console.error(err);
}

module.exports = { paginate }