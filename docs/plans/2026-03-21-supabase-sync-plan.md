# Supabase Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Students enter their email to load/save curriculum progress from Supabase with real-time sync across devices.

**Architecture:** Email-as-key lookup against a single `user_progress` table in Supabase. No auth. Zustand store extended with sync logic. Realtime subscription for cross-device updates.

**Tech Stack:** React, Zustand, Supabase JS client, Tailwind CSS, Vite

---

### Task 1: Setup — Install Supabase and create environment config

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Modify: `.gitignore`

**Step 1: Install Supabase client**

Run: `npm install @supabase/supabase-js`

**Step 2: Create `.env.local` with Supabase credentials**

```env
VITE_SUPABASE_URL=https://hjfqfhnlngfmsboqvjae.supabase.co
VITE_SUPABASE_ANON_KEY=<user must fill this in>
```

**Step 3: Add `.env*` to `.gitignore`**

Add this line to `.gitignore`:
```
.env*
```

**Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add supabase-js dependency and env config"
```

---

### Task 2: Supabase client — Create the client module

**Files:**
- Create: `src/lib/supabase.ts`

**Step 1: Create Supabase client**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 2: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add supabase client module"
```

---

### Task 3: Database — Create the table in Supabase

**Note:** This step is SQL to run in Supabase Dashboard → SQL Editor.

**Step 1: Create table and enable Realtime**

```sql
create table user_progress (
  email text primary key,
  estados jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_progress_updated_at
  before update on user_progress
  for each row execute function update_updated_at();

-- Enable Realtime
alter publication supabase_realtime add table user_progress;
```

**Step 2: Disable RLS (public access)**

In Supabase Dashboard → Table Editor → user_progress → RLS → Disable.

Or via SQL:
```sql
alter table user_progress disable row level security;
```

---

### Task 4: Login Screen — Create email input component

**Files:**
- Create: `src/components/Login/LoginScreen.tsx`

**Step 1: Create the LoginScreen component**

Simple centered screen with email input. Matches the existing design system (Tailwind theme vars, Inter font, minimal style). Shows app title, email input, "Entrar" button. On submit: stores email in localStorage, calls the store's login function.

```tsx
import { useState } from 'react'

interface LoginScreenProps {
  onLogin: (email: string) => void
  loading?: boolean
}

export function LoginScreen({ onLogin, loading }: LoginScreenProps) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (trimmed && trimmed.includes('@')) {
      onLogin(trimmed)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid">
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-4">
        <div className="bg-surface border border-border rounded-sm p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-lg font-normal tracking-tight text-text-primary">
              Ingenieria Civil
            </h1>
            <p className="text-xs text-text-tertiary tracking-wide">UTN — Plan 2023</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs text-text-secondary mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-surface placeholder:text-text-tertiary focus:outline-none focus:border-text-secondary transition-colors"
                autoFocus
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={!email.trim().includes('@') || loading}
              className="w-full py-2 text-sm bg-text-primary text-surface rounded-sm hover:bg-text-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 'Entrar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Login/LoginScreen.tsx
git commit -m "feat: add login screen component"
```

---

### Task 5: Store — Add Supabase sync to Zustand store

**Files:**
- Modify: `src/store/useCarreraStore.ts`

This is the core change. Add:
- `email: string | null` to state
- `login(email)` — load from Supabase, subscribe to Realtime
- `logout()` — unsubscribe, clear email
- `syncToSupabase()` — debounced upsert on every `estados` change

**Step 1: Modify the store**

Key changes to `useCarreraStore.ts`:

1. Import supabase client at top:
```typescript
import { supabase } from '../lib/supabase'
```

2. Add to interface `CarreraStore`:
```typescript
email: string | null
loading: boolean
login: (email: string) => Promise<void>
logout: () => void
```

3. Add `email: null` and `loading: false` to initial state.

4. Implement `login`:
```typescript
login: async (email) => {
  set({ loading: true })

  // Try to load existing progress
  const { data } = await supabase
    .from('user_progress')
    .select('estados')
    .eq('email', email)
    .single()

  if (data) {
    // Existing user — load their estados
    set({ email, estados: { ...defaultEstados, ...data.estados }, loading: false })
  } else {
    // New user — create record with current estados
    const estados = get().estados
    await supabase.from('user_progress').insert({ email, estados })
    set({ email, loading: false })
  }

  // Save email to localStorage for auto-login
  localStorage.setItem('carrera-email', email)

  // Subscribe to Realtime changes for this email
  supabase
    .channel('user_progress_sync')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'user_progress', filter: `email=eq.${email}` },
      (payload) => {
        const remoteEstados = payload.new.estados as Record<string, EstadoMateria>
        // Only update if different from current (avoid loops)
        const currentEstados = get().estados
        if (JSON.stringify(remoteEstados) !== JSON.stringify(currentEstados)) {
          set({ estados: { ...defaultEstados, ...remoteEstados } })
        }
      }
    )
    .subscribe()
},
```

