# Implementation Plan: In-Memory Python Console Todo App (Phase I)

## Technical Context

### Project Information
- **Project**: The Evolution of Todo
- **Phase**: Phase I — In-Memory Python Console App
- **Spec**: Spec v1 (approved)
- **Python Version**: 3.13+
- **Package Manager**: UV
- **Storage**: In-memory only (no persistent storage)
- **Interface**: Command-line application

### Architecture Overview
The application will follow a modular architecture with clear separation of concerns:
- **Data Layer**: In-memory storage using Python data structures
- **Business Logic Layer**: Todo operations and validation
- **CLI Layer**: Command-line interface and user interaction
- **Main Application**: Orchestrates the other layers

### Core Dependencies
- Standard Python 3.13+ libraries only (no external dependencies)
- UV for package management (if needed for any dependencies)

### Unknowns
- Specific command-line argument parsing library (argparse vs click vs sys.argv)
- Exact data structure for in-memory storage (list vs dict vs custom class)

## Constitution Check

### Compliance Verification
- ✅ Python 3.13+ requirement met
- ✅ In-memory storage only (no database/file persistence)
- ✅ Command-line interface requirement met
- ✅ Clean, modular, readable code principles
- ✅ Human-in-the-loop oversight maintained
- ✅ No manual boilerplate coding by student (AI implementation agent)

### Design Alignment
- Architecture follows separation of concerns
- Modular design enables testability
- CLI interface supports the specified user interactions
- In-memory storage meets technical constraints

## Gates Evaluation

### Gate 1: Technical Feasibility
- **Status**: ✅ PASSED
- **Justification**: All technical requirements are feasible with Python 3.13+ standard libraries

### Gate 2: Architecture Alignment
- **Status**: ✅ PASSED
- **Justification**: Proposed architecture aligns with project constitution and requirements

### Gate 3: Compliance Check
- **Status**: ✅ PASSED
- **Justification**: Plan complies with all constitutional requirements and constraints

## Phase 0: Research & Resolution

### Research Findings

#### Decision 1: Command-Line Interface Library
- **Decision**: Use Python's built-in `argparse` module
- **Rationale**: Part of standard library, sufficient for CLI requirements, no external dependencies
- **Alternatives considered**: `click` (requires installation), `sys.argv` (manual parsing)

#### Decision 2: In-Memory Storage Structure
- **Decision**: Use a dictionary with integer keys for O(1) lookup by ID
- **Rationale**: Efficient lookup by ID, maintains insertion order in Python 3.7+
- **Alternatives considered**: List with linear search, custom class wrapper

#### Decision 3: Application Structure
- **Decision**: Single main module with separate functions for each operation
- **Rationale**: Simple, clear separation of concerns, easy to test and maintain
- **Alternatives considered**: Object-oriented approach with TodoApp class

## Phase 1: Design & Contracts

### Data Model

#### Todo Entity
```python
{
    "id": int,           # Unique identifier (sequential starting from 1)
    "title": str,        # Required title (non-empty after trimming)
    "description": str,  # Optional description (can be None or empty string)
    "completed": bool,   # Status (default: False)
    "created_at": datetime  # Timestamp when created
}
```

#### In-Memory Storage Structure
```python
todos: Dict[int, Todo] = {}
next_id: int = 1  # Sequential ID counter
```

### API Contracts

#### Core Functions and Signatures

1. **add_todo(title: str, description: Optional[str] = None) -> int**
   - Input: Title (required), Description (optional)
   - Output: Assigned ID of new todo
   - Validation: Title must not be empty after trimming

2. **get_all_todos() -> List[Todo]**
   - Input: None
   - Output: List of all todos in creation order
   - Format: Returns todos sorted by creation order

3. **update_todo(todo_id: int, title: Optional[str] = None, description: Optional[str] = None) -> bool**
   - Input: Todo ID (required), new title (optional), new description (optional)
   - Output: True if successful, False if todo doesn't exist
   - Behavior: Only updates provided fields, leaves others unchanged

4. **delete_todo(todo_id: int) -> bool**
   - Input: Todo ID (required)
   - Output: True if successful, False if todo doesn't exist
   - Behavior: Permanently removes the todo

5. **mark_todo_completed(todo_id: int, completed: bool) -> bool**
   - Input: Todo ID (required), completion status (required)
   - Output: True if successful, False if todo doesn't exist
   - Behavior: Updates only the completion status

#### CLI Interface Functions

1. **parse_arguments() -> Namespace**
   - Input: sys.argv
   - Output: Parsed command-line arguments

2. **handle_add_command(args: Namespace) -> None**
   - Input: Parsed arguments with title and optional description
   - Output: Console message with result

3. **handle_list_command(args: Namespace) -> None**
   - Input: Parsed arguments
   - Output: Formatted list of all todos to console

4. **handle_update_command(args: Namespace) -> None**
   - Input: Parsed arguments with ID and optional fields
   - Output: Console message with result

5. **handle_delete_command(args: Namespace) -> None**
   - Input: Parsed arguments with ID
   - Output: Console message with result

6. **handle_complete_command(args: Namespace) -> None**
   - Input: Parsed arguments with ID and status
   - Output: Console message with result

### Module Structure

#### File Organization
```
todo_app/
├── __init__.py
├── models.py          # Todo data class and storage
├── operations.py      # Core todo operations
├── cli.py            # Command-line interface logic
└── main.py           # Application entry point
```

#### Module Dependencies
- `models.py`: Standalone, defines data structures
- `operations.py`: Depends on `models.py`, contains business logic
- `cli.py`: Depends on `operations.py`, handles user interaction
- `main.py`: Orchestrates the application, depends on `cli.py`

