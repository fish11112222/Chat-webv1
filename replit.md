# Replit.md

## Overview

This is a modern full-stack chat application built with React, Express, and TypeScript. The application provides a real-time messaging platform with Material Design-inspired UI components. It features a clean separation between client and server code, uses Drizzle ORM for database operations, and implements a RESTful API architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with three main directories:

- **client/**: React frontend with TypeScript and Vite
- **server/**: Express.js backend with TypeScript
- **shared/**: Common schemas and types shared between client and server

### Key Architectural Decisions

1. **Monorepo Structure**: Chosen to share TypeScript types and schemas between frontend and backend, reducing code duplication and ensuring type safety across the stack.

2. **TypeScript Throughout**: Provides compile-time type checking and better developer experience.

3. **Vite for Build System**: Fast development server and build tool for the React frontend.

4. **Express.js Backend**: Simple and flexible web framework for the REST API.

## Key Components

### Frontend Architecture
- **React 18** with functional components and hooks
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for server state management and caching
- **Radix UI** components with custom styling via Tailwind CSS
- **shadcn/ui** component library for consistent UI elements

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with proper HTTP methods and status codes
- **In-memory storage** implementation with interface for future database integration
- **Middleware** for request logging and error handling

### Database Layer
- **Drizzle ORM** with PostgreSQL dialect configured
- **Schema definitions** in shared directory for type safety
- **Zod validation** schemas derived from Drizzle schemas
- **Migration system** ready for database schema changes

### UI Component System
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theming support (light/dark mode ready)
- **Radix UI primitives** for accessible, unstyled components
- **Material Design** inspired custom components

## Data Flow

1. **Client Requests**: React components use TanStack Query to make API calls
2. **API Layer**: Express routes handle HTTP requests with validation
3. **Business Logic**: Service layer (storage) handles data operations
4. **Data Persistence**: Currently in-memory, configured for PostgreSQL via Drizzle
5. **Response**: JSON responses sent back to client with proper error handling

### Message Flow
- Users create messages through a form interface
- Client validates input and sends POST request to `/api/messages`
- Server validates data using Zod schemas
- Message stored with auto-generated timestamps
- Client polls for updates every 2 seconds for real-time feel
- Messages can be edited/deleted by their authors

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **class-variance-authority**: Component variant styling
- **clsx & tailwind-merge**: Conditional CSS classes
- **date-fns**: Date formatting utilities
- **wouter**: Lightweight routing

### Backend Dependencies
- **express**: Web framework
- **drizzle-orm**: Database ORM
- **@neondatabase/serverless**: PostgreSQL driver
- **zod**: Runtime type validation
- **drizzle-zod**: Zod schema generation from Drizzle schemas

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Production bundling for server
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development
- **Concurrent Development**: Vite dev server for frontend, tsx for backend hot reloading
- **API Proxy**: Vite proxies API requests to Express server
- **Type Checking**: Shared TypeScript configuration across client/server

### Production Build
1. **Frontend**: Vite builds static assets to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Static Serving**: Express serves built frontend assets
4. **Database**: Drizzle migrations applied via `npm run db:push`

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string required
- **NODE_ENV**: Controls development vs production behavior
- **REPL_ID**: Replit-specific environment detection

The application is designed to be deployed on platforms like Replit, with support for both development and production environments. The build process creates a single deployable artifact that serves both the API and static frontend assets.