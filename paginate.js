async function paginate(apicall, start = 1, stop = 100, caughtFunc = caught) {
    console.log(start);
    if (start = start + stop - 1) {
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