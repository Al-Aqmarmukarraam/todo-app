# Task CRUD Operations - Feature Specification

## User Stories

### Create Task
- As a logged-in user, I want to create new tasks so that I can track my to-dos
- Given I am authenticated and on the dashboard, when I submit a new task with a title, then the task is saved to my account

### View Tasks
- As a logged-in user, I want to view all my tasks so that I can manage my to-dos
- Given I am authenticated, when I access my dashboard, then I see all tasks belonging to my account

### Update Task
- As a logged-in user, I want to update my tasks so that I can modify their details
- Given I am authenticated and have a task, when I edit the task details, then the changes are saved to my task

### Delete Task
- As a logged-in user, I want to delete tasks I no longer need so that I can keep my list clean
- Given I am authenticated and have a task, when I choose to delete it, then the task is permanently removed from my account

### Mark Task Complete/Incomplete
- As a logged-in user, I want to mark tasks as complete/incomplete so that I can track my progress
- Given I am authenticated and have a task, when I toggle its completion status, then the status is updated in my account

## Acceptance Criteria

### Task Ownership Enforced
- Users can only view, edit, or delete their own tasks
- Attempting to access another user's tasks results in a permission error
- API endpoints validate user identity against task ownership

### Title Required
- Every task must have a title with at least 1 character
- Empty titles are rejected with a validation error
- Title length should have a reasonable maximum (e.g., 255 characters)

### Status Filtering
- Users can filter tasks by completion status (all, completed, pending)
- Default view shows all tasks
- Filtering happens on the client-side with the option for server-side filtering

### Multi-user Isolation
- Users cannot see tasks from other users
- Database queries are scoped to the authenticated user
- API endpoints require authentication and validate user identity