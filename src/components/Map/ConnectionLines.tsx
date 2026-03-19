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
}

export function ConnectionLines({ containerRef }: ConnectionLinesProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 })

  const hoveredMateria = useCarreraStore((s) => s.hoveredMateria)
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
        newConnections.push({ fromId: reqId, toId: materia.id, type: 'cursada', path: bezierPath(getElementRight(fromEl, container), getElementLeft(toEl, container)) })
      }
      for (const reqId of materia.requiereAprobadas) {
        const fromEl = container.querySelector(`[data-materia-id="${reqId}"]`) as HTMLElement | null
        if (!fromEl) continue
        newConnections.push({ fromId: reqId, toId: materia.id, type: 'aprobada', path: bezierPath(getElementRight(fromEl, container), getElementLeft(toEl, container)) })
      }
    }
    setConnections(newConnections)
  }, [containerRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const timer = setTimeout(computeConnections, 150)
    const observer = new ResizeObserver(computeConnections)
    observer.observe(container)
    return () => { clearTimeout(timer); observer.disconnect() }
  }, [containerRef, computeConnections, estados, estadosSimulados])

  const criticalPathIds = showCriticalPath ? computeCriticalPath(getEstado) : []
  const criticalPathSet = new Set(criticalPathIds)

  const getLineStyle = (conn: Connection) => {
    const reqEstado = getEstado(conn.fromId)
    if (conn.type === 'aprobada') {
      if (reqEstado === 'aprobada') return { stroke: '#10B981', dasharray: '' }
      if (reqEstado === 'regularizada' || reqEstado === 'cursando') return { stroke: '#F97316', dasharray: '6 4' }
      return { stroke: '#DC2626', dasharray: '6 4' }
    }
    if (reqEstado === 'aprobada' || reqEstado === 'regularizada' || reqEstado === 'cursando')
      return { stroke: reqEstado === 'aprobada' ? '#10B981' : '#F59E0B', dasharray: '' }
    return { stroke: '#DC2626', dasharray: '6 4' }
  }

  const isConnected = (conn: Connection) => !hoveredMateria || conn.fromId === hoveredMateria || conn.toId === hoveredMateria

  return (
    <svg className="absolute inset-0 pointer-events-none z-0" width={dimensions.w} height={dimensions.h} style={{ overflow: 'visible' }}>
      {connections.map((conn, i) => {
        const style = getLineStyle(conn)
        const connected = isConnected(conn)
        return <path key={`${conn.fromId}-${conn.toId}-${conn.type}-${i}`} d={conn.path} fill="none" stroke={style.stroke} strokeWidth={connected ? 1.5 : 1} strokeDasharray={style.dasharray} opacity={connected ? 0.7 : 0.06} className="transition-all duration-300" />
      })}
      {showCriticalPath && connections.filter((c) => criticalPathSet.has(c.fromId) && criticalPathSet.has(c.toId)).map((conn, i) => (
        <path key={`crit-${conn.fromId}-${conn.toId}-${i}`} d={conn.path} fill="none" stroke="#D97706" strokeWidth={4} opacity={0.8} className="transition-all duration-300" />
      ))}
    </svg>
  )
}
