"""
Command-line interface module for the Todo application.

This module handles command-line argument parsing and user interaction.
"""
import argparse
import sys
from typing import Optional

# Handle imports for both module execution and direct execution
try:
    from .operations import add_todo, get_all_todos
except ImportError:
    # If running as a module directly, we need to handle the import differently
    import os
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from operations import add_todo, get_all_todos


def create_parser() -> argparse.ArgumentParser:
    """
    Create and configure the argument parser for the todo application.

    Returns:
        Configured argument parser
    """
    parser = argparse.ArgumentParser(
        description="A command-line todo application with in-memory storage",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    # Create subparsers for different commands
    subparsers = parser.add_subparsers(dest='command', help='Available commands', required=True)

    # Add command
    add_parser = subparsers.add_parser('add', help='Add a new todo')
    add_parser.add_argument('title', help='Title of the todo')
    add_parser.add_argument('description', nargs='?', help='Optional description of the todo')

    # List command
    list_parser = subparsers.add_parser('list', help='List all todos')

    # Update command
    update_parser = subparsers.add_parser('update', help='Update an existing todo')
    update_parser.add_argument('id', type=int, help='ID of the todo to update')
    update_parser.add_argument('--title', help='New title for the todo')
    update_parser.add_argument('--description', help='New description for the todo')

    # Delete command
    delete_parser = subparsers.add_parser('delete', help='Delete a todo')
    delete_parser.add_argument('id', type=int, help='ID of the todo to delete')

    # Complete command
    complete_parser = subparsers.add_parser('complete', help='Mark a todo as complete')
    complete_parser.add_argument('id', type=int, help='ID of the todo to mark as complete')

    # Incomplete command
    incomplete_parser = subparsers.add_parser('incomplete', help='Mark a todo as incomplete')
    incomplete_parser.add_argument('id', type=int, help='ID of the todo to mark as incomplete')

    return parser


def handle_add_command(args) -> None:
    """
    Handle the add command by creating a new todo.

    Args:
        args: Parsed command-line arguments for the add command
    """
    try:
        # Extract title and description from arguments
        title = args.title
        description = args.description

        # Add the new todo using the operations module
        todo_id = add_todo(title, description)

        # Print success message
        print(f"Todo added successfully with ID: {todo_id}")

    except ValueError as e:
        # Handle validation errors (e.g., empty title)
        print(f"Error: {e}")
    except TypeError as e:
        # Handle type errors (e.g., wrong data type)
        print(f"Error: {e}")
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")


def handle_list_command(args) -> None:
    """
    Handle the list command by displaying all todos.

    Args:
        args: Parsed command-line arguments for the list command
    """
    from .operations import get_all_todos

    try:
        # Get all todos from the operations module
        all_todos = get_all_todos()

        # Check if there are any todos to display
        if not all_todos:
            print("No todos found.")
            return

        # Print header
        print(f"{'ID':<4} {'Status':<10} {'Title':<30} {'Description'}")
        print("-" * 70)

        # Print each todo in a formatted table
        for todo in all_todos:
            status = "Complete" if todo.completed else "Incomplete"
            description = todo.description if todo.description else ""
            print(f"{todo.id:<4} {status:<10} {todo.title:<30} {description}")

    except Exception as e:
        # Handle any unexpected errors
        print(f"An unexpected error occurred while listing todos: {e}")


def handle_update_command(args) -> None:
    """
    Handle the update command by updating an existing todo.

    Args:
        args: Parsed command-line arguments for the update command
    """
    from .operations import update_todo

    try:
        # Extract ID, title, and description from arguments
        todo_id = args.id
        title = args.title
        description = args.description

        # Check if at least one field is provided for update
        if title is None and description is None:
            print("Error: Please provide at least one field to update (--title or --description)")
            return

        # Update the todo using the operations module
        success = update_todo(todo_id, title, description)

        if success:
            print(f"Todo {todo_id} updated successfully")
        else:
            print(f"Error: Todo with ID {todo_id} does not exist")

    except ValueError as e:
        # Handle validation errors (e.g., empty title)
        print(f"Error: {e}")
    except TypeError as e:
        # Handle type errors (e.g., wrong data type)
        print(f"Error: {e}")
    except Exception as e:
        # Handle any other unexpected errors
        print(f"An unexpected error occurred: {e}")


def handle_delete_command(args) -> None:
    """
    Handle the delete command by deleting an existing todo.

    Args:
        args: Parsed command-line arguments for the delete command
    """
    from .operations import delete_todo

    try:
        # Extract ID from arguments
        todo_id = args.id

        # Delete the todo using the operations module
        success = delete_todo(todo_id)

        if success:
            print(f"Todo {todo_id} deleted successfully")
        else:
            print(f"Error: Todo with ID {todo_id} does not exist")

    except Exception as e:
        # Handle any unexpected errors
        print(f"An unexpected error occurred: {e}")


def handle_complete_command(args) -> None:
    """
    Handle the complete command by marking a todo as complete.

    Args:
        args: Parsed command-line arguments for the complete command
    """
    from .operations import mark_todo_completed

    try:
        # Extract ID from arguments
        todo_id = args.id

        # Mark the todo as complete using the operations module
        success = mark_todo_completed(todo_id, True)

        if success:
            print(f"Todo {todo_id} marked as complete")
        else:
            print(f"Error: Todo with ID {todo_id} does not exist")

    except Exception as e:
        # Handle any unexpected errors
        print(f"An unexpected error occurred: {e}")


def handle_incomplete_command(args) -> None:
    """
    Handle the incomplete command by marking a todo as incomplete.

    Args:
        args: Parsed command-line arguments for the incomplete command
    """
    from .operations import mark_todo_completed

    try:
        # Extract ID from arguments
        todo_id = args.id

        # Mark the todo as incomplete using the operations module
        success = mark_todo_completed(todo_id, False)

        if success:
            print(f"Todo {todo_id} marked as incomplete")
        else:
            print(f"Error: Todo with ID {todo_id} does not exist")

    except Exception as e:
        # Handle any unexpected errors
        print(f"An unexpected error occurred: {e}")


def main():
    """
    Main function to parse command-line arguments and execute the appropriate command.
    """
    parser = create_parser()
    args = parser.parse_args()

    # Map commands to their handler functions
    command_handlers = {
        'add': handle_add_command,
        'list': handle_list_command,
        'update': handle_update_command,
        'delete': handle_delete_command,
        'complete': handle_complete_command,
        'incomplete': handle_incomplete_command
    }

    # Execute the appropriate handler based on the command
    if args.command in command_handlers:
        command_handlers[args.command](args)
    else:
        # If command is not recognized, print help
        parser.print_help()


if __name__ == '__main__':
    main()