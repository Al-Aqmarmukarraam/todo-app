# UI Components Specification

## TaskCard Component
- **Purpose**: Display individual task information in a card format
- **Props**:
  - `task`: Task object with id, title, description, completed status
  - `onToggleComplete`: Callback function when completion status changes
  - `onEdit`: Callback function when edit button clicked
  - `onDelete`: Callback function when delete button clicked
- **Display**: Title, description (if exists), completion status indicator
- **Actions**: Complete/incomplete toggle, edit button, delete button
- **Styling**: Card layout with consistent padding, visual indication of completion status
- **Accessibility**: Proper ARIA labels for completion toggle and actions

## TaskList Component
- **Purpose**: Display a collection of TaskCard components
- **Props**:
  - `tasks`: Array of task objects
  - `onTaskUpdate`: Callback when a task is updated
  - `onTaskDelete`: Callback when a task is deleted
- **Display**: List/grid of TaskCard components
- **Empty State**: Message when no tasks exist
- **Filtering**: Option to accept filter criteria to show subset of tasks
- **Loading State**: Visual indication when tasks are loading

## TaskForm Component
- **Purpose**: Form for creating or editing tasks
- **Props**:
  - `initialValues`: Task object for editing, empty for creation
  - `onSubmit`: Callback function when form submitted
  - `onCancel`: Callback function when form cancelled
  - `submitText`: Text for submit button (e.g., "Create" or "Update")
- **Fields**:
  - Title: Required text input with validation
  - Description: Optional textarea
  - Completed: Checkbox for editing existing tasks
- **Validation**: Required field validation, character limits
- **Error Handling**: Display field-specific and general errors
- **Accessibility**: Proper labels and error messaging

## AuthForm Component
- **Purpose**: Unified component for login and signup forms
- **Props**:
  - `mode`: "login" or "signup" to control behavior
  - `onSubmit`: Callback function when form submitted
  - `onSwitchMode`: Callback when user wants to switch between login/signup
- **Fields** (based on mode):
  - Login: Email, password
  - Signup: Email, password, confirm password
- **Validation**: Email format, password requirements, password match (for signup)
- **Error Handling**: Display authentication/registration errors
- **Loading State**: Visual indication during submission

## Navbar/Header Component
- **Purpose**: Navigation and user controls across all pages
- **Props**:
  - `user`: User object with name/email for display
  - `onLogout`: Callback function when logout clicked
- **Display**:
  - Application logo/title on left
  - User profile info and logout button on right (when authenticated)
  - Navigation links as needed
- **Responsive**: Collapsible menu for mobile screens
- **Accessibility**: Proper landmark roles and navigation labeling