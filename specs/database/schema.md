# Database Schema Specification

## Overview
The database schema supports the Todo application with user authentication and task management. The schema leverages Better Auth for user management while maintaining custom tables for application-specific data.

## Users Table (Better Auth Managed)
The users table is managed by Better Auth and contains user authentication information.

### Fields
- `id`: Primary key (UUID/string), unique identifier for each user
- `email`: User's email address (string), unique, required for login
- `password_hash`: Hashed password (string), secured with bcrypt or similar
- `created_at`: Account creation timestamp (datetime), automatically set
- `updated_at`: Last update timestamp (datetime), automatically updated
- `email_verified`: Boolean indicating if email is verified (boolean)

### Constraints
- Email must be unique across all users
- Email format must be valid
- Password hash is required for all accounts
- Primary key constraint on `id`

### Indexing
- Index on `email` field for efficient login lookups
- Index on `id` field (primary key)

## Tasks Table
The tasks table stores individual todo items with associations to users.

### Fields
- `id`: Primary key (UUID/serial), unique identifier for each task
- `title`: Task title (string), required, minimum 1 character
- `description`: Task description (text), optional
- `completed`: Completion status (boolean), default false
- `user_id`: Foreign key to users table (UUID/string), required
- `created_at`: Task creation timestamp (datetime), automatically set
- `updated_at`: Last update timestamp (datetime), automatically updated

### Constraints
- `title` must not be empty (length > 0)
- `user_id` must reference a valid user in the users table (foreign key constraint)
- Primary key constraint on `id`
- Required field constraints on `title` and `user_id`

### Indexing
- Index on `user_id` for efficient user-specific queries
- Index on `completed` for status filtering
- Composite index on (`user_id`, `completed`) for combined filtering
- Index on `created_at` for chronological ordering
- Primary key index on `id`

## Relationships
- Tasks table has a foreign key relationship to Users table
- One user can have many tasks (1:N relationship)
- Cascade delete on user removal (deletes all associated tasks)
- Referential integrity enforced by database constraints

## Additional Considerations
- Database uses Neon PostgreSQL
- Connection handled through environment variables
- Connection pooling recommended for production
- All timestamps stored in UTC
- Soft deletes considered but not implemented (hard deletes used)