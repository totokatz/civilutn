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
  const [manualOpen, setManualOpen] = useState(false)
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
    <>
      <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-sm relative z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-lg font-normal tracking-tight text-text-primary">
                Ingenieria Civil
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

          <div className="flex items-center gap-2">
            {/* Manual button */}
            <button
              onClick={() => setManualOpen(true)}
              className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
              title="Manual de uso"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="7" />
                <path d="M6 6.5a2 2 0 1 1 2 2v1" />
                <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </button>

            {/* Search */}
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

            {/* Settings dropdown */}
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
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-sm shadow-lg z-[100] animate-fade-in">
                  <div className="py-1">
                    <button
                      onClick={() => { toggleSimulacion(); setSettingsOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${modoSimulacion ? 'text-amber-600 bg-amber-50' : 'text-text-primary hover:bg-background'}`}
                    >
                      {modoSimulacion ? 'Desactivar simulacion' : 'Modo simulacion'}
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
                          Limpiar simulacion
                        </button>
                      </>
                    )}
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => { toggleCriticalPath(); setSettingsOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${showCriticalPath ? 'text-amber-600 bg-amber-50' : 'text-text-primary hover:bg-background'}`}
                    >
                      {showCriticalPath ? 'Ocultar camino critico' : 'Camino critico'}
                    </button>
                    <div className="border-t border-border my-1" />
                    <button onClick={handleExport} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-background transition-colors">
                      Exportar progreso
                    </button>
                    <button onClick={handleImport} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-background transition-colors">
                      Importar progreso
                    </button>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => { if (confirm('Resetear todo el progreso?')) { resetAll(); setSettingsOpen(false) } }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
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

      {/* Manual Modal */}
      {manualOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[200]" onClick={() => setManualOpen(false)} />
          <div className="fixed inset-x-0 top-[10%] mx-auto max-w-lg bg-surface border border-border rounded-sm shadow-2xl z-[201] max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-normal tracking-tight text-text-primary">Manual de uso</h2>
                <button onClick={() => setManualOpen(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3l10 10M13 3L3 13" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6 text-sm text-text-secondary">
                <section>
                  <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide mb-2">Estados de materia</h3>
                  <p className="mb-2">Click izquierdo en una materia para ciclar su estado:</p>
                  <div className="space-y-1.5 ml-2">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-border/30" /> <span>Pendiente — no iniciada</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-estado-cursando" /> <span>Cursando — la estas cursando ahora</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-estado-regularizada" /> <span>Regularizada — cursada completa, falta final</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-estado-aprobada" /> <span>Aprobada — final aprobado</span></div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide mb-2">Bordes de las tarjetas</h3>
                  <div className="space-y-1.5 ml-2">
                    <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-estado-aprobada" /> <span>Verde — aprobada</span></div>
                    <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-estado-regularizada" /> <span>Amarillo — regularizada</span></div>
                    <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-estado-cursando" /> <span>Azul — cursando</span></div>
                    <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-violet-500" /> <span>Violeta — disponible para cursar (requisitos cumplidos)</span></div>
                    <div className="flex items-center gap-2"><span className="w-6 h-0.5 border-t border-dashed border-border" /> <span>Punteado — bloqueada (faltan requisitos)</span></div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide mb-2">Lineas de conexion</h3>
                  <p className="mb-2">Al pasar el mouse sobre una materia se muestran las conexiones:</p>
                  <div className="space-y-1.5 ml-2">
                    <div className="flex items-center gap-2">
                      <svg width="40" height="4"><line x1="0" y1="2" x2="40" y2="2" stroke="#10b981" strokeWidth="1.5" /></svg>
                      <span>Linea verde solida — requisito cumplido</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="40" height="4"><line x1="0" y1="2" x2="40" y2="2" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" /></svg>
                      <span>Linea amarilla punteada — en progreso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="40" height="4"><line x1="0" y1="2" x2="40" y2="2" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="3 3" /></svg>
                      <span>Linea gris punteada — requisito no cumplido</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="40" height="4"><line x1="0" y1="2" x2="40" y2="2" stroke="#10b981" strokeWidth="2.5" /></svg>
                      <span>Linea gruesa — requiere aprobada (mas estricto)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="40" height="4"><line x1="0" y1="2" x2="40" y2="2" stroke="#10b981" strokeWidth="1.5" /></svg>
                      <span>Linea fina — requiere cursada (menos estricto)</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide mb-2">Labels en las lineas</h3>
                  <div className="space-y-1.5 ml-2">
                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 rounded-sm bg-estado-aprobada/10 text-estado-aprobada font-medium">Cursada ✓</span> <span>La materia origen cumple el requisito de cursada</span></div>
                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-600 font-medium">Aprobada ✗</span> <span>La materia origen NO cumple el requisito de aprobada</span></div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide mb-2">Interacciones</h3>
                  <div className="space-y-1.5 ml-2">
                    <p><strong>Click izquierdo</strong> en materia — cambia el estado</p>
                    <p><strong>Click derecho</strong> en materia — abre panel de detalle</p>
                    <p><strong>Mouse sobre materia</strong> — muestra conexiones y labels</p>
                    <p><strong>Arrastrar separadores</strong> entre columnas — ajusta el espacio</p>
                    <p><strong>Zoom</strong> — controles abajo a la derecha (+, -, ver todo)</p>
                    <p><strong>Buscar</strong> — icono de lupa en la barra superior</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide mb-2">Opciones (menu ⋮)</h3>
                  <div className="space-y-1.5 ml-2">
                    <p><strong>Modo simulacion</strong> — explora cambios sin guardarlos</p>
                    <p><strong>Camino critico</strong> — resalta la cadena mas larga de materias pendientes</p>
                    <p><strong>Exportar/Importar</strong> — guarda o carga tu progreso como archivo JSON</p>
                    <p><strong>Resetear</strong> — borra todo el progreso</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
