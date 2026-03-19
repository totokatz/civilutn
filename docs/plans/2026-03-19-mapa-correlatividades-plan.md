# Mapa de Correlatividades Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully interactive career map for Civil Engineering students at UTN (Plan 2023) where they can track subject progress, visualize prerequisites as a flow graph, and simulate future scenarios.

**Architecture:** Vite SPA with React 18 + TypeScript. Zustand for state with localStorage persistence. Tailwind CSS for styling with the Simple Design System tokens. SVG overlay for bezier prerequisite connection lines. 6-column grid layout for levels.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS v3, Zustand, Vercel

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `vercel.json`

**Step 1: Scaffold Vite project**

```bash
cd C:\Users\totot\Documents\Proyectos\IngenieriaCivil-Plan
npm create vite@latest . -- --template react-ts
```

If it asks about existing files, proceed (overwrite is fine, we only have docs/).

**Step 2: Install dependencies**

```bash
npm install zustand @fontsource-variable/inter @fontsource-variable/jetbrains-mono
npm install -D tailwindcss @tailwindcss/vite
```

**Step 3: Configure Tailwind**

Replace `src/index.css` with:

```css
@import "tailwindcss";
@import "@fontsource-variable/inter";
@import "@fontsource-variable/jetbrains-mono";

@theme {
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, monospace;

  --color-primary: #3B82F6;
  --color-primary-light: #93C5FD;
  --color-primary-dark: #1D4ED8;
  --color-secondary: #8B5CF6;

  --color-success: #16A34A;
  --color-success-light: #86EFAC;
  --color-success-dark: #15803D;

  --color-warning: #D97706;
  --color-warning-light: #FDE68A;
  --color-warning-dark: #B45309;

  --color-danger: #DC2626;
  --color-danger-light: #FCA5A5;
  --color-danger-dark: #B91C1C;

  --color-surface: #FFFFFF;
  --color-surface-dark: #16213e;
  --color-background-dark: #1a1a2e;
  --color-text: #111827;
  --color-text-secondary: #6B7280;
  --color-text-dark: #F9FAFB;

  --color-estado-aprobada: #10B981;
  --color-estado-aprobada-bg: #D1FAE5;
  --color-estado-aprobada-border: #059669;
  --color-estado-regularizada: #F59E0B;
  --color-estado-regularizada-bg: #FEF3C7;
  --color-estado-regularizada-border: #D97706;
  --color-estado-cursando: #3B82F6;
  --color-estado-cursando-bg: #DBEAFE;
  --color-estado-cursando-border: #1D4ED8;
  --color-estado-disponible-border: #16A34A;
  --color-estado-bloqueada: #9CA3AF;
  --color-estado-bloqueada-bg: #F3F4F6;
  --color-estado-casi: #FED7AA;
  --color-estado-casi-border: #F97316;
}

@layer base {
  html {
    font-family: var(--font-sans);
    color: var(--color-text);
  }
}
```

**Step 4: Configure Vite**

Replace `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Step 5: Create vercel.json**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Step 6: Create minimal App**

Replace `src/App.tsx`:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <h1 className="text-2xl font-bold p-8 text-text">Mapa de Correlatividades</h1>
    </div>
  )
}

export default App
```

**Step 7: Verify it runs**

```bash
npm run dev
```

Expected: App running on localhost with "Mapa de Correlatividades" heading, Inter font, gray background.

**Step 8: Init git and commit**

```bash
git init
```

Create `.gitignore`:
```
node_modules
dist
.DS_Store
*.local
```

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind project"
```

---

## Task 2: Types and Data Layer

**Files:**
- Create: `src/types/materia.ts`
- Create: `src/data/materias.ts`

**Step 1: Define types**

Create `src/types/materia.ts`:

```typescript
export type EstadoMateria = 'pendiente' | 'cursando' | 'regularizada' | 'aprobada'

export type Disponibilidad = 'disponible' | 'bloqueada' | 'casiDisponible'

export type TipoMateria = 'A' | 'C'  // Anual | Cuatrimestral

export type PerfilElectiva = 'ambiental' | 'construcciones' | 'vias' | 'hidraulica'

export interface Materia {
  id: string                    // unique key, e.g. "am1"
  codigo: string                // UTN code, e.g. "95-0702"
  nombre: string
  nombreCorto: string           // abbreviated for card display
  nivel: number                 // 1-6 (6 = quinto nivel/electivas)
  horas: number                 // weekly class hours
  tipo: TipoMateria
  requiereCursadas: string[]    // IDs of subjects that must be cursada/regularizada/aprobada
  requiereAprobadas: string[]   // IDs of subjects that must be aprobada
  esElectiva?: boolean
  perfilElectiva?: PerfilElectiva[]  // can belong to multiple profiles
  esProyectoFinal?: boolean
  esPPS?: boolean
}

export interface MateriaConEstado extends Materia {
  estado: EstadoMateria
  disponibilidad: Disponibilidad
  requisitosCompletados: number
  requisitosTotales: number
}
```

**Step 2: Create data file with ALL subjects**

Create `src/data/materias.ts` with the complete dataset. Use short IDs for easy reference. Every subject from the PROMPT-VISUAL.md spec must be included:

```typescript
import { type Materia } from '../types/materia'

