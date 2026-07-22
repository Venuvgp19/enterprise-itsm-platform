# Workspace Rules

## Application Management Directives
- **Restart App Directive**: Whenever the user requests to "restart app" (or "restart application", "restart frontend and backend"), automatically:
  1. Rebuild NestJS backend (`npm run build:backend`).
  2. Clear ports 4000 and 3000.
  3. Start NestJS backend API server (`node apps/backend/dist/main.js` on port 4000).
  4. Start Next.js frontend dev server (`npm run dev:frontend` on port 3000).

## Database Management Directives
- **Database Integrity Directive**: Whenever the backend is built (`npm run build:backend`), restarted, or compiled, **DO NOT ALTER OR RESET THE DATABASE**. Preserve all existing DB state, table schemas, and incident records without running destructive seeds, resets, or table wipes.
