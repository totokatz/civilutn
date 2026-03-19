# Design: Mapa de Correlatividades - Ingeniería Civil UTN

**Date**: 2026-03-19
**Stack**: Vite + React 18 + TypeScript + Tailwind CSS + Zustand
**Deploy**: Vercel (SPA)
**Design System**: Simple (Inter, JetBrains Mono, tokens from TypeUI)

## Architecture

```
src/
  data/         -> materias.ts (static curriculum data, typed)
  store/        -> useCarreraStore.ts (Zustand: subject states, simulation mode)
  components/
    Layout/     -> AppShell, Sidebar, MapArea
    Map/        -> SubjectCard, ConnectionLines, LevelColumn
    Panels/     -> SubjectDetail (drawer), SimulationBanner, NextSemester
    UI/         -> ProgressRing, SearchBar, FilterButtons, ThemeToggle
  hooks/        -> useCorrelatividades.ts (unlock logic), useSimulation.ts
  utils/        -> graphLayout.ts (bezier path calc), criticalPath.ts
  types/        -> materia.ts, enums.ts
```

## Core Data Flow

1. Static data in `materias.ts` defines all 41+ subjects with codes, hours, level, type, and prerequisite IDs
2. Zustand store holds each subject's state (pending | cursando | regularizada | aprobada) + simulation overlay
3. Derived state (computed via selectors): which subjects are disponible, bloqueada, or casiDisponible
4. Persistence: zustand/middleware persist to localStorage. Export/import as JSON.

## Visualization

- 6 fixed columns (CSS Grid) for levels
- SVG overlay (absolutely positioned, pointer-events: none) draws bezier curves
- On hover: all connections fade to 10% opacity except connected ones
- Line colors: green solid (aprobada), yellow solid (cursada), red dashed (no cumplida), orange dashed (parcial)

## State Management

```typescript
interface CarreraStore {
  estados: Record<string, EstadoMateria>
  modoSimulacion: boolean
  estadosSimulados: Record<string, EstadoMateria>
  setEstado: (id: string, estado: EstadoMateria) => void
  toggleSimulacion: () => void
  aplicarSimulacion: () => void
  limpiarSimulacion: () => void
}
```

## Features (Priority Order)

1. Subject cards with state cycling
2. Color system per state (spec colors)
3. SVG connection lines with hover highlighting
4. Sidebar with progress stats + circular progress rings
5. Subject detail drawer
6. Simulation mode ("Que pasa si...")
7. Search bar with filtering
8. Dark mode
9. Critical path visualization
10. "Proximo Cuatrimestre" suggestion panel
11. Electives section (expandable tabs by profile)
12. Responsive mobile layout (vertical accordion)

## Design Tokens

- primary=#3B82F6, success=#16A34A, warning=#D97706, danger=#DC2626
- surface=#FFFFFF, text=#111827
- Font: Inter (primary), JetBrains Mono (codes)
- Spacing: 4/8/12/16/24/32
- Border radius: lg for cards
