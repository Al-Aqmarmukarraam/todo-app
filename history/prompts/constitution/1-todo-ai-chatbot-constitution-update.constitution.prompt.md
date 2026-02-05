---
id: 1
title: "Todo AI Chatbot Constitution Update"
stage: constitution
date_iso: "2026-01-15"
surface: agent
model: sonnet-4-5
feature: "todo-ai-chatbot"
branch: "main"
user: "PAKTECH"
command: "sp.constitution"
labels: ["constitution", "todo-ai-chatbot", "mcp", "agents"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - ".specify/memory/constitution.md"
tests: []
outcome: "Updated constitution to reflect Phase III Todo AI Chatbot project with MCP agents"
evaluation: "Constitution successfully updated to version 3.0.0 with new principles for stateless architecture and MCP-based AI agents"
---

# Todo AI Chatbot Constitution Update

## Prompt Text

Project: Phase III – Todo AI Chatbot (MCP + Agents)

Objective:
Define the full constitution for an AI-powered Todo Chatbot that manages tasks through natural language using a stateless MCP-based architecture.

Context:
- Frontend: OpenAI ChatKit
- Backend: FastAPI (Python)
- AI Framework: OpenAI Agents SDK
- MCP Server: Official MCP SDK
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth

System Principles:
- Server must be fully stateless
- All state (tasks, conversations, messages) must persist in database
- AI agents MUST interact with tasks only via MCP tools
- No direct DB access from agent logic
- Single chat endpoint for all interactions
- Scalable and restart-safe architecture

Constraints:
- No manual coding by user
- Must follow Agentic Dev Stack workflow
- MCP tools must be deterministic and side-effect safe
- Authentication must be enforced at API boundary
- Conversation history must be reconstructed per request

Non-Goals:
- No UI redesign
- No streaming responses (basic level)
- No voice or multimodal features

Governance:
- Specification-driven development
- Tool-first AI actions
- Explicit error handling
- Clear separation of concerns

Deliverable:
A complete constitution suitable for Spec-Kit Plus evaluation.

Do not ask questions. Produce the full constitution and stop.

## Response Text

Updated the constitution file to reflect the new Phase III Todo AI Chatbot project with the following key changes:

1. Updated version from 2.0.0 to 3.0.0 to reflect the major architectural shift
2. Revised the Project Vision to emphasize AI-powered natural language task management
3. Added specific technical constraints for the new stack (OpenAI ChatKit, MCP SDK, OpenAI Agents SDK)
4. Introduced System Architecture Principles including:
   - MCP-Only Data Access Principle
   - Stateless Server Architecture Principle
   - Single Endpoint Interaction Principle
   - Scalable Architecture Principle
   - Authentication Boundary Principle
5. Updated Phase Definitions to reflect the progression from CLI → Web App → AI Chatbot
6. Enhanced documentation requirements to include MCP tool documentation
7. Updated evaluation criteria to include MCP-based task management and AI integration
8. Added security considerations for MCP server architecture

The constitution now properly reflects the stateless, MCP-based architecture for the AI chatbot system while maintaining the spec-driven development approach.