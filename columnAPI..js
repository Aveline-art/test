const { paginatePage } = require('./paginateAPI.js')

async function getIssueNumsFromColumn(owner, repo, projectName, columnName) {
    const projectId = await getProjectId(owner, repo, projectName);
    const columnId = await getColumnId(projectId, columnName);
}


/**
 * Retrieves the ID of a project, based on project name in the global scope (see above).
 * @returns a Number representing the project's id
 */
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
                if (project.name == projectName) {
                    projectId = project.id;
                    return false;
                }
            }
        } else {
            return false;
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

/**
 * Retrieves the ID of a column, based on column name in the global scope (see above).
 * @param projectId the ID of the project in GitHub's database
 * @returns a Number representing the project's id
 */
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
                    return false;
                }
            }
        } else {
            return false;
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