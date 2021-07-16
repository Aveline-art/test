// Global variables
var github;
var context;

async function main({ g, c }) {
  github = g;
  context = c;

  console.log(g, c)
}

module.exports = main
