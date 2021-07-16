// Importing modules
var fs = require("fs");

// Global variables
var github;
var context;

async function main({ g, c }) {
    github = g;
    context = c;

    postComment()
}

async function postComment() {
    const body = createMessage()

    /*
    const results = await github.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.payload.number,
        body: body,
    });

    console.log(JSON.stringify(results));*/
}

function createMessage() {
    const nameOfCollaborator = context.payload.pull_request.head.repo.owner.login;
    const nameOfFromBranch = context.payload.pull_request.head.ref;
    const nameOfIntoBranch = context.payload.pull_request.base.ref;
    const cloneURL = context.payload.pull_request.head.repo.clone_url;

    const instructionString = `
    git checkout -b ${nameOfCollaborator}-${nameOfFromBranch} ${nameOfIntoBranch}
    git pull ${cloneURL} ${nameOfFromBranch}
    `

    const text = fs.readFileSync("./pr-instructions-template.md").toString('utf-8');
    console.log(text);

    const completedInstuctions = text.replace('${commandlineInstructions}', instructionString)

    return completedInstuctions
}

module.exports = main
