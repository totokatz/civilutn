import { useState } from 'react'
import { type PerfilElectiva } from '../../types/materia'
import { materiasElectivas } from '../../data/materias'
import { SubjectCard } from './SubjectCard'

const perfiles: { key: PerfilElectiva; label: string }[] = [
  { key: 'ambiental', label: 'Ambiental' },
  { key: 'construcciones', label: 'Construcciones' },
  { key: 'vias', label: 'Vías de Comunicación' },
  { key: 'hidraulica', label: 'Hidráulica' },
]

export function ElectivesSection() {
  const [expanded, setExpanded] = useState(false)
  const [activePerfil, setActivePerfil] = useState<PerfilElectiva>('ambiental')

  const filteredElectivas = materiasElectivas.filter((m) =>
    m.perfilElectiva?.includes(activePerfil)
  )

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-sm font-bold text-text dark:text-gray-300 mb-3">
        <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
        Electivas (11hs cátedra anuales)
      </button>
      {expanded && (
        <>
          <div className="flex gap-1 mb-4">
            {perfiles.map((p) => (
              <button key={p.key} onClick={() => setActivePerfil(p.key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${activePerfil === p.key ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {filteredElectivas.map((m) => (
              <SubjectCard key={m.id} materia={m} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
