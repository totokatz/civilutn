import { type EstadoMateria, type Disponibilidad } from '../types/materia'
import { materiasMap } from '../data/materias'

function cumpleCursada(estado: EstadoMateria): boolean {
  return estado === 'cursando' || estado === 'regularizada' || estado === 'aprobada'
}

function cumpleAprobada(estado: EstadoMateria): boolean {
  return estado === 'aprobada'
}

type EstadoGetter = (id: string) => EstadoMateria

/** Build an estado getter from raw store state */
export function makeGetEstado(
  estados: Record<string, EstadoMateria>,
  modoSimulacion: boolean,
  estadosSimulados: Record<string, EstadoMateria>
): EstadoGetter {
  return (id: string): EstadoMateria => {
    if (modoSimulacion && id in estadosSimulados) return estadosSimulados[id]
    return estados[id] ?? 'pendiente'
  }
}

/** Compute disponibilidad for a subject given a estado getter */
export function computeDisponibilidad(id: string, getEstado: EstadoGetter): Disponibilidad {
  const materia = materiasMap.get(id)
  if (!materia) return 'bloqueada'
  const estado = getEstado(id)
  if (estado !== 'pendiente') return 'disponible'
  const totalReqs = materia.requiereCursadas.length + materia.requiereAprobadas.length
  if (totalReqs === 0) return 'disponible'
  let faltantes = 0
  for (const reqId of materia.requiereCursadas) {
    if (!cumpleCursada(getEstado(reqId))) faltantes++
  }
  for (const reqId of materia.requiereAprobadas) {
    if (!cumpleAprobada(getEstado(reqId))) faltantes++
  }
  if (faltantes === 0) return 'disponible'
  if (faltantes <= 2) return 'casiDisponible'
  return 'bloqueada'
}

/** Compute requisite completion counts */
export function computeRequisitos(id: string, getEstado: EstadoGetter): { completados: number; total: number } {
  const materia = materiasMap.get(id)
  if (!materia) return { completados: 0, total: 0 }
  const total = materia.requiereCursadas.length + materia.requiereAprobadas.length
  let completados = 0
  for (const reqId of materia.requiereCursadas) {
    if (cumpleCursada(getEstado(reqId))) completados++
  }
  for (const reqId of materia.requiereAprobadas) {
    if (cumpleAprobada(getEstado(reqId))) completados++
  }
  return { completados, total }
}
