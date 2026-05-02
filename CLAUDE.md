# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Our-Moment** is a date recording and location-based memory app for couples. It allows users to:
- Record dates with multiple stops/locations
- View records on an interactive Kakao Map
- Browse memories in multiple views (calendar, card, place)
- Connect with their partner via couple pairing
- Track weather conditions for each date

**Tech Stack**: Next.js 16.2.4, React 19.2.4, TypeScript 5, Supabase, Kakao Map API

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint checks
```

**Note**: No test commands are currently configured. Add tests via Jest, Vitest, or similar as needed.

## Project Structure & Architecture

### Core Layers

**Authentication & Middleware** (`middleware.ts`)
- Supabase SSR middleware handles auth token refresh for long-running sessions
- Runs on all routes except static/image files and favicon
- Updates cookies to keep auth tokens current

**State Management** (Context API in `contexts/`)
- `AuthContext`: User auth state, session, and sign-out logic
- `UIContext`: Active tab state (map/memories)
- `MapContext`: Map-related state and interactions
- All contexts use React's `createContext` and `useContext`

**Data Layer** (`lib/supabase/`)
- `client.ts`: Browser Supabase client for client components
- `server.ts`: Server Supabase client for Server Components and Server Actions
- Uses `@supabase/ssr` for proper cookie handling in both contexts

**Server Actions** (`app/actions/`)
- `auth.ts`: Authentication operations (login, signup, verification)
- `couple.ts`: Couple connection and pairing logic
- `records.ts`: CRUD operations for travel records and stops

### Component Organization (`components/`)

```
components/
├── auth/          # AuthOverlay component
├── layout/        # SiteHeader, TabNav components
├── map/           # KakaoMap, MapSearch, RecentRecords, PinDetailModal
├── records/       # MemoriesPanel, CalendarView, CardView, PlaceView, RecordModal
└── couple/        # CoupleModal component
```

**Key Implementation Details**:
- Components using `'use client'` for client-side features
- Dynamic imports with `ssr: false` for Kakao Map (requires browser APIs)
- Modals are rendered on top level and controlled via UIContext

### Type System (`types/index.ts`)

Core data models:
- `UserProfile`: User information with optional avatar
- `TravelRecord`: Date record with title, date, stops, and weather
- `Stop`: Individual location in a record with time, place tag, photo, and coordinates
- `Pin`: Map marker linked to a specific stop
- `CoupleConnection`: Pairing data between two users
- `Session`: Supabase auth session structure

## Important Next.js 16 Notes

**From AGENTS.md**: This is NOT the standard Next.js you know. Version 16 has breaking changes:
- Always check `node_modules/next/dist/docs/` for API changes before writing code
- Pay attention to deprecation notices in Next.js documentation
- Be especially careful with auth, Server Components, and API patterns

## Key Architectural Decisions

1. **Server Actions for Data Mutations**: All database writes use Server Actions, not API routes
2. **Dynamic Component Loading**: Map and MemoriesPanel use dynamic imports to avoid browser-only APIs in SSR
3. **Page Structure**: Single-page app (SPA) using tab switching, no multi-route structure
4. **Korean Language First**: Uses Noto Sans KR font, Korean UI text, Korean comments in code
5. **Supabase for Everything**: Auth, database, and storage through Supabase (no external APIs except Kakao Map)

## Common Tasks & Patterns

### Adding a New Feature

1. Define types in `types/index.ts` if needed
2. Add Server Action in `app/actions/` for server-side logic
3. Create component in `components/` (use `'use client'` if it needs interactivity)
4. If feature needs state, add to appropriate Context
5. Wire component into page or modal layer

### Modifying Data Models

1. Update types in `types/index.ts`
2. Update Supabase queries in `app/actions/`
3. Update components that consume the data
4. Test with actual Supabase data

### Working with the Map

- Kakao Map component is in `components/map/KakaoMap.tsx` - requires browser APIs
- Pin management flows through MapContext
- PinDetailModal displays stop information from selected pins

### Authentication Flow

1. User interaction in AuthOverlay
2. Server Action in `app/actions/auth.ts` processes request
3. AuthContext listens to `onAuthStateChange` and updates state
4. Components conditionally render based on user presence

## Environment Variables Required

The app expects these `.env.local` variables (not in git):
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- Kakao Map API key (likely in public environment or embedded in component)

## Testing & Quality

- ESLint is configured with Next.js rules (core-web-vitals and TypeScript support)
- Run `npm run lint` before committing
- TypeScript strict mode is enabled (`"strict": true`)
- No unit/integration test framework is currently set up

## Potential Improvements (Not Required)

These are opportunities but NOT current requirements:
- Add unit/integration tests (Jest or Vitest)
- Add E2E tests (Playwright or Cypress)
- Implement error boundary components
- Add loading skeletons for better UX
- Consider adding React Query for data fetching
- Consider implementing date-fns for better date handling

## Key Files to Know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Root page with tab-based layout |
| `contexts/AuthContext.tsx` | Auth state and sign-out logic |
| `lib/supabase/client.ts` | Browser Supabase client |
| `app/actions/*` | Server-side mutations and queries |
| `components/map/KakaoMap.tsx` | Map display component |
| `types/index.ts` | All TypeScript type definitions |
| `middleware.ts` | Auth token refresh middleware |

---

**Last Updated**: When Next.js or major dependency versions change, review and update this file accordingly.
