# Supabase Sync — Design

## Goal

Allow students to enter their email and have their curriculum progress load from Supabase. Sync changes in real-time across devices. No authentication, no passwords.

## Approach

**Option A (chosen): Supabase Database only, no Auth.**
Email as primary key, `estados` as JSONB. Realtime subscription for cross-device sync.

## Database

Single table `user_progress`:

| Column       | Type           | Notes                              |
|-------------|----------------|-------------------------------------|
| `email`     | `text` PK      | Student identifier (lowercased)     |
| `estados`   | `jsonb`        | `Record<string, EstadoMateria>`     |
| `updated_at`| `timestamptz`  | Auto-updated via trigger            |

Realtime enabled on this table. RLS disabled (public access via anon key).

## User Flow

1. Open app → login screen with email input + "Entrar" button
2. Email exists in DB → load `estados` from Supabase
3. Email doesn't exist → create empty record, start from scratch
4. Each state change → upsert to Supabase (debounced ~1s)
5. Realtime subscription → if same email open on another device, auto-sync

## Code Changes

### New Files
- `src/lib/supabase.ts` — Supabase client with env vars
- `src/components/Login/LoginScreen.tsx` — Email input screen

### Modified Files
- `src/store/useCarreraStore.ts` — Add `email`, Supabase sync functions, Realtime subscription
- `src/App.tsx` — Conditional render: no email → LoginScreen, else → AppShell
- `package.json` — Add `@supabase/supabase-js`

### New Files (root)
- `.env` — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Persistence Strategy

- localStorage remains as local cache (Zustand persist middleware)
- Supabase is source of truth — on login, Supabase data overwrites localStorage
- Email saved in localStorage so user doesn't re-enter it each visit
- "Cerrar sesión" button to switch accounts

## What Doesn't Change

- All map UI, cards, connections, simulation — untouched
- `estados` structure — same `Record<string, EstadoMateria>`
- Export/import JSON — still works
