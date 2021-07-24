async function paginate(apicall, start = 1, stop = 100, caughtFunc = caught) {
    if (start == stop) {
        return
    }
    await runAPI(apicall, caughtFunc);
    return paginate(apicall, ++start, stop, caughtFunc)
}

async function runAPI(apicall, caughtFunc = caught) {
    try {
        if (!await apicall(start)) {
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

module.exports = { paginate }