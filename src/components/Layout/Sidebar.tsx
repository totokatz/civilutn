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
  const regularizadas = obligatorias.filter((m) => estados[m.id] === 'regularizada' || estados[m.id] === 'aprobada').length
  const cursando = obligatorias.filter((m) => estados[m.id] === 'cursando').length
  const horasAcumuladas = obligatorias.filter((m) => estados[m.id] === 'aprobada').reduce((sum, m) => sum + m.horas, 0)
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-bold text-text dark:text-text-dark">Ingeniería Civil</h1>
        <p className="text-xs text-text-secondary dark:text-gray-400">UTN — Plan 2023</p>
      </div>
      <div className="p-4"><SearchBar /></div>
      <div className="flex justify-around px-4 pb-4">
        <ProgressRing value={aprobadas} max={total} label="Aprobadas" color="#10B981" />
        <ProgressRing value={regularizadas} max={total} label="Regulares" color="#F59E0B" />
        <ProgressRing value={cursando} max={total} label="Cursando" color="#3B82F6" />
      </div>
      <div className="px-4 pb-4 space-y-2 text-sm dark:text-gray-300">
        <div className="flex justify-between"><span>Avance</span><span className="font-semibold">{porcentaje}%</span></div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div className="bg-estado-aprobada h-2 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }} />
        </div>
        <div className="flex justify-between text-xs text-text-secondary dark:text-gray-400"><span>Horas acumuladas: {horasAcumuladas}hs</span></div>
      </div>
      <div className="px-4 pb-4 space-y-2">
        <button onClick={toggleSimulacion}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${modoSimulacion ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400' : 'bg-gray-100 dark:bg-gray-700 text-text dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          {modoSimulacion ? '🔮 Modo Simulación ACTIVO' : '🔮 Modo "Qué pasa si..."'}
        </button>
        {modoSimulacion && (
          <div className="flex gap-2">
            <button onClick={aplicarSimulacion} className="flex-1 py-1.5 px-2 bg-success text-white text-xs rounded-lg hover:bg-success-dark">Aplicar</button>
            <button onClick={limpiarSimulacion} className="flex-1 py-1.5 px-2 bg-gray-200 dark:bg-gray-600 text-xs rounded-lg hover:bg-gray-300 dark:text-gray-300">Limpiar</button>
          </div>
        )}
      </div>
      <div className="px-4 pb-4 space-y-2">
        <button onClick={toggleCriticalPath}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${showCriticalPath ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-text dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          🛤️ Camino Crítico
        </button>
      </div>
      <div className="flex-1" />
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Exportar</button>
          <button onClick={handleImport} className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Importar</button>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleDarkMode} className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{darkMode ? '☀️ Claro' : '🌙 Oscuro'}</button>
          <button onClick={resetAll} className="flex-1 py-1.5 text-xs bg-danger/10 text-danger rounded-lg hover:bg-danger/20">Resetear</button>
        </div>
      </div>
    </aside>
  )
}
