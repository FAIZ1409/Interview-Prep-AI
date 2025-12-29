# PrepAI - AI-Powered Interview Preparation Platform

## Overview

PrepAI is a full-stack web application that simulates real technical interviews using AI. It helps users prepare for Software Engineering (SDE), AI/ML, and System Design roles by providing AI-powered mock interviews, speech analysis, resume evaluation, and personalized improvement feedback.

The platform acts as a realistic interviewer rather than a simple question bank, offering real-time conversation streaming, voice input/output capabilities, and comprehensive performance analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for dashboard analytics
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js
- **Sessions**: PostgreSQL-backed sessions via connect-pg-simple
- **AI Integration**: OpenAI API (GPT models) for interview conversations and analysis

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` with models split into `shared/models/`
- **Key Tables**:
  - `users` - User profiles (Replit Auth managed)
  - `sessions` - Authentication sessions
  - `conversations` / `messages` - Chat history for AI interviews
  - `interviews` - Interview session metadata and scores
  - `resumes` - Uploaded resume content and analysis

### Authentication Flow
- Replit Auth handles OAuth/OIDC with automatic user provisioning
- Session cookies stored in PostgreSQL for persistence
- `isAuthenticated` middleware protects API routes
- User data synced on login via `authStorage.upsertUser()`

### AI Integration Approach
- OpenAI API used for chat completions (interview conversations)
- Streaming responses for real-time interview feel
- Custom analysis endpoints for evaluating responses (confidence, clarity, filler words)
- Image generation capability available via `gpt-image-1` model
- Batch processing utilities for rate-limited operations

### Key Design Patterns
- **Shared Code**: Types and validation schemas shared between client/server in `shared/`
- **Storage Abstraction**: Database operations wrapped in storage classes (`storage.ts`, `chatStorage.ts`)
- **Route Definitions**: Centralized API route definitions with Zod schemas for type-safe requests/responses
- **Component Composition**: Shadcn/ui pattern with composable, accessible UI primitives

## External Dependencies

### Third-Party Services
- **Replit Auth**: OAuth/OIDC authentication provider
- **OpenAI API**: Powers AI interview conversations, response analysis, and image generation
  - Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Database
- **PostgreSQL**: Primary data store
  - Connection via `DATABASE_URL` environment variable
  - Drizzle ORM for type-safe queries
  - Schema migrations in `migrations/` directory

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session encryption key
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API base URL (for Replit AI proxy)
- `ISSUER_URL` - Replit OIDC issuer (defaults to https://replit.com/oidc)
- `REPL_ID` - Replit environment identifier

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `openai` - OpenAI API client
- `passport` / `openid-client` - Authentication
- `@tanstack/react-query` - Data fetching and caching
- `react-dropzone` - File uploads for resumes
- `recharts` - Dashboard charts
- `framer-motion` - Animations