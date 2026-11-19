# CultivaUP – Sistema de gestión del huerto universitario

Sistema web para administrar el huerto universitario de la UPSRJ (Grupo ISW-28). Es el sistema sobre el que se documenta el plan de mantenimiento de software.

## Módulos

- Panel con indicadores, alertas y gráficas
- Monitoreo en vivo de humedad y temperatura (lecturas simuladas)
- Cultivos, riegos, cosechas y observaciones
- Sensores y lecturas
- Alertas con umbrales configurables
- Calendario de actividades
- Tareas asignadas
- Inventario de insumos
- Solicitudes de cambio (correctivo, preventivo, adaptativo y perfectivo)
- Reporte por cultivo
- Usuarios, estado del sistema (respaldo y restauración) y bitácora de auditoría

## Roles

| Rol | Permisos |
|---|---|
| Administrador | Acceso completo, incluye usuarios, estado del sistema y bitácora |
| Encargado | Alta, edición y baja en los módulos operativos |
| Consulta | Solo lectura |

## Usuarios de prueba

Contraseña para todos: `Cultiva2026!`

| Correo | Rol |
|---|---|
| luis@cultivaup.demo | Administrador |
| rafael@cultivaup.demo | Encargado |
| daniel@cultivaup.demo | Consulta |

## Tecnologías

Versión actual: 1.1. HTML, CSS y JavaScript sin dependencias. Alojado como Static Site en Render.

## Pruebas

`node pruebas.js index.html` ejecuta 16 casos automatizados (requiere Node.js). Los resultados de la v1.0 y la v1.1 están en `resultados_pruebas.txt`.

## Nota

Los datos se guardan en el `localStorage` del navegador, por lo que cada equipo conserva su propia copia. Desde "Estado del sistema" se puede descargar y restaurar un respaldo.

## Documentación

- Diagrama entidad-relación (`ER_CultivaUP (1).png`)
- Plan de Mantenimiento (`Plan_Mantenimiento_CultivaUP (1) (1).pdf`)
