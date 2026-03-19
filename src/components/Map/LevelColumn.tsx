import { type Materia } from '../../types/materia'
import { SubjectCard } from './SubjectCard'

interface LevelColumnProps {
  nivel: number
  nombre: string
  materias: Materia[]
}

export function LevelColumn({ nombre, materias }: LevelColumnProps) {
  return (
    <div className="flex flex-col">
      <h2 className="text-sm font-bold text-center py-2 mb-3 border-b border-gray-200 dark:border-gray-700 dark:text-gray-300 sticky top-0 bg-gray-50 dark:bg-[#1a1a2e] z-10">
        {nombre}
      </h2>
      <div className="flex flex-col gap-3">
        {materias.map((m) => (
          <SubjectCard key={m.id} materia={m} />
        ))}
      </div>
    </div>
  )
}
