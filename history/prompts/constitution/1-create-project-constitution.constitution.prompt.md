---
id: 1
title: "Create Project Constitution"
stage: constitution
date_iso: 2025-12-28
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: PAKTECH
command: "sp.constitution"
labels: ["governance", "setup", "project-structure"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - ".specify/memory/constitution.md"
tests: []
---

# Prompt

```
You are acting as a Principal Product Architect and Senior Python Engineer.

Project Name: The Evolution of Todo
Current Phase: Phase I — In-Memory Python Console App

OBJECTIVE
Create a Constitution file that will govern the entire project lifecycle.
This Constitution must be clear, strict, and judge-review ready.

SCOPE FOR THIS TASK
- Generate ONLY the Constitution file in Markdown.
- Do NOT generate any application code.
- Do NOT generate specs or plans yet.
- Wait for my explicit approval before moving to the next step.

THE CONSTITUTION MUST DEFINE THE FOLLOWING SECTIONS:

1. Project Vision
- Explain the evolution theme (from simple scripts to distributed AI systems).
- Clearly state that Phase I is a foundational learning phase.

2. Development Philosophy
- AI-first, spec-driven, agentic development.
- No manual boilerplate coding by the student.
- Student acts as Product Architect and reviewer.

3. Agentic Workflow Rules
- Spec → Plan → Task Breakdown → Implementation.
- Every step requires human approval.
- Iterative refinement is encouraged and documented.

4. Technical Constraints
- Python version: 3.13+
- Package management: UV
- Storage: In-memory only (no database, no files)
- Interface: Command-line application

5. Code Quality Standards
- Clean, modular, readable code.
- Clear separation of concerns.
- Meaningful naming conventions.
- Minimal but sufficient error handling.

6. Documentation Requirements
- Constitution file at repository root.
- specs/ directory containing versioned specification files.
- README.md with setup and execution instructions.
- CLAUDE.md explaining how Claude Code is used and instructed.

7. Evaluation Criteria
- Adherence to agentic workflow.
- Quality of specifications and prompts.
- Clarity of architectural decisions.
- Functional correctness of the console application.

OUTPUT FORMAT
- Markdown (.md)
- Professional, concise, and unambiguous language.
- No emojis, no fluff.

Once the Constitution is generated, STOP and ask for approval.
```

# Response

Created the project constitution file at `.specify/memory/constitution.md` with all required sections:

1. Project Vision - Explaining the evolution theme and Phase I as foundational learning
2. Development Philosophy - AI-first, spec-driven approach with human oversight
3. Agentic Workflow Rules - Spec → Plan → Task → Implementation with approvals
4. Technical Constraints - Python 3.13+, UV, in-memory only, CLI interface
5. Code Quality Standards - Clean, modular, readable code principles
6. Documentation Requirements - Required documentation structure
7. Evaluation Criteria - Success metrics for the project

The constitution file establishes governance for the entire project lifecycle.