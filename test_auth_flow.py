#!/usr/bin/env python3
"""
Test script to verify the authentication flow works end-to-end
"""

import requests
import json

# Test the authentication endpoints
BASE_URL = "http://127.0.0.1:8000/api"

def test_register():
    """Test the registration endpoint"""
    print("Testing registration endpoint...")

    # Use a unique email for testing
    user_data = {
        "email": "test_auth_flow@example.com",
        "username": "test_auth_user",
        "password": "password123"
    }

    response = requests.post(f"{BASE_URL}/register", json=user_data)
    print(f"Registration response status: {response.status_code}")

    if response.status_code == 201:
        print("[SUCCESS] Registration successful")
        return response.json()
    elif response.status_code == 400:
        error_data = response.json()
        if "already registered" in error_data.get("detail", ""):
            print("[WARNING] User already exists, continuing with login test")
            return None
        else:
            print(f"[ERROR] Registration failed: {error_data}")
            return None
    else:
        print(f"[ERROR] Registration failed: {response.text}")
        return None

def test_login():
    """Test the login endpoint"""
    print("\nTesting login endpoint...")

    login_data = {
        "email": "test_auth_flow@example.com",
        "password": "password123"
    }

    response = requests.post(f"{BASE_URL}/login", json=login_data)
    print(f"Login response status: {response.status_code}")

    if response.status_code == 200:
        print("[SUCCESS] Login successful")
        return response.json()
    else:
        print(f"[ERROR] Login failed: {response.text}")
        # Try with the existing test user
        login_data = {
            "email": "newuser@example.com",
            "password": "password123"
        }
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"Login with existing user status: {response.status_code}")
        if response.status_code == 200:
            print("[SUCCESS] Login with existing user successful")
            return response.json()
        else:
            print(f"[ERROR] Login with existing user failed: {response.text}")
            return None

def test_get_me(token_data):
    """Test the /me endpoint"""
    if not token_data:
        print("\nSkipping /me test - no token available")
        return

    print("\nTesting /me endpoint...")

    headers = {
        "Authorization": f"Bearer {token_data['access_token']}"
    }

    response = requests.get(f"{BASE_URL}/me", headers=headers)
    print(f"/me response status: {response.status_code}")

    if response.status_code == 200:
        print("[SUCCESS] /me endpoint successful")
        user_data = response.json()
        print(f"User data: {user_data}")
        return True
    else:
        print(f"[ERROR] /me endpoint failed: {response.text}")
        return False

def main():
    print("Starting authentication flow test...")
    print("=" * 50)

    # Test registration
    register_result = test_register()

    # Test login
    login_result = test_login()

    # Test /me endpoint
    if login_result:
        test_get_me(login_result)

    print("=" * 50)
    print("Authentication flow test completed!")

if __name__ == "__main__":
    main()