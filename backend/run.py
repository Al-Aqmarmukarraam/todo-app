"""
Entry point for Todo AI Chatbot application
Can be used to run the server or perform migrations
"""
import argparse
from main import app
from db.migrate import create_db_and_tables
from uvicorn import run


def main():
    parser = argparse.ArgumentParser(description='Todo AI Chatbot Application')
    parser.add_argument('command', nargs='?', default='serve',
                        choices=['serve', 'migrate'],
                        help='Command to run: serve (default) or migrate')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8000, help='Port to bind to')

    args = parser.parse_args()

    if args.command == 'migrate':
        print("Running database migrations...")
        create_db_and_tables()
        print("Migrations completed!")
    elif args.command == 'serve':
        print(f"Starting Todo AI Chatbot server on {args.host}:{args.port}")
        run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()