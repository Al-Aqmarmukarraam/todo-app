# Todo Full-Stack Web Application - Frontend

This is the frontend component of the Todo Full-Stack Web Application, built with Next.js 16+, TypeScript, and Tailwind CSS. This application allows users to manage their personal todo tasks with secure authentication and data persistence.

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   │   ├── favicon.ico
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout component
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable React components
│   ├── lib/                 # Shared utilities and services
│   ├── db/                  # Database models and connection utilities
│   └── auth/                # Authentication middleware and utilities
├── public/                  # Static assets
├── .env.local               # Environment variables (not committed)
├── next.config.ts           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies and scripts
```

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root of the frontend directory with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/todo_app"
NEON_DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/todo_app?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
JWT_EXPIRES_IN="24h"
NEXT_PUBLIC_APP_NAME="Todo Full-Stack Web App"
```

## Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production server
- `npm run lint` - Runs ESLint to check for code issues

## Tech Stack

- [Next.js 16+](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React](https://reactjs.org/) - UI library

## Features

- User authentication and authorization
- Task management (create, read, update, delete)
- Task completion tracking
- Multi-user isolation
- Responsive design
