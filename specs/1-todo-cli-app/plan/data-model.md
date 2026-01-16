# Data Model: In-Memory Python Console Todo App

## Entity Definitions

### Todo Entity

The core entity for the todo application with the following attributes:

#### Attributes
- **id** (int)
  - Type: Integer
  - Requirement: Required
  - Description: Unique identifier for the todo
  - Generation: Sequential starting from 1
  - Constraints: Must be unique within the session

- **title** (str)
  - Type: String
  - Requirement: Required
  - Description: The main title/description of the todo
  - Constraints: Cannot be empty or consist only of whitespace
  - Validation: Trimmed of leading/trailing whitespace before validation

- **description** (Optional[str])
  - Type: String or None
  - Requirement: Optional
  - Description: Additional details about the todo
  - Default: None
  - Constraints: Can be empty string or None

- **completed** (bool)
  - Type: Boolean
  - Requirement: Required
  - Description: Completion status of the todo
  - Default: False (incomplete)
  - Values: True (complete) or False (incomplete)

- **created_at** (datetime)
  - Type: datetime.datetime
  - Requirement: Required
  - Description: Timestamp when the todo was created
  - Default: Current timestamp at creation time
  - Format: ISO format datetime

### In-Memory Storage Structure

#### Global Variables
- **todos** (Dict[int, Todo])
  - Type: Dictionary mapping integer IDs to Todo objects
  - Purpose: Primary storage for all todo items
  - Access: Thread-safe within single process
  - Lifecycle: Exists for duration of application session

- **next_id** (int)
  - Type: Integer
  - Purpose: Tracks the next available ID for new todos
  - Initial Value: 1
  - Increment: Increases by 1 each time a new todo is added
  - Lifecycle: Resets to 1 on application restart

## Data Relationships

### Entity Relationships
The application contains a single entity type (Todo) with no relationships to other entities. All todos are independent of each other.

## Validation Rules

### Todo Creation Validation
1. Title must not be empty after trimming whitespace
2. Title must be a string type
3. Description, if provided, must be a string type
4. Completed status, if provided, must be a boolean type
5. ID is auto-generated and validated to be unique

### Todo Update Validation
1. Todo with specified ID must exist
2. If title is provided, it must not be empty after trimming
3. If title is provided, it must be a string type
4. If description is provided, it must be a string type
5. If completed status is provided, it must be a boolean type

### Todo Status Update Validation
1. Todo with specified ID must exist
2. Completed status must be a boolean type

## State Transitions

### Todo States
A todo can exist in one of two primary states:
1. **Incomplete**: completed = False (default state)
2. **Complete**: completed = True

### State Transition Rules
- Any todo can transition from Incomplete to Complete
- Any todo can transition from Complete to Incomplete
- No other state transitions are allowed

## Data Access Patterns

### Read Operations
1. **Get All Todos**: Retrieve all todos in creation order
2. **Get Single Todo**: Retrieve specific todo by ID

### Write Operations
1. **Create Todo**: Add new todo with auto-generated ID
2. **Update Todo**: Modify existing todo fields
3. **Delete Todo**: Remove todo from storage
4. **Update Status**: Change completion status only

## Data Lifecycle

### Creation
1. User requests to add a new todo
2. System validates the title is not empty
3. System assigns next available ID
4. System creates Todo object with current timestamp
5. System stores Todo in the global dictionary

### Retrieval
1. User requests to view todos
2. System retrieves todos from global dictionary
3. System sorts by creation order (using insertion order of dict)
4. System returns todos to user

### Update
1. User requests to update a specific todo
2. System verifies todo exists by ID
3. System updates only the specified fields
4. System maintains unchanged fields

### Deletion
1. User requests to delete a specific todo
2. System verifies todo exists by ID
3. System removes todo from global dictionary
4. System does not reuse the ID

### Destruction
1. Application terminates
2. Global dictionary and next_id are lost
3. All data is permanently destroyed
4. No persistence to external storage

## Data Constraints

### Uniqueness Constraints
- ID must be unique within the application session

### Type Constraints
- ID must be an integer
- Title must be a string
- Description must be a string or None
- Completed status must be a boolean
- Created timestamp must be a datetime object

### Value Constraints
- Title cannot be empty (after trimming whitespace)
- ID must be a positive integer
- Created timestamp must be a valid datetime