## Phase 2: Implementation Plan & Task Breakdown

### Implementation Plan

#### 1. Add Todo Feature
- **Module**: `operations.py`
- **Functions**: `add_todo(title, description)`
- **Input**: Title (str), Description (Optional[str])
- **Output**: Todo ID (int)
- **Validation**: Title cannot be empty after trimming
- **Storage**: Add to in-memory dictionary with next available ID

#### 2. View All Todos Feature
- **Module**: `operations.py`
- **Functions**: `get_all_todos()`
- **Input**: None
- **Output**: List of all todos sorted by creation order
- **Display**: ID, Title, Description, Status in tabular format

#### 3. Update Todo Feature
- **Module**: `operations.py`
- **Functions**: `update_todo(todo_id, title, description)`
- **Input**: Todo ID (int), new title (Optional[str]), new description (Optional[str])
- **Output**: Success boolean (bool)
- **Behavior**: Only update provided fields, leave others unchanged

#### 4. Delete Todo Feature
- **Module**: `operations.py`
- **Functions**: `delete_todo(todo_id)`
- **Input**: Todo ID (int)
- **Output**: Success boolean (bool)
- **Behavior**: Remove from in-memory storage

#### 5. Mark Complete/Incomplete Feature
- **Module**: `operations.py`
- **Functions**: `mark_todo_completed(todo_id, completed)`
- **Input**: Todo ID (int), completion status (bool)
- **Output**: Success boolean (bool)
- **Behavior**: Update only the completion status

#### 6. CLI Implementation
- **Module**: `cli.py`
- **Functions**: Argument parsing and command handling
- **Input**: Command-line arguments
- **Output**: Console messages and formatted output
- **Commands**: add, list, update, delete, complete, incomplete

#### 7. Main Application
- **Module**: `main.py`
- **Function**: Entry point and application flow
- **Input**: Command-line arguments
- **Output**: Execute appropriate command

## Task Breakdown

| Task ID | Feature | Description | Target File | Expected Input/Output | Status |
|---------|---------|-------------|-------------|----------------------|---------|
| 1 | Data Model | Create Todo data class and in-memory storage structure | todo_app/models.py | Define Todo class and global storage dictionary | Pending |
| 2 | Add Todo | Implement add_todo function with validation | todo_app/operations.py | Input: title, description; Output: todo ID | Pending |
| 3 | View Todos | Implement get_all_todos function to retrieve all todos | todo_app/operations.py | Input: None; Output: list of todos in creation order | Pending |
| 4 | Update Todo | Implement update_todo function to modify existing todo | todo_app/operations.py | Input: todo ID, optional title/description; Output: success boolean | Pending |
| 5 | Delete Todo | Implement delete_todo function to remove a todo | todo_app/operations.py | Input: todo ID; Output: success boolean | Pending |
| 6 | Mark Status | Implement mark_todo_completed function to change completion status | todo_app/operations.py | Input: todo ID, completion status; Output: success boolean | Pending |
| 7 | CLI Setup | Implement argument parsing with argparse | todo_app/cli.py | Input: sys.argv; Output: parsed arguments | Pending |
| 8 | Add Command | Implement CLI handler for add command | todo_app/cli.py | Input: parsed add arguments; Output: console message | Pending |
| 9 | List Command | Implement CLI handler for list command | todo_app/cli.py | Input: parsed list arguments; Output: formatted todo list | Pending |
| 10 | Update Command | Implement CLI handler for update command | todo_app/cli.py | Input: parsed update arguments; Output: console message | Pending |
| 11 | Delete Command | Implement CLI handler for delete command | todo_app/cli.py | Input: parsed delete arguments; Output: console message | Pending |
| 12 | Complete Command | Implement CLI handler for complete/incomplete commands | todo_app/cli.py | Input: parsed complete arguments; Output: console message | Pending |
| 13 | Main App | Create main application entry point | todo_app/main.py | Input: command-line arguments; Output: execute appropriate command | Pending |
| 14 | Error Handling | Add comprehensive error handling and validation | todo_app/operations.py, todo_app/cli.py | Input: various; Output: appropriate error messages | Pending |
| 15 | Help Text | Add help text and usage instructions to CLI | todo_app/cli.py | Input: --help or invalid commands; Output: help information | Pending |

## Quickstart Guide

### Development Environment Setup
1. Ensure Python 3.13+ is installed
2. Install UV package manager
3. Clone the repository
4. Create virtual environment with UV

### Running the Application
```bash
python -m todo_app.main [command] [arguments]
```

### Example Commands
```bash
# Add a todo
python -m todo_app.main add "Buy groceries" "Milk, eggs, bread"

# List all todos
python -m todo_app.main list

# Update a todo
python -m todo_app.main update 1 --title "Buy weekly groceries"

# Delete a todo
python -m todo_app.main delete 1

# Mark as complete
python -m todo_app.main complete 1
```

## Agent Context Update

The following technologies and patterns will be added to the agent context:
- Python 3.13+ standard library usage
- argparse for command-line argument parsing
- In-memory data storage patterns
- Modular Python application structure
- CLI application design patterns

## Re-evaluation: Post-Design Constitution Check

### Architecture Alignment Post-Implementation
- ✅ Clean, modular, readable code principles maintained
- ✅ Separation of concerns achieved through module structure
- ✅ In-memory storage implemented as required
- ✅ CLI interface meets specification requirements
- ✅ Python 3.13+ standards followed

### Compliance Verification
All constitutional requirements continue to be met after detailed design:
- ✅ No external dependencies beyond standard library
- ✅ In-memory only storage implemented
- ✅ Command-line interface as specified
- ✅ Modular architecture for maintainability