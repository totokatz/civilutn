# Prompt Visual - App de Correlatividades Ingeniería Civil UTN (Plan 2023)

## Concepto General

Una aplicación web interactiva tipo "mapa de carrera" donde el estudiante de Ingeniería Civil puede marcar el estado de cada materia y visualizar en tiempo real cómo eso afecta todo su recorrido académico. La metáfora visual es un **tablero de flujo** (estilo mapa de metro/circuito) donde cada materia es un nodo y las correlatividades son conexiones entre nodos.

---

## Layout Principal

La pantalla se divide en **dos zonas**:

### Zona Izquierda (sidebar fijo, ~300px)
- **Panel de perfil del estudiante**: nombre opcional, cantidad de materias aprobadas/cursadas/pendientes mostrado con barras de progreso circulares.
- **Filtros rápidos**: botones toggle para mostrar/ocultar niveles, mostrar solo materias disponibles, mostrar solo un perfil de electivas.
- **Resumen estadístico**:
  - Materias aprobadas: X/41
  - Materias cursadas (regularizadas): X/41
  - Porcentaje de avance de la carrera (barra horizontal)
  - Horas cátedra acumuladas
- **Selector de modo**:
  - **Modo Normal**: el estudiante marca estados y ve el mapa.
  - **Modo "Qué pasa si..."** (simulación): el estudiante puede simular aprobar o regularizar una materia y ver en tiempo real qué se desbloquea sin guardar cambios.

### Zona Principal (centro-derecha, ocupa el resto)
El **mapa de materias** organizado como un flujo horizontal de izquierda a derecha, con 6 columnas correspondientes a los 6 niveles.

---

## El Mapa de Materias

### Disposición
- **6 columnas** verticales, una por nivel (1er año a 6to año), separadas con líneas sutiles y un header con el nombre del nivel.
- Debajo de las 6 columnas, una **sección expandible** con las electivas agrupadas por perfil (4 pestañas: Ambiental, Construcciones, Vías de Comunicación, Hidráulica).
- Cada materia es una **tarjeta/nodo rectangular** con bordes redondeados, tamaño proporcional a las horas cátedra (más horas = tarjeta ligeramente más alta).

### Anatomía de cada tarjeta de materia

```
┌──────────────────────────────┐
│ [código]           [A/C] [hs]│
│                              │
│   Nombre de la Materia       │
│                              │
│ ○ Pendiente                  │
│ ◉ Cursando                   │
│ ◉ Regularizada               │
│ ◉ Aprobada                   │
│                              │
│ [icono candado/check/reloj]  │
└──────────────────────────────┘
```

- **código**: el código UTN (ej: 95-0702)
- **A/C**: badge que indica Anual o Cuatrimestral
- **hs**: horas cátedra semanales
- **Estado** se selecciona con radio buttons o haciendo click en la tarjeta para ciclar entre estados.

### Sistema de Colores por Estado

