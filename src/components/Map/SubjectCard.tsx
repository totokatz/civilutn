import { type Materia } from '../../types/materia'
import { useCarreraStore } from '../../store/useCarreraStore'
import { makeGetEstado, computeDisponibilidad, computeRequisitos } from '../../hooks/useMateria'

interface SubjectCardProps {
  materia: Materia
}

const estadoConfig = {
  aprobada: { bg: 'bg-estado-aprobada-bg dark:bg-emerald-900/40', border: 'border-estado-aprobada-border', icon: '✓', label: 'Aprobada' },
  regularizada: { bg: 'bg-estado-regularizada-bg dark:bg-amber-900/30', border: 'border-estado-regularizada-border', icon: '◐', label: 'Regularizada' },
  cursando: { bg: 'bg-estado-cursando-bg dark:bg-blue-900/30', border: 'border-estado-cursando-border', icon: '▶', label: 'Cursando' },
  pendiente: { bg: 'bg-white dark:bg-[#16213e]', border: 'border-gray-300 dark:border-gray-600', icon: '', label: 'Pendiente' },
}

const disponibilidadOverride = {
  disponible: { bg: 'bg-white dark:bg-[#16213e]', border: 'border-dashed border-estado-disponible-border', icon: '🔓' },
  bloqueada: { bg: 'bg-estado-bloqueada-bg dark:bg-gray-800/60', border: 'border-estado-bloqueada', icon: '🔒' },
  casiDisponible: { bg: 'bg-estado-casi dark:bg-orange-900/30', border: 'border-estado-casi-border', icon: '⚡' },
}

export function SubjectCard({ materia }: SubjectCardProps) {
  const cycleEstado = useCarreraStore((s) => s.cycleEstado)
  const setHovered = useCarreraStore((s) => s.setHovered)
  const setSelected = useCarreraStore((s) => s.setSelected)
  const hoveredMateria = useCarreraStore((s) => s.hoveredMateria)
  const searchQuery = useCarreraStore((s) => s.searchQuery)
  const estados = useCarreraStore((s) => s.estados)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)

  const getEstado = makeGetEstado(estados, modoSimulacion, estadosSimulados)
  const estado = getEstado(materia.id)
  const disponibilidad = computeDisponibilidad(materia.id, getEstado)
  const { completados, total } = computeRequisitos(materia.id, getEstado)

  const isPendiente = estado === 'pendiente'
  const config = isPendiente ? disponibilidadOverride[disponibilidad] : estadoConfig[estado]
  const icon = isPendiente ? disponibilidadOverride[disponibilidad].icon : estadoConfig[estado].icon

  const isSearchMatch = !searchQuery ||
    materia.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    materia.codigo.includes(searchQuery) ||
    materia.nombreCorto.toLowerCase().includes(searchQuery.toLowerCase())

  const isDimmed = (hoveredMateria && hoveredMateria !== materia.id) || (!isSearchMatch && searchQuery)
  const isSimulated = modoSimulacion && materia.id in estadosSimulados

  const minHeight = 80 + materia.horas * 6

  return (
    <div
      data-materia-id={materia.id}
      className={`relative rounded-lg border-2 p-3 cursor-pointer select-none transition-all duration-300 ${config.bg} ${config.border} ${isDimmed ? 'opacity-30' : 'opacity-100'} ${isSimulated ? 'ring-2 ring-amber-400 animate-pulse' : ''} ${materia.esProyectoFinal ? 'col-span-full' : ''} hover:shadow-md hover:scale-[1.02]`}
      style={{ minHeight }}
      onMouseEnter={() => setHovered(materia.id)}
      onMouseLeave={() => setHovered(null)}
      onClick={(e) => { e.stopPropagation(); cycleEstado(materia.id) }}
      onContextMenu={(e) => { e.preventDefault(); setSelected(materia.id) }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="font-mono text-[10px] text-text-secondary dark:text-gray-400">{materia.codigo}</span>
        <div className="flex gap-1 items-center">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 dark:text-gray-300 font-medium">
            {materia.tipo === 'A' ? 'Anual' : 'Cuatr.'}
          </span>
          <span className="text-[10px] text-text-secondary dark:text-gray-400">{materia.horas}hs</span>
        </div>
      </div>
      <p className="text-xs font-semibold leading-tight dark:text-gray-200 mb-2">{materia.nombreCorto}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] text-text-secondary dark:text-gray-400">
          {isPendiente ? (disponibilidad === 'disponible' ? 'Disponible' : disponibilidad === 'casiDisponible' ? 'Casi disp.' : 'Bloqueada') : estadoConfig[estado].label}
        </span>
        <span className="text-sm">{icon}</span>
      </div>
      {isPendiente && disponibilidad !== 'disponible' && total > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
            <div className="bg-primary h-1 rounded-full transition-all duration-300" style={{ width: `${(completados / total) * 100}%` }} />
          </div>
          <span className="text-[9px] text-text-secondary dark:text-gray-500">{completados}/{total} requisitos</span>
        </div>
      )}
      {materia.esProyectoFinal && (
        <div className="mt-1 text-[9px] text-amber-600 dark:text-amber-400 font-medium">Para rendir: todas las demás aprobadas</div>
      )}
    </div>
  )
}
