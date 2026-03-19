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
        if (estado !== 'pendiente') return 'disponible'
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