| Estado | Color de fondo | Color de borde | Icono |
|--------|---------------|----------------|-------|
| **Aprobada** | Verde esmeralda (#10B981) suave | Verde oscuro | ✓ check |
| **Regularizada** (cursada) | Amarillo/ámbar (#F59E0B) suave | Ámbar oscuro | ◐ medio círculo |
| **Cursando actualmente** | Azul cielo (#3B82F6) suave | Azul oscuro | ▶ play |
| **Disponible para cursar** | Blanco con borde verde punteado | Verde punteado | 🔓 candado abierto |
| **Bloqueada** (no cumple requisitos) | Gris (#9CA3AF) muy suave | Gris | 🔒 candado cerrado |
| **Casi disponible** (le falta 1-2 correlativas) | Naranja pálido (#FED7AA) | Naranja | ⚡ rayo |

### Conexiones / Líneas de Correlatividad

Entre las tarjetas hay **líneas curvas estilo bezier** que conectan las materias con sus correlativas:
- **Línea sólida verde**: correlativa aprobada cumplida.
- **Línea sólida amarilla**: correlativa de cursada cumplida.
- **Línea punteada roja**: correlativa NO cumplida (bloquea).
- **Línea punteada naranja**: correlativa parcialmente cumplida (falta aprobar pero está cursada).

Las líneas se dibujan desde el borde derecho de la materia origen hasta el borde izquierdo de la materia destino. Cuando hay muchas conexiones, se agrupan con un sistema de rutas para evitar superposición.

Al hacer **hover sobre una materia**, se resaltan SOLO las líneas conectadas a ella (las demás se atenúan con opacidad baja), mostrando claramente:
- En verde/amarillo: las que ya cumple.
- En rojo: las que le faltan.

---

## Interacciones Clave

### 1. Click en una materia (Modo Normal)
Se abre un **panel lateral derecho deslizable** o **modal** con:
- Nombre completo, código, horas, nivel.
- **Estado actual** con selector desplegable para cambiarlo.
- **Sección "Para cursar necesitás"**: lista de correlativas con su estado (✓ cumplida / ✗ no cumplida), separadas en "Tener cursadas" y "Tener aprobadas".
- **Sección "Esta materia te habilita"**: lista de materias que se desbloquean (total o parcialmente) al aprobar/regularizar esta.
- **Indicador de impacto**: "Si aprobás esta materia, se desbloquean X materias nuevas".

### 2. Modo "Qué pasa si..." (Simulación)
Al activar este modo:
- El fondo del mapa cambia sutilmente (borde dorado o fondo con gradiente sutil) para indicar que estamos en simulación.
- Aparece un **banner superior**: "Modo Simulación — Los cambios no se guardan. Estás explorando posibilidades."
- El estudiante puede hacer **click en cualquier materia bloqueada o pendiente** y simular que la aprueba o regulariza.
- **En tiempo real**, todo el mapa se recalcula:
  - Materias que estaban bloqueadas y ahora se desbloquean hacen una **animación de destello/brillo** y cambian de gris a blanco con borde verde punteado.
  - Las líneas rojas se vuelven verdes con una animación de transición.
  - El contador de "materias disponibles para cursar" se actualiza.
- Se muestra un **diff visual** (mini resumen flotante): "Simulando aprobar [materia] → Se desbloquean: [lista de materias]".
- Botón "Limpiar simulación" para volver al estado real.
- Botón "Aplicar cambios" si decide confirmar la simulación como estado real.

### 3. Hover sobre materia bloqueada
Al pasar el mouse sobre una materia gris/bloqueada:
- Se muestra un **tooltip rico** que dice:
  - "Para cursar te falta: [lista de materias faltantes con su estado]"
  - "Camino más corto: Aprobá primero [materia A], luego regularizá [materia B]"
- Las materias que le faltan como correlativa se resaltan con un **borde pulsante rojo** en el mapa.

### 4. Vista de "Camino Crítico"
Un botón especial que calcula y resalta el **camino más largo/bloqueante** de la carrera del estudiante: la cadena de correlatividades más larga que queda por completar. Se dibuja como una línea gruesa dorada que atraviesa el mapa, mostrando al estudiante cuáles son las materias que NO puede posponer si quiere avanzar lo más rápido posible.

### 5. Vista de "Próximo Cuatrimestre"
Un panel que sugiere combinaciones óptimas de materias para cursar en el próximo período:
- Filtra solo las materias **disponibles para cursar**.
- Las agrupa en combinaciones posibles respetando carga horaria (con un slider de "horas máximas por semana").
- Cada combinación muestra cuántas materias nuevas se desbloquearían al completarla.
- Ordena por "impacto" (cuál combinación desbloquea más caminos futuros).

---

## Datos de Materias (Plan 2023 - CL 2025)

### PRIMER NIVEL (8 materias - 30hs)
| Nº | Código | Materia | Hs | Tipo | Cursadas | Aprobadas |
|----|--------|---------|-----|------|----------|-----------|
| 1 | 95-0702 | Análisis Matemático I | 5 | A | - | - |
| 2 | 95-0701 | Álgebra y Geometría Analítica | 5 | A | - | - |
| 3 | 95-1604 | Ingeniería y Sociedad | 2 | A | - | - |
| 4 | 95-0220 | Ingeniería Civil I | 3 | A | - | - |
| 5 | 95-1601 | Sistemas de Representación | 3 | A | - | - |
| 6 | 95-1407 | Química General | 5 | A | - | - |
| 7 | 95-0605 | Física I | 5 | A | - | - |
| 8 | 95-0299 | Fundamentos de Informática | 2 | A | - | - |

### SEGUNDO NIVEL (7 materias - 29hs + 2 ingleses)
| Nº | Código | Materia | Hs | Tipo | Para Cursar (Cursadas) | Para Cursar (Aprobadas) |
|----|--------|---------|-----|------|------------------------|------------------------|
| 9 | 95-0703 | Análisis Matemático II | 5 | A | Análisis Matemático I; Álgebra y Geometría Analítica | - |
| 10 | 95-0704 | Probabilidad y Estadística | 3 | A | Análisis Matemático I; Álgebra y Geometría Analítica | - |
| 11 | 95-0606 | Física II | 5 | A | Análisis Matemático I; Física I; Fundamentos de Informática | - |
| 12 | 95-0297 | Tecnología de los Materiales | 5 | A | Ingeniería y Sociedad; Ingeniería Civil I; Sistemas de Representación; Fundamentos de Informática; Química General; Física I | - |
| 13 | 95-0222 | Ingeniería Civil II (E.I.) | 3 | A | Análisis Matemático I; Sistemas de Representación; Química General; Física I | - |
| 14 | 95-0221 | Estabilidad | 5 | A | Análisis Matemático I; Álgebra y Geometría Analítica; Sistemas de Representación; Física I; Fundamentos de Informática | - |
| 25 | 95-0225 | Inglés I | 4 | C | Ingeniería y Sociedad | - |
| 29 | 95-1603 | Inglés II | 4 | C | Ingeniería y Sociedad; Ingeniería Civil I | Inglés I |

### TERCER NIVEL (9 materias - 31hs)
| Nº | Código | Materia | Hs | Tipo | Para Cursar (Cursadas) | Para Cursar (Aprobadas) |
|----|--------|---------|-----|------|------------------------|------------------------|
| 16 | 95-0294 | Resistencia de Materiales | 6 | A | Estabilidad; Análisis Matemático II; Ingeniería Civil II; Física II; Probabilidad y Estadística | Análisis Matemático I; Álgebra y Geometría Analítica; Sistemas de Representación; Física I; Fundamentos de Informática |
| 17 | 95-0296 | Tecnología del Hormigón | 4 | A | Ingeniería Civil II; Tecnología de los Materiales; Física II | Análisis Matemático I; Álgebra y Geometría Analítica; Ingeniería Civil I; Sistemas de Representación; Química General; Física I |
| 18 | 95-0224 | Tecnología de la Construcción | 5 | A | Ingeniería Civil II; Tecnología de los Materiales; Física II | Análisis Matemático I; Álgebra y Geometría Analítica; Ingeniería Civil I; Sistemas de Representación; Química General; Física I |
| 19 | 95-0244 | Geotopografía | 4 | A | Ingeniería Civil II; Probabilidad y Estadística; Inglés I | Análisis Matemático I; Álgebra y Geometría Analítica; Ingeniería y Sociedad; Ingeniería Civil I; Fundamentos de Informática |
| 20 | 95-0227 | Hidráulica General y Aplicada | 5 | A | Análisis Matemático II; Ingeniería Civil II; Probabilidad y Estadística; Inglés I | Análisis Matemático I; Álgebra y Geometría Analítica; Ingeniería y Sociedad; Ingeniería Civil I; Fundamentos de Informática |
| 22 | 95-0228 | Economía | 2 | A | Tecnología de los Materiales; Probabilidad y Estadística; Inglés I | Análisis Matemático I; Álgebra y Geometría Analítica; Ingeniería y Sociedad; Ingeniería Civil I; Fundamentos de Informática |
| 23 | 95-0309 | Instalaciones Eléctricas y Acústicas | 2 | A | Estabilidad; Tecnología de los Materiales; Probabilidad y Estadística; Inglés I; Análisis Matemático II; Ingeniería Civil II; Física II | Análisis Matemático I; Álgebra y Geometría Analítica; Sistemas de Representación; Física I; Fundamentos de Informática |
| 24 | 95-0298 | Instalaciones Termomecánicas | 3 | A | Estabilidad; Tecnología de los Materiales; Probabilidad y Estadística; Inglés I; Análisis Matemático II; Ingeniería Civil II; Física II | Análisis Matemático I; Álgebra y Geometría Analítica; Sistemas de Representación; Física I; Fundamentos de Informática |
| 32 | 95-0225 | Ingeniería Legal | 3 | A | Análisis Matemático II; Ingeniería Civil II; Probabilidad y Estadística; Inglés I | Análisis Matemático I; Álgebra y Geometría Analítica; Ingeniería y Sociedad; Ingeniería Civil I; Fundamentos de Informática |

### CUARTO NIVEL (7 materias - 33hs)
| Nº | Código | Materia | Hs | Tipo | Para Cursar (Cursadas) | Para Cursar (Aprobadas) |
|----|--------|---------|-----|------|------------------------|------------------------|
| 21 | 95-0287 | Vías de Comunicación I | 4 | A | Resistencia de Materiales; Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía; Hidráulica General y Aplicada; Economía; Inglés II | Análisis Matemático II; Estabilidad; Ingeniería Civil II; Tecnología de los Materiales; Física II; Probabilidad y Estadística |
| 26 | 95-0293 | Cálculo Avanzado | 5 | A | Análisis Matemático II; Estabilidad; Tecnología de los Materiales; Probabilidad y Estadística | Análisis Matemático I; Álgebra y Geometría Analítica; Sistemas de Representación; Física I; Fundamentos de Informática |
| 27 | 95-0247 | Geotecnia | 5 | A | Resistencia de Materiales; Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía; Hidráulica General y Aplicada | Análisis Matemático II; Estabilidad; Ingeniería Civil II; Tecnología de los Materiales; Física II; Probabilidad y Estadística |
| 28 | 95-0230 | Instalaciones Sanitarias y de Gas | 3 | A | Tecnología de la Construcción; Geotopografía; Hidráulica General y Aplicada; Economía | Tecnología de los Materiales; Sistemas de Representación; Química General; Física I; Fundamentos de Informática |
| 29 | 95-0290 | Diseño Arquitectónico, Planeamiento y Urbanismo (E.I.) | 5 | A | Tecnología de la Construcción; Geotopografía; Instalaciones Eléctricas y Acústicas; Instalaciones Termomecánicas; Economía; Inglés II | Estabilidad; Ingeniería Civil II; Tecnología de los Materiales; Inglés I |
| 30 | 95-0229 | Análisis Estructural I | 5 | A | Resistencia de Materiales; Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía; Inglés II | Análisis Matemático II; Estabilidad; Ingeniería Civil II; Tecnología de los Materiales; Física II; Probabilidad y Estadística |
| 31 | 95-0226 | Estructuras de Hormigón | 5 | A | Resistencia de Materiales; Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía | Análisis Matemático II; Estabilidad; Ingeniería Civil II; Tecnología de los Materiales; Probabilidad y Estadística; Inglés I |
| 37 | 95-0295 | Hidrología y Obras Hidráulicas | 2 | A | Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía | Análisis Matemático II; Estabilidad; Ingeniería Civil II; Tecnología de los Materiales; Probabilidad y Estadística; Inglés I |

### QUINTO NIVEL (8 materias - 29hs)
| Nº | Código | Materia | Hs | Tipo | Para Cursar (Cursadas) | Para Cursar (Aprobadas) |
|----|--------|---------|-----|------|------------------------|------------------------|
| 33 | 95-0231 | Construcciones Metálicas y de Madera | 5 | A | Cálculo Avanzado; Análisis Estructural I | Resistencia de Materiales; Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía |
| 34 | 95-0234 | Cimentaciones | 4 | A | Cálculo Avanzado; Geotecnia; Análisis Estructural I; Estructuras de Hormigón; Hidrología y Obras Hidráulicas | Resistencia de Materiales; Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía; Hidráulica General y Aplicada |
| 35 | 95-0291 | Ingeniería Sanitaria | 3 | A | Geotecnia; Instalaciones Sanitarias y de Gas; Hidrología y Obras Hidráulicas; Inglés II | Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía; Hidráulica General y Aplicada |
| 36 | 95-0292 | Análisis Estructural II | 5 | A | Cálculo Avanzado; Geotecnia; Análisis Estructural I; Estructuras de Hormigón; Hidrología y Obras Hidráulicas; Inglés II | Resistencia de Materiales; Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía; Hidráulica General y Aplicada |
| 38 | 95-0289 | Organización y Conducción de Obras | 5 | A | Geotecnia; Estructuras de Hormigón; Hidrología y Obras Hidráulicas; Ingeniería Legal; Vías de Comunicación I | Resistencia de Materiales; Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía; Hidráulica General y Aplicada; Economía |
| 39 | 95-0235 | Vías de Comunicación II | 3 | A | Geotecnia; Diseño Arquitectónico, Planeamiento y Urbanismo; Hidrología y Obras Hidráulicas; Ingeniería Legal | Hidráulica General y Aplicada; Economía; Inglés II |
| 40 | 95-0288 | Gestión Ambiental y Desarrollo Sustentable | 3 | A | Geotecnia; Instalaciones Sanitarias y de Gas; Diseño Arquitectónico, Planeamiento y Urbanismo; Análisis Estructural I; Estructuras de Hormigón; Hidrología y Obras Hidráulicas; Ingeniería Legal; Instalaciones Eléctricas y Acústicas; Instalaciones Termomecánicas; Economía; Inglés II | Inglés I; Resistencia de Materiales; Tecnología del Hormigón; Tecnología de la Construcción; Geotopografía; Hidráulica General y Aplicada |
| 41 | 95-0289 | Proyecto Final (E.I.) | 2 | A | (mismas correlativas que Gestión Ambiental) | (mismas correlativas que Gestión Ambiental). Para RENDIR: todas las demás aprobadas |

### ELECTIVAS (el estudiante elige materias sumando 11hs cátedra anuales / 22hs cuatrimestrales)

#### Perfil Ambiental
| Código | Materia | Hs | Tipo | Para Cursar (Cursadas) | Para Cursar (Aprobadas) |
|--------|---------|-----|------|------------------------|------------------------|
| 95-0280 | Planificación Urbana Sustentable | 3 | A | Diseño Arquitectónico; Estructuras de Hormigón | Tecnología de la Construcción; Tecnología del Hormigón; Resistencia de Materiales |
| 95-0272 | Energías Renovables | 4 | A | Diseño Arquitectónico; Análisis Matemático II | Instalaciones Termomecánicas |
| 95-0271 | Contaminación y Saneamiento Ambiental | 4 | C | Instalaciones Sanitarias y de Gas; Ingeniería Legal | Hidrología y Obras Hidráulicas; Hidráulica General y Aplicada; Geotecnia |
| -- | Gestión y Calidad del Agua | 4 | C | Hidrología y Obras Hidráulicas; Ingeniería Legal | Hidráulica General y Aplicada; Geotecnia |

#### Perfil Construcciones
| Código | Materia | Hs | Tipo | Para Cursar (Cursadas) | Para Cursar (Aprobadas) |
|--------|---------|-----|------|------------------------|------------------------|
| 95-0280 | Planificación Urbana Sustentable | 3 | A | Diseño Arquitectónico; Estructuras de Hormigón | Tecnología de la Construcción; Tecnología del Hormigón; Resistencia de Materiales |
| 95-0249 | Prefabricación | 2 | A | Tecnología del Hormigón; Tecnología de la Construcción; Estructuras de Hormigón | Análisis Estructural I |
| 95-0284 | Estructuras Especiales | 6 | C | Análisis Estructural II; Estructuras de Hormigón | Análisis Estructural I |
| 95-0281 | Túneles y Grandes Puentes | 6 | C | Vías de Comunicación I; Análisis Estructural II; Cimentaciones; Hidráulica General y Aplicada; Tecnología de la Construcción | Tecnología del Hormigón; Geotecnia |
| -- | Estructuras Antisísmicas | 3 | A | Análisis Estructural II; Estructuras de Hormigón | Análisis Estructural I |

#### Perfil Vías de Comunicación
| Código | Materia | Hs | Tipo | Para Cursar (Cursadas) | Para Cursar (Aprobadas) |
|--------|---------|-----|------|------------------------|------------------------|
| 95-0276 | Geología Aplicada | 3 | A | Geotecnia; Estructuras de Hormigón; Hidráulica General y Aplicada | - |
| 95-0258 | Puertos y Vías Navegables | 3 | A | Hidráulica General y Aplicada; Geotopografía; Geotecnia; Estructuras de Hormigón | - |
| 95-0256 | Ferrocarriles | 2 | A | Geotecnia; Vías de Comunicación I; Ingeniería Civil II | Resistencia de Materiales; Geotopografía |
| 95-0241 | Construcción de Carreteras | 4 | C | Vías de Comunicación I; Tecnología del Hormigón; Hidráulica General y Aplicada; Tecnología de la Construcción; Geotecnia | - |
| 95-0266 | Aeropuertos | 4 | C | Vías de Comunicación I; Hidráulica General y Aplicada; Tecnología de la Construcción; Geotecnia | - |

#### Perfil Hidráulica
| Código | Materia | Hs | Tipo | Para Cursar (Cursadas) | Para Cursar (Aprobadas) |
|--------|---------|-----|------|------------------------|------------------------|
| 95-0276 | Geología Aplicada | 3 | A | Geotecnia; Estructuras de Hormigón; Hidráulica General y Aplicada | - |
| 95-0258 | Puertos y Vías Navegables | 3 | A | Hidráulica General y Aplicada; Geotopografía; Geotecnia; Estructuras de Hormigón | - |
| 95-0277 | Presas y Centrales Hidroeléctricas | 2 | A | Hidrología y Obras Hidráulicas; Hidráulica General y Aplicada; Geotecnia | - |
| 95-0283 | Gestión de Cuencas | 8 | C | Hidrología y Obras Hidráulicas; Hidráulica General y Aplicada; Geotecnia | - |

---

## Detalles Visuales Específicos

### Animaciones
- Al cambiar el estado de una materia, las tarjetas afectadas hacen una **transición suave de color** (300ms ease).
- Las materias que se desbloquean hacen un **efecto de "pulse" verde** (un brillo que se expande y desaparece).
- Las líneas de correlatividad se animan como si "fluyera" energía por ellas al hover.
- En modo simulación, las materias simuladas tienen un **borde dorado parpadeante** sutil.

### Responsive
- En **desktop**: layout completo con sidebar + mapa horizontal.
- En **tablet**: sidebar se colapsa a un menú hamburguesa, el mapa permite scroll horizontal.
- En **mobile**: el mapa se reorganiza en formato **lista vertical por niveles** con acordeones expandibles, y las correlatividades se muestran como badges dentro de cada tarjeta en vez de líneas.

### Dark Mode
- Soporte completo con toggle en el sidebar.
- Los colores de estado se adaptan (tonos más oscuros de fondo, bordes más brillantes).
- Fondo del mapa en gris muy oscuro (#1a1a2e) con tarjetas en (#16213e).

### Persistencia
- El estado de las materias se guarda en **localStorage** para que al volver a abrir no se pierda nada.
- Opción de **exportar/importar** el estado como JSON (para compartir o hacer backup).

---

## Funcionalidades Avanzadas

### 1. "Desbloquea-meter" por materia
Cada materia bloqueada muestra una mini barra de progreso debajo que indica "cumplís X de Y requisitos". Así el estudiante ve de un vistazo cuáles están más cerca de desbloquearse.

### 2. Alertas inteligentes
- Si una materia es **anual y ya empezó** (basándose en la fecha actual): badge de "Inscripción cerrada" con fecha estimada de próxima apertura.
- Si una materia es **cuatrimestral**: indicar en qué cuatrimestre se puede cursar.

### 3. Búsqueda rápida
Un searchbar en el header del mapa que filtra y resalta la materia buscada, atenuando las demás.

### 4. Vista "Grafo completo"
Un toggle que muestra TODAS las conexiones de correlatividad a la vez (sin hover), como un grafo de red. Útil para ver la complejidad global y encontrar cuellos de botella.

### 5. Compartir estado
Botón que genera un **link/código** para compartir tu estado de carrera con compañeros o tutores.

---

## Regla especial: Proyecto Final
- Proyecto Final solo se puede **rendir** (aprobar el examen final) cuando TODAS las demás materias están aprobadas.
- Se debe mostrar con un tratamiento visual especial: tarjeta más grande, en la última posición, con un indicador tipo "X/40 materias aprobadas para rendir".
- La PPS (Práctica Profesional Supervisada - 150hs reloj) se muestra como un nodo separado debajo de Proyecto Final con los mismos requisitos de inscripción.

---

## Stack Tecnológico Sugerido
- **Framework**: React + TypeScript (o Next.js para SSR si se quiere SEO)
- **Visualización del grafo**: D3.js para las líneas curvas y animaciones, o React Flow para un approach más declarativo
- **Estilos**: Tailwind CSS para utility-first + CSS custom para animaciones
- **Estado**: Zustand o React Context para manejar el estado de materias
- **Persistencia**: localStorage + opción de export/import JSON
