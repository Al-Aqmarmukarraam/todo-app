# Todo Full-Stack Web Application Constitution

## Overview

This document establishes the rules, constraints, and guardrails for the Todo Full-Stack Web Application project. We are transitioning from Phase I (CLI-based Todo app) to Phase II (multi-user full-stack web application) using a spec-driven approach with Spec-Kit Plus.

## Project Phases

- **Phase I**: CLI-based Todo app (completed)
- **Phase II**: Multi-user full-stack web application (current phase)
- **Phase III**: Advanced features and scaling (future)

## Development Workflow

The development follows the spec-driven approach:
```
spec → plan → tasks → implement
```

## Core Principles

### NO MANUAL CODING BY USER
- All code must be generated through Spec-Kit Plus workflows
- Manual code editing by the user is strictly prohibited
- Claude Code is the sole implementer of all features
- Any code changes must follow the spec → plan → tasks → implement cycle

### SPEC COMPLIANCE
- Always read and follow existing specifications
- Never implement features outside the defined specs
- Modifications to functionality must be made through spec updates first
- Maintain strict adherence to architectural decisions documented in plans

### STRUCTURAL INTEGRITY
- Maintain consistent folder structure and naming conventions
- Follow established architectural patterns
- Preserve existing functionality unless explicitly specified for change
- Ensure backward compatibility where specified

## Tech Stack

### Frontend
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
- Server Components by default
- Client Components only for interactive elements

### Backend
- FastAPI
- SQLModel
- Neon PostgreSQL
- JWT authentication with Better Auth compatibility

## Commands

### Running the Applications

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Full Stack
```bash
# Run both frontend and backend simultaneously
# Use a process manager or separate terminals
```

## Governance

This is a hackathon project that will be judged on process, specs, and discipline. Strict adherence to the constitution is required for success.

### Amendment Procedure
- Constitution changes must follow the spec → plan → tasks → implement workflow
- All team members must approve significant changes
- Version control through Git with proper commit messages
- Regular compliance reviews during development

### Versioning Policy
- Major version increments for breaking changes to the constitution
- Minor version increments for new principles or guidelines
- Patch version increments for clarifications or typo fixes

### Compliance Review
- Regular checks to ensure adherence to principles
- Code reviews must verify compliance with constitutional rules
- Process audits to ensure spec-driven development is maintained