import { useEffect, useState, useCallback, type RefObject } from 'react'
import { useCarreraStore } from '../../store/useCarreraStore'
import { materias } from '../../data/materias'
import { bezierPath, getElementRight, getElementLeft } from '../../utils/graphLayout'
import { computeCriticalPath } from '../../utils/criticalPath'
import { type EstadoMateria } from '../../types/materia'

interface Connection {
  fromId: string
  toId: string
  type: 'cursada' | 'aprobada'
  path: string
}

interface ConnectionLinesProps {
  containerRef: RefObject<HTMLDivElement | null>
  zoom: number
}

function cumpleCursada(e: EstadoMateria) {
  return e === 'cursando' || e === 'regularizada' || e === 'aprobada'
}

export function ConnectionLines({ containerRef, zoom }: ConnectionLinesProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 })

  const hoveredMateria = useCarreraStore((s) => s.hoveredMateria)
  const pinnedMaterias = useCarreraStore((s) => s.pinnedMaterias)
  const estados = useCarreraStore((s) => s.estados)
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const showCriticalPath = useCarreraStore((s) => s.showCriticalPath)

  const getEstado = useCallback((id: string): EstadoMateria => {
    if (modoSimulacion && id in estadosSimulados) return estadosSimulados[id]
    return estados[id] ?? 'pendiente'
  }, [estados, estadosSimulados, modoSimulacion])

  const computeConnections = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    setDimensions({ w: container.scrollWidth, h: container.scrollHeight })
    const newConnections: Connection[] = []
    for (const materia of materias) {
      const toEl = container.querySelector(`[data-materia-id="${materia.id}"]`) as HTMLElement | null
      if (!toEl) continue
      for (const reqId of materia.requiereCursadas) {
        const fromEl = container.querySelector(`[data-materia-id="${reqId}"]`) as HTMLElement | null
        if (!fromEl) continue
        newConnections.push({
          fromId: reqId, toId: materia.id, type: 'cursada',
          path: bezierPath(getElementRight(fromEl, container, zoom), getElementLeft(toEl, container, zoom)),
        })
      }
      for (const reqId of materia.requiereAprobadas) {
        const fromEl = container.querySelector(`[data-materia-id="${reqId}"]`) as HTMLElement | null
        if (!fromEl) continue
        newConnections.push({
          fromId: reqId, toId: materia.id, type: 'aprobada',
          path: bezierPath(getElementRight(fromEl, container, zoom), getElementLeft(toEl, container, zoom)),
        })
      }
    }
    setConnections(newConnections)
  }, [containerRef, zoom])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const timer = setTimeout(computeConnections, 150)
    const observer = new ResizeObserver(computeConnections)
    observer.observe(container)
    return () => { clearTimeout(timer); observer.disconnect() }
  }, [containerRef, computeConnections, estados, estadosSimulados, zoom])

  const criticalPathIds = showCriticalPath ? computeCriticalPath(getEstado) : []
  const criticalPathSet = new Set(criticalPathIds)

  // When pinned, ignore hover
  const hasPinned = pinnedMaterias.length > 0
  const activeIds = new Set(hasPinned ? pinnedMaterias : hoveredMateria ? [hoveredMateria] : [])

  const getLineColor = (conn: Connection) => {
    const reqEstado = getEstado(conn.fromId)
    const met = conn.type === 'aprobada' ? reqEstado === 'aprobada' : cumpleCursada(reqEstado)
    if (met) return '#10b981'
    if (cumpleCursada(reqEstado)) return '#f59e0b'
    return '#a1a1aa'
  }

  const isMet = (conn: Connection) => {
    const reqEstado = getEstado(conn.fromId)
    return conn.type === 'aprobada' ? reqEstado === 'aprobada' : cumpleCursada(reqEstado)
  }

  const isConnected = (conn: Connection) =>
    activeIds.has(conn.fromId) || activeIds.has(conn.toId)

  return (
    <svg className="absolute inset-0 pointer-events-none" width={dimensions.w} height={dimensions.h} style={{ overflow: 'visible' }}>
      <defs>
        <marker id="arrow-green" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L8 3L0 6Z" fill="#10b981" />
        </marker>
        <marker id="arrow-amber" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L8 3L0 6Z" fill="#f59e0b" />
        </marker>
        <marker id="arrow-zinc" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L8 3L0 6Z" fill="#a1a1aa" />
        </marker>
      </defs>

      {connections.map((conn, i) => {
        const connected = isConnected(conn)
        if (!connected && !showCriticalPath) return null
        const color = getLineColor(conn)
        const met = isMet(conn)
        const markerEnd = color === '#10b981' ? 'url(#arrow-green)' : color === '#f59e0b' ? 'url(#arrow-amber)' : 'url(#arrow-zinc)'

        return (
          <path
            key={`${conn.fromId}-${conn.toId}-${conn.type}-${i}`}
            d={conn.path}
            fill="none"
            stroke={color}
            strokeWidth={connected ? (conn.type === 'aprobada' ? 2.5 : 1.5) : 0.5}
            strokeDasharray={conn.type === 'aprobada' && connected ? '' : met ? '' : '3 3'}
            opacity={connected ? 0.7 : 0.04}
            markerEnd={connected ? markerEnd : undefined}
            className="transition-all duration-200"
          />
        )
      })}
      {showCriticalPath &&
        connections
          .filter((c) => criticalPathSet.has(c.fromId) && criticalPathSet.has(c.toId))
          .map((conn, i) => (
            <path
              key={`crit-${conn.fromId}-${conn.toId}-${i}`}
              d={conn.path}
              fill="none"
              stroke="#d97706"
              strokeWidth={2.5}
              opacity={0.7}
              className="transition-all duration-300"
            />
          ))}
    </svg>
  )
}
