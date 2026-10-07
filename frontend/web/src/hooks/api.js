const BASE_URL = 'http://localhost:8001';

/**
 * Universal fetch wrapper for API calls.
 */
async function callApi(endpoint, body = null, method = 'GET', headers = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        // Handle 204 No Content or empty responses safely
        if (response.status === 204) {
            return { success: true };
        }

        return await response.json();
    } catch (error) {
        console.error(`API Call Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

// ============================================================================
// SYSTEM & MONITORING
// ============================================================================

export function getHealthCheckUrl() {
    return `${BASE_URL}/monitor/health`;
}

// ============================================================================
// TASK MANAGEMENT ENDPOINTS
// ============================================================================

export async function createTask(taskData) {
    // POST /tasks/create
    return await callApi('/tasks/create', taskData, 'POST');
}

export async function updateTask(taskId, taskData) {
    // PUT /tasks/{task_id}/update
    return await callApi(`/tasks/${taskId}/update`, taskData, 'PUT');
}

export async function updateTaskState(taskId, newState) {
    // PATCH /tasks/{task_id}/state?new_state={new_state}
    return await callApi(`/tasks/${taskId}/state?new_state=${encodeURIComponent(newState)}`, null, 'PATCH');
}

export async function fetchTasksDueToday() {
    // GET /tasks/due_today
    return await callApi('/tasks/due_today', null, 'GET');
}

export async function fetchUpcomingTasks() {
    // GET /tasks/upcoming
    return await callApi('/tasks/upcoming', null, 'GET');
}

export async function fetchOverdueTasks() {
    // GET /tasks/overdue
    return await callApi('/tasks/overdue', null, 'GET');
}

export async function fetchCompletedTasks() {
    // GET /tasks/completed
    return await callApi('/tasks/completed', null, 'GET');
}

export async function fetchTasks() {
    // GET /tasks/all (Active non-completed tasks)
    return await callApi('/tasks/all', null, 'GET');
}

export async function fetchTaskById(taskId) {
    // GET /tasks/{task_id}
    return await callApi(`/tasks/${taskId}`, null, 'GET');
}

export async function assignTagToTask(taskId, tagName) {
    // POST /tasks/{task_id}/tags/{tag_name}
    return await callApi(`/tasks/${taskId}/tags/${encodeURIComponent(tagName)}`, null, 'POST');
}

export async function fetchTasksByTag(tagName) {
    // GET /tags/{tag_name}/tasks
    return await callApi(`/tags/${encodeURIComponent(tagName)}/tasks`, null, 'GET');
}

export async function deleteTask(taskId) {
    // DELETE /tasks/{task_id}
    return await callApi(`/tasks/${taskId}`, null, 'DELETE');
}

// ============================================================================
// PROJECT MANAGEMENT ENDPOINTS
// ============================================================================

export async function createProject(projectData) {
    // POST /projects/create
    return await callApi('/projects/create', projectData, 'POST');
}

export async function updateProject(projectId, projectData) {
    // PUT /projects/{project_id}/update
    return await callApi(`/projects/${projectId}/update`, projectData, 'PUT');
}

export async function updateProjectState(projectId, newState) {
    // PATCH /projects/{project_id}/state?new_state={new_state}
    return await callApi(`/projects/${projectId}/state?new_state=${encodeURIComponent(newState)}`, null, 'PATCH');
}

export async function fetchProjectsDueToday() {
    // GET /projects/due_today
    return await callApi('/projects/due_today', null, 'GET');
}

export async function fetchUpcomingProjects() {
    // GET /projects/upcoming
    return await callApi('/projects/upcoming', null, 'GET');
}

export async function fetchOverdueProjects() {
    // GET /projects/overdue
    return await callApi('/projects/overdue', null, 'GET');
}

export async function fetchCompletedProjects() {
    // GET /projects/completed
    return await callApi('/projects/completed', null, 'GET');
}

export async function fetchProjects() {
    // GET /projects/all (Active non-completed projects)
    return await callApi('/projects/all', null, 'GET');
}

export async function fetchProjectById(projectId) {
    // GET /projects/{project_id}
    return await callApi(`/projects/${projectId}`, null, 'GET');
}

export async function assignTagToProject(projectId, tagName) {
    // POST /projects/{project_id}/tags/{tag_name}
    return await callApi(`/projects/${projectId}/tags/${encodeURIComponent(tagName)}`, null, 'POST');
}

export async function fetchProjectsByTag(tagName) {
    // GET /tags/{tag_name}/projects
    return await callApi(`/tags/${encodeURIComponent(tagName)}/projects`, null, 'GET');
}

export async function deleteProject(projectId) {
    // DELETE /projects/{project_id}
    return await callApi(`/projects/${projectId}`, null, 'DELETE');
}