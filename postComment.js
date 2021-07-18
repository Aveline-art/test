// Importing modules
var fs = require("fs");

// Global variables
var github;
var context;

async function main({ g, c }, {issueNum, instruction}) {
    github = g;
    context = c;
    console.log('-------dadssa-------------------')
    console.log(issueNum)
    console.log(instruction)

    const instructions = formatComment(instruction)
    postComment(issueNum, instructions);
    return true;
}

function formatComment(instruction) {
    const text = fs.readFileSync("./pr-instructions-template.md").toString('utf-8');
    const completedInstuctions = text.replace('${commandlineInstructions}', instruction)
    return completedInstuctions
}

async function postComment(issueNum, instructions) {
    let results;
    try {
        results = await github.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issueNum,
            body: instructions,
        });
    } catch(err) {
        throw new Error(err);
    }

    console.log('-------------123-------------')
    console.log(results)
}

module.exports = main