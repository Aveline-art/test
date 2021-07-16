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

    const results = await github.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.payload.number,
        body,
    });

    console.log(JSON.stringify(results));
}

function createMessage() {
    const text = fs.readFileSync("./pr-instructions-template.md").toString('utf-8');
    console.log(text);
    
}

module.exports = main
