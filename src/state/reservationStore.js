const { crearDatosVacios, catalogoDisponible, prepararRegistro, prepararEdicionPerfil, prepararEliminacionPerfil, prepararEliminacionReserva, prepararReserva, validarDatos, validarHistorialAnterior, fallo } = require('./reservationDomain');
const CLAVE_DATOS = '@reservas_ingles:v1';
const CLAVE_ANTERIOR = '@reservas_ingles';
const PREFIJO_RESPALDO = `${CLAVE_DATOS}:respaldo:`;
// Diario mínimo: permite reanudar una eliminación autorizada si se interrumpe la app.
const MARCA_REINICIO = JSON.stringify({ version: 1, reinicioPendiente: true });
const esReinicioPendiente = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) &&
  v.version === 1 && v.reinicioPendiente === true && Object.keys(v).length === 2;

function congelar(valor) {
  if (valor && typeof valor === 'object' && !Object.isFrozen(valor)) {
    Object.values(valor).forEach(congelar);
    Object.freeze(valor);
  }
  return valor;
}
function createReservationStore({ storage, catalogo, niveles, ahora = () => new Date().toISOString() }) {
  let contador = 0;
  // Identificador local opaco, no criptográfico. La CC nunca forma parte del ID.
  const crearId = (tipo) => `${tipo}-${Date.now().toString(36)}-${(++contador).toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const listeners = new Set();
  let ocupado = false;
  let pendiente = null;
  let datos = congelar(crearDatosVacios());
  let snapshot = congelar({ datos, clases: catalogoDisponible(catalogo, datos.reservas), fase: 'cargando', guardando: false, error: null });
  function publicar(cambios) {
    snapshot = congelar({ ...snapshot, datos, clases: catalogoDisponible(catalogo, datos.reservas), ...cambios });
    listeners.forEach((l) => l());
  }
  async function cargar() {
    if (ocupado) return fallo('OCUPADO', 'Espera a que termine la operación actual.');
    ocupado = true;
    pendiente = null;
    try {
      publicar({ fase: 'cargando', error: null, guardando: false });
      let clave;
      let raw;
      // Solo fallos del transporte se clasifican como errores de lectura.
      try {
        const actual = await storage.getItem(CLAVE_DATOS);
        clave = actual === null ? CLAVE_ANTERIOR : CLAVE_DATOS;
        raw = actual === null ? await storage.getItem(CLAVE_ANTERIOR) : actual;
      } catch {
        publicar({ fase: 'errorLectura', error: 'No se pudo leer el almacenamiento. Los datos no se consideran vacíos y las acciones están bloqueadas. Reintenta la lectura.' });
        return fallo('LECTURA_FALLIDA', snapshot.error);
      }
      if (raw === null) {
        datos = congelar(crearDatosVacios());
        publicar({ fase: 'listo' });
        return { ok: true };
      }
      let valor;
      try { valor = JSON.parse(raw); } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        valor = undefined;
      }
      if (clave === CLAVE_DATOS && esReinicioPendiente(valor)) {
        datos = congelar(crearDatosVacios());
        return await completarReinicio();
      }
      const valido = clave === CLAVE_DATOS ? validarDatos(valor, catalogo, niveles) : validarHistorialAnterior(valor);
      if (!valido) {
        pendiente = { clave, raw };
        publicar({ fase: 'corrupto', error: 'Los datos guardados no tienen un formato válido. No se han cambiado. Puedes reintentar o guardar un respaldo antes de empezar de nuevo.' });
        return fallo('DATOS_CORRUPTOS', snapshot.error);
      }
      if (clave === CLAVE_ANTERIOR && valor.length > 0) {
        pendiente = { clave, raw, historial: valor };
        publicar({ fase: 'legado', error: 'Hay reservas de una versión anterior sin propietario. Puedes conservarlas como historial sin asignar e iniciar tu registro local.' });
        return fallo('HISTORIAL_ANTERIOR', snapshot.error);
      }
      datos = congelar(clave === CLAVE_DATOS ? valor : crearDatosVacios());
      publicar({ fase: 'listo' });
      return { ok: true };
    } finally { ocupado = false; }
  }
  async function guardar(candidato) {
    try {
      // Una sola clave contiene perfil y reservas. No hay efectos de autoguardado.
      await storage.setItem(CLAVE_DATOS, JSON.stringify(candidato.datos));
      datos = congelar(candidato.datos);
      publicar({ fase: 'listo', guardando: false, error: null });
      return { ok: true, ...(candidato.reserva ? { reserva: candidato.reserva } : {}) };
    } catch {
      // Un adaptador podría haber escrito antes de rechazar: recargar reconcilia ese caso.
      publicar({ fase: 'errorEscritura', guardando: false, error: 'No se pudo confirmar el guardado. No se confirmó la operación. Reintenta la lectura para comprobar qué datos quedaron guardados antes de continuar.' });
      return fallo('GUARDADO_FALLIDO', snapshot.error);
    }
  }
  async function completarReinicio() {
    publicar({ fase: 'eliminando', guardando: true, error: null });
    try {
      const claves = await storage.getAllKeys();
      // No borrar datos de otras aplicaciones/bibliotecas ni usar clear().
      for (const clave of claves) {
        if (clave === CLAVE_ANTERIOR || clave.startsWith(PREFIJO_RESPALDO)) await storage.removeItem(clave);
      }
      const vacios = crearDatosVacios();
      // Mantener la clave canónica vacía evita reimportar datos de una versión anterior.
      await storage.setItem(CLAVE_DATOS, JSON.stringify(vacios));
      datos = congelar(vacios);
      publicar({ fase: 'listo', guardando: false, error: null });
      return { ok: true };
    } catch {
      publicar({ fase: 'errorEscritura', guardando: false, error: 'La eliminación está pendiente de terminar. Reintenta la lectura para completar la limpieza del perfil, reservas y respaldos. No se confirmó su finalización.' });
      return fallo('ELIMINACION_PENDIENTE', snapshot.error);
    }
  }
  async function guardarReinicio() {
    try {
      // Nada se elimina si no se pudo iniciar el reinicio durable.
      await storage.setItem(CLAVE_DATOS, MARCA_REINICIO);
    } catch {
      publicar({ fase: 'errorEscritura', guardando: false, error: 'No se pudo confirmar el inicio de la eliminación. Reintenta la lectura para comprobar el estado guardado antes de continuar.' });
      return fallo('GUARDADO_FALLIDO', snapshot.error);
    }
    datos = congelar(crearDatosVacios());
    return completarReinicio();
  }
  async function operar(preparar, persistir = guardar) {
    if (ocupado) return fallo('OCUPADO', 'Hay un guardado en curso. Espera antes de intentarlo otra vez.');
    if (snapshot.fase !== 'listo') return fallo('NO_LISTO', 'Primero termina la carga o recupera el almacenamiento.');
    ocupado = true; // El cierre síncrono protege incluso antes de que React vuelva a renderizar.
    try {
      const candidato = preparar();
      if (!candidato.ok) return candidato;
      if (!validarDatos(candidato.datos, catalogo, niveles)) return fallo('DATOS_INVALIDOS', 'La operación no produce datos válidos. No se guardó ningún cambio.');
      publicar({ guardando: true, error: null });
      return await persistir(candidato);
    } finally { ocupado = false; }
  }
  async function recuperar() {
    if (ocupado) return fallo('OCUPADO', 'Espera a que termine la operación actual.');
    if (!pendiente || !['corrupto', 'legado'].includes(snapshot.fase)) return fallo('NO_RECUPERABLE', 'Reintenta primero la lectura.');
    ocupado = true;
    publicar({ guardando: true });
    try {
      const nuevos = crearDatosVacios();
      if (snapshot.fase === 'legado') {
        nuevos.historialAnterior = pendiente.historial;
      } else {
        const creadoEn = ahora();
        const clave = `${PREFIJO_RESPALDO}${crearId('copia')}`;
        const respaldo = JSON.stringify({ origen: pendiente.clave, creadoEn, contenidoOriginal: pendiente.raw });
        // Si el respaldo o su verificación fallan, jamás se reemplaza la clave activa.
        await storage.setItem(clave, respaldo);
        if (await storage.getItem(clave) !== respaldo) throw new Error('RESPALDO_NO_VERIFICADO');
        nuevos.recuperaciones = [{ clave, creadoEn, origen: pendiente.clave }];
      }
      const resultado = await guardar({ datos: nuevos });
      if (resultado.ok) pendiente = null;
      return resultado;
    } catch {
      publicar({ fase: 'errorEscritura', guardando: false, error: 'No se pudo verificar el respaldo. No se reemplazaron los datos originales. Reintenta la lectura.' });
      return fallo('RESPALDO_FALLIDO', snapshot.error);
    } finally { ocupado = false; }
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    cargar,
    recuperar,
    registrarPerfil: (entrada) => operar(() => prepararRegistro(datos, entrada, niveles, crearId('estudiante'), ahora())),
    actualizarPerfil: (entrada) => operar(() => prepararEdicionPerfil(datos, entrada, niveles)),
    eliminarPerfil: () => operar(() => prepararEliminacionPerfil(datos), guardarReinicio),
    eliminarReserva: (id) => operar(() => prepararEliminacionReserva(datos, id)),
    agregarReserva: (claseId, horario) => operar(() => prepararReserva(datos, catalogo, niveles, claseId, horario, crearId('reserva'), ahora())),
  };
}
module.exports = { createReservationStore, CLAVE_DATOS, CLAVE_ANTERIOR };
