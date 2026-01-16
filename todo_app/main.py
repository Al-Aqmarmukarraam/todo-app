"""
Main entry point for the Todo application.

This module serves as the entry point for the command-line interface.
"""
from .cli import create_parser, handle_add_command, handle_list_command, handle_update_command, handle_delete_command, handle_complete_command, handle_incomplete_command


def main():
    """
    Main function that parses command-line arguments and executes the appropriate command.
    """
    # Create the argument parser
    parser = create_parser()

    # Parse the command-line arguments
    args = parser.parse_args()

    # Execute the appropriate handler based on the command
    if args.command == 'add':
        handle_add_command(args)
    elif args.command == 'list':
        handle_list_command(args)
    elif args.command == 'update':
        handle_update_command(args)
    elif args.command == 'delete':
        handle_delete_command(args)
    elif args.command == 'complete':
        handle_complete_command(args)
    elif args.command == 'incomplete':
        handle_incomplete_command(args)
    else:
        # This should not happen due to argparse configuration, but included for safety
        print(f"Unknown command: {args.command}")
        parser.print_help()


if __name__ == "__main__":
    main()