export const materias: Materia[] = [
  // === PRIMER NIVEL ===
  {
    id: 'am1', codigo: '95-0702', nombre: 'Análisis Matemático I',
    nombreCorto: 'Análisis Mat. I', nivel: 1, horas: 5, tipo: 'A',
    requiereCursadas: [], requiereAprobadas: [],
  },
  {
    id: 'aga', codigo: '95-0701', nombre: 'Álgebra y Geometría Analítica',
    nombreCorto: 'Álgebra y Geom.', nivel: 1, horas: 5, tipo: 'A',
    requiereCursadas: [], requiereAprobadas: [],
  },
  {
    id: 'iys', codigo: '95-1604', nombre: 'Ingeniería y Sociedad',
    nombreCorto: 'Ing. y Sociedad', nivel: 1, horas: 2, tipo: 'A',
    requiereCursadas: [], requiereAprobadas: [],
  },
  {
    id: 'ic1', codigo: '95-0220', nombre: 'Ingeniería Civil I',
    nombreCorto: 'Ing. Civil I', nivel: 1, horas: 3, tipo: 'A',
    requiereCursadas: [], requiereAprobadas: [],
  },
  {
    id: 'sr', codigo: '95-1601', nombre: 'Sistemas de Representación',
    nombreCorto: 'Sist. Represent.', nivel: 1, horas: 3, tipo: 'A',
    requiereCursadas: [], requiereAprobadas: [],
  },
  {
    id: 'qg', codigo: '95-1407', nombre: 'Química General',
    nombreCorto: 'Química Gral.', nivel: 1, horas: 5, tipo: 'A',
    requiereCursadas: [], requiereAprobadas: [],
  },
  {
    id: 'f1', codigo: '95-0605', nombre: 'Física I',
    nombreCorto: 'Física I', nivel: 1, horas: 5, tipo: 'A',
    requiereCursadas: [], requiereAprobadas: [],
  },
  {
    id: 'fi', codigo: '95-0299', nombre: 'Fundamentos de Informática',
    nombreCorto: 'Fund. Informát.', nivel: 1, horas: 2, tipo: 'A',
    requiereCursadas: [], requiereAprobadas: [],
  },

  // === SEGUNDO NIVEL ===
  {
    id: 'am2', codigo: '95-0703', nombre: 'Análisis Matemático II',
    nombreCorto: 'Análisis Mat. II', nivel: 2, horas: 5, tipo: 'A',
    requiereCursadas: ['am1', 'aga'], requiereAprobadas: [],
  },
  {
    id: 'pye', codigo: '95-0704', nombre: 'Probabilidad y Estadística',
    nombreCorto: 'Prob. y Estad.', nivel: 2, horas: 3, tipo: 'A',
    requiereCursadas: ['am1', 'aga'], requiereAprobadas: [],
  },
  {
    id: 'f2', codigo: '95-0606', nombre: 'Física II',
    nombreCorto: 'Física II', nivel: 2, horas: 5, tipo: 'A',
    requiereCursadas: ['am1', 'f1', 'fi'], requiereAprobadas: [],
  },
  {
    id: 'tm', codigo: '95-0297', nombre: 'Tecnología de los Materiales',
    nombreCorto: 'Tec. Materiales', nivel: 2, horas: 5, tipo: 'A',
    requiereCursadas: ['iys', 'ic1', 'sr', 'fi', 'qg', 'f1'], requiereAprobadas: [],
  },
  {
    id: 'ic2', codigo: '95-0222', nombre: 'Ingeniería Civil II (E.I.)',
    nombreCorto: 'Ing. Civil II', nivel: 2, horas: 3, tipo: 'A',
    requiereCursadas: ['am1', 'sr', 'qg', 'f1'], requiereAprobadas: [],
  },
  {
    id: 'est', codigo: '95-0221', nombre: 'Estabilidad',
    nombreCorto: 'Estabilidad', nivel: 2, horas: 5, tipo: 'A',
    requiereCursadas: ['am1', 'aga', 'sr', 'f1', 'fi'], requiereAprobadas: [],
  },
  {
    id: 'ing1', codigo: '95-0225', nombre: 'Inglés I',
    nombreCorto: 'Inglés I', nivel: 2, horas: 4, tipo: 'C',
    requiereCursadas: ['iys'], requiereAprobadas: [],
  },
  {
    id: 'ing2', codigo: '95-1603', nombre: 'Inglés II',
    nombreCorto: 'Inglés II', nivel: 2, horas: 4, tipo: 'C',
    requiereCursadas: ['iys', 'ic1'], requiereAprobadas: ['ing1'],
  },

  // === TERCER NIVEL ===
  {
    id: 'rm', codigo: '95-0294', nombre: 'Resistencia de Materiales',
    nombreCorto: 'Resist. Mater.', nivel: 3, horas: 6, tipo: 'A',
    requiereCursadas: ['est', 'am2', 'ic2', 'f2', 'pye'],
    requiereAprobadas: ['am1', 'aga', 'sr', 'f1', 'fi'],
  },
  {
    id: 'th', codigo: '95-0296', nombre: 'Tecnología del Hormigón',
    nombreCorto: 'Tec. Hormigón', nivel: 3, horas: 4, tipo: 'A',
    requiereCursadas: ['ic2', 'tm', 'f2'],
    requiereAprobadas: ['am1', 'aga', 'ic1', 'sr', 'qg', 'f1'],
  },
  {
    id: 'tc', codigo: '95-0224', nombre: 'Tecnología de la Construcción',
    nombreCorto: 'Tec. Construcc.', nivel: 3, horas: 5, tipo: 'A',
    requiereCursadas: ['ic2', 'tm', 'f2'],
    requiereAprobadas: ['am1', 'aga', 'ic1', 'sr', 'qg', 'f1'],
  },
  {
    id: 'geo', codigo: '95-0244', nombre: 'Geotopografía',
    nombreCorto: 'Geotopografía', nivel: 3, horas: 4, tipo: 'A',
    requiereCursadas: ['ic2', 'pye', 'ing1'],
    requiereAprobadas: ['am1', 'aga', 'iys', 'ic1', 'fi'],
  },
  {
    id: 'hga', codigo: '95-0227', nombre: 'Hidráulica General y Aplicada',
    nombreCorto: 'Hidráulica Gral.', nivel: 3, horas: 5, tipo: 'A',
    requiereCursadas: ['am2', 'ic2', 'pye', 'ing1'],
    requiereAprobadas: ['am1', 'aga', 'iys', 'ic1', 'fi'],
  },
  {
    id: 'eco', codigo: '95-0228', nombre: 'Economía',
    nombreCorto: 'Economía', nivel: 3, horas: 2, tipo: 'A',
    requiereCursadas: ['tm', 'pye', 'ing1'],
    requiereAprobadas: ['am1', 'aga', 'iys', 'ic1', 'fi'],
  },
  {
    id: 'iea', codigo: '95-0309', nombre: 'Instalaciones Eléctricas y Acústicas',
    nombreCorto: 'Inst. Eléc/Acús.', nivel: 3, horas: 2, tipo: 'A',
    requiereCursadas: ['est', 'tm', 'pye', 'ing1', 'am2', 'ic2', 'f2'],
    requiereAprobadas: ['am1', 'aga', 'sr', 'f1', 'fi'],
  },
  {
    id: 'itm', codigo: '95-0298', nombre: 'Instalaciones Termomecánicas',
    nombreCorto: 'Inst. Termomec.', nivel: 3, horas: 3, tipo: 'A',
    requiereCursadas: ['est', 'tm', 'pye', 'ing1', 'am2', 'ic2', 'f2'],
    requiereAprobadas: ['am1', 'aga', 'sr', 'f1', 'fi'],
  },
  {
    id: 'il', codigo: '95-0225', nombre: 'Ingeniería Legal',
    nombreCorto: 'Ing. Legal', nivel: 3, horas: 3, tipo: 'A',
    requiereCursadas: ['am2', 'ic2', 'pye', 'ing1'],
    requiereAprobadas: ['am1', 'aga', 'iys', 'ic1', 'fi'],
  },

  // === CUARTO NIVEL ===
  {
    id: 'vc1', codigo: '95-0287', nombre: 'Vías de Comunicación I',
    nombreCorto: 'Vías Com. I', nivel: 4, horas: 4, tipo: 'A',
    requiereCursadas: ['rm', 'th', 'tc', 'geo', 'hga', 'eco', 'ing2'],
    requiereAprobadas: ['am2', 'est', 'ic2', 'tm', 'f2', 'pye'],
  },
  {
    id: 'ca', codigo: '95-0293', nombre: 'Cálculo Avanzado',
    nombreCorto: 'Cálculo Avanz.', nivel: 4, horas: 5, tipo: 'A',
    requiereCursadas: ['am2', 'est', 'tm', 'pye'],
    requiereAprobadas: ['am1', 'aga', 'sr', 'f1', 'fi'],
  },
  {
    id: 'gt', codigo: '95-0247', nombre: 'Geotecnia',
    nombreCorto: 'Geotecnia', nivel: 4, horas: 5, tipo: 'A',
    requiereCursadas: ['rm', 'th', 'tc', 'geo', 'hga'],
    requiereAprobadas: ['am2', 'est', 'ic2', 'tm', 'f2', 'pye'],
  },
  {
    id: 'isg', codigo: '95-0230', nombre: 'Instalaciones Sanitarias y de Gas',
    nombreCorto: 'Inst. Sanit/Gas', nivel: 4, horas: 3, tipo: 'A',
    requiereCursadas: ['tc', 'geo', 'hga', 'eco'],
    requiereAprobadas: ['tm', 'sr', 'qg', 'f1', 'fi'],
  },
  {
    id: 'dapu', codigo: '95-0290', nombre: 'Diseño Arquitectónico, Planeamiento y Urbanismo (E.I.)',
    nombreCorto: 'Diseño Arq./Urb.', nivel: 4, horas: 5, tipo: 'A',
    requiereCursadas: ['tc', 'geo', 'iea', 'itm', 'eco', 'ing2'],
    requiereAprobadas: ['est', 'ic2', 'tm', 'ing1'],
  },
  {
    id: 'ae1', codigo: '95-0229', nombre: 'Análisis Estructural I',
    nombreCorto: 'Anál. Estruc. I', nivel: 4, horas: 5, tipo: 'A',
    requiereCursadas: ['rm', 'th', 'tc', 'geo', 'ing2'],
    requiereAprobadas: ['am2', 'est', 'ic2', 'tm', 'f2', 'pye'],
  },
  {
    id: 'eh', codigo: '95-0226', nombre: 'Estructuras de Hormigón',
    nombreCorto: 'Estruc. Hormigón', nivel: 4, horas: 5, tipo: 'A',
    requiereCursadas: ['rm', 'th', 'tc', 'geo'],
    requiereAprobadas: ['am2', 'est', 'ic2', 'tm', 'pye', 'ing1'],
  },
  {
    id: 'hoh', codigo: '95-0295', nombre: 'Hidrología y Obras Hidráulicas',
    nombreCorto: 'Hidrol. y Obras', nivel: 4, horas: 2, tipo: 'A',
    requiereCursadas: ['th', 'tc', 'geo'],
    requiereAprobadas: ['am2', 'est', 'ic2', 'tm', 'pye', 'ing1'],
  },

  // === QUINTO NIVEL ===
  {
    id: 'cmm', codigo: '95-0231', nombre: 'Construcciones Metálicas y de Madera',
    nombreCorto: 'Const. Met/Mad.', nivel: 5, horas: 5, tipo: 'A',
    requiereCursadas: ['ca', 'ae1'],
    requiereAprobadas: ['rm', 'th', 'tc', 'geo'],
  },
  {
    id: 'cim', codigo: '95-0234', nombre: 'Cimentaciones',
    nombreCorto: 'Cimentaciones', nivel: 5, horas: 4, tipo: 'A',
    requiereCursadas: ['ca', 'gt', 'ae1', 'eh', 'hoh'],
    requiereAprobadas: ['rm', 'th', 'tc', 'geo', 'hga'],
  },
  {
    id: 'is', codigo: '95-0291', nombre: 'Ingeniería Sanitaria',
    nombreCorto: 'Ing. Sanitaria', nivel: 5, horas: 3, tipo: 'A',
    requiereCursadas: ['gt', 'isg', 'hoh', 'ing2'],
    requiereAprobadas: ['th', 'tc', 'geo', 'hga'],
  },
  {
    id: 'ae2', codigo: '95-0292', nombre: 'Análisis Estructural II',
    nombreCorto: 'Anál. Estruc. II', nivel: 5, horas: 5, tipo: 'A',
    requiereCursadas: ['ca', 'gt', 'ae1', 'eh', 'hoh', 'ing2'],
    requiereAprobadas: ['rm', 'th', 'tc', 'geo', 'hga'],
  },
  {
    id: 'oco', codigo: '95-0289', nombre: 'Organización y Conducción de Obras',
    nombreCorto: 'Org. y Cond. Obras', nivel: 5, horas: 5, tipo: 'A',
    requiereCursadas: ['gt', 'eh', 'hoh', 'il', 'vc1'],
    requiereAprobadas: ['rm', 'th', 'tc', 'geo', 'hga', 'eco'],
  },
  {
    id: 'vc2', codigo: '95-0235', nombre: 'Vías de Comunicación II',
    nombreCorto: 'Vías Com. II', nivel: 5, horas: 3, tipo: 'A',
    requiereCursadas: ['gt', 'dapu', 'hoh', 'il'],
    requiereAprobadas: ['hga', 'eco', 'ing2'],
  },
  {
    id: 'gads', codigo: '95-0288', nombre: 'Gestión Ambiental y Desarrollo Sustentable',
    nombreCorto: 'Gestión Ambient.', nivel: 5, horas: 3, tipo: 'A',
    requiereCursadas: ['gt', 'isg', 'dapu', 'ae1', 'eh', 'hoh', 'il', 'iea', 'itm', 'eco', 'ing2'],
    requiereAprobadas: ['ing1', 'rm', 'th', 'tc', 'geo', 'hga'],
  },
  {
    id: 'pf', codigo: '95-0289', nombre: 'Proyecto Final (E.I.)',
    nombreCorto: 'Proyecto Final', nivel: 5, horas: 2, tipo: 'A',
    requiereCursadas: ['gt', 'isg', 'dapu', 'ae1', 'eh', 'hoh', 'il', 'iea', 'itm', 'eco', 'ing2'],
    requiereAprobadas: ['ing1', 'rm', 'th', 'tc', 'geo', 'hga'],
    esProyectoFinal: true,
  },

  // === ELECTIVAS - PERFIL AMBIENTAL ===
  {
    id: 'e_pus', codigo: '95-0280', nombre: 'Planificación Urbana Sustentable',
    nombreCorto: 'Plan. Urbana Sust.', nivel: 6, horas: 3, tipo: 'A',
    requiereCursadas: ['dapu', 'eh'],
    requiereAprobadas: ['tc', 'th', 'rm'],
    esElectiva: true, perfilElectiva: ['ambiental', 'construcciones'],
  },
  {
    id: 'e_er', codigo: '95-0272', nombre: 'Energías Renovables',
    nombreCorto: 'Energías Renov.', nivel: 6, horas: 4, tipo: 'A',
    requiereCursadas: ['dapu', 'am2'],
    requiereAprobadas: ['itm'],
    esElectiva: true, perfilElectiva: ['ambiental'],
  },
  {
    id: 'e_csa', codigo: '95-0271', nombre: 'Contaminación y Saneamiento Ambiental',
    nombreCorto: 'Contam. y Sanea.', nivel: 6, horas: 4, tipo: 'C',
    requiereCursadas: ['isg', 'il'],
    requiereAprobadas: ['hoh', 'hga', 'gt'],
    esElectiva: true, perfilElectiva: ['ambiental'],
  },
  {
    id: 'e_gca', codigo: '--', nombre: 'Gestión y Calidad del Agua',
    nombreCorto: 'Gest. Calidad Agua', nivel: 6, horas: 4, tipo: 'C',
    requiereCursadas: ['hoh', 'il'],
    requiereAprobadas: ['hga', 'gt'],
    esElectiva: true, perfilElectiva: ['ambiental'],
  },

  // === ELECTIVAS - PERFIL CONSTRUCCIONES ===
  {
    id: 'e_pref', codigo: '95-0249', nombre: 'Prefabricación',
    nombreCorto: 'Prefabricación', nivel: 6, horas: 2, tipo: 'A',
    requiereCursadas: ['th', 'tc', 'eh'],
    requiereAprobadas: ['ae1'],
    esElectiva: true, perfilElectiva: ['construcciones'],
  },
  {
    id: 'e_ee', codigo: '95-0284', nombre: 'Estructuras Especiales',
    nombreCorto: 'Estruc. Especiales', nivel: 6, horas: 6, tipo: 'C',
    requiereCursadas: ['ae2', 'eh'],
    requiereAprobadas: ['ae1'],
    esElectiva: true, perfilElectiva: ['construcciones'],
  },
  {
    id: 'e_tgp', codigo: '95-0281', nombre: 'Túneles y Grandes Puentes',
    nombreCorto: 'Túneles y Puentes', nivel: 6, horas: 6, tipo: 'C',
    requiereCursadas: ['vc1', 'ae2', 'cim', 'hga', 'tc'],
    requiereAprobadas: ['th', 'gt'],
    esElectiva: true, perfilElectiva: ['construcciones'],
  },
  {
    id: 'e_eas', codigo: '--', nombre: 'Estructuras Antisísmicas',
    nombreCorto: 'Estruc. Antisísm.', nivel: 6, horas: 3, tipo: 'A',
    requiereCursadas: ['ae2', 'eh'],
    requiereAprobadas: ['ae1'],
    esElectiva: true, perfilElectiva: ['construcciones'],
  },

  // === ELECTIVAS - PERFIL VÍAS DE COMUNICACIÓN ===
  {
    id: 'e_ga', codigo: '95-0276', nombre: 'Geología Aplicada',
    nombreCorto: 'Geología Aplic.', nivel: 6, horas: 3, tipo: 'A',
    requiereCursadas: ['gt', 'eh', 'hga'],
    requiereAprobadas: [],
    esElectiva: true, perfilElectiva: ['vias', 'hidraulica'],
  },
  {
    id: 'e_pvn', codigo: '95-0258', nombre: 'Puertos y Vías Navegables',
    nombreCorto: 'Puertos y Vías Nav.', nivel: 6, horas: 3, tipo: 'A',
    requiereCursadas: ['hga', 'geo', 'gt', 'eh'],
    requiereAprobadas: [],
    esElectiva: true, perfilElectiva: ['vias', 'hidraulica'],
  },
  {
    id: 'e_fc', codigo: '95-0256', nombre: 'Ferrocarriles',
    nombreCorto: 'Ferrocarriles', nivel: 6, horas: 2, tipo: 'A',
    requiereCursadas: ['gt', 'vc1', 'ic2'],
    requiereAprobadas: ['rm', 'geo'],
    esElectiva: true, perfilElectiva: ['vias'],
  },
  {
    id: 'e_cc', codigo: '95-0241', nombre: 'Construcción de Carreteras',
    nombreCorto: 'Constr. Carreteras', nivel: 6, horas: 4, tipo: 'C',
    requiereCursadas: ['vc1', 'th', 'hga', 'tc', 'gt'],
    requiereAprobadas: [],
    esElectiva: true, perfilElectiva: ['vias'],
  },
  {
    id: 'e_aer', codigo: '95-0266', nombre: 'Aeropuertos',
    nombreCorto: 'Aeropuertos', nivel: 6, horas: 4, tipo: 'C',
    requiereCursadas: ['vc1', 'hga', 'tc', 'gt'],
    requiereAprobadas: [],
    esElectiva: true, perfilElectiva: ['vias'],
  },

  // === ELECTIVAS - PERFIL HIDRÁULICA ===
  {
    id: 'e_pch', codigo: '95-0277', nombre: 'Presas y Centrales Hidroeléctricas',
    nombreCorto: 'Presas y Centr.', nivel: 6, horas: 2, tipo: 'A',
    requiereCursadas: ['hoh', 'hga', 'gt'],
    requiereAprobadas: [],
    esElectiva: true, perfilElectiva: ['hidraulica'],
  },
  {
    id: 'e_gc', codigo: '95-0283', nombre: 'Gestión de Cuencas',
    nombreCorto: 'Gestión Cuencas', nivel: 6, horas: 8, tipo: 'C',
    requiereCursadas: ['hoh', 'hga', 'gt'],
    requiereAprobadas: [],
    esElectiva: true, perfilElectiva: ['hidraulica'],
  },
]

