# Tasks: In-Memory Python Console Todo App (Phase I)

## Feature Overview
- **Feature**: In-Memory Python Console Todo App
- **Phase**: Phase I
- **Spec**: Spec v1 (approved)
- **Plan**: Phase I implementation plan (approved)

## Implementation Strategy
This implementation follows an incremental delivery approach, starting with a minimal viable product (MVP) that includes the core functionality of adding and viewing todos. Subsequent phases will implement the remaining features (update, delete, mark complete/incomplete).

## Dependencies
- Python 3.13+
- UV package manager
- Standard library only (no external dependencies)

## Parallel Execution Opportunities
- Data model and CLI setup can be developed in parallel with operations
- Individual feature implementations can be developed independently after foundational setup

## Phase 1: Setup
### Goal
Initialize the project structure and foundational components required for all features.

### Tasks
- [x] T001 Create project directory structure with todo_app/ package
- [x] T002 Initialize Python package with __init__.py files
- [x] T003 Set up UV configuration for project dependencies

## Phase 2: Foundational Components
### Goal
Implement the core data model and storage mechanism that will be used by all features.

### Tasks
- [x] T004 [P] Create Todo data model in todo_app/models.py with id, title, description, completed, created_at fields
- [x] T005 [P] Implement in-memory storage in todo_app/models.py with global todos dict and next_id counter
- [x] T006 [P] Create utility functions for ID generation and validation in todo_app/models.py

## Phase 3: Add Todo Feature [US1]
### Goal
Implement the ability to add new todos with title and optional description.

### Independent Test Criteria
- User can add a todo with a title
- User can add a todo with a title and description
- Todo is assigned a unique ID
- Todo is stored in memory
- Title validation prevents empty titles

### Tasks
- [x] T007 [P] [US1] Implement add_todo function in todo_app/operations.py with title validation
- [x] T008 [P] [US1] Add input validation for title (non-empty after trimming)
- [x] T009 [US1] Create CLI handler for add command in todo_app/cli.py
- [x] T010 [US1] Implement argument parsing for add command with title and optional description

## Phase 4: View Todos Feature [US2]
### Goal
Implement the ability to view all todos with their status in a formatted list.

### Independent Test Criteria
- User can list all todos
- Todos display with ID, title, description, and completion status
- Todos are displayed in creation order
- Empty list is handled gracefully

### Tasks
- [x] T011 [P] [US2] Implement get_all_todos function in todo_app/operations.py
- [x] T012 [US2] Create CLI handler for list command in todo_app/cli.py
- [x] T013 [US2] Format and display todos in tabular format in todo_app/cli.py

## Phase 5: Update Todo Feature [US3]
### Goal
Implement the ability to update the title and/or description of existing todos.

### Independent Test Criteria
- User can update a todo's title
- User can update a todo's description
- User can update both title and description simultaneously
- Update fails gracefully if todo ID doesn't exist
- Only specified fields are updated, others remain unchanged

### Tasks
- [x] T014 [P] [US3] Implement update_todo function in todo_app/operations.py
- [x] T015 [P] [US3] Add validation for update operations in todo_app/operations.py
- [x] T016 [US3] Create CLI handler for update command in todo_app/cli.py
- [x] T017 [US3] Implement argument parsing for update command with optional fields

## Phase 6: Delete Todo Feature [US4]
### Goal
Implement the ability to delete todos by ID.

### Independent Test Criteria
- User can delete a todo by ID
- Delete operation returns success status
- Attempting to delete non-existent todo fails gracefully
- Deleted todo is removed from storage

### Tasks
- [x] T018 [P] [US4] Implement delete_todo function in todo_app/operations.py
- [x] T019 [P] [US4] Add validation for delete operations in todo_app/operations.py
- [x] T020 [US4] Create CLI handler for delete command in todo_app/cli.py
- [x] T021 [US4] Implement argument parsing for delete command

## Phase 7: Mark Complete/Incomplete Feature [US5]
### Goal
Implement the ability to mark todos as complete or incomplete.

### Independent Test Criteria
- User can mark a todo as complete
- User can mark a todo as incomplete
- Operation returns success status
- Attempting to mark non-existent todo fails gracefully
- Todo status is updated in storage

### Tasks
- [x] T022 [P] [US5] Implement mark_todo_completed function in todo_app/operations.py
- [x] T023 [P] [US5] Add validation for status update operations in todo_app/operations.py
- [x] T024 [US5] Create CLI handlers for complete and incomplete commands in todo_app/cli.py
- [x] T025 [US5] Implement argument parsing for complete/incomplete commands

## Phase 8: Main Application & CLI Integration
### Goal
Integrate all features into a cohesive command-line application with proper error handling.

### Tasks
- [x] T026 [P] Create main application entry point in todo_app/main.py
- [x] T027 [P] Implement comprehensive error handling across all modules
- [x] T028 [P] Add help text and usage instructions to CLI
- [ ] T029 [P] Implement graceful error messages for invalid operations
- [ ] T030 [P] Add validation for all user inputs across all commands

## Phase 9: Polish & Cross-Cutting Concerns
### Goal
Finalize the application with proper documentation, testing, and quality improvements.

### Tasks
- [ ] T031 Add comprehensive docstrings to all functions and modules
- [ ] T032 Implement input sanitization and additional validation
- [ ] T033 Add logging for debugging and error tracking
- [ ] T034 Create README.md with usage instructions
- [ ] T035 Perform integration testing of all features