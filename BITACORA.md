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

   **Fecha:** 2026-10-06.

   **Módulo:** Contexto de reservas, persistencia local, inicio de la aplicación y estado de almacenamiento.

3. Integración del Provider y estado de almacenamiento

Se integró el Provider de reservas con el sistema de almacenamiento local, permitiendo centralizar el perfil del estudiante, las reservas y el historial. También se adaptó el hook useReserva para trabajar con el nuevo contexto y se mantuvo la compatibilidad con la navegación existente. No se agregaron nuevas dependencias.

4. Implementación del estado de almacenamiento

Se agregó una capa para controlar el estado de lectura y recuperación de la información almacenada, incluyendo manejo de errores, reintentos y recuperación de datos anteriores o corruptos. La aplicación ahora espera a que el almacenamiento esté listo antes de mostrar las pantallas principales. La compilación en Metro para Android e iOS fue validada correctamente.

**Estado:** Correcto para la integración del Provider y el estado de almacenamiento; pendiente adaptar el contrato de detalle/reserva y finalizar la navegación en pasos siguientes.

## 2026-10-07 — Integración del estado de almacenamiento

**Módulo:** Persistencia local, contexto de reservas y flujo de arranque.

**Archivos modificados o agregados:**

- `App.js`
- `src/components/EstadoAlmacenamiento.js`
- `BITACORA.md`

**Cambios realizados:**

- Se integra la capa de `EstadoAlmacenamiento` en el árbol principal para controlar la carga, errores y recuperación de los datos almacenados.
- El arranque de la app espera a que el almacenamiento esté listo antes de mostrar la navegación principal.
- El flujo conserva la lógica del Provider de reservas y el manejo de recuperación ante datos corruptos o heredados.

**Problemas encontrados:**

- El punto anterior quedó centrado únicamente en el Provider, por lo que faltaba reencajar la capa del estado de almacenamiento sobre la app.

**Solución aplicada:**

- Se reintrodujo `EstadoAlmacenamiento` entre `ReservaProvider` y `RootNavigator` para cerrar la integración completa del siguiente paso.

**Validación:**

- Revisión del árbol de render y la lógica de carga del contexto de reservas.

**Estado:** Correcto.

## 2026-10-07 — Finalización estado de almacenamiento

**Módulo:** Persistencia local, recuperación y flujo de arranque.

**Archivos modificados o agregados:**

- `src/state/reservationStore.test.cjs`
- `package.json`
- `BITACORA.md`

**Cambios realizados:**

- Se añadieron pruebas automatizadas para la carga inicial, los errores de lectura y escritura, la recuperación de datos corruptos, la conservación del historial anterior y la reanudación de una eliminación interrumpida.
- Se comprobó que si falla la escritura del respaldo, los datos corruptos originales permanecen intactos y la operación devuelve un error explícito.
- Se comprobó que los fallos de almacenamiento se reporten explícitamente y que el estado no habilite operaciones hasta completar una lectura o recuperación satisfactoria.
- Se verificó que el respaldo conserva el contenido original antes de inicializar datos vacíos y que el historial legado queda sin asignación de propietario.
- Se verificó que la eliminación reanudable limpia únicamente las claves propias de la aplicación y conserva claves ajenas.

**Estado:** Correcto.

## 2026-10-07 — Preparación para Expo Go

**Módulo:** Navegación, detalles de clase y configuración de Expo.

**Archivos modificados o agregados:**

- `app.json`
- `package.json`
- `package-lock.json`
- `src/components/EstadoVacio.js`
- `src/screens/DetallesClase.js`
- `BITACORA.md`

**Cambios realizados:**

- Se configuró el nombre visible `Reserva Inglés`, un slug válido para Expo y los identificadores de Android e iOS.
- Se alinearon las versiones de `expo`, `expo-font` y `expo-splash-screen` ya existentes con las versiones esperadas por el SDK 57; no se añadieron dependencias directas nuevas.
- Se mantuvo el flujo de navegación de inicio, detalle, perfil y reservas integrado con el Provider y el almacenamiento local.

**Problemas encontrados:**

- La configuración de Expo conservaba el nombre y slug genéricos `React`.
- La comprobación de Expo detectó versiones de tres dependencias existentes por debajo de las recomendadas para el SDK.
- Una ruta de detalle sin clase válida podía dejar la pantalla vacía.

**Solución aplicada:**

- Se definió la identidad propia de la aplicación en Expo y los identificadores nativos estables.
- Se actualizaron solo dependencias que ya estaban declaradas y se sincronizó el lockfile.
- Se agregó una pantalla de recuperación contextual para el detalle inválido, sin instalar bibliotecas adicionales.

**Estado:** Correcto para la ejecución nativa con Expo Go; el dispositivo móvil debe estar en la misma red local que el equipo que ejecuta Metro.

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
