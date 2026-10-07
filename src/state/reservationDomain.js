// Reglas puras compartidas por la aplicación y node:test. Sin dependencias externas.
const CAMPOS = ['nombre', 'apellido', 'telefono', 'correo', 'cc', 'nivel'];
const esObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const texto = (v) => typeof v === 'string' && v.trim().length > 0;
const fechaISO = (v) => typeof v === 'string' && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;
const fallo = (codigo, mensaje, extra = {}) => ({ ok: false, codigo, mensaje, ...extra });

function validarPerfil(entrada, niveles) {
  const perfil = {};
  const errores = {};
  for (const campo of CAMPOS) {
    perfil[campo] = typeof entrada?.[campo] === 'string' ? entrada[campo].trim() : '';
    if (!perfil[campo]) errores[campo] = 'Este campo es obligatorio.';
  }
  // Se admiten nombres con tildes, espacios, guiones y apóstrofos: no se restringen letras.
  if (perfil.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.correo)) errores.correo = 'Escribe un correo válido, por ejemplo alumno@example.test.';
  if (perfil.telefono && !/^\+?[0-9 ()-]+$/.test(perfil.telefono)) errores.telefono = 'Usa dígitos y, si necesitas, + al inicio, espacios, guiones o paréntesis.';
  const digitos = perfil.telefono.replace(/\D/g, '');
  if (perfil.telefono && (digitos.length < 7 || digitos.length > 15)) errores.telefono = 'El teléfono debe contener entre 7 y 15 dígitos.';
  if (perfil.cc && !/^\d{6,10}$/.test(perfil.cc)) errores.cc = 'La CC debe contener entre 6 y 10 dígitos, sin separadores.';
  if (perfil.nivel && (!niveles.includes(perfil.nivel) || perfil.nivel === 'Todos')) errores.nivel = 'Selecciona uno de los niveles disponibles.';
  return Object.keys(errores).length ? fallo('PERFIL_INVALIDO', 'Revisa los campos señalados.', { errores }) : { ok: true, perfil };
}

const crearDatosVacios = () => ({ version: 1, perfil: null, reservas: [], historialAnterior: [], recuperaciones: [] });
function catalogoDisponible(catalogo, reservas) {
  return catalogo.map((clase) => ({ ...clase, cupos: Math.max(0, clase.cupos - reservas.filter((r) => r.claseId === clase.id).length) }));
}
function prepararRegistro(datos, entrada, niveles, id, creadoEn) {
  if (datos.perfil) return fallo('YA_REGISTRADO', 'Ya existe un perfil registrado en este dispositivo.');
  const resultado = validarPerfil(entrada, niveles);
  if (!resultado.ok) return resultado;
  return { ok: true, datos: { ...datos, perfil: { ...resultado.perfil, id, creadoEn } } };
}
function prepararEdicionPerfil(datos, entrada, niveles) {
  if (!datos.perfil) return fallo('PERFIL_REQUERIDO', 'No hay un perfil registrado para editar.');
  const resultado = validarPerfil(entrada, niveles);
  if (!resultado.ok) return resultado;
  // Solo se editan los seis campos; el ID y la fecha mantienen las reservas vinculadas.
  return { ok: true, datos: { ...datos, perfil: { ...datos.perfil, ...resultado.perfil } } };
}
function prepararEliminacionPerfil(datos) {
  if (!datos.perfil) return fallo('PERFIL_REQUERIDO', 'No hay un perfil registrado para eliminar.');
  return { ok: true, datos: crearDatosVacios() };
}
function prepararEliminacionReserva(datos, id) {
  if (!datos.perfil) return fallo('PERFIL_REQUERIDO', 'No hay un perfil registrado.');
  if (!texto(id)) return fallo('RESERVA_INVALIDA', 'El identificador de la reserva no es válido.');
  const reserva = datos.reservas.find((r) => r.id === id && r.estudianteId === datos.perfil.id);
  if (!reserva) return fallo('RESERVA_NO_ENCONTRADA', 'Esta reserva ya no está disponible en tu perfil.');
  return { ok: true, datos: { ...datos, reservas: datos.reservas.filter((r) => r.id !== id) } };
}
function prepararReserva(datos, catalogo, niveles, claseId, horario, id, creadoEn) {
  const clase = catalogo.find((c) => c.id === claseId);
  if (!clase) return fallo('CLASE_INVALIDA', 'Esta clase no existe en el catálogo.');
  if (!texto(horario) || !clase.horarios.includes(horario)) return fallo('HORARIO_INVALIDO', 'Selecciona un horario de esta clase.');
  if (!datos.perfil || !validarPerfil(datos.perfil, niveles).ok) return fallo('PERFIL_REQUERIDO', 'Completa tu perfil antes de reservar para asociar la reserva a tu registro.');
  if (datos.reservas.some((r) => r.estudianteId === datos.perfil.id && r.claseId === claseId && r.horario === horario)) return fallo('DUPLICADA', 'Ya tienes una reserva confirmada para esta clase y horario.');
  if (datos.reservas.filter((r) => r.claseId === claseId).length >= clase.cupos) return fallo('SIN_CUPOS', 'Esta clase no tiene cupos disponibles.');
  const reserva = {
    id, claseId, estudianteId: datos.perfil.id, horario, creadoEn, estado: 'confirmada',
    titulo: clase.titulo, profesor: clase.profesor.nombre, nivel: clase.nivel,
    modalidad: clase.modalidad, precio: clase.precio,
  };
  return { ok: true, reserva, datos: { ...datos, reservas: [...datos.reservas, reserva] } };
}

