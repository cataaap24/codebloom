# CodeBloom - TODO

## Setup & Base
- [x] Configurar esquema de base de datos (cursos, tareas, notas, estadísticas, jardín)
- [x] Aplicar migraciones SQL
- [x] Configurar estilos globales pastel con tipografía Nunito
- [x] Configurar paleta de colores: lavanda, rosa suave, beige, azul cielo

## Backend (tRPC Routers)
- [x] Router de cursos: CRUD completo (nombre, descripción, categoría, progreso, estado)
- [x] Router de tareas: CRUD con etiquetas, prioridad, fecha límite, estado
- [x] Router de notas/snippets: CRUD con soporte de texto enriquecido y etiquetado por curso
- [x] Router de estadísticas: horas acumuladas, racha de días, cursos completados
- [x] Router de jardín digital: flores por curso completado
- [x] Router de sesiones de estudio: registro de tiempo activo
- [x] Router de calendario: eventos y sesiones semanales

## Frontend - Layout
- [x] Configurar DashboardLayout con sidebar de navegación pastel
- [x] Sidebar con íconos outline y navegación entre módulos
- [x] Header con nombre de usuario y avatar
- [x] Diseño responsive mobile-friendly

## Frontend - Páginas
- [x] Dashboard principal: resumen de progreso, tareas pendientes, logros recientes
- [x] Página de Cursos: lista con tarjetas, CRUD completo, barra de progreso
- [x] Página de Tareas: lista filtrable por etiqueta/prioridad, checkbox animado
- [x] Página de Calendario semanal: visualización de sesiones y fechas de entrega
- [x] Página de Notas/Snippets: editor con etiquetado por curso
- [x] Página de Estadísticas: gráficos de horas, racha, cursos completados
- [x] Jardín Digital: flores animadas por curso completado

## Funcionalidades Especiales
- [x] Animación de flor creciendo al completar un curso
- [x] Racha de días activos calculada desde sesiones reales
- [x] Horas acumuladas desde registro de sesiones de estudio
- [x] Estadísticas reflejan datos reales de uso
- [x] Microinteracciones suaves en todos los elementos interactivos
- [x] Notificación toast al completar curso / tarea

## Tests
- [x] Tests para router de cursos
- [x] Tests para router de tareas
- [x] Tests para router de estadísticas


## Cambios Solicitados - Iteración 2
- [x] Agregar campo courseLink a tabla de cursos en BD
- [x] Actualizar schema y generar migración
- [x] Agregar input de link en formulario de cursos
- [x] Rediseñar página de Cursos con estilo inspirado en notas (colores pastel)
- [x] Mostrar link como botón/icono en tarjeta de curso
- [x] Filtrar jardín digital para mostrar solo cursos completados (ya estaba implementado)
- [x] Tests para nuevo campo courseLink (14 tests pasando: validación URL, mock verification, casos opcionales)


## Autocompletado Inteligente de Cursos - Iteración 3
- [x] Crear endpoint backend para extraer metadatos de URL (título, descripción, imagen)
- [x] Implementar scraping de Open Graph y meta tags
- [x] Agregar router tRPC para courses.extractMetadata
- [x] Implementar debounce en input courseLink del formulario
- [x] Autocompletar título si está vacío
- [x] Autocompletar descripción si está vacía
- [x] Mostrar loading state mientras se extrae metadata
- [x] Manejar errores de URLs inválidas o no accesibles
- [x] Tests para endpoint de extracción de metadatos (14 tests pasando)


## Iteración 4 - Mejoras Visuales y Funcionalidades
- [x] Arreglar el link de cursos (validación URL flexible) (ExternalLink button)
- [x] Agregar animación de resaltado en campos autocompletados
- [x] Crear tabla de public_gardens en BD
- [x] Endpoint para generar enlace público del jardín
- [ ] Página pública para ver jardín compartido
- [x] Botón "Compartir" en página del jardín
- [ ] Crear tabla de reminders en BD
- [ ] Endpoint para crear recordatorios automáticos
- [ ] Notificaciones para tareas con fecha límite en 24h
- [ ] Fondo gradiente pastel en jardín digital
- [ ] Agregar cielo con nubes animadas
- [ ] Agregar sol animado
- [ ] Mostrar contador de flores
- [ ] Fondos pastel coloreados para notas
- [ ] Selector de color pastel en notas
