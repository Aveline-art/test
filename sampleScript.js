// Import modules
const findLinkedIssue = require('./findLinkedIssue.js')
const { paginatePage } = require('./paginateAPI.js')

// Global variables
var github;
var context;
const label = 'To Update !'; // label to add
const updateLimit = 3 // only check all events in an issue within the last updateLimit days

// testing values to be deleted


async function main({ g, c }) {
  github = g;
  context = c;

  const issueNums = await getIssueNumsFromColumn();

  for (num of issueNums) {
    const timeline = await getTimeline(num);
    const assignee = await getAssignee(num);

    if (!assignee) {
      console.log(`Assignee not found, skipping ${num}`)
      continue
    }

    if (isTimelineOutdated(timeline, num, assignee)) {
      addUpdateLabel(num)
      console.log(`Going to ask for an update now for issue ${num}`);
    } else {
      console.log(`No updates needed for issue ${num}`);
    }
  }

  return true;
}

async function getIssueNumsFromColumn() {
  const payload = {
    column_id: inProgressColumnId,
    per_page: 100,
  }

  function processor(results) {

    if (results.data.length) {
      let urls = [];
      for (card of results.data) {
        if (card.hasOwnProperty('content_url')) {
          // Isolates the issue number from the rest of the url
          const arr = card.content_url.split('/');
          // Pushes the last item in arr, which is the issue number
          urls.push(arr.pop());
        }
      }
      return urls;
    } else {
      return false;
    }
  }

  const results = await paginatePage({
    apicall: github.projects.listCards,
    payload: payload,
    processor: processor,
  })

  return collectPages(results);
}

/**
 * Get request and returns the timeline object for an issue.
 * @param {Number} issueNum the issue number 
 * @returns the timeline
 */
async function getTimeline(issueNum) {
  const payload = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNum,
    per_page: 100,
  }

  function processor(results) {
    if (results.data.length) {
      return results.data;
    } else {
      return false;
    }
  }

  const timeline = await paginatePage({
    apicall: github.issues.listEventsForTimeline,
    payload: payload,
    processor: processor,
    failure: err => {
      console.error(`Could not retrieve timeline for ${issueNum}`);
      return true;
    }
  })

  return collectPages(timeline);
}

/**
 * Assess whether the timeline passes multiple checks. Returns true if timeline indicates the issue is outdated and false if the timeline indicates the issue is up to date or the assignee could not be found. Outdated means that the assignee did not make a linked PR or comment within the last updateLimit (see global variables) days.
 * @param {*} timeline 
 * @param {*} issueNum 
 * @returns 
 */
function isTimelineOutdated(timeline, issueNum, assignee) {
  for (moment of timeline) {
    if (isMomentRecent(moment.created_at, updateLimit)) {
      if (moment.event == 'cross-referenced' && isLinkedIssue(moment, issueNum)) {
        return false;
      } else if (moment.event == 'commented' && isCommentByAssignee(moment, assignee)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Adds the label to the issue based on issueNum
 * @param {*} issueNum 
 */
async function addUpdateLabel(issueNum) {
  try {
    // https://octokit.github.io/rest.js/v18#issues-add-labels
    await github.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
      labels: ['To Update !']
    })

  } catch (err) {
    console.error(`Could not add label for issue ${num}`)
  }
}

/***********************
*** HELPER FUNCTIONS ***
***********************/

function collectPages(results) {
  let collection = []
  for (page of results) {
    collection.push(...page.result);
  }
  return collection
}

function isMomentRecent(dateString, limit) {
  const dateStringObj = new Date(dateString);
  const dateWeekBefore = new Date()
  dateWeekBefore.setDate(dateWeekBefore.getDate() - limit)

  if (dateStringObj >= dateWeekBefore) {
    return true
  } else {
    return false
  }
}

function isLinkedIssue(data, issueNum) {
  return findLinkedIssue(data.source.issue.body) == issueNum
}

function isCommentByAssignee(data, assignee) {
  return data.actor.login == assignee
}

async function getAssignee(issueNum) {
  try {
    results = await github.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
    });
    return results.data.assignee.login
  } catch (err) {
    console.error(`Failed request to get assignee from issue: ${issueNum}`)
    return false;
  }
}

module.exports = main
