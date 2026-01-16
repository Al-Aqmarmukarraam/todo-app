import json
import os
from datetime import datetime

# Constants
TODO_FILE = "todo_data.json"

def load_tasks():
    """Load tasks from the JSON file."""
    if os.path.exists(TODO_FILE):
        with open(TODO_FILE, 'r') as file:
            return json.load(file)
    return []

def save_tasks(tasks):
    """Save tasks to the JSON file."""
    with open(TODO_FILE, 'w') as file:
        json.dump(tasks, file, indent=2)

def display_menu():
    """Display the main menu."""
    print("\nTodo App")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Mark Task Completed")
    print("4. Delete Task")
    print("5. Exit")

def add_task(tasks):
    """Add a new task to the list."""
    description = input("Enter task description: ").strip()
    if not description:
        print("Task description cannot be empty!")
        return tasks

    # Generate a new ID (highest existing ID + 1)
    new_id = max([task['id'] for task in tasks], default=0) + 1

    new_task = {
        'id': new_id,
        'description': description,
        'completed': False,
        'created_at': datetime.now().isoformat()
    }

    tasks.append(new_task)
    save_tasks(tasks)
    print(f"Task '{description}' added successfully with ID {new_id}!")
    return tasks

def view_tasks(tasks):
    """Display all tasks with their status."""
    if not tasks:
        print("No tasks found!")
        return

    print("\nYour Tasks:")
    print("-" * 50)
    for task in sorted(tasks, key=lambda x: x['id']):
        status = "[DONE]" if task['completed'] else "[TODO]"
        print(f"{task['id']}. {status} {task['description']}")
    print("-" * 50)

def mark_task_completed(tasks):
    """Mark a task as completed."""
    if not tasks:
        print("No tasks found!")
        return tasks

    try:
        task_id = int(input("Enter task ID to mark as completed: "))
        task_found = False

        for task in tasks:
            if task['id'] == task_id:
                if task['completed']:
                    print(f"Task {task_id} is already completed!")
                else:
                    task['completed'] = True
                    save_tasks(tasks)
                    print(f"Task {task_id} marked as completed!")
                task_found = True
                break

        if not task_found:
            print(f"Task with ID {task_id} not found!")

    except ValueError:
        print("Invalid input! Please enter a valid task ID.")

    return tasks

def delete_task(tasks):
    """Delete a task by ID."""
    if not tasks:
        print("No tasks found!")
        return tasks

    try:
        task_id = int(input("Enter task ID to delete: "))
        task_found = False

        for i, task in enumerate(tasks):
            if task['id'] == task_id:
                deleted_task = tasks.pop(i)
                save_tasks(tasks)
                print(f"Task '{deleted_task['description']}' (ID: {task_id}) deleted successfully!")
                task_found = True
                break

        if not task_found:
            print(f"Task with ID {task_id} not found!")

    except ValueError:
        print("Invalid input! Please enter a valid task ID.")

    return tasks

def main():
    """Main function to run the Todo App."""
    print("Welcome to the Todo App!")
    tasks = load_tasks()

    while True:
        display_menu()

        try:
            choice = input("\nEnter your choice (1-5): ").strip()

            if choice == '1':
                tasks = add_task(tasks)
            elif choice == '2':
                view_tasks(tasks)
            elif choice == '3':
                tasks = mark_task_completed(tasks)
            elif choice == '4':
                tasks = delete_task(tasks)
            elif choice == '5':
                print("Thank you for using the Todo App. Goodbye!")
                break
            else:
                print("Invalid choice! Please enter a number between 1 and 5.")

        except KeyboardInterrupt:
            print("\n\nProgram interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()