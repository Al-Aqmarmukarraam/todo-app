<!-- SYNC IMPACT REPORT
Version change: 1.0.0 -> 2.0.0
Modified principles: Project Vision, Technical Constraints, Evaluation Criteria
Added sections: Frontend/Backend Principles
Removed sections: None
Templates requiring updates: ⚠ pending
Follow-up TODOs: None
-->

# Project Constitution: Todo Full-Stack Web Application

## Version Information
- **Constitution Version**: 2.0.0
- **Ratification Date**: 2025-12-28
- **Last Amended Date**: 2026-01-08

## 1. Project Vision

The Todo Full-Stack Web Application project embodies the transformation from a simple CLI-based application to a sophisticated multi-user web application. This initiative demonstrates the evolution of software development practices, emphasizing the importance of proper architecture, specification-driven development, and AI-assisted implementation. Phase I (CLI app) served as a foundational learning phase, establishing core principles of agentic development. Phase II transforms this into a full-stack web application with user authentication, database persistence, and modern UI/UX. Phase III will focus on advanced features and scaling.

## 2. Development Philosophy

The project follows an AI-first, spec-driven, agentic development approach. Manual boilerplate coding by the student is prohibited, ensuring focus on architectural and design decisions rather than implementation minutiae. The student acts as Principal Product Architect and reviewer, making critical decisions while leveraging AI as an implementation agent. All development follows the principle of human-in-the-loop oversight with automated execution.

## 3. Agentic Workflow Rules

Development follows the strict sequence: Spec → Plan → Task Breakdown → Implementation. Every step requires explicit human approval before proceeding to the next phase. Iterative refinement is encouraged and must be documented through Prompt History Records (PHRs). Each architectural decision must be validated and approved before implementation begins. No implementation work may commence without a completed and approved specification and plan.

## 4. Technical Constraints

The project operates under specific technical constraints to ensure focus on core principles:

### Frontend Stack
- Next.js 16+ with App Router
- TypeScript
- Tailwind CSS
- Server Components by default
- Client Components only for interactive elements
- Centralized API client for all API calls

### Backend Stack
- FastAPI
- SQLModel
- Neon PostgreSQL
- JWT authentication with Better Auth compatibility
- API routes under `/api` prefix
- JWT verification required on all endpoints

### General Constraints
- No manual code editing by user
- Claude Code is the sole implementer
- All features must be spec-driven
- Data persistence through Neon PostgreSQL
- Authentication via JWT tokens

## 5. Code Quality Standards

Code must meet the following standards:
- Clean, modular, readable code with clear separation of concerns
- Meaningful naming conventions that reflect purpose and function
- Proper error handling for expected failure cases
- Proper documentation for public interfaces
- Adherence to language best practices and style guidelines (PEP 8 for Python, TypeScript standards)
- Testable architecture with clear component boundaries
- Consistent folder structure and file naming conventions

## 6. Documentation Requirements

The project must maintain comprehensive documentation:
- Constitution file at repository root defining governance principles
- specs/ directory containing versioned specification files for each feature
- README.md with setup and execution instructions
- CLAUDE.md files in root, frontend/, and backend/ directories
- All architectural decisions must be documented in ADRs when significant

## 7. Evaluation Criteria

Project success is measured by:
- Strict adherence to agentic workflow with human approval at each stage
- Quality and completeness of specifications and planning documents
- Clarity and documentation of architectural decisions
- Functional correctness of the full-stack web application
- Proper use of AI assistance without bypassing human oversight
- Compliance with all technical constraints and quality standards
- Successful implementation of multi-user functionality
- Proper integration between frontend and backend

## 8. Phase Definitions

- **Phase I**: CLI-based Todo app (completed)
- **Phase II**: Multi-user full-stack web application (current phase)
- **Phase III**: Advanced features and scaling (future)

## Governance

This constitution may only be amended through explicit human approval following a formal change proposal process. Versioning follows semantic versioning principles where major changes represent fundamental shifts in approach, minor changes add new principles or constraints, and patch changes address clarifications or corrections. All team members must acknowledge and comply with this constitution before participating in development activities.