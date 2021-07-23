// Import modules
const findLinkedIssue = require('./findLinkedIssue.js')
const { paginatePage } = require('./paginateAPI.js')

// Global variables
var github;
var context;
const projectName = 'Project Board';
const columnName = 'In progress (actively working)';
const labels = ['To Update !']; // labels to add
const updateLimit = 3; // only check all events in an issue within the last updateLimit days

async function main({ g, c }) {
  github = g;
  context = c;

  const projectId = await getProjectId();
  const columnId = await getColumnId(projectId);

  const issueNums = await getIssueNumsFromColumn(columnId);

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

async function getProjectId() {
  let projectId;

  const payload = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    per_page: 100,
  }

  function processor(results) {
    if (results.data.length) {
      for (project of results.data) {
        console.log(project.name);
        if (project.name == projectName) {
          projectId = project.number
          return false
        }
      }
    } else {
      return false
    }
  }

  await paginatePage({
    apicall: github.projects.listForRepo,
    payload: payload,
    processor: processor,
  });

  if (projectId) {
    return projectId;
  } else {
    throw new Error('Project not found. Please check that the name is correct.');
  }
}

async function getColumnId(projectId) {
  let columnId;

  const payload = {
    project_id: projectId,
    per_page: 100,
  }

  function processor(results) {
    if (results.data.length) {
      for (column of results.data) {
        if (column.name == columnName) {
          columnId = column.id;
          return false
        }
      }
    } else {
      return false
    }
  }

  await paginatePage({
    apicall: github.projects.listColumns,
    payload: payload,
    processor: processor,
  });

  if (columnId) {
    return columnId;
  } else {
    throw new Error('Column not found. Please check that the name is correct.');
  }

}

async function getIssueNumsFromColumn(columnId) {
  const payload = {
    column_id: columnId,
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
      labels: labels,
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
