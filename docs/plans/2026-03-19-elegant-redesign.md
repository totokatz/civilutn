# Elegant Curriculum Map — Complete UI Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete visual redesign of the UTN Civil Engineering curriculum planner from cramped 5-column layout to an elegant, spacious horizontal-scroll navigator inspired by the "Elegant" design system.

**Architecture:** Replace the sidebar+grid layout with a top-bar + horizontal scroll-snap level navigator. Each of the 5 levels (+ electives) fills the viewport as its own page. Cards are large and spacious with left-border estado indicators. Dark mode is removed in favor of a single clean off-white aesthetic.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Zustand 5, Vite 8

---

### Task 1: Foundation — CSS Theme & Store Fixes

**Files:**
- Modify: `src/index.css` (full rewrite)
- Modify: `src/store/useCarreraStore.ts:15-16,59,80` (remove darkMode)

**Step 1: Rewrite `src/index.css` with elegant theme**

Replace entire file:

```css
@import "tailwindcss";
@import "@fontsource-variable/inter";
@import "@fontsource-variable/jetbrains-mono";

@theme {
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, monospace;

  --color-surface: #ffffff;
  --color-background: #fafafa;
  --color-border: #e4e4e7;
  --color-border-hover: #d4d4d8;

  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-text-tertiary: #a1a1aa;

  --color-estado-aprobada: #10b981;
  --color-estado-regularizada: #f59e0b;
  --color-estado-cursando: #3b82f6;
  --color-estado-bloqueada: #a1a1aa;
}

@layer base {
  html {
    font-family: var(--font-sans);
    color: var(--color-text-primary);
    background: var(--color-background);
  }
}

.bg-grid {
  background-image: radial-gradient(circle, #d4d4d8 1px, transparent 1px);
  background-size: 32px 32px;
}

@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in 0.25s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

**Step 2: Remove darkMode from store**

In `src/store/useCarreraStore.ts`:

- Remove `darkMode: boolean` from the interface (line 15)
- Remove `toggleDarkMode: () => void` from the interface (line 22)
- Remove `darkMode: false` from the initial state (line 59)
- Remove `toggleDarkMode` setter (line 80)
- Update `partialize` to only persist `estados`: `partialize: (s) => ({ estados: s.estados })`

The resulting store interface should be:

```typescript
interface CarreraStore {
  estados: Record<string, EstadoMateria>
  modoSimulacion: boolean
  estadosSimulados: Record<string, EstadoMateria>
  hoveredMateria: string | null
  selectedMateria: string | null
  searchQuery: string
  showCriticalPath: boolean
  setEstado: (id: string, estado: EstadoMateria) => void
  cycleEstado: (id: string) => void
  setHovered: (id: string | null) => void
  setSelected: (id: string | null) => void
  setSearchQuery: (query: string) => void
  toggleSimulacion: () => void
  simularEstado: (id: string, estado: EstadoMateria) => void
  aplicarSimulacion: () => void
  limpiarSimulacion: () => void
  toggleCriticalPath: () => void
  exportState: () => string
  importState: (json: string) => void
  resetAll: () => void
  getEstadoEfectivo: (id: string) => EstadoMateria
  getDisponibilidad: (id: string) => Disponibilidad
  getRequisitosCompletados: (id: string) => { completados: number; total: number }
}
```

**Step 3: Verify build compiles (will have errors from components referencing darkMode — expected, we fix in later tasks)**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Errors about darkMode references in components (this is OK — will be fixed in subsequent tasks)

**Step 4: Commit**

```bash
git add src/index.css src/store/useCarreraStore.ts
git commit -m "refactor: elegant theme foundation + remove darkMode from store"
```

---

### Task 2: TopBar Component (replaces Sidebar)

**Files:**
- Create: `src/components/Layout/TopBar.tsx`
- Delete later: `src/components/Layout/Sidebar.tsx` (in cleanup task)
- Delete later: `src/components/UI/ProgressRing.tsx` (no longer used)

**Step 1: Create TopBar component**

Create `src/components/Layout/TopBar.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react'
import { useCarreraStore } from '../../store/useCarreraStore'
import { materias } from '../../data/materias'

