const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  createReservationStore,
  CLAVE_DATOS,
  CLAVE_ANTERIOR,
} = require("./reservationStore");

const niveles = ["Todos", "Basico", "Intermedio", "Avanzado"];
const catalogo = [
  {
    id: "1",
    titulo: "Inglés inicial",
    nivel: "Basico",
    profesor: { nombre: "Laura" },
    cupos: 2,
    horarios: ["Lun 7:00 a.m."],
    modalidad: "Virtual",
    precio: 10000,
  },
];
const perfil = {
  nombre: "Ana",
  apellido: "Pérez",
  telefono: "+57 300 1234567",
  correo: "ana@example.test",
  cc: "123456",
  nivel: "Basico",
};
const instante = "2026-10-07T12:00:00.000Z";

function crearAlmacenamiento(inicial = {}) {
  const datos = new Map(Object.entries(inicial));
  return {
    datos,
    fallarLectura: false,
    fallarEliminacionDe: null,
    async getItem(clave) {
      if (this.fallarLectura) throw new Error("LECTURA_FALLIDA");
      return datos.has(clave) ? datos.get(clave) : null;
    },
    async setItem(clave, valor) {
      datos.set(clave, valor);
    },
    async getAllKeys() {
      return [...datos.keys()];
    },
    async removeItem(clave) {
      if (this.fallarEliminacionDe === clave) {
        this.fallarEliminacionDe = null;
        throw new Error("ELIMINACION_FALLIDA");
      }
      datos.delete(clave);
    },
  };
}

function crearStore(storage) {
  return createReservationStore({
    storage,
    catalogo,
    niveles,
    ahora: () => instante,
  });
}

test("la carga vacía pasa a listo y expone los cupos del catálogo", async () => {
  const store = crearStore(crearAlmacenamiento());

  assert.equal(store.getSnapshot().fase, "cargando");
  assert.deepEqual(await store.cargar(), { ok: true });
  assert.equal(store.getSnapshot().fase, "listo");
  assert.equal(store.getSnapshot().clases[0].cupos, 2);
});

test("un fallo de lectura no crea datos vacíos y permite reintentar", async () => {
  const storage = crearAlmacenamiento({
    [CLAVE_DATOS]: JSON.stringify({
      version: 1,
      perfil: null,
      reservas: [],
      historialAnterior: [],
      recuperaciones: [],
    }),
  });
  const store = crearStore(storage);
  storage.fallarLectura = true;

  const resultado = await store.cargar();
  assert.equal(resultado.codigo, "LECTURA_FALLIDA");
  assert.equal(store.getSnapshot().fase, "errorLectura");

  storage.fallarLectura = false;
  assert.deepEqual(await store.cargar(), { ok: true });
  assert.equal(store.getSnapshot().fase, "listo");
});

test("datos corruptos se conservan en respaldo antes de iniciar datos vacíos", async () => {
  const original = "{contenido no válido";
  const storage = crearAlmacenamiento({ [CLAVE_DATOS]: original });
  const store = crearStore(storage);

  const resultadoCarga = await store.cargar();
  assert.equal(resultadoCarga.codigo, "DATOS_CORRUPTOS");
  assert.equal(store.getSnapshot().fase, "corrupto");

  assert.deepEqual(await store.recuperar(), { ok: true });
  assert.equal(store.getSnapshot().fase, "listo");
  assert.deepEqual(store.getSnapshot().datos.reservas, []);

  const claveRespaldo = (await storage.getAllKeys()).find((clave) =>
    clave.startsWith(`${CLAVE_DATOS}:respaldo:`),
  );
  assert.ok(claveRespaldo);
  assert.deepEqual(JSON.parse(await storage.getItem(claveRespaldo)), {
    origen: CLAVE_DATOS,
    creadoEn: instante,
    contenidoOriginal: original,
  });
});

test("si falla guardar el respaldo, no se reemplazan los datos corruptos", async () => {
  const original = "{contenido no válido";
  const storage = crearAlmacenamiento({ [CLAVE_DATOS]: original });
  const guardarOriginal = storage.setItem.bind(storage);
  storage.setItem = async (clave, valor) => {
    if (clave.startsWith(`${CLAVE_DATOS}:respaldo:`)) {
      throw new Error("RESPALDO_FALLIDO");
    }
    return guardarOriginal(clave, valor);
  };
  const store = crearStore(storage);
  await store.cargar();

  const resultado = await store.recuperar();
  assert.equal(resultado.codigo, "RESPALDO_FALLIDO");
  assert.equal(store.getSnapshot().fase, "errorEscritura");
  assert.equal(await storage.getItem(CLAVE_DATOS), original);
});

test("un historial anterior se conserva sin asignarle propietario", async () => {
  const historial = [
    {
      id: "reserva-anterior-1",
      titulo: "Inglés inicial",
      profesor: "Laura",
      nivel: "Basico",
      horario: "Lun 7:00 a.m.",
      creadoEn: instante,
      precio: 10000,
      modalidad: "Virtual",
    },
  ];
  const storage = crearAlmacenamiento({
    [CLAVE_ANTERIOR]: JSON.stringify(historial),
  });
  const store = crearStore(storage);

  const resultadoCarga = await store.cargar();
  assert.equal(resultadoCarga.codigo, "HISTORIAL_ANTERIOR");
  assert.equal(store.getSnapshot().fase, "legado");

  assert.deepEqual(await store.recuperar(), { ok: true });
  assert.deepEqual(store.getSnapshot().datos.historialAnterior, historial);
  assert.equal(store.getSnapshot().datos.perfil, null);
  assert.equal(store.getSnapshot().fase, "listo");
});

test("una escritura fallida se informa y bloquea cambios hasta recargar", async () => {
  const storage = crearAlmacenamiento();
  const originalSetItem = storage.setItem.bind(storage);
  storage.setItem = async () => {
    throw new Error("ESCRITURA_FALLIDA");
  };
  const store = crearStore(storage);
  await store.cargar();

  const resultado = await store.registrarPerfil(perfil);
  assert.equal(resultado.codigo, "GUARDADO_FALLIDO");
  assert.equal(store.getSnapshot().fase, "errorEscritura");
  assert.equal(store.getSnapshot().datos.perfil, null);

  storage.setItem = originalSetItem;
  assert.deepEqual(await store.cargar(), { ok: true });
  assert.equal(store.getSnapshot().fase, "listo");
});

test("la eliminación interrumpida se reanuda y no borra claves ajenas", async () => {
  const storage = crearAlmacenamiento({
    "@otra-aplicacion:dato": "conservar",
  });
  const store = crearStore(storage);
  await store.cargar();
  await store.registrarPerfil(perfil);
  await storage.setItem(CLAVE_ANTERIOR, "historial anterior");
  await storage.setItem(`${CLAVE_DATOS}:respaldo:copia-1`, "respaldo");
  storage.fallarEliminacionDe = CLAVE_ANTERIOR;

  const resultadoEliminacion = await store.eliminarPerfil();
  assert.equal(resultadoEliminacion.codigo, "ELIMINACION_PENDIENTE");
  assert.equal(store.getSnapshot().fase, "errorEscritura");

  assert.deepEqual(await store.cargar(), { ok: true });
  assert.equal(store.getSnapshot().fase, "listo");
  assert.equal(store.getSnapshot().datos.perfil, null);
  assert.equal(await storage.getItem(CLAVE_ANTERIOR), null);
  assert.equal(
    await storage.getItem(`${CLAVE_DATOS}:respaldo:copia-1`),
    null,
  );
  assert.equal(await storage.getItem("@otra-aplicacion:dato"), "conservar");
});
