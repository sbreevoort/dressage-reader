# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Progressive Web App (PWA) built as a multi-app portal. The primary app is **Dressuur Voorlezer** — a Dutch dressage test reader that uses the Web Speech API to read test steps aloud. The portal also hosts several other unrelated tools (integration dashboard, nutrition advisor, intake assistant, etc.).

All code lives in `react-app/`. There is no backend — the app is entirely frontend with proxied API calls.

## Commands

Run all commands from the `react-app/` directory using `pnpm`.

```bash
pnpm start          # Run dev server + mock server concurrently
pnpm dev            # Dev server only (no mocks)
pnpm build          # Generate API types, type-check, and build
pnpm lint           # ESLint
pnpm generate:api   # Regenerate API client via Orval (from OpenAPI spec)
```

## Architecture

### App Portal Pattern

`Applications.tsx` is the registry — every app is declared there with its `routePath`, `accessRoles`, and a lazy-loaded component. Adding a new app means adding an entry here; the routing in `ApplicationPortalRoutes.tsx` dynamically builds routes from this list.

Apps live in `src/apps/<appname>/` and each export a named `*App` component that receives `AppComponentProps` (`name`, `routePath`, `accessRoles`, `avatar`).

### Context Stack

`ApplicationPortal.tsx` nests providers in this order (outer → inner):

`ErrorBoundary` → `QueryClientProvider` → `BrowserRouter` → `ThemeContext` → `GlobalContext` → `SessionContext` → `AuthContext` → `UserManagementProvider`

`AuthContext` is currently hardcoded to `isAuthenticated: true` (no real auth integration yet).

### Role-Based Access Control

User roles are stored in `localStorage` under the key `userroles-data`. On first load, `userRolesStorage.ts` seeds them from `public/userroles-config.json`. `ProtectedRoute` checks the current user's roles against each app's `accessRoles` list and redirects to `/` if unauthorized. User management is editable at `/settings`.

### Anthropic API Proxy

Calls to the Anthropic API go through Vite's dev-server proxy: `/api/anthropic` → `https://api.anthropic.com`. This avoids CORS issues. The API key is read from `VITE_ANTHROPIC_API_KEY`.

### Shared Library

`src/libs/shared/` contains reusable components (`Button`, `Layout`, `Header`, `Sidebar`, `DotLoader`, `DefaultErrorBoundary`), all exported from `src/libs/shared/components/index.ts`. Contexts and utilities follow the same path pattern.

### Dressage Reader App

The core app (`src/apps/dressagereader/`) stores test data as hardcoded `DRESSAGE_TESTS` constants inside the component file. It uses the browser's `window.speechSynthesis` API, filtering for Dutch (`nl`) voices and preferring Google voices. A "Zelf voorlezen" (self-narration) mode skips TTS and just advances steps manually.
