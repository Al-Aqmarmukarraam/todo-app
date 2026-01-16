# UI Pages Specification

## Login Page
- **Purpose**: Allow existing users to authenticate and access their accounts
- **Components**: AuthForm component for login
- **Layout**: Centered form with email/password fields and submit button
- **Navigation**: Link to signup page for new users
- **Functionality**: Submit credentials, handle authentication errors, redirect to dashboard on success
- **Validation**: Real-time validation for email format and required fields
- **Error Handling**: Display authentication errors from API

## Signup Page
- **Purpose**: Allow new users to create accounts
- **Components**: AuthForm component for registration
- **Layout**: Centered form with email/password/confirm password fields and submit button
- **Navigation**: Link to login page for existing users
- **Functionality**: Submit registration details, handle creation errors, redirect to dashboard on success
- **Validation**: Real-time validation for email format, password strength, and required fields
- **Error Handling**: Display registration errors from API

## Dashboard Page
- **Purpose**: Main application page showing user's tasks and controls
- **Components**: Navbar, TaskList, and TaskForm modal/button
- **Layout**: Responsive layout with navigation header and main content area
- **Navigation**: Links to user profile/logout in header
- **Functionality**: Display user's tasks, provide access to create new tasks, allow filtering by status
- **Default View**: Show all tasks (completed and pending)

## Task List View
- **Purpose**: Display all tasks for the authenticated user
- **Components**: TaskList and TaskCard components
- **Layout**: Grid or list view of tasks with consistent spacing
- **Functionality**: Show task details, allow completion toggling, provide edit/delete controls
- **Filtering**: Controls to filter by status (all, completed, pending)
- **Empty State**: Friendly message when no tasks exist with call-to-action

## Task Create/Edit Modal or Page
- **Purpose**: Allow users to create new tasks or edit existing ones
- **Components**: TaskForm component
- **Layout**: Modal overlay or dedicated page with form fields
- **Fields**: Title (required), description (optional), completion status (for editing)
- **Functionality**: Submit new task or update existing task, cancel/closing behavior
- **Validation**: Required field validation, character limits
- **Error Handling**: Display API errors for saving tasks