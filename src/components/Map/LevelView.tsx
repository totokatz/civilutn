import { type Materia } from '../../types/materia'
import { SubjectCard } from './SubjectCard'

interface LevelViewProps {
  nivel: number
  nombre: string
  subtitulo: string
  materias: Materia[]
}

export function LevelView({ nombre, subtitulo, materias }: LevelViewProps) {
  return (
    <div className="w-[280px] shrink-0 flex flex-col">
      <div className="sticky top-0 bg-background/90 backdrop-blur-sm z-10 pb-3 pt-1 text-center border-b border-border/50 mb-4">
        <h2 className="text-sm font-medium tracking-tight text-text-primary">
          {nombre}
        </h2>
        <p className="text-[11px] text-text-tertiary">{subtitulo}</p>
      </div>
      <div className="flex flex-col gap-3">
        {materias.map((m) => (
          <SubjectCard key={m.id} materia={m} />
        ))}
      </div>
    </div>
  )
}
