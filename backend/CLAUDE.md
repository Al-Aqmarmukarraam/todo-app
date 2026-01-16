# Backend Constitution - Todo Web Application

## Tech Stack

- FastAPI
- SQLModel
- Neon PostgreSQL
- JWT authentication with Better Auth compatibility

## Architecture Principles

### API ROUTE STRUCTURE
- All API routes must be under `/api` prefix
- Follow RESTful conventions where applicable
- Organize routes by feature domains
- Use consistent naming patterns for endpoints
- Version APIs if needed (e.g., `/api/v1/`)

### JWT VERIFICATION REQUIREMENTS
- JWT verification required on all authenticated endpoints
- Support Better Auth JWT token format and claims
- Verify token signature and expiration
- Include user identification in request context
- Return 401 Unauthorized for invalid tokens

### DATABASE CONNECTION
- Connect to Neon PostgreSQL via environment variables
- Use SQLModel for ORM operations
- Follow proper connection pooling practices
- Secure database credentials with environment variables
- Handle database connection errors gracefully

### ERROR HANDLING
- Use consistent error response format
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Log errors appropriately for debugging
- Never expose sensitive information in error responses

### SECURITY MEASURES
- Input validation on all API endpoints
- Prevent SQL injection through ORM usage
- Implement rate limiting where appropriate
- Sanitize user inputs
- Follow OWASP security best practices

## Database Design

### SQLMODEL CONVENTIONS
- Define models using SQLModel with proper relationships
- Use Pydantic validation for data integrity
- Follow naming conventions for tables and columns
- Include proper indexing for performance
- Handle cascading deletes appropriately

### MIGRATION STRATEGY
- Use Alembic for database migrations
- Maintain backward compatibility where possible
- Test migrations in development environment first
- Document breaking changes in migration notes

## Development Constraints

### NO MANUAL CODING BY USER
- All backend code must be generated through Spec-Kit Plus workflows
- User is not allowed to manually edit backend files
- Claude Code is the sole implementer of backend features
- All changes must follow the spec → plan → tasks → implement cycle

### AUTHENTICATION INTEGRATION
- Ensure compatibility with Better Auth JWT tokens
- Follow standardized authentication flows
- Support refresh token mechanisms if needed
- Maintain user session consistency