// Lookup maps for quick access
export const materiasMap = new Map(materias.map(m => [m.id, m]))
export const materiasPorNivel = (nivel: number) => materias.filter(m => m.nivel === nivel && !m.esElectiva)
export const materiasElectivas = materias.filter(m => m.esElectiva)
export const totalMateriasObligatorias = materias.filter(m => !m.esElectiva).length
```

**Step 3: Commit**

```bash
git add src/types/ src/data/
git commit -m "feat: add types and complete curriculum data for all 55 subjects"
```

---

## Task 3: Zustand Store with Persistence

**Files:**
- Create: `src/store/useCarreraStore.ts`

**Step 1: Create the store**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type EstadoMateria } from '../types/materia'
import { materias, materiasMap } from '../data/materias'

type Disponibilidad = 'disponible' | 'bloqueada' | 'casiDisponible'

interface CarreraStore {
  estados: Record<string, EstadoMateria>
  modoSimulacion: boolean
  estadosSimulados: Record<string, EstadoMateria>
  hoveredMateria: string | null
  selectedMateria: string | null
  searchQuery: string
  darkMode: boolean
  showCriticalPath: boolean

  // Actions
  setEstado: (id: string, estado: EstadoMateria) => void
  cycleEstado: (id: string) => void
  setHovered: (id: string | null) => void
  setSelected: (id: string | null) => void
  setSearchQuery: (query: string) => void
  toggleDarkMode: () => void
  toggleSimulacion: () => void
  simularEstado: (id: string, estado: EstadoMateria) => void
  aplicarSimulacion: () => void
  limpiarSimulacion: () => void
  toggleCriticalPath: () => void
  exportState: () => string
  importState: (json: string) => void
  resetAll: () => void

  // Derived (computed on access)
  getEstadoEfectivo: (id: string) => EstadoMateria
  getDisponibilidad: (id: string) => Disponibilidad
  getRequisitosCompletados: (id: string) => { completados: number; total: number }
}

const estadoCycle: EstadoMateria[] = ['pendiente', 'cursando', 'regularizada', 'aprobada']

function cumpleCursada(estado: EstadoMateria): boolean {
  return estado === 'cursando' || estado === 'regularizada' || estado === 'aprobada'
}

function cumpleAprobada(estado: EstadoMateria): boolean {
  return estado === 'aprobada'
}

const defaultEstados: Record<string, EstadoMateria> = Object.fromEntries(
  materias.map(m => [m.id, 'pendiente' as EstadoMateria])
)

export const useCarreraStore = create<CarreraStore>()(
  persist(
    (set, get) => ({
      estados: { ...defaultEstados },
      modoSimulacion: false,
      estadosSimulados: {},
      hoveredMateria: null,
      selectedMateria: null,
      searchQuery: '',
      darkMode: false,
      showCriticalPath: false,

      setEstado: (id, estado) =>
        set((s) => ({ estados: { ...s.estados, [id]: estado } })),

      cycleEstado: (id) =>
        set((s) => {
          if (s.modoSimulacion) {
            const current = s.estadosSimulados[id] ?? s.estados[id] ?? 'pendiente'
            const next = estadoCycle[(estadoCycle.indexOf(current) + 1) % estadoCycle.length]
            return { estadosSimulados: { ...s.estadosSimulados, [id]: next } }
          }
          const current = s.estados[id] ?? 'pendiente'
          const next = estadoCycle[(estadoCycle.indexOf(current) + 1) % estadoCycle.length]
          return { estados: { ...s.estados, [id]: next } }
        }),

      setHovered: (id) => set({ hoveredMateria: id }),
      setSelected: (id) => set({ selectedMateria: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleCriticalPath: () => set((s) => ({ showCriticalPath: !s.showCriticalPath })),

      toggleSimulacion: () =>
        set((s) => ({
          modoSimulacion: !s.modoSimulacion,
          estadosSimulados: !s.modoSimulacion ? {} : s.estadosSimulados,
        })),

      simularEstado: (id, estado) =>
        set((s) => ({
          estadosSimulados: { ...s.estadosSimulados, [id]: estado },
        })),

      aplicarSimulacion: () =>
        set((s) => ({
          estados: { ...s.estados, ...s.estadosSimulados },
          estadosSimulados: {},
          modoSimulacion: false,
        })),

      limpiarSimulacion: () => set({ estadosSimulados: {}, modoSimulacion: false }),

      exportState: () => JSON.stringify(get().estados),

      importState: (json) => {
        try {
          const parsed = JSON.parse(json)
          set({ estados: { ...defaultEstados, ...parsed } })
        } catch { /* ignore invalid JSON */ }
      },

      resetAll: () => set({ estados: { ...defaultEstados } }),

      getEstadoEfectivo: (id) => {
        const s = get()
        if (s.modoSimulacion && id in s.estadosSimulados) {
          return s.estadosSimulados[id]
        }
        return s.estados[id] ?? 'pendiente'
      },

      getDisponibilidad: (id) => {
        const s = get()
        const materia = materiasMap.get(id)
        if (!materia) return 'bloqueada'

        const estado = s.getEstadoEfectivo(id)
        if (estado !== 'pendiente') return 'disponible' // already has a state

        const totalReqs = materia.requiereCursadas.length + materia.requiereAprobadas.length
        if (totalReqs === 0) return 'disponible'

        let cumplidos = 0
        let faltantes = 0
        for (const reqId of materia.requiereCursadas) {
          if (cumpleCursada(s.getEstadoEfectivo(reqId))) cumplidos++
          else faltantes++
        }
        for (const reqId of materia.requiereAprobadas) {
          if (cumpleAprobada(s.getEstadoEfectivo(reqId))) cumplidos++
          else faltantes++
        }

        if (faltantes === 0) return 'disponible'
        if (faltantes <= 2) return 'casiDisponible'
        return 'bloqueada'
      },

      getRequisitosCompletados: (id) => {
        const s = get()
        const materia = materiasMap.get(id)
        if (!materia) return { completados: 0, total: 0 }

        const total = materia.requiereCursadas.length + materia.requiereAprobadas.length
        let completados = 0
        for (const reqId of materia.requiereCursadas) {
          if (cumpleCursada(s.getEstadoEfectivo(reqId))) completados++
        }
        for (const reqId of materia.requiereAprobadas) {
          if (cumpleAprobada(s.getEstadoEfectivo(reqId))) completados++
        }
        return { completados, total }
      },
    }),
    {
      name: 'carrera-ic-utn',
      partialize: (s) => ({ estados: s.estados, darkMode: s.darkMode }),
    }
  )
)
```

