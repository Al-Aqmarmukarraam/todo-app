#!/usr/bin/env python3
"""Debug script to test pbkdf2 approach"""

print("Starting debug...")

try:
    print("Importing pbkdf2...")
    from passlib.hash import pbkdf2_sha256

    print("Testing hash with short password...")
    short_pass = "test123"
    hashed = pbkdf2_sha256.hash(short_pass)
    print(f"Successfully hashed short password: {hashed[:20]}...")

    print("Testing hash with long password...")
    long_pass = "a" * 80  # Very long password
    hashed_long = pbkdf2_sha256.hash(long_pass)
    print(f"Successfully hashed long password: {hashed_long[:20]}...")

    print("Testing verify...")
    is_valid = pbkdf2_sha256.verify("test123", hashed)
    print(f"Verification result: {is_valid}")

    print("All tests passed!")

except Exception as e:
    print(f"Error occurred: {e}")
    import traceback
    traceback.print_exc()