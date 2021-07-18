// Importing modules
var fs = require("fs");

// Global variables
var github;
var context;

async function main({ g, c }, {issueNum, message}) {
    github = g;
    context = c;
    postComment(issueNum, message);
    return true;
}

async function postComment(issueNum, message) {
    let results;
    try {
        results = await github.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issueNum,
            body: message,
        });
    } catch(err) {
        throw new Error(err);
    }
}

module.exports = main