import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasMap, materias } from '../../data/materias'
import { type EstadoMateria } from '../../types/materia'

const estadoOptions: { value: EstadoMateria; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'cursando', label: 'Cursando' },
  { value: 'regularizada', label: 'Regularizada' },
  { value: 'aprobada', label: 'Aprobada' },
]

export function SubjectDetail() {
  const selectedMateria = useCarreraStore((s) => s.selectedMateria)
  const setSelected = useCarreraStore((s) => s.setSelected)
  const setEstado = useCarreraStore((s) => s.setEstado)
  // Subscribe to estados + estadosSimulados so we re-render on changes
  const estados = useCarreraStore((s) => s.estados)
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)

  if (!selectedMateria) return null
  const materia = materiasMap.get(selectedMateria)
  if (!materia) return null

  const getEstado = (id: string): EstadoMateria => {
    if (modoSimulacion && id in estadosSimulados) return estadosSimulados[id]
    return estados[id] ?? 'pendiente'
  }

  const estado = getEstado(materia.id)
  const habilita = materias.filter((m) => m.requiereCursadas.includes(materia.id) || m.requiereAprobadas.includes(materia.id))
  const impacto = habilita.length

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelected(null)} />
      <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-white dark:bg-[#16213e] shadow-2xl z-50 overflow-y-auto animate-slide-in">
        <div className="p-6">
          <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">✕</button>
          <span className="font-mono text-xs text-text-secondary dark:text-gray-400">{materia.codigo}</span>
          <h2 className="text-lg font-bold mt-1 dark:text-gray-200">{materia.nombre}</h2>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300">Nivel {materia.nivel}</span>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300">{materia.tipo === 'A' ? 'Anual' : 'Cuatrimestral'}</span>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300">{materia.horas}hs semanales</span>
          </div>
          <div className="mt-6">
            <label className="text-sm font-semibold dark:text-gray-300">Estado actual</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {estadoOptions.map((opt) => (
                <button key={opt.value} onClick={() => setEstado(materia.id, opt.value)}
                  className={`py-2 px-3 text-xs rounded-lg font-medium transition-all ${estado === opt.value ? 'bg-primary text-white ring-2 ring-primary/30' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {(materia.requiereCursadas.length > 0 || materia.requiereAprobadas.length > 0) && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold dark:text-gray-300 mb-2">Para cursar necesitás</h3>
              {materia.requiereCursadas.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wide text-text-secondary dark:text-gray-500 mb-1">Tener cursadas</p>
                  <ul className="space-y-1">
                    {materia.requiereCursadas.map((reqId) => {
                      const req = materiasMap.get(reqId)
                      if (!req) return null
                      const reqEstado = getEstado(reqId)
                      const cumple = reqEstado === 'cursando' || reqEstado === 'regularizada' || reqEstado === 'aprobada'
                      return <li key={reqId} className="flex items-center gap-2 text-xs dark:text-gray-300"><span className={cumple ? 'text-success' : 'text-danger'}>{cumple ? '✓' : '✗'}</span>{req.nombreCorto}</li>
                    })}
                  </ul>
                </div>
              )}
              {materia.requiereAprobadas.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-text-secondary dark:text-gray-500 mb-1">Tener aprobadas</p>
                  <ul className="space-y-1">
                    {materia.requiereAprobadas.map((reqId) => {
                      const req = materiasMap.get(reqId)
                      if (!req) return null
                      const cumple = getEstado(reqId) === 'aprobada'
                      return <li key={reqId} className="flex items-center gap-2 text-xs dark:text-gray-300"><span className={cumple ? 'text-success' : 'text-danger'}>{cumple ? '✓' : '✗'}</span>{req.nombreCorto}</li>
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
          {habilita.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold dark:text-gray-300 mb-2">Esta materia te habilita</h3>
              <ul className="space-y-1">
                {habilita.map((m) => (<li key={m.id} className="text-xs dark:text-gray-300">→ {m.nombreCorto}</li>))}
              </ul>
              <p className="mt-2 text-xs font-medium text-primary">Si aprobás esta materia, impactás en {impacto} materias</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
