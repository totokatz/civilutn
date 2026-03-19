# Elegant Curriculum Map — Complete UI Redesign

## Problem
Current UI is too dense: 5 cramped columns, tiny 9-10px fonts, overloaded sidebar, everything packed together. Also, "aprobada" incorrectly counts as "regularizada" in stats.

## Design Direction
Inspired by "Elegant" aesthetic (https://elegant-kohl-nine.vercel.app/): minimal grayscale palette, generous whitespace, typography-driven hierarchy, subtle borders, semi-transparent cards with backdrop-blur.

## Layout

### Top Bar (replaces Sidebar)
- Title left: "Ingeniería Civil · UTN Plan 2023"
- Center: linear progress bar (thin, zinc-200 track, emerald-500 fill)
- Stats inline: "12 aprobadas · 5 regularizadas · 3 cursando"
- Right: expandable search icon, settings gear dropdown
- Settings dropdown contains: simulation toggle, critical path toggle, export, import, reset

### Main Area — Horizontal Level Navigator
- Full viewport height minus top bar
- Scroll-snap horizontal navigation between levels
- Each level takes full viewport width
- Navigation: left/right arrows on sides + dot indicators at bottom
- Level heading: large centered text (text-2xl, font-normal, tracking-tight)

### Subject Cards (within each level)
- Grid: 2-3 columns responsive within each level view
- Card size: min 180px wide, generous padding (p-5)
- Card style: `bg-white/50 backdrop-blur-sm border border-zinc-200 rounded-sm`
- Hover: `bg-white transition-colors shadow-sm`
- State indicator: 3px left border colored by estado
  - Aprobada: emerald-500
  - Regularizada: amber-500
  - Cursando: blue-500
  - Pendiente: no left border (transparent)
  - Bloqueada: opacity-50, border-dashed border-zinc-300
- Content hierarchy:
  1. Subject name (text-base, font-medium, zinc-900)
  2. Metadata line (text-sm, zinc-500): "Anual · 10hs"
  3. Estado label (text-sm, zinc-500): "✓ Aprobada" / "◐ Regularizada" / etc.
  4. Requisite progress bar (only when casiDisponible)
- Click: opens detail panel (no more cycling on click)

### Detail Panel
- Slide-in from right, 400px wide
- Semi-transparent overlay backdrop
- Estado selector: 4 buttons (Pendiente, Cursando, Regularizada, Aprobada)
- Prerequisites list (cursadas vs aprobadas distinction)
- "Habilita" list (subjects this enables)
- Impact count

### Electives
- Accessible as 6th "level" in the horizontal navigator
- Profile tabs within: Ambiental, Construcciones, Vías, Hidráulica

### Simulation Mode
- Amber top banner when active
- Cards with simulated state show subtle amber ring
- Apply/Clear buttons in the banner

## Color System
- Background: #fafafa (off-white)
- Cards: white/50 with backdrop-blur
- Text primary: zinc-900
- Text secondary: zinc-500
- Text tertiary: zinc-400
- Borders: zinc-200
- Estado emerald: emerald-500 (aprobada)
- Estado amber: amber-500 (regularizada)
- Estado blue: blue-500 (cursando)
- Dark mode: REMOVED (single light elegant theme)

## Typography
- Font: Inter Variable (already installed)
- Headings: font-normal, tracking-tight (not bold)
- Body: text-sm to text-base
- Mono: JetBrains Mono for course codes

## Bug Fix
- Sidebar line 23: `regularizadas` count must exclude aprobadas
- `regularizadas = filter(m => estados[m.id] === 'regularizada')` (no `|| aprobada`)
- Stats show three mutually exclusive counts

## Files to Modify
1. `src/index.css` — New color theme, remove dark mode vars, add grid pattern
2. `src/components/Layout/AppShell.tsx` — Remove dark mode, new layout structure
3. `src/components/Layout/Sidebar.tsx` → `TopBar.tsx` — Complete rewrite as top bar
4. `src/components/Layout/MapArea.tsx` — Horizontal scroll-snap navigator
5. `src/components/Map/SubjectCard.tsx` — New elegant card design
6. `src/components/Map/LevelColumn.tsx` → `LevelView.tsx` — Full-width level view
7. `src/components/Map/ElectivesSection.tsx` — Integrate as 6th level
8. `src/components/Map/ConnectionLines.tsx` — Remove (doesn't work with horizontal layout)
9. `src/components/Panels/SubjectDetail.tsx` — Redesign with elegant styling
10. `src/components/Panels/SimulationBanner.tsx` — Subtle amber bar
11. `src/components/UI/ProgressRing.tsx` — Remove (replaced by linear bar)
12. `src/components/UI/SearchBar.tsx` — Expandable search icon
13. `src/store/useCarreraStore.ts` — Remove darkMode, fix regularizada count
14. `src/types/materia.ts` — No changes needed