**Step 2: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand store with persistence, simulation, and derived state"
```

---

## Task 4: Layout Shell

**Files:**
- Create: `src/components/Layout/AppShell.tsx`
- Create: `src/components/Layout/Sidebar.tsx`
- Create: `src/components/Layout/MapArea.tsx`
- Modify: `src/App.tsx`

**Step 1: Create AppShell**

`src/components/Layout/AppShell.tsx`:

```tsx
import { useCarreraStore } from '../../store/useCarreraStore'
import { Sidebar } from './Sidebar'
import { MapArea } from './MapArea'

export function AppShell() {
  const darkMode = useCarreraStore((s) => s.darkMode)

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-50 dark:bg-[#1a1a2e] transition-colors duration-300">
        <Sidebar />
        <MapArea />
      </div>
    </div>
  )
}
```

**Step 2: Create Sidebar placeholder**

`src/components/Layout/Sidebar.tsx`:

```tsx
import { useCarreraStore } from '../../store/useCarreraStore'
import { materias } from '../../data/materias'
import { ProgressRing } from '../UI/ProgressRing'
import { SearchBar } from '../UI/SearchBar'

export function Sidebar() {
  const estados = useCarreraStore((s) => s.estados)
  const darkMode = useCarreraStore((s) => s.darkMode)
  const toggleDarkMode = useCarreraStore((s) => s.toggleDarkMode)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const toggleSimulacion = useCarreraStore((s) => s.toggleSimulacion)
  const aplicarSimulacion = useCarreraStore((s) => s.aplicarSimulacion)
  const limpiarSimulacion = useCarreraStore((s) => s.limpiarSimulacion)
  const showCriticalPath = useCarreraStore((s) => s.showCriticalPath)
  const toggleCriticalPath = useCarreraStore((s) => s.toggleCriticalPath)
  const exportState = useCarreraStore((s) => s.exportState)
  const importState = useCarreraStore((s) => s.importState)
  const resetAll = useCarreraStore((s) => s.resetAll)

  const obligatorias = materias.filter((m) => !m.esElectiva)
  const total = obligatorias.length
  const aprobadas = obligatorias.filter((m) => estados[m.id] === 'aprobada').length
  const regularizadas = obligatorias.filter(
    (m) => estados[m.id] === 'regularizada' || estados[m.id] === 'aprobada'
  ).length
  const cursando = obligatorias.filter((m) => estados[m.id] === 'cursando').length
  const horasAcumuladas = obligatorias
    .filter((m) => estados[m.id] === 'aprobada')
    .reduce((sum, m) => sum + m.horas, 0)

  const porcentaje = Math.round((aprobadas / total) * 100)

  const handleExport = () => {
    const json = exportState()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mi-carrera-ic-utn.json'
    a.click()
    URL.revokeObjectURL(url)
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
  }

  return (
    <aside className="w-[300px] shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16213e] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-bold text-text dark:text-text-dark">
          Ingeniería Civil
        </h1>
        <p className="text-xs text-text-secondary dark:text-gray-400">UTN — Plan 2023</p>
      </div>

      {/* Search */}
      <div className="p-4">
        <SearchBar />
      </div>

      {/* Progress rings */}
      <div className="flex justify-around px-4 pb-4">
        <ProgressRing value={aprobadas} max={total} label="Aprobadas" color="#10B981" />
        <ProgressRing value={regularizadas} max={total} label="Regulares" color="#F59E0B" />
        <ProgressRing value={cursando} max={total} label="Cursando" color="#3B82F6" />
      </div>

      {/* Stats */}
      <div className="px-4 pb-4 space-y-2 text-sm dark:text-gray-300">
        <div className="flex justify-between">
          <span>Avance</span>
          <span className="font-semibold">{porcentaje}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div
            className="bg-estado-aprobada h-2 rounded-full transition-all duration-500"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-secondary dark:text-gray-400">
          <span>Horas acumuladas: {horasAcumuladas}hs</span>
        </div>
      </div>

      {/* Mode selector */}
      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={toggleSimulacion}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            modoSimulacion
              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400'
              : 'bg-gray-100 dark:bg-gray-700 text-text dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {modoSimulacion ? '🔮 Modo Simulación ACTIVO' : '🔮 Modo "Qué pasa si..."'}
        </button>

        {modoSimulacion && (
          <div className="flex gap-2">
            <button
              onClick={aplicarSimulacion}
              className="flex-1 py-1.5 px-2 bg-success text-white text-xs rounded-lg hover:bg-success-dark"
            >
              Aplicar
            </button>
            <button
              onClick={limpiarSimulacion}
              className="flex-1 py-1.5 px-2 bg-gray-200 dark:bg-gray-600 text-xs rounded-lg hover:bg-gray-300 dark:text-gray-300"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Tools */}
      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={toggleCriticalPath}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            showCriticalPath
              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-300'
              : 'bg-gray-100 dark:bg-gray-700 text-text dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          🛤️ Camino Crítico
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Exportar
          </button>
          <button
            onClick={handleImport}
            className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Importar
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleDarkMode}
            className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
          <button
            onClick={resetAll}
            className="flex-1 py-1.5 text-xs bg-danger/10 text-danger rounded-lg hover:bg-danger/20"
          >
            Resetear
          </button>
        </div>
      </div>
    </aside>
  )
}
```

**Step 3: Create MapArea placeholder**

`src/components/Layout/MapArea.tsx`:

```tsx
import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasPorNivel } from '../../data/materias'
import { LevelColumn } from '../Map/LevelColumn'
import { ConnectionLines } from '../Map/ConnectionLines'
import { SimulationBanner } from '../Panels/SimulationBanner'
import { SubjectDetail } from '../Panels/SubjectDetail'
import { ElectivesSection } from '../Map/ElectivesSection'
import { useRef } from 'react'

