import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasMap, materias } from '../../data/materias'
import { type EstadoMateria } from '../../types/materia'

const estadoOptions: { value: EstadoMateria; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'border-border text-text-secondary' },
  { value: 'cursando', label: 'Cursando', color: 'border-estado-cursando text-estado-cursando' },
  { value: 'regularizada', label: 'Regularizada', color: 'border-estado-regularizada text-estado-regularizada' },
  { value: 'aprobada', label: 'Aprobada', color: 'border-estado-aprobada text-estado-aprobada' },
]

export function SubjectDetail() {
  const selectedMateria = useCarreraStore((s) => s.selectedMateria)
  const setSelected = useCarreraStore((s) => s.setSelected)
  const setEstado = useCarreraStore((s) => s.setEstado)
  const estados = useCarreraStore((s) => s.estados)
  const estadosSimulados = useCarreraStore((s) => s.estadosSimulados)
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const simularEstado = useCarreraStore((s) => s.simularEstado)

  if (!selectedMateria) return null
  const materia = materiasMap.get(selectedMateria)
  if (!materia) return null

  const getEstado = (id: string): EstadoMateria => {
    if (modoSimulacion && id in estadosSimulados) return estadosSimulados[id]
    return estados[id] ?? 'pendiente'
  }

  const estado = getEstado(materia.id)
  const habilita = materias.filter((m) =>
    m.requiereCursadas.includes(materia.id) || m.requiereAprobadas.includes(materia.id)
  )

  const handleSetEstado = (newEstado: EstadoMateria) => {
    if (modoSimulacion) {
      simularEstado(materia.id, newEstado)
    } else {
      setEstado(materia.id, newEstado)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-surface border-l border-border z-50 overflow-y-auto animate-slide-in">
        <div className="p-8">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-6 right-6 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>

          <span className="font-mono text-xs text-text-tertiary">{materia.codigo}</span>
          <h2 className="text-xl font-normal tracking-tight mt-1 text-text-primary leading-snug">
            {materia.nombre}
          </h2>

          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-sm border border-border text-text-secondary">
              Nivel {materia.nivel}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-sm border border-border text-text-secondary">
              {materia.tipo === 'A' ? 'Anual' : 'Cuatrimestral'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-sm border border-border text-text-secondary">
              {materia.horas}hs semanales
            </span>
          </div>

          <div className="mt-8">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Estado
            </label>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {estadoOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSetEstado(opt.value)}
                  className={`py-2.5 px-3 text-sm rounded-sm border-2 font-medium transition-all ${
                    estado === opt.value
                      ? `${opt.color} bg-background`
                      : 'border-transparent bg-background text-text-secondary hover:border-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {(materia.requiereCursadas.length > 0 || materia.requiereAprobadas.length > 0) && (
            <div className="mt-8">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3">
                Requisitos
              </h3>
              {materia.requiereCursadas.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] text-text-tertiary mb-2">Tener cursadas</p>
                  <ul className="space-y-1.5">
                    {materia.requiereCursadas.map((reqId) => {
                      const req = materiasMap.get(reqId)
                      if (!req) return null
                      const reqEstado = getEstado(reqId)
                      const cumple = reqEstado === 'cursando' || reqEstado === 'regularizada' || reqEstado === 'aprobada'
                      return (
                        <li key={reqId} className="flex items-center gap-2 text-sm">
                          <span className={cumple ? 'text-estado-aprobada' : 'text-text-tertiary'}>
                            {cumple ? '✓' : '○'}
                          </span>
                          <span className={cumple ? 'text-text-primary' : 'text-text-secondary'}>
                            {req.nombreCorto}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {materia.requiereAprobadas.length > 0 && (
                <div>
                  <p className="text-[11px] text-text-tertiary mb-2">Tener aprobadas</p>
                  <ul className="space-y-1.5">
                    {materia.requiereAprobadas.map((reqId) => {
                      const req = materiasMap.get(reqId)
                      if (!req) return null
                      const cumple = getEstado(reqId) === 'aprobada'
                      return (
                        <li key={reqId} className="flex items-center gap-2 text-sm">
                          <span className={cumple ? 'text-estado-aprobada' : 'text-text-tertiary'}>
                            {cumple ? '✓' : '○'}
                          </span>
                          <span className={cumple ? 'text-text-primary' : 'text-text-secondary'}>
                            {req.nombreCorto}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {habilita.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3">
                Habilita ({habilita.length} materias)
              </h3>
              <ul className="space-y-1.5">
                {habilita.map((m) => (
                  <li key={m.id} className="text-sm text-text-secondary">
                    <span className="text-text-tertiary mr-2">→</span>
                    {m.nombreCorto}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
