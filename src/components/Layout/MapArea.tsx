import { useRef, useState, useCallback, useEffect } from 'react'
import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasPorNivel } from '../../data/materias'
import { LevelView } from '../Map/LevelView'
import { ElectivesView } from '../Map/ElectivesView'
import { ConnectionLines } from '../Map/ConnectionLines'
import { SimulationBanner } from '../Panels/SimulationBanner'
import { SubjectDetail } from '../Panels/SubjectDetail'

const LEVELS = [
  { nivel: 1, nombre: '1er Nivel', subtitulo: 'Ciencias Basicas' },
  { nivel: 2, nombre: '2do Nivel', subtitulo: 'Ciencias de la Ingenieria' },
  { nivel: 3, nombre: '3er Nivel', subtitulo: 'Tecnologias Aplicadas' },
  { nivel: 4, nombre: '4to Nivel', subtitulo: 'Ingenieria Aplicada' },
  { nivel: 5, nombre: '5to Nivel', subtitulo: 'Integracion Profesional' },
]

const ZOOM_MIN = 0.3
const ZOOM_MAX = 1.5
const ZOOM_STEP = 0.1
const GAP_MIN = 24
const GAP_MAX = 500
const GAP_DEFAULT = 60

export function MapArea() {
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const selectedMateria = useCarreraStore((s) => s.selectedMateria)
  const mapRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [gaps, setGaps] = useState<number[]>([GAP_DEFAULT, GAP_DEFAULT, GAP_DEFAULT, GAP_DEFAULT, GAP_DEFAULT])
  const [dragging, setDragging] = useState<{ index: number; startX: number; startGap: number } | null>(null)
  const [panning, setPanning] = useState<{ startX: number; startY: number; scrollX: number; scrollY: number } | null>(null)

  const clampZoom = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, +z.toFixed(2)))
  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z + ZOOM_STEP)), [])
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z - ZOOM_STEP)), [])
  const zoomReset = useCallback(() => setZoom(1), [])
  const zoomFit = useCallback(() => setZoom(0.55), [])

  // Ctrl+Scroll = zoom toward cursor
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()

      const rect = container.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top

      const contentX = (container.scrollLeft + cursorX) / zoom
      const contentY = (container.scrollTop + cursorY) / zoom

      const delta = e.deltaY > 0 ? -0.05 : 0.05
      const newZoom = clampZoom(zoom + delta)

      setZoom(newZoom)

      // After zoom, adjust scroll to keep content under cursor
      requestAnimationFrame(() => {
        container.scrollLeft = contentX * newZoom - cursorX
        container.scrollTop = contentY * newZoom - cursorY
      })
    }
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [zoom])

  // Middle-click pan
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleDown = (e: MouseEvent) => {
      // Middle button (1) or Space held (handled via class)
      if (e.button !== 1) return
      e.preventDefault()
      setPanning({
        startX: e.clientX,
        startY: e.clientY,
        scrollX: container.scrollLeft,
        scrollY: container.scrollTop,
      })
    }

    const handleMove = (e: MouseEvent) => {
      if (!panning) return
      container.scrollLeft = panning.scrollX - (e.clientX - panning.startX)
      container.scrollTop = panning.scrollY - (e.clientY - panning.startY)
    }

    const handleUp = () => setPanning(null)

    container.addEventListener('mousedown', handleDown)
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    return () => {
      container.removeEventListener('mousedown', handleDown)
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [panning])

  // Space held = grab cursor for pan, keyboard shortcuts
  const [spaceHeld, setSpaceHeld] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.code === 'Space') { e.preventDefault(); setSpaceHeld(true) }
      if (e.code === 'Equal' || e.code === 'NumpadAdd') { e.preventDefault(); zoomIn() }
      if (e.code === 'Minus' || e.code === 'NumpadSubtract') { e.preventDefault(); zoomOut() }
      if (e.code === 'Digit0' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomReset() }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [zoomIn, zoomOut, zoomReset])

  // Space+click pan
  useEffect(() => {
    if (!spaceHeld) return
    const container = scrollRef.current
    if (!container) return

    const handleDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      setPanning({
        startX: e.clientX,
        startY: e.clientY,
        scrollX: container.scrollLeft,
        scrollY: container.scrollTop,
      })
    }

    container.addEventListener('mousedown', handleDown, { capture: true })
    return () => container.removeEventListener('mousedown', handleDown, { capture: true })
  }, [spaceHeld])

  // Column gap drag
  const handleDragStart = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    setDragging({ index, startX: e.clientX, startGap: gaps[index] })
  }

  useEffect(() => {
    if (!dragging) return
    const handleMove = (e: MouseEvent) => {
      const delta = (e.clientX - dragging.startX) / zoom
      const newGap = Math.max(GAP_MIN, Math.min(GAP_MAX, dragging.startGap + delta))
      setGaps((prev) => {
        const next = [...prev]
        next[dragging.index] = Math.round(newGap)
        return next
      })
    }
    const handleUp = () => setDragging(null)
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [dragging, zoom])

  const columns = [
    ...LEVELS.map((level) => (
      <LevelView
        key={level.nivel}
        nivel={level.nivel}
        nombre={level.nombre}
        subtitulo={level.subtitulo}
        materias={materiasPorNivel(level.nivel)}
      />
    )),
    <ElectivesView key="electivas" />,
  ]

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      {modoSimulacion && <SimulationBanner />}

      <div
        ref={scrollRef}
        className={`flex-1 overflow-auto ${spaceHeld || panning ? 'cursor-grab' : ''} ${panning ? '!cursor-grabbing' : ''}`}
      >
        <div
          ref={mapRef}
          className="relative p-8 inline-block"
          style={{ zoom }}
        >
          <div className="flex items-start">
            {columns.map((col, i) => (
              <div key={i} className="contents">
                {col}
                {i < columns.length - 1 && (
                  <div
                    className="shrink-0 relative cursor-col-resize group"
                    style={{ width: gaps[i], minHeight: 200 }}
                    onMouseDown={(e) => handleDragStart(i, e)}
                  >
                    <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-border/40 group-hover:border-border transition-colors" />
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-surface border border-border/60 rounded-sm px-1 py-1.5 opacity-40 group-hover:opacity-100 transition-opacity cursor-col-resize">
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="#a1a1aa">
                        <circle cx="2" cy="2" r="1" /><circle cx="6" cy="2" r="1" />
                        <circle cx="2" cy="7" r="1" /><circle cx="6" cy="7" r="1" />
                        <circle cx="2" cy="12" r="1" /><circle cx="6" cy="12" r="1" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <ConnectionLines containerRef={mapRef} zoom={zoom} />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-surface/90 backdrop-blur-sm border border-border rounded-sm shadow-sm z-30">
        <button onClick={zoomOut} className="px-2.5 py-2 text-text-secondary hover:text-text-primary transition-colors" title="Alejar (-)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h8" /></svg>
        </button>
        <button onClick={zoomReset} className="px-2 py-1.5 text-[11px] text-text-secondary hover:text-text-primary transition-colors tabular-nums min-w-[3rem] text-center" title="Resetear (Ctrl+0)">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={zoomIn} className="px-2.5 py-2 text-text-secondary hover:text-text-primary transition-colors" title="Acercar (+)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h8M7 3v8" /></svg>
        </button>
        <div className="w-px h-5 bg-border" />
        <button onClick={zoomFit} className="px-2.5 py-2 text-text-secondary hover:text-text-primary transition-colors text-[11px]" title="Ver todo">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="12" height="12" rx="1" /><path d="M1 5h12M5 1v12M9 1v12" /></svg>
        </button>
      </div>

      {/* Navigation hint */}
      <div className="absolute bottom-6 left-6 text-[10px] text-text-tertiary z-30 space-y-0.5">
        <p>Ctrl+Scroll: zoom</p>
        <p>Click medio o Espacio+arrastrar: mover</p>
      </div>

      {selectedMateria && <SubjectDetail />}
    </main>
  )
}