const LEVEL_NAMES = ['1er Nivel', '2do Nivel', '3er Nivel', '4to Nivel', '5to Nivel']

export function MapArea() {
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const selectedMateria = useCarreraStore((s) => s.selectedMateria)
  const mapRef = useRef<HTMLDivElement>(null)

  return (
    <main className="flex-1 overflow-auto relative">
      {modoSimulacion && <SimulationBanner />}

      <div
        ref={mapRef}
        className={`relative p-6 min-w-[1200px] ${
          modoSimulacion ? 'ring-2 ring-amber-400/50 ring-inset' : ''
        }`}
      >
        {/* SVG overlay for connection lines */}
        <ConnectionLines containerRef={mapRef} />

        {/* Level columns grid */}
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((nivel, i) => (
            <LevelColumn
              key={nivel}
              nivel={nivel}
              nombre={LEVEL_NAMES[i]}
              materias={materiasPorNivel(nivel)}
            />
          ))}
        </div>

        {/* Electives section */}
        <ElectivesSection />
      </div>

      {/* Subject detail drawer */}
      {selectedMateria && <SubjectDetail />}
    </main>
  )
}
```

**Step 4: Update App.tsx**

```tsx
import { AppShell } from './components/Layout/AppShell'

function App() {
  return <AppShell />
}

export default App
```

**Step 5: Commit**

```bash
git add src/components/Layout/ src/App.tsx
git commit -m "feat: add layout shell with sidebar, map area, and app shell"
```

---

## Task 5: UI Components (ProgressRing, SearchBar)

**Files:**
- Create: `src/components/UI/ProgressRing.tsx`
- Create: `src/components/UI/SearchBar.tsx`

**Step 1: Create ProgressRing**

`src/components/UI/ProgressRing.tsx`:

```tsx
interface ProgressRingProps {
  value: number
  max: number
  label: string
  color: string
  size?: number
}

export function ProgressRing({ value, max, label, color, size = 64 }: ProgressRingProps) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = max > 0 ? value / max : 0
  const offset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-600"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="text-sm font-semibold dark:text-gray-200">
        {value}/{max}
      </span>
      <span className="text-[10px] text-text-secondary dark:text-gray-400">{label}</span>
    </div>
  )
}
```

**Step 2: Create SearchBar**

`src/components/UI/SearchBar.tsx`:

```tsx
import { useCarreraStore } from '../../store/useCarreraStore'

