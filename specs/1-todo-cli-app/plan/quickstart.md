# Quickstart Guide: In-Memory Python Console Todo App

## Development Environment Setup

### Prerequisites
- Python 3.13+ installed on your system
- UV package manager (for dependency management)
- Basic command-line familiarity

### Setup Steps
1. Clone or create the project directory
2. Ensure Python 3.13+ is available:
   ```bash
   python --version
   ```
3. Install UV package manager if not already installed:
   ```bash
   pip install uv
   ```
4. Create a virtual environment:
   ```bash
   uv venv
   ```
5. Activate the virtual environment:
   ```bash
   # On Windows:
   .\.venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

## Project Structure
```
todo_app/
├── __init__.py
├── models.py          # Todo data class and storage
├── operations.py      # Core todo operations
├── cli.py            # Command-line interface logic
└── main.py           # Application entry point
```

## Running the Application

### Direct Execution
```bash
python -m todo_app.main [command] [arguments]
```

### Example Commands

#### Add a Todo
```bash
# Add a todo with title only
python -m todo_app.main add "Buy groceries"

# Add a todo with title and description
python -m todo_app.main add "Buy groceries" "Milk, eggs, bread"
```

#### List All Todos
```bash
# List all todos
python -m todo_app.main list
```

#### Update a Todo
```bash
# Update only the title
python -m todo_app.main update 1 --title "Buy weekly groceries"

# Update only the description
python -m todo_app.main update 1 --description "Milk, eggs, bread, fruits, vegetables"

# Update both title and description
python -m todo_app.main update 1 --title "Buy weekly groceries" --description "Milk, eggs, bread, fruits, vegetables"
```

#### Delete a Todo
```bash
# Delete a todo by ID
python -m todo_app.main delete 1
```

#### Mark Todo as Complete/Incomplete
```bash
# Mark a todo as complete
python -m todo_app.main complete 1

# Mark a todo as incomplete
python -m todo_app.main incomplete 1
```

#### Get Help
```bash
# Show general help
python -m todo_app.main --help

# Show help for a specific command
python -m todo_app.main add --help
python -m todo_app.main update --help
```

## Development Workflow

### Adding New Features
1. Update the implementation plan if needed
2. Create or modify the appropriate module (models, operations, or cli)
3. Test the new functionality
4. Update documentation if necessary

### Testing the Application
1. Run the application with various commands to verify functionality
2. Test error conditions to ensure proper error handling
3. Verify data persistence within the session (in-memory)
4. Confirm data is cleared when the application restarts

### Common Issues and Solutions

#### Issue: Command not recognized
**Solution**: Ensure you're running the command from the project root directory and the virtual environment is activated.

#### Issue: Invalid ID error
**Solution**: Check that the ID exists by running `python -m todo_app.main list` to see all current todos.

#### Issue: Empty title error
**Solution**: Ensure the title is not empty or consists only of whitespace when adding or updating a todo.

## Key Features Summary

- **Add Todo**: Create new todos with title and optional description
- **List Todos**: View all todos with their status in a tabular format
- **Update Todo**: Modify title and/or description of existing todos
- **Delete Todo**: Remove todos by ID
- **Mark Complete/Incomplete**: Change the completion status of todos
- **In-Memory Storage**: All data is stored in memory during the session
- **Data Reset**: All data is lost when the application restarts
- **Command-Line Interface**: Simple and intuitive CLI for all operations