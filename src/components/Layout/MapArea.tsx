import { useCarreraStore } from '../../store/useCarreraStore'
import { materiasPorNivel } from '../../data/materias'
import { LevelColumn } from '../Map/LevelColumn'
import { ConnectionLines } from '../Map/ConnectionLines'
import { SimulationBanner } from '../Panels/SimulationBanner'
import { SubjectDetail } from '../Panels/SubjectDetail'
import { ElectivesSection } from '../Map/ElectivesSection'
import { useRef } from 'react'

const LEVEL_NAMES = ['1er Nivel', '2do Nivel', '3er Nivel', '4to Nivel', '5to Nivel']

export function MapArea() {
  const modoSimulacion = useCarreraStore((s) => s.modoSimulacion)
  const selectedMateria = useCarreraStore((s) => s.selectedMateria)
  const mapRef = useRef<HTMLDivElement>(null)

  return (
    <main className="flex-1 overflow-auto relative">
      {modoSimulacion && <SimulationBanner />}
      <div ref={mapRef} className={`relative p-6 min-w-[1200px] ${modoSimulacion ? 'ring-2 ring-amber-400/50 ring-inset' : ''}`}>
        <ConnectionLines containerRef={mapRef} />
        <div className="grid grid-cols-5 gap-4 relative z-10">
          {[1, 2, 3, 4, 5].map((nivel, i) => (
            <LevelColumn key={nivel} nivel={nivel} nombre={LEVEL_NAMES[i]} materias={materiasPorNivel(nivel)} />
          ))}
        </div>
        <ElectivesSection />
      </div>
      {selectedMateria && <SubjectDetail />}
    </main>
  )
}