export function SearchBar() {
  const searchQuery = useCarreraStore((s) => s.searchQuery)
  const setSearchQuery = useCarreraStore((s) => s.setSearchQuery)

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Buscar materia..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-200 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/UI/
git commit -m "feat: add ProgressRing and SearchBar components"
```

---

## Task 6: SubjectCard Component

**Files:**
- Create: `src/components/Map/SubjectCard.tsx`

**Step 1: Create SubjectCard**

`src/components/Map/SubjectCard.tsx`:

```tsx
import { type Materia, type EstadoMateria } from '../../types/materia'
import { useCarreraStore } from '../../store/useCarreraStore'

interface SubjectCardProps {
  materia: Materia
}

const estadoConfig = {
  aprobada: {
    bg: 'bg-estado-aprobada-bg dark:bg-emerald-900/40',
    border: 'border-estado-aprobada-border',
    icon: '✓',
    label: 'Aprobada',
  },
  regularizada: {
    bg: 'bg-estado-regularizada-bg dark:bg-amber-900/30',
    border: 'border-estado-regularizada-border',
    icon: '◐',
    label: 'Regularizada',
  },
  cursando: {
    bg: 'bg-estado-cursando-bg dark:bg-blue-900/30',
    border: 'border-estado-cursando-border',
    icon: '▶',
    label: 'Cursando',
  },
  pendiente: {
    bg: 'bg-white dark:bg-[#16213e]',
    border: 'border-gray-300 dark:border-gray-600',
    icon: '',
    label: 'Pendiente',
  },
}

const disponibilidadOverride = {
  disponible: {
    bg: 'bg-white dark:bg-[#16213e]',
    border: 'border-dashed border-estado-disponible-border',
    icon: '🔓',
  },
  bloqueada: {
    bg: 'bg-estado-bloqueada-bg dark:bg-gray-800/60',
    border: 'border-estado-bloqueada',
    icon: '🔒',
  },
  casiDisponible: {
    bg: 'bg-estado-casi dark:bg-orange-900/30',
    border: 'border-estado-casi-border',
    icon: '⚡',
  },
}

export function SubjectCard({ materia }: SubjectCardProps) {
  const getEstadoEfectivo = useCarreraStore((s) => s.getEstadoEfectivo)
  const getDisponibilidad = useCarreraStore((s) => s.getDisponibilidad)
  const getRequisitosCompletados = useCarreraStore((s) => s.getRequisitosCompletados)
  const cycleEstado = useCarreraStore((s) => s.cycleEstado)
  const setHovered = useCarreraStore((s) => s.setHovered)
  const setSelected = useCarreraStore((s) => s.setSelected)
  const hoveredMateria = useCarreraStore((s) => s.hoveredMateria)
  const searchQuery = useCarreraStore((s) => s.searchQuery)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)

  const estado = getEstadoEfectivo(materia.id)
  const disponibilidad = getDisponibilidad(materia.id)
  const { completados, total } = getRequisitosCompletados(materia.id)

  const isPendiente = estado === 'pendiente'
  const config = isPendiente
    ? disponibilidadOverride[disponibilidad]
    : estadoConfig[estado]

  const icon = isPendiente
    ? disponibilidadOverride[disponibilidad].icon
    : estadoConfig[estado].icon

  // Search dimming
  const isSearchMatch =
    !searchQuery ||
    materia.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    materia.codigo.includes(searchQuery) ||
    materia.nombreCorto.toLowerCase().includes(searchQuery.toLowerCase())

  // Hover dimming
  const isDimmed = (hoveredMateria && hoveredMateria !== materia.id) || (!isSearchMatch && searchQuery)

  const isSimulated = modoSimulacion && materia.id in estadosSimulados

  // Height based on hours (base 80px + 8px per hour)
  const minHeight = 80 + materia.horas * 6

  return (
    <div
      data-materia-id={materia.id}
      className={`
        relative rounded-lg border-2 p-3 cursor-pointer select-none
        transition-all duration-300
        ${config.bg} ${config.border}
        ${isDimmed ? 'opacity-30' : 'opacity-100'}
        ${isSimulated ? 'ring-2 ring-amber-400 animate-pulse' : ''}
        ${materia.esProyectoFinal ? 'col-span-full' : ''}
        hover:shadow-md hover:scale-[1.02]
      `}
      style={{ minHeight }}
      onMouseEnter={() => setHovered(materia.id)}
      onMouseLeave={() => setHovered(null)}
      onClick={(e) => {
        e.stopPropagation()
        cycleEstado(materia.id)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        setSelected(materia.id)
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-1">
        <span className="font-mono text-[10px] text-text-secondary dark:text-gray-400">
          {materia.codigo}
        </span>
        <div className="flex gap-1 items-center">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 dark:text-gray-300 font-medium">
            {materia.tipo === 'A' ? 'Anual' : 'Cuatr.'}
          </span>
          <span className="text-[10px] text-text-secondary dark:text-gray-400">
            {materia.horas}hs
          </span>
        </div>
      </div>

      {/* Subject name */}
      <p className="text-xs font-semibold leading-tight dark:text-gray-200 mb-2">
        {materia.nombreCorto}
      </p>

      {/* Status icon and label */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] text-text-secondary dark:text-gray-400">
          {isPendiente ? disponibilidad === 'disponible' ? 'Disponible' : disponibilidad === 'casiDisponible' ? 'Casi disp.' : 'Bloqueada' : estadoConfig[estado].label}
        </span>
        <span className="text-sm">{icon}</span>
      </div>

      {/* Unlock progress bar for blocked subjects */}
      {isPendiente && disponibilidad !== 'disponible' && total > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${(completados / total) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-text-secondary dark:text-gray-500">
            {completados}/{total} requisitos
          </span>
        </div>
      )}

      {/* Proyecto Final special indicator */}
      {materia.esProyectoFinal && (
        <div className="mt-1 text-[9px] text-amber-600 dark:text-amber-400 font-medium">
          Para rendir: todas las demás aprobadas
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Map/SubjectCard.tsx
git commit -m "feat: add SubjectCard with state colors, cycling, search dim, and unlock meter"
```

---

## Task 7: LevelColumn and ElectivesSection

**Files:**
- Create: `src/components/Map/LevelColumn.tsx`
- Create: `src/components/Map/ElectivesSection.tsx`

**Step 1: Create LevelColumn**

`src/components/Map/LevelColumn.tsx`:

```tsx
import { type Materia } from '../../types/materia'
import { SubjectCard } from './SubjectCard'

interface LevelColumnProps {
  nivel: number
  nombre: string
  materias: Materia[]
}

export function LevelColumn({ nombre, materias }: LevelColumnProps) {
  return (
    <div className="flex flex-col">
      <h2 className="text-sm font-bold text-center py-2 mb-3 border-b border-gray-200 dark:border-gray-700 dark:text-gray-300 sticky top-0 bg-gray-50 dark:bg-[#1a1a2e] z-10">
        {nombre}
      </h2>
      <div className="flex flex-col gap-3">
        {materias.map((m) => (
          <SubjectCard key={m.id} materia={m} />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Create ElectivesSection**

`src/components/Map/ElectivesSection.tsx`:

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

export function ElectivesSection() {
  const [expanded, setExpanded] = useState(false)
  const [activePerfil, setActivePerfil] = useState<PerfilElectiva>('ambiental')

  const filteredElectivas = materiasElectivas.filter((m) =>
    m.perfilElectiva?.includes(activePerfil)
  )

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-bold text-text dark:text-gray-300 mb-3"
      >
        <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
        Electivas (11hs cátedra anuales)
      </button>

      {expanded && (
        <>
          {/* Profile tabs */}
          <div className="flex gap-1 mb-4">
            {perfiles.map((p) => (
              <button
                key={p.key}
                onClick={() => setActivePerfil(p.key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  activePerfil === p.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Electives grid */}
          <div className="grid grid-cols-4 gap-3">
            {filteredElectivas.map((m) => (
              <SubjectCard key={m.id} materia={m} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/Map/LevelColumn.tsx src/components/Map/ElectivesSection.tsx
git commit -m "feat: add LevelColumn and ElectivesSection with profile tabs"
```

---

## Task 8: SVG Connection Lines

**Files:**
- Create: `src/components/Map/ConnectionLines.tsx`
- Create: `src/utils/graphLayout.ts`

**Step 1: Create graphLayout utility**

`src/utils/graphLayout.ts`:

```typescript
export interface Point {
  x: number
  y: number
}

export function bezierPath(from: Point, to: Point): string {
  const dx = to.x - from.x
  const cp1x = from.x + dx * 0.4
  const cp2x = to.x - dx * 0.4
  return `M ${from.x} ${from.y} C ${cp1x} ${from.y}, ${cp2x} ${to.y}, ${to.x} ${to.y}`
}

export function getElementCenter(el: HTMLElement, container: HTMLElement): Point {
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return {
    x: elRect.left - containerRect.left + elRect.width / 2,
    y: elRect.top - containerRect.top + elRect.height / 2,
  }
}

export function getElementRight(el: HTMLElement, container: HTMLElement): Point {
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return {
    x: elRect.right - containerRect.left,
    y: elRect.top - containerRect.top + elRect.height / 2,
  }
}

export function getElementLeft(el: HTMLElement, container: HTMLElement): Point {
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return {
    x: elRect.left - containerRect.left,
    y: elRect.top - containerRect.top + elRect.height / 2,
  }
}
```

**Step 2: Create ConnectionLines**

`src/components/Map/ConnectionLines.tsx`:

```tsx
import { useEffect, useState, type RefObject } from 'react'
import { useCarreraStore } from '../../store/useCarreraStore'
import { materias, materiasMap } from '../../data/materias'
import { bezierPath, getElementRight, getElementLeft } from '../../utils/graphLayout'

interface Connection {
  fromId: string
  toId: string
  type: 'cursada' | 'aprobada'
  path: string
}

interface ConnectionLinesProps {
  containerRef: RefObject<HTMLDivElement | null>
}

export function ConnectionLines({ containerRef }: ConnectionLinesProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 })

  const hoveredMateria = useCarreraStore((s) => s.hoveredMateria)
  const getEstadoEfectivo = useCarreraStore((s) => s.getEstadoEfectivo)
  const estados = useCarreraStore((s) => s.estados)
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const computeConnections = () => {
      const w = container.scrollWidth
      const h = container.scrollHeight
      setDimensions({ w, h })

      const newConnections: Connection[] = []

      for (const materia of materias) {
        const toEl = container.querySelector(`[data-materia-id="${materia.id}"]`) as HTMLElement | null
        if (!toEl) continue

        for (const reqId of materia.requiereCursadas) {
          const fromEl = container.querySelector(`[data-materia-id="${reqId}"]`) as HTMLElement | null
          if (!fromEl) continue
          const from = getElementRight(fromEl, container)
          const to = getElementLeft(toEl, container)
          newConnections.push({
            fromId: reqId,
            toId: materia.id,
            type: 'cursada',
            path: bezierPath(from, to),
          })
        }

        for (const reqId of materia.requiereAprobadas) {
          const fromEl = container.querySelector(`[data-materia-id="${reqId}"]`) as HTMLElement | null
          if (!fromEl) continue
          const from = getElementRight(fromEl, container)
          const to = getElementLeft(toEl, container)
          newConnections.push({
            fromId: reqId,
            toId: materia.id,
            type: 'aprobada',
            path: bezierPath(from, to),
          })
        }
      }

      setConnections(newConnections)
    }

    // Compute after DOM settles
    const timer = setTimeout(computeConnections, 100)

    const observer = new ResizeObserver(computeConnections)
    observer.observe(container)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [containerRef, estados, estadosSimulados])

  const getLineStyle = (conn: Connection) => {
    const reqEstado = getEstadoEfectivo(conn.fromId)

    if (conn.type === 'aprobada') {
      if (reqEstado === 'aprobada') return { stroke: '#10B981', dasharray: '', opacity: 1 }
      if (reqEstado === 'regularizada' || reqEstado === 'cursando')
        return { stroke: '#F97316', dasharray: '6 4', opacity: 1 }
      return { stroke: '#DC2626', dasharray: '6 4', opacity: 1 }
    }

    // cursada requirement
    if (reqEstado === 'aprobada' || reqEstado === 'regularizada' || reqEstado === 'cursando')
      return { stroke: reqEstado === 'aprobada' ? '#10B981' : '#F59E0B', dasharray: '', opacity: 1 }

    return { stroke: '#DC2626', dasharray: '6 4', opacity: 1 }
  }

  const isConnectedToHovered = (conn: Connection) =>
    !hoveredMateria || conn.fromId === hoveredMateria || conn.toId === hoveredMateria

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      width={dimensions.w}
      height={dimensions.h}
      style={{ overflow: 'visible' }}
    >
      {connections.map((conn, i) => {
        const style = getLineStyle(conn)
        const connected = isConnectedToHovered(conn)

        return (
          <path
            key={`${conn.fromId}-${conn.toId}-${conn.type}-${i}`}
            d={conn.path}
            fill="none"
            stroke={style.stroke}
            strokeWidth={connected ? 2 : 1}
            strokeDasharray={style.dasharray}
            opacity={connected ? style.opacity : 0.08}
            className="transition-all duration-300"
          />
        )
      })}
    </svg>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/Map/ConnectionLines.tsx src/utils/graphLayout.ts
git commit -m "feat: add SVG bezier connection lines with hover highlighting"
```

---

## Task 9: Subject Detail Drawer

**Files:**
- Create: `src/components/Panels/SubjectDetail.tsx`

**Step 1: Create the drawer**

`src/components/Panels/SubjectDetail.tsx`:

```tsx
import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasMap, materias } from '../../data/materias'
import { type EstadoMateria } from '../../types/materia'

const estadoOptions: { value: EstadoMateria; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'cursando', label: 'Cursando' },
  { value: 'regularizada', label: 'Regularizada' },
  { value: 'aprobada', label: 'Aprobada' },
]

export function SubjectDetail() {
  const selectedMateria = useCarreraStore((s) => s.selectedMateria)
  const setSelected = useCarreraStore((s) => s.setSelected)
  const getEstadoEfectivo = useCarreraStore((s) => s.getEstadoEfectivo)
  const setEstado = useCarreraStore((s) => s.setEstado)

  if (!selectedMateria) return null
  const materia = materiasMap.get(selectedMateria)
  if (!materia) return null

  const estado = getEstadoEfectivo(materia.id)

  // Find subjects that this one unlocks
  const habilita = materias.filter(
    (m) => m.requiereCursadas.includes(materia.id) || m.requiereAprobadas.includes(materia.id)
  )

  // Count how many subjects would become available if this one were approved
  const impacto = habilita.length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setSelected(null)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-white dark:bg-[#16213e] shadow-2xl z-50 overflow-y-auto animate-slide-in">
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
          >
            ✕
          </button>

          {/* Header */}
          <span className="font-mono text-xs text-text-secondary dark:text-gray-400">
            {materia.codigo}
          </span>
          <h2 className="text-lg font-bold mt-1 dark:text-gray-200">{materia.nombre}</h2>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
              Nivel {materia.nivel}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
              {materia.tipo === 'A' ? 'Anual' : 'Cuatrimestral'}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
              {materia.horas}hs semanales
            </span>
          </div>

          {/* Estado selector */}
          <div className="mt-6">
            <label className="text-sm font-semibold dark:text-gray-300">Estado actual</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {estadoOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEstado(materia.id, opt.value)}
                  className={`py-2 px-3 text-xs rounded-lg font-medium transition-all ${
                    estado === opt.value
                      ? 'bg-primary text-white ring-2 ring-primary/30'
                      : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Para cursar necesitas */}
          {(materia.requiereCursadas.length > 0 || materia.requiereAprobadas.length > 0) && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold dark:text-gray-300 mb-2">
                Para cursar necesitás
              </h3>

              {materia.requiereCursadas.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wide text-text-secondary dark:text-gray-500 mb-1">
                    Tener cursadas
                  </p>
                  <ul className="space-y-1">
                    {materia.requiereCursadas.map((reqId) => {
                      const req = materiasMap.get(reqId)
                      if (!req) return null
                      const reqEstado = getEstadoEfectivo(reqId)
                      const cumple = reqEstado === 'cursando' || reqEstado === 'regularizada' || reqEstado === 'aprobada'
                      return (
                        <li key={reqId} className="flex items-center gap-2 text-xs dark:text-gray-300">
                          <span className={cumple ? 'text-success' : 'text-danger'}>
                            {cumple ? '✓' : '✗'}
                          </span>
                          {req.nombreCorto}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {materia.requiereAprobadas.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-text-secondary dark:text-gray-500 mb-1">
                    Tener aprobadas
                  </p>
                  <ul className="space-y-1">
                    {materia.requiereAprobadas.map((reqId) => {
                      const req = materiasMap.get(reqId)
                      if (!req) return null
                      const reqEstado = getEstadoEfectivo(reqId)
                      const cumple = reqEstado === 'aprobada'
                      return (
                        <li key={reqId} className="flex items-center gap-2 text-xs dark:text-gray-300">
                          <span className={cumple ? 'text-success' : 'text-danger'}>
                            {cumple ? '✓' : '✗'}
                          </span>
                          {req.nombreCorto}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Esta materia te habilita */}
          {habilita.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold dark:text-gray-300 mb-2">
                Esta materia te habilita
              </h3>
              <ul className="space-y-1">
                {habilita.map((m) => (
                  <li key={m.id} className="text-xs dark:text-gray-300">
                    → {m.nombreCorto}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs font-medium text-primary">
                Si aprobás esta materia, impactás en {impacto} materias
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
```

**Step 2: Add the slide-in animation to index.css**

Append to `src/index.css`:

```css
@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in 0.2s ease-out;
}
```

**Step 3: Commit**

```bash
git add src/components/Panels/SubjectDetail.tsx src/index.css
git commit -m "feat: add subject detail drawer with requirements and impact info"
```

---

## Task 10: Simulation Banner

**Files:**
- Create: `src/components/Panels/SimulationBanner.tsx`

**Step 1: Create SimulationBanner**

`src/components/Panels/SimulationBanner.tsx`:

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
    <div className="sticky top-0 z-20 bg-amber-50 dark:bg-amber-900/30 border-b-2 border-amber-400 px-6 py-3 flex items-center justify-between">
      <div>
        <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
          🔮 Modo Simulación
        </span>
        <span className="text-xs text-amber-600 dark:text-amber-300 ml-2">
          Los cambios no se guardan. Estás explorando posibilidades.
        </span>
        {simulatedNames.length > 0 && (
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            Simulando: {simulatedNames.join(', ')}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={aplicarSimulacion}
          className="px-3 py-1.5 text-xs bg-success text-white rounded-lg hover:bg-success-dark font-medium"
        >
          Aplicar cambios
        </button>
        <button
          onClick={limpiarSimulacion}
          className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 text-amber-800 dark:text-amber-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 font-medium"
        >
          Limpiar simulación
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Panels/SimulationBanner.tsx
git commit -m "feat: add simulation mode banner with apply/clear actions"
```

---

## Task 11: Critical Path Utility

**Files:**
- Create: `src/utils/criticalPath.ts`

**Step 1: Implement longest path algorithm**

`src/utils/criticalPath.ts`:

```typescript
import { type EstadoMateria } from '../types/materia'
import { materias, materiasMap } from '../data/materias'

/**
 * Find the longest chain of unfinished prerequisites (critical path).
 * Uses DFS with memoization to find the longest path in the DAG
 * from any incomplete subject.
 */
export function computeCriticalPath(
  getEstado: (id: string) => EstadoMateria
): string[] {
  const memo = new Map<string, string[]>()

  function longestFrom(id: string): string[] {
    if (memo.has(id)) return memo.get(id)!

    const estado = getEstado(id)
    if (estado === 'aprobada') {
      memo.set(id, [])
      return []
    }

    const materia = materiasMap.get(id)
    if (!materia) {
      memo.set(id, [id])
      return [id]
    }

    const allReqs = [...materia.requiereCursadas, ...materia.requiereAprobadas]
    const unmetReqs = allReqs.filter((reqId) => getEstado(reqId) !== 'aprobada')

    let longestChain: string[] = []
    for (const reqId of unmetReqs) {
      const chain = longestFrom(reqId)
      if (chain.length > longestChain.length) {
        longestChain = chain
      }
    }

    const result = [...longestChain, id]
    memo.set(id, result)
    return result
  }

  // Find the longest path ending at any incomplete subject
  let criticalPath: string[] = []
  for (const materia of materias) {
    if (!materia.esElectiva) {
      const path = longestFrom(materia.id)
      if (path.length > criticalPath.length) {
        criticalPath = path
      }
    }
  }

  return criticalPath
}
```

**Step 2: Commit**

```bash
git add src/utils/criticalPath.ts
git commit -m "feat: add critical path algorithm using DFS with memoization"
```

---

## Task 12: Wire Everything Together and Polish

**Files:**
- Modify: `src/components/Map/ConnectionLines.tsx` (add critical path support)
- Modify: `src/components/Map/SubjectCard.tsx` (add critical path highlight)
- Modify: `src/App.tsx`

**Step 1: Add critical path overlay to ConnectionLines**

In `ConnectionLines.tsx`, import and use `computeCriticalPath`. Add a second pass that draws golden thick lines over the critical path when `showCriticalPath` is true.

Add after the existing connections map in the `<svg>`:

```tsx
// Inside the component, before return:
const showCriticalPath = useCarreraStore((s) => s.showCriticalPath)

// Compute critical path IDs
const criticalPathIds = showCriticalPath
  ? computeCriticalPath(getEstadoEfectivo)
  : []
const criticalPathSet = new Set(criticalPathIds)

// Inside the SVG, after existing paths:
{showCriticalPath && connections
  .filter((conn) => criticalPathSet.has(conn.fromId) && criticalPathSet.has(conn.toId))
  .map((conn, i) => (
    <path
      key={`critical-${conn.fromId}-${conn.toId}-${i}`}
      d={conn.path}
      fill="none"
      stroke="#D97706"
      strokeWidth={4}
      opacity={0.8}
      className="transition-all duration-300"
    />
  ))}
```

**Step 2: Add critical path highlight to SubjectCard**

In `SubjectCard.tsx`, check if the subject is on the critical path and add a golden ring:

```tsx
// Inside the component:
const showCriticalPath = useCarreraStore((s) => s.showCriticalPath)

// Import and compute:
import { computeCriticalPath } from '../../utils/criticalPath'

// Before return, check if on critical path:
const criticalPathIds = showCriticalPath
  ? computeCriticalPath(getEstadoEfectivo)
  : []
const isOnCriticalPath = criticalPathIds.includes(materia.id)

// Add to className:
// ${isOnCriticalPath ? 'ring-2 ring-amber-500 shadow-amber-200 shadow-lg' : ''}
```

**Step 3: Verify the app compiles and renders**

```bash
npm run dev
```

Navigate to localhost, verify:
- 5 level columns with subject cards
- Sidebar with progress stats
- Click subject card cycles state
- Right-click opens detail drawer
- Search works
- Dark mode toggle works
- Simulation mode activates
- Connection lines render between columns

**Step 4: Build for production**

```bash
npm run build
```

Expected: No errors, `dist/` folder created.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire all components together, add critical path overlay, production build"
```

---

## Task 13: Final Polish and Animations

**Files:**
- Modify: `src/index.css`

**Step 1: Add animations**

Append to `src/index.css`:

```css
@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}

.animate-unlock {
  animation: pulse-green 1s ease-in-out 1;
}

@keyframes pulse-border {
  0%, 100% { border-color: rgba(239, 68, 68, 0.4); }
  50% { border-color: rgba(239, 68, 68, 1); }
}

.animate-pulse-red {
  animation: pulse-border 1.5s ease-in-out infinite;
}
```

**Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: add unlock pulse and red border animations"
```

---

## Summary

The plan builds the app in 13 tasks:

| Task | What | Est. LOC |
|------|------|---------|
| 1 | Scaffold (Vite + React + TS + Tailwind) | ~60 |
| 2 | Types + all 55 subjects data | ~400 |
| 3 | Zustand store with persistence | ~150 |
| 4 | Layout shell (AppShell, Sidebar, MapArea) | ~200 |
| 5 | UI components (ProgressRing, SearchBar) | ~80 |
| 6 | SubjectCard (colors, states, cycling) | ~150 |
| 7 | LevelColumn + ElectivesSection | ~80 |
| 8 | SVG connection lines | ~140 |
| 9 | Subject detail drawer | ~170 |
| 10 | Simulation banner | ~50 |
| 11 | Critical path algorithm | ~50 |
| 12 | Wire together + critical path UI | ~40 |
| 13 | Animations polish | ~20 |

Total: ~1,590 lines of code across 17 files.
