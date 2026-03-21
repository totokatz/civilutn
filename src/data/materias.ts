import { type Materia } from '../types/materia'

export const materias: Materia[] = [
  // === PRIMER NIVEL (8 materias) ===
  { id: 'am1', codigo: '95-0702', nombre: 'Análisis Matemático I', nombreCorto: 'Análisis Mat. I', nivel: 1, horas: 5, tipo: 'A', requiereCursadas: [], requiereAprobadas: [] },
  { id: 'aga', codigo: '95-0701', nombre: 'Álgebra y Geometría Analítica', nombreCorto: 'Álgebra y Geom.', nivel: 1, horas: 5, tipo: 'A', requiereCursadas: [], requiereAprobadas: [] },
  { id: 'iys', codigo: '95-1604', nombre: 'Ingeniería y Sociedad', nombreCorto: 'Ing. y Sociedad', nivel: 1, horas: 2, tipo: 'A', requiereCursadas: [], requiereAprobadas: [] },
  { id: 'ic1', codigo: '95-0220', nombre: 'Ingeniería Civil I', nombreCorto: 'Ing. Civil I', nivel: 1, horas: 3, tipo: 'A', requiereCursadas: [], requiereAprobadas: [] },
  { id: 'sr', codigo: '95-1601', nombre: 'Sistemas de Representación', nombreCorto: 'Sist. Represent.', nivel: 1, horas: 3, tipo: 'A', requiereCursadas: [], requiereAprobadas: [] },
  { id: 'qg', codigo: '95-1407', nombre: 'Química General', nombreCorto: 'Química Gral.', nivel: 1, horas: 5, tipo: 'A', requiereCursadas: [], requiereAprobadas: [] },
  { id: 'f1', codigo: '95-0605', nombre: 'Física I', nombreCorto: 'Física I', nivel: 1, horas: 5, tipo: 'A', requiereCursadas: [], requiereAprobadas: [] },
  { id: 'fi', codigo: '95-0299', nombre: 'Fundamentos de Informática', nombreCorto: 'Fund. Informát.', nivel: 1, horas: 2, tipo: 'A', requiereCursadas: [], requiereAprobadas: [] },

  // === SEGUNDO NIVEL (8 materias) ===
  { id: 'am2', codigo: '95-0703', nombre: 'Análisis Matemático II', nombreCorto: 'Análisis Mat. II', nivel: 2, horas: 5, tipo: 'A', requiereCursadas: ['am1', 'aga'], requiereAprobadas: [] },
  { id: 'est', codigo: '95-0221', nombre: 'Estabilidad', nombreCorto: 'Estabilidad', nivel: 2, horas: 5, tipo: 'A', requiereCursadas: ['am1', 'aga', 'sr', 'f1', 'fi'], requiereAprobadas: [] },
  { id: 'ic2', codigo: '95-0222', nombre: 'Ingeniería Civil II (E.I.)', nombreCorto: 'Ing. Civil II', nivel: 2, horas: 3, tipo: 'A', requiereCursadas: ['iys', 'ic1', 'sr', 'fi'], requiereAprobadas: [] },
  { id: 'tm', codigo: '95-0297', nombre: 'Tecnología de los Materiales', nombreCorto: 'Tec. Materiales', nivel: 2, horas: 4, tipo: 'A', requiereCursadas: ['am1', 'sr', 'qg', 'f1'], requiereAprobadas: [] },
  { id: 'f2', codigo: '95-0606', nombre: 'Física II', nombreCorto: 'Física II', nivel: 2, horas: 5, tipo: 'A', requiereCursadas: ['am1', 'f1'], requiereAprobadas: [] },
  { id: 'pye', codigo: '95-0704', nombre: 'Probabilidad y Estadística', nombreCorto: 'Prob. y Estad.', nivel: 2, horas: 3, tipo: 'A', requiereCursadas: ['am1', 'aga'], requiereAprobadas: [] },
  { id: 'ing1', codigo: '95-1602', nombre: 'Inglés I', nombreCorto: 'Inglés I', nivel: 2, horas: 4, tipo: 'C', requiereCursadas: ['iys'], requiereAprobadas: [] },
  { id: 'ing2', codigo: '95-1603', nombre: 'Inglés II', nombreCorto: 'Inglés II', nivel: 2, horas: 4, tipo: 'C', requiereCursadas: ['ing1'], requiereAprobadas: ['iys', 'ic1'] },

  // === TERCER NIVEL (9 materias) ===
  { id: 'rm', codigo: '95-0224', nombre: 'Resistencia de Materiales', nombreCorto: 'Resist. Mater.', nivel: 3, horas: 4, tipo: 'A', requiereCursadas: ['est'], requiereAprobadas: ['am1', 'aga', 'f1', 'fi'] },
  { id: 'th', codigo: '95-0244', nombre: 'Tecnología del Hormigón', nombreCorto: 'Tec. Hormigón', nivel: 3, horas: 2, tipo: 'A', requiereCursadas: ['tm', 'pye', 'ing1'], requiereAprobadas: ['am1', 'aga', 'qg', 'f1'] },
  { id: 'tc', codigo: '95-0227', nombre: 'Tecnología de la Construcción', nombreCorto: 'Tec. Construcc.', nivel: 3, horas: 6, tipo: 'A', requiereCursadas: ['est', 'ic2', 'tm', 'ing1'], requiereAprobadas: ['am1', 'aga', 'ic1', 'sr', 'qg', 'f1', 'fi'] },
  { id: 'geo', codigo: '95-0228', nombre: 'Geotopografía', nombreCorto: 'Geotopografía', nivel: 3, horas: 4, tipo: 'A', requiereCursadas: ['am2', 'ic2', 'f2', 'pye'], requiereAprobadas: ['am1', 'aga', 'ic1', 'sr', 'f1'] },
  { id: 'hga', codigo: '95-0225', nombre: 'Hidráulica General y Aplicada', nombreCorto: 'Hidráulica Gral.', nivel: 3, horas: 5, tipo: 'A', requiereCursadas: ['am2', 'est', 'ic2', 'f2', 'pye'], requiereAprobadas: ['am1', 'aga', 'sr', 'f1', 'fi'] },
  { id: 'iea', codigo: '95-0296', nombre: 'Instalaciones Eléctricas y Acústicas', nombreCorto: 'Inst. Eléc/Acús.', nivel: 3, horas: 2, tipo: 'A', requiereCursadas: ['ic2', 'tm', 'f2'], requiereAprobadas: ['am1', 'aga', 'ic1', 'sr', 'qg', 'f1'] },
  { id: 'itm', codigo: '95-0294', nombre: 'Instalaciones Termomecánicas', nombreCorto: 'Inst. Termomec.', nivel: 3, horas: 2, tipo: 'A', requiereCursadas: ['ic2', 'tm', 'f2'], requiereAprobadas: ['am1', 'aga', 'ic1', 'sr', 'qg', 'f1'] },
  { id: 'eco', codigo: '95-0309', nombre: 'Economía', nombreCorto: 'Economía', nivel: 3, horas: 3, tipo: 'A', requiereCursadas: ['ic2', 'pye', 'ing1'], requiereAprobadas: ['am1', 'aga', 'iys', 'ic1', 'fi'] },
  { id: 'il', codigo: '95-0298', nombre: 'Ingeniería Legal', nombreCorto: 'Ing. Legal', nivel: 3, horas: 3, tipo: 'A', requiereCursadas: ['am2', 'ic2', 'pye', 'ing1'], requiereAprobadas: ['am1', 'aga', 'iys', 'ic1', 'fi'] },

  // === CUARTO NIVEL (8 materias) ===
  { id: 'ca', codigo: '95-0295', nombre: 'Cálculo Avanzado', nombreCorto: 'Cálculo Avanz.', nivel: 4, horas: 2, tipo: 'A', requiereCursadas: ['am2', 'est', 'tm', 'pye'], requiereAprobadas: ['am1', 'aga', 'sr', 'f1', 'fi'] },
  { id: 'gt', codigo: '95-0230', nombre: 'Geotecnia', nombreCorto: 'Geotecnia', nivel: 4, horas: 5, tipo: 'A', requiereCursadas: ['rm', 'th', 'tc', 'geo', 'hga'], requiereAprobadas: ['am2', 'est', 'ic2', 'tm', 'f2', 'pye'] },
  { id: 'isg', codigo: '95-0247', nombre: 'Instalaciones Sanitarias y de Gas', nombreCorto: 'Inst. Sanit/Gas', nivel: 4, horas: 3, tipo: 'A', requiereCursadas: ['tc', 'geo', 'hga', 'eco'], requiereAprobadas: ['sr', 'qg', 'f1', 'fi', 'tm'] },
  { id: 'dapu', codigo: '95-0293', nombre: 'Diseño Arquitectónico, Planeamiento y Urbanismo (E.I.)', nombreCorto: 'Diseño Arq./Urb.', nivel: 4, horas: 5, tipo: 'A', requiereCursadas: ['tc', 'geo', 'iea', 'itm', 'eco', 'ing2'], requiereAprobadas: ['est', 'ic2', 'tm', 'ing1'] },
  { id: 'ae1', codigo: '95-0226', nombre: 'Análisis Estructural I', nombreCorto: 'Anál. Estruc. I', nivel: 4, horas: 5, tipo: 'A', requiereCursadas: ['rm', 'th'], requiereAprobadas: ['am2', 'est', 'ic2', 'pye'] },
  { id: 'eh', codigo: '95-0229', nombre: 'Estructuras de Hormigón', nombreCorto: 'Estruc. Hormigón', nivel: 4, horas: 5, tipo: 'A', requiereCursadas: ['rm', 'th', 'tc', 'geo', 'ing2'], requiereAprobadas: ['am2', 'est', 'ic2', 'tm', 'f2', 'pye'] },
  { id: 'hoh', codigo: '95-0287', nombre: 'Hidrología y Obras Hidráulicas', nombreCorto: 'Hidrol. y Obras', nivel: 4, horas: 4, tipo: 'A', requiereCursadas: ['rm', 'tc', 'geo', 'hga', 'eco', 'ing2'], requiereAprobadas: ['am2', 'est', 'ic2', 'tm', 'f2', 'pye'] },
  { id: 'vc1', codigo: '95-0290', nombre: 'Vías de Comunicación I', nombreCorto: 'Vías Com. I', nivel: 4, horas: 4, tipo: 'A', requiereCursadas: ['th', 'tc', 'geo'], requiereAprobadas: ['am2', 'est', 'ic2', 'tm', 'pye', 'ing1'] },

  // === QUINTO NIVEL (8 materias) ===
  { id: 'cmm', codigo: '95-0235', nombre: 'Construcciones Metálicas y de Madera', nombreCorto: 'Const. Met/Mad.', nivel: 5, horas: 4, tipo: 'A', requiereCursadas: ['ca', 'ae1'], requiereAprobadas: ['rm', 'th', 'tc', 'geo'] },
  { id: 'cim', codigo: '95-0292', nombre: 'Cimentaciones', nombreCorto: 'Cimentaciones', nivel: 5, horas: 3, tipo: 'A', requiereCursadas: ['ca', 'gt', 'ae1', 'eh', 'hoh'], requiereAprobadas: ['rm', 'th', 'tc', 'geo', 'hga'] },
  { id: 'is', codigo: '95-0291', nombre: 'Ingeniería Sanitaria', nombreCorto: 'Ing. Sanitaria', nivel: 5, horas: 3, tipo: 'A', requiereCursadas: ['gt', 'isg', 'hoh'], requiereAprobadas: ['th', 'tc', 'geo', 'hga', 'ing2'] },
  { id: 'oco', codigo: '95-0234', nombre: 'Organización y Conducción de Obras', nombreCorto: 'Org. y Cond. Obras', nivel: 5, horas: 5, tipo: 'A', requiereCursadas: ['gt', 'isg', 'dapu', 'eh', 'hoh'], requiereAprobadas: ['th', 'tc', 'geo', 'hga', 'iea', 'itm', 'eco', 'ing2'] },
  { id: 'ae2', codigo: '95-0231', nombre: 'Análisis Estructural II', nombreCorto: 'Anál. Estruc. II', nivel: 5, horas: 5, tipo: 'A', requiereCursadas: ['ca', 'gt', 'ae1', 'eh', 'hoh'], requiereAprobadas: ['rm', 'th', 'tc', 'geo', 'ing2'] },
  { id: 'vc2', codigo: '95-0288', nombre: 'Vías de Comunicación II', nombreCorto: 'Vías Com. II', nivel: 5, horas: 4, tipo: 'A', requiereCursadas: ['gt', 'eh', 'hoh', 'il', 'vc1'], requiereAprobadas: ['rm', 'th', 'tc', 'geo', 'hga', 'eco'] },
  { id: 'gads', codigo: '--', nombre: 'Gestión Ambiental y Desarrollo Sustentable', nombreCorto: 'Gestión Ambient.', nivel: 5, horas: 3, tipo: 'A', requiereCursadas: ['gt', 'dapu', 'hoh', 'il'], requiereAprobadas: ['hga', 'eco', 'ing2'] },
  { id: 'pf', codigo: '95-0289', nombre: 'Proyecto Final (E.I.)', nombreCorto: 'Proyecto Final', nivel: 5, horas: 2, tipo: 'A', requiereCursadas: ['gt', 'isg', 'dapu', 'ae1', 'eh', 'hoh', 'il'], requiereAprobadas: ['ing1', 'rm', 'th', 'tc', 'geo', 'hga', 'iea', 'itm', 'eco', 'ing2'], esProyectoFinal: true },

  // === ELECTIVAS ===
  // Perfil Ambiental
  { id: 'e_pus', codigo: '95-0280', nombre: 'Planificación Urbana Sustentable', nombreCorto: 'Plan. Urbana Sust.', nivel: 6, horas: 3, tipo: 'A', requiereCursadas: ['dapu', 'eh'], requiereAprobadas: ['tc', 'th', 'rm'], esElectiva: true, perfilElectiva: ['ambiental', 'construcciones'] },
  { id: 'e_er', codigo: '95-0272', nombre: 'Energías Renovables', nombreCorto: 'Energías Renov.', nivel: 6, horas: 4, tipo: 'A', requiereCursadas: ['dapu'], requiereAprobadas: ['am2', 'itm'], esElectiva: true, perfilElectiva: ['ambiental'] },
  { id: 'e_csa', codigo: '--', nombre: 'Contaminación y Saneamiento Ambiental', nombreCorto: 'Contam. y Sanea.', nivel: 6, horas: 4, tipo: 'C', requiereCursadas: ['hoh'], requiereAprobadas: ['il'], esElectiva: true, perfilElectiva: ['ambiental'] },
  { id: 'e_gca', codigo: '--', nombre: 'Gestión y Calidad del Agua', nombreCorto: 'Gest. Calidad Agua', nivel: 6, horas: 4, tipo: 'C', requiereCursadas: ['isg', 'hoh'], requiereAprobadas: ['il'], esElectiva: true, perfilElectiva: ['ambiental'] },
  // Perfil Construcciones
  { id: 'e_pref', codigo: '95-0249', nombre: 'Prefabricación', nombreCorto: 'Prefabricación', nivel: 6, horas: 2, tipo: 'A', requiereCursadas: ['th', 'eh'], requiereAprobadas: ['tc'], esElectiva: true, perfilElectiva: ['construcciones'] },
  { id: 'e_eas', codigo: '95-0271', nombre: 'Estructuras Antisísmicas', nombreCorto: 'Estruc. Antisísm.', nivel: 6, horas: 6, tipo: 'C', requiereCursadas: ['ae2'], requiereAprobadas: ['ae1', 'eh'], esElectiva: true, perfilElectiva: ['construcciones'] },
  { id: 'e_ee', codigo: '95-0284', nombre: 'Estructuras Especiales', nombreCorto: 'Estruc. Especiales', nivel: 6, horas: 6, tipo: 'C', requiereCursadas: ['ae2'], requiereAprobadas: ['ae1', 'eh'], esElectiva: true, perfilElectiva: ['construcciones'] },
  { id: 'e_tgp', codigo: '95-0281', nombre: 'Túneles y Grandes Puentes', nombreCorto: 'Túneles y Puentes', nivel: 6, horas: 6, tipo: 'C', requiereCursadas: ['vc1', 'ae2', 'cim'], requiereAprobadas: ['hga', 'tc', 'th', 'gt'], esElectiva: true, perfilElectiva: ['construcciones'] },
  // Perfil Vías de Comunicación
  { id: 'e_ga', codigo: '95-0276', nombre: 'Geología Aplicada', nombreCorto: 'Geología Aplic.', nivel: 6, horas: 3, tipo: 'A', requiereCursadas: ['gt', 'eh'], requiereAprobadas: ['hga'], esElectiva: true, perfilElectiva: ['vias', 'hidraulica'] },
  { id: 'e_pvn', codigo: '95-0258', nombre: 'Puertos y Vías Navegables', nombreCorto: 'Puertos y Vías Nav.', nivel: 6, horas: 3, tipo: 'A', requiereCursadas: ['hga', 'gt', 'eh'], requiereAprobadas: ['geo'], esElectiva: true, perfilElectiva: ['vias', 'hidraulica'] },
  { id: 'e_fc', codigo: '95-0256', nombre: 'Ferrocarriles', nombreCorto: 'Ferrocarriles', nivel: 6, horas: 2, tipo: 'A', requiereCursadas: ['gt', 'vc1'], requiereAprobadas: ['ic2', 'rm', 'geo'], esElectiva: true, perfilElectiva: ['vias'] },
  { id: 'e_cc', codigo: '95-0241', nombre: 'Construcción de Carreteras', nombreCorto: 'Constr. Carreteras', nivel: 6, horas: 4, tipo: 'C', requiereCursadas: ['vc1'], requiereAprobadas: ['th', 'hga', 'tc', 'gt'], esElectiva: true, perfilElectiva: ['vias'] },
  { id: 'e_aer', codigo: '95-0266', nombre: 'Aeropuertos', nombreCorto: 'Aeropuertos', nivel: 6, horas: 4, tipo: 'C', requiereCursadas: ['vc1'], requiereAprobadas: ['hga', 'tc', 'gt'], esElectiva: true, perfilElectiva: ['vias'] },
  // Perfil Hidráulica
  { id: 'e_pch', codigo: '95-0277', nombre: 'Presas y Centrales Hidroeléctricas', nombreCorto: 'Presas y Centr.', nivel: 6, horas: 2, tipo: 'A', requiereCursadas: ['hoh', 'gt'], requiereAprobadas: ['hga'], esElectiva: true, perfilElectiva: ['hidraulica'] },
  { id: 'e_gc', codigo: '95-0283', nombre: 'Gestión de Cuencas', nombreCorto: 'Gestión Cuencas', nivel: 6, horas: 8, tipo: 'C', requiereCursadas: ['hoh', 'gt'], requiereAprobadas: ['hga'], esElectiva: true, perfilElectiva: ['hidraulica'] },
]

export const materiasMap = new Map(materias.map(m => [m.id, m]))
export const materiasPorNivel = (nivel: number) => materias.filter(m => m.nivel === nivel && !m.esElectiva)
export const materiasElectivas = materias.filter(m => m.esElectiva)
export const totalMateriasObligatorias = materias.filter(m => !m.esElectiva).length
