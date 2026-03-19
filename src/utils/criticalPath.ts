import { type EstadoMateria } from '../types/materia'
import { materias, materiasMap } from '../data/materias'

export function computeCriticalPath(getEstado: (id: string) => EstadoMateria): string[] {
  const memo = new Map<string, string[]>()

  function longestFrom(id: string): string[] {
    if (memo.has(id)) return memo.get(id)!
    const estado = getEstado(id)
    if (estado === 'aprobada') { memo.set(id, []); return [] }
    const materia = materiasMap.get(id)
    if (!materia) { memo.set(id, [id]); return [id] }
    const allReqs = [...materia.requiereCursadas, ...materia.requiereAprobadas]
    const unmetReqs = allReqs.filter((reqId) => getEstado(reqId) !== 'aprobada')
    let longestChain: string[] = []
    for (const reqId of unmetReqs) {
      const chain = longestFrom(reqId)
      if (chain.length > longestChain.length) longestChain = chain
    }
    const result = [...longestChain, id]
    memo.set(id, result)
    return result
  }

  let criticalPath: string[] = []
  for (const materia of materias) {
    if (!materia.esElectiva) {
      const path = longestFrom(materia.id)
      if (path.length > criticalPath.length) criticalPath = path
    }
  }
  return criticalPath
}
