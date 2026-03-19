import { useState } from 'react'
import { type PerfilElectiva } from '../../types/materia'
import { materiasElectivas } from '../../data/materias'
import { SubjectCard } from './SubjectCard'

const perfiles: { key: PerfilElectiva; label: string }[] = [
  { key: 'ambiental', label: 'Amb.' },
  { key: 'construcciones', label: 'Constr.' },
  { key: 'vias', label: 'Vías' },
  { key: 'hidraulica', label: 'Hidr.' },
]

export function ElectivesView() {
  const [activePerfil, setActivePerfil] = useState<PerfilElectiva>('ambiental')

  const filtered = materiasElectivas.filter((m) =>
    m.perfilElectiva?.includes(activePerfil)
  )

  return (
    <div className="w-[280px] shrink-0 flex flex-col">
      <div className="sticky top-0 bg-background/90 backdrop-blur-sm z-10 pb-3 pt-1 text-center border-b border-border/50 mb-4">
        <h2 className="text-sm font-medium tracking-tight text-text-primary">
          Electivas
        </h2>
        <p className="text-[11px] text-text-tertiary">11hs cátedra anuales</p>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {perfiles.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePerfil(p.key)}
            className={`px-2.5 py-1 text-[11px] rounded-sm transition-all ${
              activePerfil === p.key
                ? 'bg-text-primary text-white'
                : 'text-text-secondary hover:bg-border/30 border border-border'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((m) => (
          <SubjectCard key={m.id} materia={m} />
        ))}
      </div>
    </div>
  )
}
