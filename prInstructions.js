// Global variables
var github;
var context;

async function main({ g, c }) {
  github = g;
  context = c;

  console.log(JSON.stringify(c))
}

module.exports = main
