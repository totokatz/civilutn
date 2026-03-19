export type EstadoMateria = 'pendiente' | 'cursando' | 'regularizada' | 'aprobada'

export type Disponibilidad = 'disponible' | 'bloqueada' | 'casiDisponible'

export type TipoMateria = 'A' | 'C'

export type PerfilElectiva = 'ambiental' | 'construcciones' | 'vias' | 'hidraulica'

export interface Materia {
  id: string
  codigo: string
  nombre: string
  nombreCorto: string
  nivel: number
  horas: number
  tipo: TipoMateria
  requiereCursadas: string[]
  requiereAprobadas: string[]
  esElectiva?: boolean
  perfilElectiva?: PerfilElectiva[]
  esProyectoFinal?: boolean
}

export interface MateriaConEstado extends Materia {
  estado: EstadoMateria
  disponibilidad: Disponibilidad
  requisitosCompletados: number
  requisitosTotales: number
}
