# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Teable is an open-source Airtable alternative built as a no-code database platform with a spreadsheet-like interface backed by PostgreSQL. It supports real-time collaboration, multiple views (grid, form, kanban, gallery, calendar), and handles millions of rows.

## Common Commands

### Development Setup
```bash
pnpm install                    # Install dependencies
make switch-db-mode             # Choose SQLite (dev) or PostgreSQL
pnpm g:build                    # Build all packages (required first run)
```

### Running Development Servers
```bash
# Terminal 1 - Backend (NestJS)
pnpm -F @teable/backend dev     # Or dev:swc for faster startup

# Terminal 2 - Frontend (Next.js)
pnpm -F @teable/app dev
```

### Testing
```bash
pnpm g:test-unit                # All unit tests (Vitest)
pnpm g:test-e2e                 # All E2E tests (Playwright)
pnpm -F @teable/backend test-unit          # Backend unit tests only
pnpm -F @teable/backend test-e2e           # Backend E2E tests only
pnpm -F @teable/app test-unit              # Frontend unit tests only
```

### Code Quality
```bash
pnpm g:lint                     # Lint all workspaces
pnpm g:typecheck                # TypeScript check all
pnpm g:fix-all-files            # Auto-fix linting issues
```

### Database Migrations (Prisma)
```bash
make db-migration               # Create migration for both SQLite & PostgreSQL
pnpm -F @teable/db-main-prisma prisma-generate    # Generate Prisma client
pnpm -F @teable/db-main-prisma prisma-studio      # Open Prisma Studio GUI
```

### Building
```bash
pnpm g:build                    # Build all
pnpm -F @teable/app build-fast  # Quick frontend build (skip checks)
```

## Architecture

### Monorepo Structure
```
apps/
├── nestjs-backend/     # NestJS backend API + WebSocket server
└── nextjs-app/         # Next.js frontend

packages/
├── core/               # Core types, field definitions, formula engine (ANTLR4)
├── sdk/                # React hooks, components, contexts for frontend
├── openapi/            # Auto-generated API types from OpenAPI specs
├── db-main-prisma/     # Prisma schema, migrations, database providers
├── ui-lib/             # Shadcn/UI component library
├── common-i18n/        # i18next translations
└── icons/              # Icon library

plugins/                # Plugin system (iframe-isolated with Penpal bridge)
```

### Frontend-Backend Communication

**REST API**: OpenAPI-typed endpoints, React Query for data fetching
- Query client configured in `packages/sdk/src/context/app/queryClient.tsx`
- Query keys in `packages/sdk/src/config/react-query-keys.ts`

**Real-time Collaboration**: ShareDB + Operational Transformation (OT)
- Backend: `apps/nestjs-backend/src/share-db/` - adapter, service, Redis pub/sub
- Frontend receives operations via WebSocket, applies to local state
- Multi-server support via Redis pub/sub

### State Management

**Server State**: React Query (@tanstack/react-query)
- Hooks in `packages/sdk/src/hooks/` (useRecords, useFieldOperations, etc.)

**Client State**: Zustand stores
- `apps/nextjs-app/src/store/` for app-level state

**Context Providers**:
- `packages/sdk/src/context/` for aggregation, permissions, table state

### Database Layer

**ORM**: Prisma with PostgreSQL (production) or SQLite (development)
- Schema: `packages/db-main-prisma/prisma/postgres/schema.prisma`
- DB providers: `apps/nestjs-backend/src/db-provider/` abstracts SQL differences

**Key Models**: Space → Base → TableMeta → Field/View/Record, Ops (OT log)

### Backend Feature Modules

Each feature in `apps/nestjs-backend/src/features/` is self-contained:
- `{feature}.module.ts` - NestJS module
- `{feature}.service.ts` - Business logic
- `{feature}.controller.ts` - REST endpoints
- `open-api/` - OpenAPI definitions

Major features: table, field, record, base, space, auth, share-db, plugin, attachments

### Plugin System

- Plugins run in isolated iframes
- Communication via Penpal (postMessage bridge)
- Backend: `apps/nestjs-backend/src/features/plugin/`
- SDK bridge: `packages/sdk/src/plugin-bridge/`

## Code Conventions

### Git Commits (Conventional Commits)
```
feat|fix|docs|test|refactor|style|chore|perf|ci|build|revert|translation|security: message
```
- Max 100 char header, lowercase subject, no ending period

### Naming Conventions
- **Variables/Functions**: camelCase
- **Classes/Types/Interfaces**: PascalCase (interfaces prefixed with `I`)
- **Constants**: UPPER_CASE
- **Files**: kebab-case for components, camelCase for utilities

### TypeScript
- Use explicit `type` keyword for imports/exports
- No `any` types (use `unknown` or proper typing)
- Unused vars must be prefixed with `_`

### Imports Order
builtin → external → internal → parent → sibling → index

## Key Files

- `apps/nestjs-backend/src/app.module.ts` - Backend module registration
- `apps/nextjs-app/src/pages/` - Next.js page routes
- `packages/core/src/models/field/` - Field type definitions
- `packages/sdk/src/hooks/` - React data fetching hooks
- `packages/db-main-prisma/prisma/` - Database schema
