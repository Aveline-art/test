async function paginate(apicall, caughtFunc = caught, start = 1, stop = 100) {
    const stopPage = start + stop - 1
    async function helper(start) {
        if (start == stopPage) {
            return
        }

        const result = await runAPIOnce(apicall.bind(this, start), caughtFunc)
        if (!result) {
            return
        }
        return helper(++start)
    }
    await helper(start);
}

async function runAPIOnce(apicall, caughtFunc = caught) {
    try {
        const result = await apicall();
        if (!result) {
            return result
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