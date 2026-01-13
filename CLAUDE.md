# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Teable is an open-source Airtable alternative built as a no-code database platform with a spreadsheet-like interface backed by PostgreSQL. It supports real-time collaboration, multiple views (grid, form, kanban, gallery, calendar), and handles millions of rows.

## Development Setup

### Quick Start (Recommended)
```bash
pnpm install                    # Install dependencies
pnpm g:build                    # Build all packages (required first run)
pnpm run dev:start              # Start Docker (PG + Redis) + PM2 (Backend + Frontend)
```

The `dev:start` script automatically:
1. Starts PostgreSQL (port 54321) and Redis (port 6379) via Docker
2. Waits for database to be ready
3. Starts backend (port 3000) and frontend (port 3002) via PM2
4. Shows PM2 status with all running processes

### Manual Development (Alternative)
```bash
# Terminal 1 - Start Docker services
docker compose -f docker-compose.dev.yaml up -d

# Terminal 2 - Backend (NestJS)
pnpm -F @teable/backend dev     # Or dev:swc for faster startup

# Terminal 3 - Frontend (Next.js)
pnpm -F @teable/app dev
```

### Development URLs
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:54321 (user: teable, db: teable)
- **Redis**: localhost:6379

### PM2 Commands
```bash
pm2 status                      # Check running processes
pm2 logs                        # View all logs
pm2 logs teable-backend         # View backend logs only
pm2 logs teable-frontend        # View frontend logs only
pm2 restart all                 # Restart all services
pm2 stop all                    # Stop all services
pm2 delete all                  # Remove all processes
```

## Common Commands

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

### Database (Prisma)
```bash
cd packages/db-main-prisma
pnpm exec prisma generate --schema=prisma/postgres/schema.prisma   # Generate client
pnpm exec prisma studio --schema=prisma/postgres/schema.prisma     # Open Studio GUI
pnpm exec prisma migrate deploy --schema=prisma/postgres/schema.prisma  # Apply migrations
```

### Building
```bash
pnpm g:build                    # Build all packages
pnpm -F @teable/app build-fast  # Quick frontend build (skip checks)
```

## Architecture

### Development Architecture
```
┌────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                        │
├────────────────────────────────────────────────────────────┤
│  Docker Compose (docker-compose.dev.yaml)                   │
│  ├── PostgreSQL 15.4  → localhost:54321                    │
│  └── Redis 7.2.4      → localhost:6379                     │
├────────────────────────────────────────────────────────────┤
│  PM2 Process Manager (ecosystem.config.js)                  │
│  ├── teable-backend   → localhost:3000 (Node.js)           │
│  └── teable-frontend  → localhost:3002 (Next.js)           │
│       └── API Proxy: /api/* → localhost:3000               │
└────────────────────────────────────────────────────────────┘
```

### Production Architecture (Dokploy on Vultr)
```
┌────────────────────────────────────────────────────────────┐
│                    VULTR SERVER (Dokploy)                   │
├────────────────────────────────────────────────────────────┤
│  Docker Containers:                                         │
│  ├── teable         → Main app (stateless)                 │
│  ├── teable-db      → PostgreSQL 15.4 (volume: teable-db)  │
│  └── teable-cache   → Redis 7.2.4 (volume: teable-cache)   │
├────────────────────────────────────────────────────────────┤
│  External Services:                                         │
│  └── Cloudflare R2  → File storage (S3-compatible)         │
└────────────────────────────────────────────────────────────┘
```

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
- Query client: `packages/sdk/src/context/app/queryClient.tsx`
- Query keys: `packages/sdk/src/config/react-query-keys.ts`

**API Proxy** (Development): Next.js rewrites `/api/*` to backend
- Configured in `apps/nextjs-app/next.config.mjs`
- Requires `NEXT_DEV_API_PROXY=true` in `.env` during build

**Real-time Collaboration**: ShareDB + Operational Transformation (OT)
- Backend: `apps/nestjs-backend/src/share-db/` - adapter, service, Redis pub/sub
- Multi-server support via Redis pub/sub

### State Management

**Server State**: React Query (@tanstack/react-query)
- Hooks in `packages/sdk/src/hooks/` (useRecords, useFieldOperations, etc.)

**Client State**: Zustand stores
- `apps/nextjs-app/src/store/` for app-level state

**Context Providers**:
- `packages/sdk/src/context/` for aggregation, permissions, table state

### Database Layer

**ORM**: Prisma with PostgreSQL
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

## Key Configuration Files

| File | Purpose |
|------|---------|
| `ecosystem.config.js` | PM2 process configuration (backend + frontend) |
| `docker-compose.dev.yaml` | Local Docker services (PostgreSQL + Redis) |
| `apps/nextjs-app/.env` | Frontend environment (API proxy config) |
| `apps/nestjs-backend/.env` | Backend environment (DB, Redis, storage) |
| `packages/db-main-prisma/prisma/postgres/schema.prisma` | Database schema |

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

