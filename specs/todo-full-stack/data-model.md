# Data Model: Todo Full-Stack Web Application (Phase II)

## Entities

### User Entity
- **Primary Key**: `id` (UUID/string) - unique identifier
- **Attributes**:
  - `email` (string) - user's email address, unique, required
  - `password_hash` (string) - securely hashed password, required
  - `created_at` (datetime) - account creation timestamp, auto-generated
  - `updated_at` (datetime) - last update timestamp, auto-generated
  - `email_verified` (boolean) - indicates if email is verified, default: false

- **Validation Rules**:
  - Email must be valid email format
  - Email must be unique across all users
  - Password hash must exist for all accounts

- **Relationships**:
  - One User to Many Tasks (1:N relationship)

### Task Entity
- **Primary Key**: `id` (UUID/serial) - unique identifier
- **Attributes**:
  - `title` (string) - task title, required, min length: 1 character
  - `description` (text) - task description, optional
  - `completed` (boolean) - completion status, default: false
  - `user_id` (UUID/string) - foreign key to User, required
  - `created_at` (datetime) - task creation timestamp, auto-generated
  - `updated_at` (datetime) - last update timestamp, auto-generated

- **Validation Rules**:
  - Title must not be empty (length > 0)
  - User ID must reference a valid user
  - Title length should have maximum of 255 characters

- **State Transitions**:
  - `completed` can transition from false to true (mark complete)
  - `completed` can transition from true to false (mark incomplete)
  - All other attributes can be updated when editing

- **Relationships**:
  - Many Tasks to One User (N:1 relationship)
  - Foreign key constraint on `user_id` to `users.id`

## Constraints

### Database Constraints
- Primary key constraints on `id` fields for both entities
- Unique constraint on `email` field in users table
- Foreign key constraint from `tasks.user_id` to `users.id`
- NOT NULL constraints on required fields
- Check constraint on email format (if database supports)

### Application-Level Constraints
- Users can only access tasks associated with their user ID
- Task titles must be at least 1 character long
- Task titles must be no more than 255 characters long

## Indexes

### Required Indexes
- Index on `users.email` for efficient login lookups
- Index on `tasks.user_id` for efficient user-specific queries
- Index on `tasks.completed` for status filtering
- Composite index on (`tasks.user_id`, `tasks.completed`) for combined filtering
- Index on `tasks.created_at` for chronological ordering
- Primary key indexes on `id` fields (automatically created)

## Access Patterns

### Common Queries
- Retrieve all tasks for a specific user (filtered by user_id)
- Retrieve a specific task for a specific user (filtered by user_id and task id)
- Update task completion status for a specific user's task
- Filter tasks by completion status for a specific user
- Create new task for a specific user

### Performance Considerations
- Most frequent operation: retrieving user's tasks by user_id
- Second most frequent: updating task completion status
- Indexes optimized for user-specific access patterns