export function TopBar() {
  const estados = useCarreraStore((s) => s.estados)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const toggleSimulacion = useCarreraStore((s) => s.toggleSimulacion)
  const aplicarSimulacion = useCarreraStore((s) => s.aplicarSimulacion)
  const limpiarSimulacion = useCarreraStore((s) => s.limpiarSimulacion)
  const showCriticalPath = useCarreraStore((s) => s.showCriticalPath)
  const toggleCriticalPath = useCarreraStore((s) => s.toggleCriticalPath)
  const exportState = useCarreraStore((s) => s.exportState)
  const importState = useCarreraStore((s) => s.importState)
  const resetAll = useCarreraStore((s) => s.resetAll)
  const searchQuery = useCarreraStore((s) => s.searchQuery)
  const setSearchQuery = useCarreraStore((s) => s.setSearchQuery)

  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  const obligatorias = materias.filter((m) => !m.esElectiva)
  const total = obligatorias.length
  const aprobadas = obligatorias.filter((m) => estados[m.id] === 'aprobada').length
  const regularizadas = obligatorias.filter((m) => estados[m.id] === 'regularizada').length
  const cursando = obligatorias.filter((m) => estados[m.id] === 'cursando').length
  const porcentaje = total > 0 ? Math.round((aprobadas / total) * 100) : 0

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = () => {
    const json = exportState()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mi-carrera-ic-utn.json'
    a.click()
    URL.revokeObjectURL(url)
    setSettingsOpen(false)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => importState(reader.result as string)
      reader.readAsText(file)
    }
    input.click()
    setSettingsOpen(false)
  }

  return (
    <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-normal tracking-tight text-text-primary">
              Ingeniería Civil
            </h1>
            <p className="text-xs text-text-tertiary tracking-wide">UTN — Plan 2023</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-estado-aprobada" />
              {aprobadas} aprobadas
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-estado-regularizada" />
              {regularizadas} regulares
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-estado-cursando" />
              {cursando} cursando
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {searchOpen ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar materia..."
                className="w-48 px-3 py-1.5 text-sm border border-border rounded-sm bg-surface placeholder:text-text-tertiary focus:outline-none focus:border-text-secondary transition-colors"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                className="text-text-tertiary hover:text-text-primary transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
              title="Buscar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="5" />
                <path d="M11 11l3.5 3.5" />
              </svg>
            </button>
          )}

          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
              title="Opciones"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-sm shadow-lg z-50 animate-fade-in">
                <div className="py-1">
                  <button
                    onClick={() => { toggleSimulacion(); setSettingsOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${modoSimulacion ? 'text-amber-600 bg-amber-50' : 'text-text-primary hover:bg-background'}`}
                  >
                    {modoSimulacion ? 'Desactivar simulación' : 'Modo simulación'}
                  </button>
                  {modoSimulacion && (
                    <>
                      <button
                        onClick={() => { aplicarSimulacion(); setSettingsOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-estado-aprobada hover:bg-background transition-colors"
                      >
                        Aplicar cambios simulados
                      </button>
                      <button
                        onClick={() => { limpiarSimulacion(); setSettingsOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-background transition-colors"
                      >
                        Limpiar simulación
                      </button>
                    </>
                  )}
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => { toggleCriticalPath(); setSettingsOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${showCriticalPath ? 'text-amber-600 bg-amber-50' : 'text-text-primary hover:bg-background'}`}
                  >
                    {showCriticalPath ? 'Ocultar camino crítico' : 'Camino crítico'}
                  </button>
                  <div className="border-t border-border my-1" />
                  <button onClick={handleExport} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-background transition-colors">
                    Exportar progreso
                  </button>
                  <button onClick={handleImport} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-background transition-colors">
                    Importar progreso
                  </button>
                  <div className="border-t border-border my-1" />
                  <button onClick={() => { if (confirm('¿Resetear todo el progreso?')) { resetAll(); setSettingsOpen(false) } }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    Resetear todo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-border/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-estado-aprobada rounded-full transition-all duration-700"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <span className="text-xs text-text-secondary tabular-nums">{porcentaje}%</span>
        </div>
      </div>
    </header>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Layout/TopBar.tsx
git commit -m "feat: create TopBar component replacing Sidebar"
```

---

### Task 3: Redesign SubjectCard

**Files:**
- Modify: `src/components/Map/SubjectCard.tsx` (full rewrite)

**Step 1: Rewrite SubjectCard with elegant design**

Replace entire `src/components/Map/SubjectCard.tsx`:

```tsx
import { type Materia } from '../../types/materia'
import { useCarreraStore } from '../../store/useCarreraStore'
import { makeGetEstado, computeDisponibilidad, computeRequisitos } from '../../hooks/useMateria'

interface SubjectCardProps {
  materia: Materia
}

const estadoConfig = {
  aprobada: { border: 'border-l-estado-aprobada', label: 'Aprobada', icon: '✓' },
  regularizada: { border: 'border-l-estado-regularizada', label: 'Regularizada', icon: '◐' },
  cursando: { border: 'border-l-estado-cursando', label: 'Cursando', icon: '▶' },
  pendiente: { border: 'border-l-transparent', label: '', icon: '' },
}

export function SubjectCard({ materia }: SubjectCardProps) {
  const setSelected = useCarreraStore((s) => s.setSelected)
  const hoveredMateria = useCarreraStore((s) => s.hoveredMateria)
  const setHovered = useCarreraStore((s) => s.setHovered)
  const searchQuery = useCarreraStore((s) => s.searchQuery)
  const estados = useCarreraStore((s) => s.estados)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)

  const getEstado = makeGetEstado(estados, modoSimulacion, estadosSimulados)
  const estado = getEstado(materia.id)
  const disponibilidad = computeDisponibilidad(materia.id, getEstado)
  const { completados, total } = computeRequisitos(materia.id, getEstado)

  const isSearchMatch = !searchQuery ||
    materia.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    materia.codigo.includes(searchQuery) ||
    materia.nombreCorto.toLowerCase().includes(searchQuery.toLowerCase())

  const isDimmed = (hoveredMateria && hoveredMateria !== materia.id) || (!isSearchMatch && searchQuery)
  const isSimulated = modoSimulacion && materia.id in estadosSimulados
  const isBloqueada = estado === 'pendiente' && disponibilidad === 'bloqueada'

  const config = estado !== 'pendiente' ? estadoConfig[estado] : estadoConfig.pendiente

  const disponibilidadLabel =
    estado !== 'pendiente' ? config.label :
    disponibilidad === 'disponible' ? 'Disponible' :
    disponibilidad === 'casiDisponible' ? 'Casi disponible' :
    'Bloqueada'

  return (
    <div
      data-materia-id={materia.id}
      onClick={() => setSelected(materia.id)}
      onMouseEnter={() => setHovered(materia.id)}
      onMouseLeave={() => setHovered(null)}
      className={`
        relative rounded-sm border border-border bg-white/50 backdrop-blur-sm
        border-l-[3px] ${config.border}
        p-5 cursor-pointer select-none
        transition-all duration-200
        hover:bg-white hover:shadow-sm hover:border-border-hover
        ${isDimmed ? 'opacity-30' : 'opacity-100'}
        ${isBloqueada ? 'opacity-50 border-dashed' : ''}
        ${isSimulated ? 'ring-2 ring-amber-400/60' : ''}
      `}
    >
      <div className="mb-3">
        <p className="text-base font-medium leading-snug text-text-primary">
          {materia.nombreCorto}
        </p>
        <span className="font-mono text-[11px] text-text-tertiary">{materia.codigo}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
        <span>{materia.tipo === 'A' ? 'Anual' : 'Cuatrimestral'}</span>
        <span className="text-text-tertiary">·</span>
        <span>{materia.horas}hs</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          {estado !== 'pendiente' && <span className="mr-1">{config.icon}</span>}
          {disponibilidadLabel}
        </span>
      </div>

      {estado === 'pendiente' && disponibilidad !== 'disponible' && total > 0 && (
        <div className="mt-3">
          <div className="w-full h-1 bg-border/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-estado-cursando rounded-full transition-all duration-300"
              style={{ width: `${(completados / total) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-text-tertiary mt-1 block">
            {completados}/{total} requisitos
          </span>
        </div>
      )}

      {materia.esProyectoFinal && (
        <p className="mt-2 text-[11px] text-amber-600 font-medium">
          Requiere todas las demás aprobadas
        </p>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Map/SubjectCard.tsx
git commit -m "refactor: redesign SubjectCard with elegant minimal style"
```

---

### Task 4: Create LevelView (replaces LevelColumn)

**Files:**
- Create: `src/components/Map/LevelView.tsx`
- Delete later: `src/components/Map/LevelColumn.tsx`

**Step 1: Create LevelView component**

Create `src/components/Map/LevelView.tsx`:

```tsx
import { type Materia } from '../../types/materia'
import { SubjectCard } from './SubjectCard'

interface LevelViewProps {
  nivel: number
  nombre: string
  subtitulo: string
  materias: Materia[]
}

export function LevelView({ nombre, subtitulo, materias }: LevelViewProps) {
  return (
    <div className="w-full shrink-0 snap-center px-8 py-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-normal tracking-tight text-text-primary">
            {nombre}
          </h2>
          <p className="text-sm text-text-tertiary mt-1">{subtitulo}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map((m) => (
            <SubjectCard key={m.id} materia={m} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Map/LevelView.tsx
git commit -m "feat: create LevelView for horizontal scroll navigator"
```

---

### Task 5: Create ElectivesView (replaces ElectivesSection)

**Files:**
- Create: `src/components/Map/ElectivesView.tsx`
- Delete later: `src/components/Map/ElectivesSection.tsx`

**Step 1: Create ElectivesView component**

Create `src/components/Map/ElectivesView.tsx`:

```tsx
import { useState } from 'react'
import { type PerfilElectiva } from '../../types/materia'
import { materiasElectivas } from '../../data/materias'
import { SubjectCard } from './SubjectCard'

const perfiles: { key: PerfilElectiva; label: string }[] = [
  { key: 'ambiental', label: 'Ambiental' },
  { key: 'construcciones', label: 'Construcciones' },
  { key: 'vias', label: 'Vías de Comunicación' },
  { key: 'hidraulica', label: 'Hidráulica' },
]

export function ElectivesView() {
  const [activePerfil, setActivePerfil] = useState<PerfilElectiva>('ambiental')

  const filtered = materiasElectivas.filter((m) =>
    m.perfilElectiva?.includes(activePerfil)
  )

  return (
    <div className="w-full shrink-0 snap-center px-8 py-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-normal tracking-tight text-text-primary">
            Electivas
          </h2>
          <p className="text-sm text-text-tertiary mt-1">11hs cátedra anuales requeridas</p>
        </div>

        <div className="flex justify-center gap-1 mb-8">
          {perfiles.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePerfil(p.key)}
              className={`px-4 py-2 text-sm rounded-sm transition-all ${
                activePerfil === p.key
                  ? 'bg-text-primary text-white'
                  : 'text-text-secondary hover:bg-border/30'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <SubjectCard key={m.id} materia={m} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Map/ElectivesView.tsx
git commit -m "feat: create ElectivesView as 6th level page"
```

---

### Task 6: Rewrite MapArea with Horizontal Scroll Navigator

**Files:**
- Modify: `src/components/Layout/MapArea.tsx` (full rewrite)

**Step 1: Rewrite MapArea**

Replace entire `src/components/Layout/MapArea.tsx`:

```tsx
import { useRef, useState, useEffect } from 'react'
import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasPorNivel } from '../../data/materias'
import { LevelView } from '../Map/LevelView'
import { ElectivesView } from '../Map/ElectivesView'
import { SimulationBanner } from '../Panels/SimulationBanner'
import { SubjectDetail } from '../Panels/SubjectDetail'

const LEVELS = [
  { nivel: 1, nombre: '1er Nivel', subtitulo: 'Ciencias Básicas' },
  { nivel: 2, nombre: '2do Nivel', subtitulo: 'Ciencias de la Ingeniería' },
  { nivel: 3, nombre: '3er Nivel', subtitulo: 'Tecnologías Aplicadas' },
  { nivel: 4, nombre: '4to Nivel', subtitulo: 'Ingeniería Aplicada' },
  { nivel: 5, nombre: '5to Nivel', subtitulo: 'Integración Profesional' },
]

export function MapArea() {
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const selectedMateria = useCarreraStore((s) => s.selectedMateria)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const totalPages = LEVELS.length + 1 // +1 for electives

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const pageWidth = container.clientWidth
      const index = Math.round(scrollLeft / pageWidth)
      setActiveIndex(index)
    }
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (index: number) => {
    const container = scrollRef.current
    if (!container) return
    const clamped = Math.max(0, Math.min(index, totalPages - 1))
    container.scrollTo({ left: clamped * container.clientWidth, behavior: 'smooth' })
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      {modoSimulacion && <SimulationBanner />}

      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {LEVELS.map((level) => (
          <LevelView
            key={level.nivel}
            nivel={level.nivel}
            nombre={level.nombre}
            subtitulo={level.subtitulo}
            materias={materiasPorNivel(level.nivel)}
          />
        ))}
        <ElectivesView />
      </div>

      {/* Navigation arrows */}
      {activeIndex > 0 && (
        <button
          onClick={() => scrollTo(activeIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all z-20"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
      )}
      {activeIndex < totalPages - 1 && (
        <button
          onClick={() => scrollTo(activeIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all z-20"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === activeIndex
                ? 'bg-text-primary scale-125'
                : 'bg-text-tertiary/40 hover:bg-text-tertiary'
            }`}
            title={i < LEVELS.length ? LEVELS[i].nombre : 'Electivas'}
          />
        ))}
      </div>

      {selectedMateria && <SubjectDetail />}
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Layout/MapArea.tsx
git commit -m "refactor: MapArea horizontal scroll-snap navigator"
```

---

### Task 7: Redesign SubjectDetail Panel

**Files:**
- Modify: `src/components/Panels/SubjectDetail.tsx` (full rewrite)

**Step 1: Rewrite SubjectDetail with elegant styling**

Replace entire `src/components/Panels/SubjectDetail.tsx`:

```tsx
import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasMap, materias } from '../../data/materias'
import { type EstadoMateria } from '../../types/materia'

const estadoOptions: { value: EstadoMateria; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'border-border text-text-secondary' },
  { value: 'cursando', label: 'Cursando', color: 'border-estado-cursando text-estado-cursando' },
  { value: 'regularizada', label: 'Regularizada', color: 'border-estado-regularizada text-estado-regularizada' },
  { value: 'aprobada', label: 'Aprobada', color: 'border-estado-aprobada text-estado-aprobada' },
]

export function SubjectDetail() {
  const selectedMateria = useCarreraStore((s) => s.selectedMateria)
  const setSelected = useCarreraStore((s) => s.setSelected)
  const setEstado = useCarreraStore((s) => s.setEstado)
  const estados = useCarreraStore((s) => s.estados)
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const simularEstado = useCarreraStore((s) => s.simularEstado)

  if (!selectedMateria) return null
  const materia = materiasMap.get(selectedMateria)
  if (!materia) return null

  const getEstado = (id: string): EstadoMateria => {
    if (modoSimulacion && id in estadosSimulados) return estadosSimulados[id]
    return estados[id] ?? 'pendiente'
  }

  const estado = getEstado(materia.id)
  const habilita = materias.filter((m) =>
    m.requiereCursadas.includes(materia.id) || m.requiereAprobadas.includes(materia.id)
  )

  const handleSetEstado = (newEstado: EstadoMateria) => {
    if (modoSimulacion) {
      simularEstado(materia.id, newEstado)
    } else {
      setEstado(materia.id, newEstado)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-surface border-l border-border z-50 overflow-y-auto animate-slide-in">
        <div className="p-8">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-6 right-6 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>

          <span className="font-mono text-xs text-text-tertiary">{materia.codigo}</span>
          <h2 className="text-xl font-normal tracking-tight mt-1 text-text-primary leading-snug">
            {materia.nombre}
          </h2>

          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-sm border border-border text-text-secondary">
              Nivel {materia.nivel}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-sm border border-border text-text-secondary">
              {materia.tipo === 'A' ? 'Anual' : 'Cuatrimestral'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-sm border border-border text-text-secondary">
              {materia.horas}hs semanales
            </span>
          </div>

          <div className="mt-8">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Estado
            </label>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {estadoOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSetEstado(opt.value)}
                  className={`py-2.5 px-3 text-sm rounded-sm border-2 font-medium transition-all ${
                    estado === opt.value
                      ? `${opt.color} bg-background`
                      : 'border-transparent bg-background text-text-secondary hover:border-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {(materia.requiereCursadas.length > 0 || materia.requiereAprobadas.length > 0) && (
            <div className="mt-8">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3">
                Requisitos
              </h3>
              {materia.requiereCursadas.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] text-text-tertiary mb-2">Tener cursadas</p>
                  <ul className="space-y-1.5">
                    {materia.requiereCursadas.map((reqId) => {
                      const req = materiasMap.get(reqId)
                      if (!req) return null
                      const reqEstado = getEstado(reqId)
                      const cumple = reqEstado === 'cursando' || reqEstado === 'regularizada' || reqEstado === 'aprobada'
                      return (
                        <li key={reqId} className="flex items-center gap-2 text-sm">
                          <span className={cumple ? 'text-estado-aprobada' : 'text-text-tertiary'}>
                            {cumple ? '✓' : '○'}
                          </span>
                          <span className={cumple ? 'text-text-primary' : 'text-text-secondary'}>
                            {req.nombreCorto}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {materia.requiereAprobadas.length > 0 && (
                <div>
                  <p className="text-[11px] text-text-tertiary mb-2">Tener aprobadas</p>
                  <ul className="space-y-1.5">
                    {materia.requiereAprobadas.map((reqId) => {
                      const req = materiasMap.get(reqId)
                      if (!req) return null
                      const cumple = getEstado(reqId) === 'aprobada'
                      return (
                        <li key={reqId} className="flex items-center gap-2 text-sm">
                          <span className={cumple ? 'text-estado-aprobada' : 'text-text-tertiary'}>
                            {cumple ? '✓' : '○'}
                          </span>
                          <span className={cumple ? 'text-text-primary' : 'text-text-secondary'}>
                            {req.nombreCorto}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {habilita.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3">
                Habilita ({habilita.length} materias)
              </h3>
              <ul className="space-y-1.5">
                {habilita.map((m) => (
                  <li key={m.id} className="text-sm text-text-secondary">
                    <span className="text-text-tertiary mr-2">→</span>
                    {m.nombreCorto}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Panels/SubjectDetail.tsx
git commit -m "refactor: redesign SubjectDetail with elegant styling"
```

---

### Task 8: Redesign SimulationBanner

**Files:**
- Modify: `src/components/Panels/SimulationBanner.tsx` (full rewrite)

**Step 1: Rewrite SimulationBanner**

Replace entire `src/components/Panels/SimulationBanner.tsx`:

```tsx
import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasMap } from '../../data/materias'

export function SimulationBanner() {
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)
  const limpiarSimulacion = useCarreraStore((s) => s.limpiarSimulacion)
  const aplicarSimulacion = useCarreraStore((s) => s.aplicarSimulacion)

  const simulatedNames = Object.keys(estadosSimulados)
    .map((id) => materiasMap.get(id)?.nombreCorto)
    .filter(Boolean)

  return (
    <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-6 py-3 flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-amber-800">Modo Simulación</span>
        <span className="text-xs text-amber-600 ml-2">
          Explorando posibilidades — los cambios no se guardan.
        </span>
        {simulatedNames.length > 0 && (
          <p className="text-xs text-amber-700 mt-1">
            Simulando: {simulatedNames.join(', ')}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={aplicarSimulacion}
          className="px-3 py-1.5 text-xs bg-estado-aprobada text-white rounded-sm hover:opacity-90 transition-opacity font-medium"
        >
          Aplicar cambios
        </button>
        <button
          onClick={limpiarSimulacion}
          className="px-3 py-1.5 text-xs border border-amber-300 text-amber-700 rounded-sm hover:bg-amber-100 transition-colors font-medium"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Panels/SimulationBanner.tsx
git commit -m "refactor: redesign SimulationBanner with subtle amber style"
```

---

### Task 9: Rewrite AppShell & Final Integration

**Files:**
- Modify: `src/components/Layout/AppShell.tsx` (full rewrite)
- Delete: `src/components/Layout/Sidebar.tsx`
- Delete: `src/components/Map/LevelColumn.tsx`
- Delete: `src/components/Map/ElectivesSection.tsx`
- Delete: `src/components/Map/ConnectionLines.tsx`
- Delete: `src/components/UI/ProgressRing.tsx`
- Delete: `src/components/UI/SearchBar.tsx`
- Delete: `src/utils/graphLayout.ts`
- Delete: `src/utils/criticalPath.ts`

**Step 1: Rewrite AppShell**

Replace entire `src/components/Layout/AppShell.tsx`:

```tsx
import { TopBar } from './TopBar'
import { MapArea } from './MapArea'

export function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-background bg-grid">
      <TopBar />
      <MapArea />
    </div>
  )
}
```

**Step 2: Delete unused files**

```bash
rm src/components/Layout/Sidebar.tsx
rm src/components/Map/LevelColumn.tsx
rm src/components/Map/ElectivesSection.tsx
rm src/components/Map/ConnectionLines.tsx
rm src/components/UI/ProgressRing.tsx
rm src/components/UI/SearchBar.tsx
rm src/utils/graphLayout.ts
rm src/utils/criticalPath.ts
```

**Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

Run: `npx vite build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: complete elegant UI redesign — integrate TopBar, horizontal scroll, cleanup old components"
```

---

### Task 10: Visual Polish & Scrollbar Fixes

**Files:**
- Modify: `src/index.css` (add scrollbar-hide utility)
- Modify: `src/components/Map/LevelView.tsx` (ensure each page takes full width)

**Step 1: Add scrollbar-hide to CSS**

Add to bottom of `src/index.css`:

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

**Step 2: Ensure LevelView pages take exactly viewport width**

In `src/components/Map/LevelView.tsx`, update the root div:

Change the className of the root div from `"w-full shrink-0 snap-center px-8 py-6 overflow-y-auto"` to:

```
"min-w-full w-full shrink-0 snap-center px-8 py-6 overflow-y-auto"
```

Do the same in `src/components/Map/ElectivesView.tsx`.

**Step 3: Verify in dev mode**

Run: `npx vite --open`
Expected: App opens with elegant UI, horizontal scrolling between levels works

**Step 4: Commit**

```bash
git add src/index.css src/components/Map/LevelView.tsx src/components/Map/ElectivesView.tsx
git commit -m "polish: scrollbar hide + ensure full-width level pages"
```

---

### Task 11: Final Build Verification

**Step 1: Run full build**

```bash
npx tsc -b && npx vite build
```

Expected: Clean build with no errors.

**Step 2: Run lint**

```bash
npx eslint . 2>&1 | head -30
```

Expected: No critical errors (warnings are OK).