5. Implement `logout`:
```typescript
logout: () => {
  supabase.channel('user_progress_sync').unsubscribe()
  localStorage.removeItem('carrera-email')
  set({ email: null, estados: { ...defaultEstados } })
},
```

6. Add a debounced sync mechanism. After the store creation, add a subscriber that watches `estados` changes and syncs to Supabase:

```typescript
// Debounced sync to Supabase
let syncTimeout: ReturnType<typeof setTimeout> | null = null

useCarreraStore.subscribe(
  (state) => state.estados,
  (estados) => {
    const email = useCarreraStore.getState().email
    if (!email) return

    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
      supabase.from('user_progress').upsert({ email, estados })
    }, 1000)
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
)
```

Note: This uses Zustand's `subscribe` with a selector — requires importing `subscribeWithSelector` middleware.

7. Add `subscribeWithSelector` middleware to the store:
```typescript
import { persist, subscribeWithSelector } from 'zustand/middleware'

export const useCarreraStore = create<CarreraStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ... existing store
      }),
      {
        name: 'carrera-ic-utn',
        partialize: (s) => ({ estados: s.estados, email: s.email }),
      }
    )
  )
)
```

8. Update `partialize` to also persist `email` so the store remembers it.

**Step 2: Commit**

```bash
git add src/store/useCarreraStore.ts
git commit -m "feat: add supabase sync to carrera store"
```

---

### Task 6: App — Add login gate and logout button

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Layout/TopBar.tsx`

**Step 1: Modify `App.tsx` to gate on email**

```tsx
import { useEffect } from 'react'
import { AppShell } from './components/Layout/AppShell'
import { LoginScreen } from './components/Login/LoginScreen'
import { useCarreraStore } from './store/useCarreraStore'

function App() {
  const email = useCarreraStore((s) => s.email)
  const loading = useCarreraStore((s) => s.loading)
  const login = useCarreraStore((s) => s.login)

  // Auto-login from localStorage on first load
  useEffect(() => {
    const savedEmail = localStorage.getItem('carrera-email')
    if (savedEmail && !email) {
      login(savedEmail)
    }
  }, [])

  if (!email) {
    return <LoginScreen onLogin={login} loading={loading} />
  }

  return <AppShell />
}

export default App
```

**Step 2: Add logout button to TopBar settings menu**

In `src/components/Layout/TopBar.tsx`, add to the settings dropdown (before "Resetear todo"):

```tsx
// Import at top
const email = useCarreraStore((s) => s.email)
const logout = useCarreraStore((s) => s.logout)

// In the dropdown, before the "Resetear" divider:
<div className="border-t border-border my-1" />
<div className="px-4 py-2 text-xs text-text-tertiary truncate">{email}</div>
<button
  onClick={() => { logout(); setSettingsOpen(false) }}
  className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-background transition-colors"
>
  Cerrar sesion
</button>
```

**Step 3: Commit**

```bash
git add src/App.tsx src/components/Layout/TopBar.tsx
git commit -m "feat: add login gate and logout button"
```

---

### Task 7: Test end-to-end

**Step 1: Run dev server**

Run: `npm run dev`

**Step 2: Manual test checklist**

- [ ] App shows login screen on first visit
- [ ] Enter email → loads empty progress for new user
- [ ] Click some materias to change state → wait 1s → check Supabase table has updated `estados`
- [ ] Refresh page → auto-login, progress preserved
- [ ] Open in second browser tab with same email → changes sync between tabs
- [ ] "Cerrar sesion" → returns to login screen
- [ ] Login again with same email → progress loads back
- [ ] Export/import JSON still works

**Step 3: Build check**

Run: `npm run build`
Expected: builds with no TypeScript errors.

**Step 4: Commit any fixes**

---

### Task 8: Final cleanup

**Step 1: Verify `.env.local` is not tracked**

Run: `git status`
Ensure `.env.local` does NOT appear.

**Step 2: Final commit if needed**
