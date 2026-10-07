# Bitácora de cambios — Reserva Inglés

Este documento conserva el historial de las modificaciones solicitadas para el
proyecto. Las entradas describen lo que se hizo, incluyendo cambios que después
fueron revertidos. Para cada trabajo nuevo, agregar una entrada al final sin
eliminar las anteriores.

## 2026-10-06 — Creación inicial de esta bitácora

**Módulo:** Documentación.

**Archivo agregado:** `BITACORA.md`.

**Cambios realizados:**

- Se creó la bitácora persistente en la raíz del proyecto.
- Se añadió una plantilla para registrar trabajos futuros.

**Estado:** Correcto.

1. Corrección y preparación del proyecto para ejecución en Expo Go

   Se corrigieron errores de navegación, imports y sintaxis que impedían ejecutar correctamente la aplicación.
   Se agregaron las pantallas de Perfil y Reservas y se conectaron con el sistema de persistencia.
   Se ajustó el flujo de registro inicial y la gestión de reservas, incluyendo la detección de reservas duplicadas.
   Se verificó que los bundles de Android e iOS fueran generados correctamente mediante Metro.

2. Implementación del dominio y almacenamiento de reservas
   Se creó la estructura base para gestionar las reservas y la información de los estudiantes.
   Se implementaron funciones para registrar perfiles, crear y cancelar reservas, validar duplicados y calcular los cupos disponibles.
   Se incorporó almacenamiento local para conservar la información y recuperación ante datos antiguos o corruptos.
   Se realizaron pruebas básicas de las funciones principales, confirmando su correcto funcionamiento antes de integrarlas con las pantallas.

## Plantilla para registrar cambios futuros

Agregar una copia de este formato al final del archivo por cada nueva entrega:

### AAAA-MM-DD — Título del cambio

**Módulo:**

**Archivos modificados o agregados:**

- `ruta/al/archivo`

**Cambios realizados:**

- **Problemas encontrados:**

- Ninguno / describir los problemas detectados.

**Solución aplicada:**

- **Validación:**

- **Estado:** Correcto / Pendiente / Revertido.
