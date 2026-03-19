import { type Materia } from '../../types/materia'
import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasMap } from '../../data/materias'
import { makeGetEstado, computeDisponibilidad, computeRequisitos } from '../../hooks/useMateria'

interface SubjectCardProps {
  materia: Materia
}

const estadoConfig = {
  aprobada: { border: 'border-l-estado-aprobada', label: 'Aprobada', icon: '✓', badge: 'bg-estado-aprobada/15 text-estado-aprobada border-estado-aprobada/30' },
  regularizada: { border: 'border-l-estado-regularizada', label: 'Regularizada', icon: '◐', badge: 'bg-estado-regularizada/15 text-estado-regularizada border-estado-regularizada/30' },
  cursando: { border: 'border-l-estado-cursando', label: 'Cursando', icon: '▶', badge: 'bg-estado-cursando/15 text-estado-cursando border-estado-cursando/30' },
  pendiente: { border: 'border-l-transparent', label: '', icon: '', badge: 'bg-border/30 text-text-secondary border-border' },
}

export function SubjectCard({ materia }: SubjectCardProps) {
  const cycleEstado = useCarreraStore((s) => s.cycleEstado)
  const setSelected = useCarreraStore((s) => s.setSelected)
  const hoveredMateria = useCarreraStore((s) => s.hoveredMateria)
  const setHovered = useCarreraStore((s) => s.setHovered)
  const searchQuery = useCarreraStore((s) => s.searchQuery)
  const estados = useCarreraStore((s) => s.estados)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)
  const pinnedMaterias = useCarreraStore((s) => s.pinnedMaterias)
  const togglePin = useCarreraStore((s) => s.togglePin)

  const getEstado = makeGetEstado(estados, modoSimulacion, estadosSimulados)
  const estado = getEstado(materia.id)
  const disponibilidad = computeDisponibilidad(materia.id, getEstado)
  const { completados, total } = computeRequisitos(materia.id, getEstado)

  const isSearchMatch = !searchQuery ||
    materia.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    materia.codigo.includes(searchQuery) ||
    materia.nombreCorto.toLowerCase().includes(searchQuery.toLowerCase())

  const isHovered = hoveredMateria === materia.id
  const isPinned = pinnedMaterias.includes(materia.id)
  const isSimulated = modoSimulacion && materia.id in estadosSimulados
  const isBloqueada = estado === 'pendiente' && disponibilidad === 'bloqueada'
  const isDisponible = estado === 'pendiente' && disponibilidad === 'disponible' && (materia.requiereCursadas.length > 0 || materia.requiereAprobadas.length > 0)

  // When pinned, ignore hover — focus only on the pinned card
  const hasPinned = pinnedMaterias.length > 0
  const activeIds = hasPinned
    ? pinnedMaterias
    : hoveredMateria ? [hoveredMateria] : []

  // Connection tags from all active cards
  const connectionTags: { label: string; met: boolean }[] = []
  for (const activeId of activeIds) {
    if (activeId === materia.id) continue
    const activeData = materiasMap.get(activeId)
    if (!activeData) continue

    if (activeData.requiereCursadas.includes(materia.id)) {
      const met = estado === 'cursando' || estado === 'regularizada' || estado === 'aprobada'
      connectionTags.push({ label: 'Cursada', met })
    } else if (activeData.requiereAprobadas.includes(materia.id)) {
      const met = estado === 'aprobada'
      connectionTags.push({ label: 'Aprobada', met })
    } else if (materia.requiereCursadas.includes(activeId)) {
      const activeEstado = getEstado(activeId)
      const met = activeEstado === 'cursando' || activeEstado === 'regularizada' || activeEstado === 'aprobada'
      connectionTags.push({ label: 'Cursada', met })
    } else if (materia.requiereAprobadas.includes(activeId)) {
      const activeEstado = getEstado(activeId)
      const met = activeEstado === 'aprobada'
      connectionTags.push({ label: 'Aprobada', met })
    }
  }

  const hasConnections = connectionTags.length > 0
  const isActive = isHovered || isPinned
  const hasAnyActive = hoveredMateria !== null || pinnedMaterias.length > 0

  const isDimmed = !isActive && !hasConnections && hasAnyActive && !(searchQuery && !isSearchMatch)
  const isSearchDimmed = !isSearchMatch && !!searchQuery

  const borderClass = estado !== 'pendiente'
    ? estadoConfig[estado].border
    : isDisponible ? 'border-l-violet-500' : 'border-l-transparent'

  const config = estado !== 'pendiente' ? estadoConfig[estado] : estadoConfig.pendiente

  const disponibilidadLabel =
    estado !== 'pendiente' ? config.label :
    disponibilidad === 'disponible' ? 'Disponible' :
    disponibilidad === 'casiDisponible' ? 'Casi disponible' :
    'Bloqueada'

  return (
    <div
      data-materia-id={materia.id}
      onClick={(e) => { e.stopPropagation(); cycleEstado(materia.id) }}
      onContextMenu={(e) => { e.preventDefault(); setSelected(materia.id) }}
      onMouseEnter={() => setHovered(materia.id)}
      onMouseLeave={() => setHovered(null)}
      className={`
        relative rounded-sm border border-border bg-white/50 backdrop-blur-sm
        border-l-[3px] ${borderClass}
        p-4 cursor-pointer select-none
        transition-all duration-200
        hover:bg-white hover:shadow-sm hover:border-border-hover
        ${isDimmed || isSearchDimmed ? 'opacity-20' : 'opacity-100'}
        ${isBloqueada && !hasConnections ? 'opacity-50 border-dashed' : ''}
        ${isSimulated ? 'ring-2 ring-amber-400/60' : ''}
        ${isActive ? 'shadow-lg scale-[1.03] z-20 bg-white' : ''}
        ${isPinned ? 'ring-2 ring-violet-400/60' : ''}
        ${hasConnections && !isActive ? 'bg-white shadow-sm' : ''}
      `}
    >
      {/* Pin button — visible on hover or when pinned */}
      <button
        onClick={(e) => { e.stopPropagation(); togglePin(materia.id) }}
        className={`absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-sm transition-all
          ${isPinned ? 'text-violet-500 bg-violet-50' : 'text-text-tertiary hover:text-text-primary'}
          ${isHovered || isPinned ? 'opacity-100' : 'opacity-0'}
        `}
        title={isPinned ? 'Desfijar' : 'Fijar conexiones'}
      >
        <svg width="10" height="12" viewBox="0 0 10 12" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2">
          <path d="M3 0v4L1 5v1h3.5v4l.5 2 .5-2V6H9V5L7 4V0" />
        </svg>
      </button>

      {/* Connection tags inside the card */}
      {hasConnections && (
        <div className="flex flex-wrap gap-1 mb-2">
          {connectionTags.map((tag, i) => (
            <span
              key={i}
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-sm ${
                tag.label === 'Aprobada'
                  ? tag.met ? 'bg-orange-100 text-orange-700' : 'bg-orange-50 text-orange-500'
                  : tag.met ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-400'
              }`}
            >
              {tag.label} {tag.met ? '✓' : '✗'}
            </span>
          ))}
        </div>
      )}

      <div className="mb-2">
        <p className="text-sm font-medium leading-snug text-text-primary">
          {materia.nombreCorto}
        </p>
        <span className="font-mono text-[10px] text-text-tertiary">{materia.codigo}</span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mb-2">
        <span>{materia.tipo === 'A' ? 'Anual' : 'Cuatr.'}</span>
        <span className="text-text-tertiary">·</span>
        <span>{materia.horas}hs</span>
      </div>

      {isActive ? (
        <div className={`mt-1 text-[11px] font-semibold py-1.5 px-2.5 rounded-sm border text-center ${estadoConfig[estado].badge}`}>
          {estadoConfig[estado].icon && <span className="mr-1">{estadoConfig[estado].icon}</span>}
          {estado !== 'pendiente' ? estadoConfig[estado].label : disponibilidadLabel}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className={`text-[11px] ${isDisponible ? 'text-violet-600 font-medium' : 'text-text-secondary'}`}>
            {estado !== 'pendiente' && <span className="mr-1">{config.icon}</span>}
            {isDisponible && <span className="mr-1">●</span>}
            {disponibilidadLabel}
          </span>
        </div>
      )}

      {estado === 'pendiente' && disponibilidad !== 'disponible' && total > 0 && (
        <div className="mt-2">
          <div className="w-full h-1 bg-border/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-estado-cursando rounded-full transition-all duration-300"
              style={{ width: `${(completados / total) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-text-tertiary mt-0.5 block">
            {completados}/{total} requisitos
          </span>
        </div>
      )}

      {materia.esProyectoFinal && (
        <p className="mt-1.5 text-[10px] text-amber-600 font-medium">
          Requiere todas las demas aprobadas
        </p>
      )}
    </div>
  )
}