// El esquema antiguo no guardaba claseId ni estudianteId. Nunca se le inventa dueño.
function validarHistorialAnterior(valor) {
  if (!Array.isArray(valor)) return false;
  const ids = new Set();
  return valor.every((r) => {
    if (!esObjeto(r) || !['id', 'titulo', 'profesor', 'nivel', 'horario'].every((k) => texto(r[k])) ||
      !fechaISO(r.creadoEn) || !Number.isFinite(r.precio) || r.precio < 0 || ids.has(r.id) ||
      r.estudianteId !== undefined || r.claseId !== undefined ||
      (r.modalidad !== undefined && !texto(r.modalidad))) return false;
    ids.add(r.id);
    return true;
  });
}
function validarDatos(datos, catalogo, niveles) {
  if (!esObjeto(datos) || Object.prototype.hasOwnProperty.call(datos, 'reinicioPendiente') || datos.version !== 1 || !Array.isArray(datos.reservas) ||
      !validarHistorialAnterior(datos.historialAnterior) || !Array.isArray(datos.recuperaciones)) return false;
  if (datos.perfil !== null) {
    const p = datos.perfil;
    // RegExp.test coerciona: comprobar el tipo antes evita aceptar arreglos o invocar toString.
    if (!esObjeto(p) || typeof p.id !== 'string' || !/^estudiante-[a-z0-9-]+$/.test(p.id) || !fechaISO(p.creadoEn) || !validarPerfil(p, niveles).ok) return false;
    // La carga no normaliza silenciosamente información persistida.
    if (CAMPOS.some((k) => typeof p[k] !== 'string' || p[k] !== p[k].trim())) return false;
  }
  if (datos.recuperaciones.some((r) => !esObjeto(r) || !texto(r.clave) || !texto(r.origen) || !fechaISO(r.creadoEn))) return false;
  const ids = new Set();
  const combinaciones = new Set();
  const cantidades = {};
  for (const r of datos.reservas) {
    if (!esObjeto(r) || !datos.perfil || typeof r.estudianteId !== 'string' || r.estudianteId !== datos.perfil.id ||
        typeof r.claseId !== 'string' || typeof r.id !== 'string' ||
        !/^reserva-[a-z0-9-]+$/.test(r.id) || ids.has(r.id) || r.estado !== 'confirmada' ||
        !fechaISO(r.creadoEn) || !['titulo', 'profesor', 'nivel', 'modalidad'].every((k) => texto(r[k])) ||
        !niveles.includes(r.nivel) || r.nivel === 'Todos' || !Number.isFinite(r.precio) || r.precio < 0) return false;
    const clase = catalogo.find((c) => c.id === r.claseId);
    if (!clase || !clase.horarios.includes(r.horario)) return false;
    const combinacion = JSON.stringify([r.estudianteId, r.claseId, r.horario]);
    cantidades[r.claseId] = (cantidades[r.claseId] || 0) + 1;
    if (combinaciones.has(combinacion) || cantidades[r.claseId] > clase.cupos) return false;
    ids.add(r.id);
    combinaciones.add(combinacion);
  }
  return true;
}
function filtrarClases(clases, nivel, busqueda) {
  const normalizar = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const consulta = normalizar(busqueda.trim());
  return clases.filter((c) => (nivel === 'Todos' || c.nivel === nivel) &&
    (!consulta || normalizar(c.titulo).includes(consulta) || normalizar(c.profesor.nombre).includes(consulta)));
}
function ordenarReservas(reservas) {
  return [...reservas].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn) || a.id.localeCompare(b.id));
}
module.exports = { CAMPOS, validarPerfil, crearDatosVacios, catalogoDisponible, prepararRegistro, prepararEdicionPerfil, prepararEliminacionPerfil, prepararEliminacionReserva, prepararReserva, validarHistorialAnterior, validarDatos, filtrarClases, ordenarReservas, fallo };
