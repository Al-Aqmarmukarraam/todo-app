---
id: 1
title: update-constitution-for-phase-ii
stage: constitution
date_iso: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: sp.constitution
labels:
  - constitution
  - phase-ii
  - todo-app
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - .specify/memory/constitution.md
  - CLAUDE.md
  - frontend/CLAUDE.md
  - backend/CLAUDE.md
tests_yaml: []
---

# Constitution Update for Phase II

## PROMPT_TEXT
You are operating in Agentic Dev Stack mode using Claude Code + Spec-Kit Plus.

GOAL:
Create the full CONSTITUTION (rules, constraints, and guardrails) for Phase II of a Todo Full-Stack Web Application.

PROJECT CONTEXT:
- Phase I (CLI-based Todo app) is completed.
- Phase II transforms the app into a multi-user full-stack web application.
- This is a hackathon project and will be judged on process, specs, and discipline.

STRICT RULES:
- I am NOT allowed to write or edit code manually.
- All development must be spec-driven using Spec-Kit Plus.
- You (Claude Code) are the sole implementer.
- Always read relevant specs before implementing.
- Never invent features outside the specs.

TASKS:

1. Create or update the ROOT `CLAUDE.md` with:
   - Project overview
   - Explanation of Spec-Kit folder structure
   - Phase definitions (Phase I, Phase II, Phase III)
   - Development workflow:
     spec → plan → tasks → implement
   - Clear rule: "NO MANUAL CODING BY USER"
   - Commands to run frontend, backend, and full stack
   - Hackathon-friendly clarity and structure

2. Create or update `frontend/CLAUDE.md` with:
   - Stack: Next.js 16+ (App Router), TypeScript, Tailwind CSS
   - Default use of Server Components
   - Client Components only for interactivity
   - API calls only via a centralized API client
   - Component and folder structure rules
   - Styling rules (clean, modern, minimal, responsive)

3. Create or update `backend/CLAUDE.md` with:
   - Stack: FastAPI, SQLModel, Neon PostgreSQL
   - API route structure under `/api`
   - JWT verification required on all endpoints
   - Better Auth JWT compatibility rules
   - Database connection via environment variables
   - Error handling conventions

OUTPUT CONSTRAINTS:
- Only create or update CLAUDE.md files
- Do NOT implement any features
- Do NOT create specs yet
- Do NOT generate plans or tasks yet

FINAL STEP:
After finishing, summarize the constitution rules that now govern Phase II development.

## RESPONSE_TEXT
Created and updated the constitution files for Phase II of the Todo Full-Stack Web Application:

1. Updated the root CLAUDE.md with project overview, phase definitions, development workflow, and the "NO MANUAL CODING BY USER" rule.

2. Created frontend/CLAUDE.md with specifications for Next.js 16+, TypeScript, Tailwind CSS, Server Components default, centralized API client, component structure, and styling rules.

3. Created backend/CLAUDE.md with specifications for FastAPI, SQLModel, Neon PostgreSQL, API route structure, JWT verification, database connections, and error handling.

4. Updated the main constitution file (.specify/memory/constitution.md) to reflect the transition to Phase II, including updated technical constraints for both frontend and backend stacks, and expanded project vision.

The constitution now properly governs Phase II development with clear rules around spec-driven development, technology stacks, and the prohibition of manual coding by the user.