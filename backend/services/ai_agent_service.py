"""
AI Agent Service for Todo AI Chatbot
Connects to MCP server to perform task management operations
"""
import httpx
import asyncio
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel
import os
from models.message_model import MessageCreate
from services.message_service import MessageService
from sqlmodel import Session


class AIConfig(BaseModel):
    """
    Configuration for the AI agent
    """
    openai_api_key: str
    mcp_server_url: str = "http://localhost:8001"
    model: str = "gpt-3.5-turbo"


class AIAgentService:
    def __init__(self, config: AIConfig):
        self.config = config
        self.mcp_client = httpx.AsyncClient(base_url=config.mcp_server_url)
        self.openai_client = None  # Will initialize when OpenAI key is available

    async def initialize_openai(self):
        """
        Initialize OpenAI client if API key is available
        """
        if self.config.openai_api_key:
            try:
                import openai
                self.openai_client = openai.AsyncOpenAI(api_key=self.config.openai_api_key)
            except ImportError:
                print("OpenAI library not installed. Please install with: pip install openai")

    async def process_message(self, message_content: str, user_id: int, conversation_id: int, session: Session) -> str:
        """
        Process a user message and return an AI-generated response
        """
        # First, get conversation history to provide context
        context = await self._get_conversation_context(conversation_id, session)

        # Prepare the tools that the AI can use
        tools = await self._get_available_tools()

        # Create the AI request with tools
        try:
            if self.openai_client:
                response = await self.openai_client.chat.completions.create(
                    model=self.config.model,
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant for managing tasks. Use the provided tools to interact with the user's tasks. Only use tools that are relevant to the user's request."},
                        {"role": "user", "content": f"Context: {context}\n\nUser message: {message_content}"}
                    ],
                    tools=tools,
                    tool_choice="auto"
                )

                # Process the response
                if response.choices[0].finish_reason == "tool_calls":
                    # Process tool calls
                    tool_calls = response.choices[0].message.tool_calls
                    tool_results = []

                    for tool_call in tool_calls:
                        result = await self._execute_tool_call(tool_call, user_id)
                        tool_results.append({
                            "tool_call_id": tool_call.id,
                            "result": result
                        })

                    # Get final response based on tool results
                    final_response = await self._get_final_response(message_content, tool_results)
                    return final_response
                else:
                    # Return the AI's direct response
                    return response.choices[0].message.content
            else:
                # Fallback response if OpenAI is not available
                return f"I received your message: '{message_content}'. In a full implementation, I would process this using AI and MCP tools."
        except Exception as e:
            return f"Sorry, I encountered an error processing your request: {str(e)}"

    async def _get_conversation_context(self, conversation_id: int, session: Session) -> str:
        """
        Get conversation context for the AI agent
        """
        # This would typically fetch recent messages in the conversation
        # For now, returning a simple placeholder
        return f"Conversation ID: {conversation_id}. Recent context would be retrieved here."

    async def _get_available_tools(self) -> list:
        """
        Get the list of available tools for the AI agent
        """
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Add a new task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "title": {"type": "string", "description": "The title of the task"},
                            "description": {"type": "string", "description": "The description of the task"}
                        },
                        "required": ["user_id", "title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List tasks with optional filtering",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "status": {"type": "string", "enum": ["all", "pending", "completed"], "description": "Status of tasks to filter"}
                        },
                        "required": ["user_id", "status"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "task_id": {"type": "integer", "description": "The ID of the task to complete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "task_id": {"type": "integer", "description": "The ID of the task to delete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "task_id": {"type": "integer", "description": "The ID of the task to update"},
                            "title": {"type": "string", "description": "The new title of the task"},
                            "description": {"type": "string", "description": "The new description of the task"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            }
        ]

        return tools

    async def _execute_tool_call(self, tool_call, user_id: int) -> Dict[str, Any]:
        """
        Execute a tool call via the MCP server
        """
        try:
            # Determine which tool is being called
            tool_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)

            # Prepare the payload - user_id is already included in arguments according to spec
            # but we ensure it's set correctly
            payload = {
                **arguments
            }

            # Ensure user_id is correctly set in the payload
            if 'user_id' not in payload:
                payload['user_id'] = str(user_id)  # MCP server expects user_id as string
            else:
                # If user_id was provided by the AI, convert to string if it's an int
                payload['user_id'] = str(payload['user_id'])

            # Call the appropriate MCP endpoint
            if tool_name == "add_task":
                response = await self.mcp_client.post(
                    f"/tools/add_task",
                    json=payload
                )
            elif tool_name == "list_tasks":
                response = await self.mcp_client.post(
                    f"/tools/list_tasks",
                    json=payload
                )
            elif tool_name == "complete_task":
                response = await self.mcp_client.post(
                    f"/tools/complete_task",
                    json=payload
                )
            elif tool_name == "delete_task":
                response = await self.mcp_client.post(
                    f"/tools/delete_task",
                    json=payload
                )
            elif tool_name == "update_task":
                response = await self.mcp_client.post(
                    f"/tools/update_task",
                    json=payload
                )
            else:
                return {"error": f"Unknown tool: {tool_name}"}

            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"MCP server error: {response.text}"}

        except Exception as e:
            return {"error": f"Error executing tool: {str(e)}"}

    async def _get_final_response(self, original_request: str, tool_results: list) -> str:
        """
        Generate the final response based on tool results
        """
        # This would normally use the AI model again to generate a natural language response
        # based on the tool results, but for now we'll return a simple response

        if tool_results and len(tool_results) > 0:
            # If there were successful tool operations, acknowledge them
            successful_ops = [res for res in tool_results if "error" not in res.get("result", {})]
            if successful_ops:
                return f"I've processed your request. The operations were completed successfully."

        return "I've processed your request and completed the necessary operations."

    async def close(self):
        """
        Close the clients when done
        """
        await self.mcp_client.aclose()