## Technical Notes

### API Proxy Configuration
The frontend uses Next.js rewrites to proxy `/api/*` requests to the backend. This is baked at **build time**, not runtime.

**Important**: If API calls return 404 in development:
1. Ensure `NEXT_DEV_API_PROXY=true` is in `apps/nextjs-app/.env`
2. Rebuild the frontend: `pnpm -F @teable/app build`

### Known Warnings (Non-Critical)
- **sqlite3 native build**: May fail during `pnpm install` due to missing Python distutils. This is non-critical as production uses PostgreSQL.
- **Lint warnings**: ~76 warnings exist in test files (`apps/nestjs-backend/test/`) for unused variables. These are pre-existing and don't affect functionality.

### Package Manager
This project uses **pnpm** (not npm/yarn/bun). Bun was tested but causes NestJS dependency injection issues in monorepos due to separate package instance resolution.

## Key Files

- `apps/nestjs-backend/src/app.module.ts` - Backend module registration
- `apps/nextjs-app/src/pages/` - Next.js page routes
- `packages/core/src/models/field/` - Field type definitions
- `packages/sdk/src/hooks/` - React data fetching hooks
- `packages/db-main-prisma/prisma/` - Database schema
- `scripts/dev-start.sh` - Development startup script

## Adding New Field Types

When adding a new field type (e.g., Signature), update these locations:

### Core Package (`packages/core/src/models/field/`)
1. `constant.ts` - Add to `FieldType` enum
2. `derivate/{field-name}.field.ts` - Field class extending `FieldCore`
3. `derivate/{field-name}-option.schema.ts` - Zod schema for field options
4. `derivate/index.ts` - Export new schemas
5. `field.schema.ts` - Add to field union types
6. `field-unions.schema.ts` - Add to union discriminator
7. `options.schema.ts` - Add options to union
8. `field-visitor.interface.ts` - Add visitor method
9. `cell-value-validation.ts` - Add validation case

### Backend (`apps/nestjs-backend/src/`)
1. `features/field/model/factory.ts` - Add to field factory
2. `features/field/model/field-dto/{field}.dto.ts` - DTO class
3. `db-provider/create-database-column-query/` - Column creation visitors (postgres + sqlite)
4. `db-provider/drop-database-column-query/` - Column drop visitors
5. `features/record/query-builder/field-*.ts` - Query builder visitors
6. `features/record/record.service.ts` - presignedUrl generation (if storing files)

### Frontend SDK (`packages/sdk/src/`)
1. `model/field/{field}.field.ts` - Frontend field class
2. `model/field/factory.ts` - Add to factory
3. `model/field/index.ts` - Export
4. `components/editor/{field}/Editor.tsx` - Editor component
5. `components/cell-value/cell-{field}/` - Cell display component
6. `components/cell-value-editor/CellEditorMain.tsx` - Editor routing
7. `components/cell-value/CellValue.tsx` - Cell display routing
8. `components/grid-enhancements/hooks/use-grid-columns.tsx` - Grid cell mapping
9. `hooks/use-field-static-getter.ts` - Static field info
10. `utils/fieldType.ts` - Field type utilities

### Frontend App (`apps/nextjs-app/src/features/app/components/field-setting/`)
1. `SelectFieldType.tsx` - Add to field type selector
2. `FieldOptions.tsx` - Add options component routing
3. `options/{Field}Options.tsx` - Field-specific options UI
4. `useFieldTypeSubtitle.ts` - Field type description

### i18n (`packages/common-i18n/src/locales/`)
1. `en/table.json` - Field type labels
2. `en/sdk.json` - Editor/component labels

## Technical Debt

### Signature Field (Added Jan 2025)
- **Missing Tests**: No unit or E2E tests for Signature field
- **i18n Incomplete**: Only English translations added; needs zh-CN, ja, de, fr, etc.
- **Form View**: Not tested in form views (may need additional integration)
- **Share View**: Not verified in public share views
- **Lookup/Rollup**: Signature fields cannot be used as lookup sources (by design, but not enforced in UI)

### Grid Rendering
The grid uses **canvas-based rendering** with `CellType` enum, not React components. New fields displaying images should map to `CellType.Image` in `use-grid-columns.tsx`. The grid does NOT render React components - it uses a custom canvas renderer.

### presignedUrl Pattern
Fields storing files (Attachment, Signature) require runtime URL generation:
- URLs are NOT stored in database - only `path` and `token`
- `presignedUrl` is generated in `record.service.ts` at read time
- Must handle both single records and batch operations
