import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasMap } from '../../data/materias'

export function SimulationBanner() {
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)
  const limpiarSimulacion = useCarreraStore((s) => s.limpiarSimulacion)
  const aplicarSimulacion = useCarreraStore((s) => s.aplicarSimulacion)

  const simulatedNames = Object.keys(estadosSimulados).map((id) => materiasMap.get(id)?.nombreCorto).filter(Boolean)

  return (
    <div className="sticky top-0 z-20 bg-amber-50 dark:bg-amber-900/30 border-b-2 border-amber-400 px-6 py-3 flex items-center justify-between">
      <div>
        <span className="text-sm font-bold text-amber-800 dark:text-amber-200">🔮 Modo Simulación</span>
        <span className="text-xs text-amber-600 dark:text-amber-300 ml-2">Los cambios no se guardan. Estás explorando posibilidades.</span>
        {simulatedNames.length > 0 && (
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Simulando: {simulatedNames.join(', ')}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={aplicarSimulacion} className="px-3 py-1.5 text-xs bg-success text-white rounded-lg hover:bg-success-dark font-medium">Aplicar cambios</button>
        <button onClick={limpiarSimulacion} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 text-amber-800 dark:text-amber-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 font-medium">Limpiar simulación</button>
      </div>
    </div>
  )
}
