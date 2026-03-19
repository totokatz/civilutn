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
    <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-6 py-3 flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-amber-800">Modo Simulación</span>
        <span className="text-xs text-amber-600 ml-2">
          Explorando posibilidades — los cambios no se guardan.
        </span>
        {simulatedNames.length > 0 && (
          <p className="text-xs text-amber-700 mt-1">
            Simulando: {simulatedNames.join(', ')}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={aplicarSimulacion}
          className="px-3 py-1.5 text-xs bg-estado-aprobada text-white rounded-sm hover:opacity-90 transition-opacity font-medium"
        >
          Aplicar cambios
        </button>
        <button
          onClick={limpiarSimulacion}
          className="px-3 py-1.5 text-xs border border-amber-300 text-amber-700 rounded-sm hover:bg-amber-100 transition-colors font-medium"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
