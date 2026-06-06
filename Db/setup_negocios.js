use("expense_tracker");

const negocio = db.negocios.findOne({
  nombre: "Finca La Esperanza",
  usuario_id: "U001",
});

if (!negocio) {
  throw new Error("No existe el negocio Finca La Esperanza para U001");
}

db.createCollection("trabajadores_negocio");
db.createCollection("producciones_negocio");
db.createCollection("gastos_negocio");
db.createCollection("ventas_negocio");

db.trabajadores_negocio.createIndex({ usuario_id: 1 });
db.trabajadores_negocio.createIndex({ negocio_id: 1 });
db.trabajadores_negocio.createIndex(
  { usuario_id: 1, negocio_id: 1, trabajador_id: 1 },
  { unique: true }
);

db.producciones_negocio.createIndex({ usuario_id: 1 });
db.producciones_negocio.createIndex({ negocio_id: 1 });
db.producciones_negocio.createIndex({ trabajador_id: 1 });
db.producciones_negocio.createIndex({ fecha: -1 });

db.gastos_negocio.createIndex({ usuario_id: 1 });
db.gastos_negocio.createIndex({ negocio_id: 1 });
db.gastos_negocio.createIndex({ tipo: 1 });
db.gastos_negocio.createIndex({ fecha: -1 });

db.ventas_negocio.createIndex({ usuario_id: 1 });
db.ventas_negocio.createIndex({ negocio_id: 1 });
db.ventas_negocio.createIndex({ fecha: -1 });

const trabajador = {
  usuario_id: "U001",
  negocio_id: negocio._id,
  trabajador_id: "T001",
  nombre: "Pedro Gómez",
  telefono: "",
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

db.trabajadores_negocio.updateOne(
  {
    usuario_id: trabajador.usuario_id,
    negocio_id: trabajador.negocio_id,
    trabajador_id: trabajador.trabajador_id,
  },
  { $setOnInsert: trabajador },
  { upsert: true }
);

const trabajadorDb = db.trabajadores_negocio.findOne({
  usuario_id: "U001",
  negocio_id: negocio._id,
  trabajador_id: "T001",
});

db.producciones_negocio.insertOne({
  usuario_id: "U001",
  negocio_id: negocio._id,
  trabajador_id: trabajadorDb._id,
  trabajador_nombre: trabajadorDb.nombre,
  fecha: new Date("2026-06-04"),
  kilos: 120,
  precio_kilo: 800,
  total_pago: 120 * 800,
  abonado: 50000,
  pendiente: 120 * 800 - 50000,
  estado: "abonado",
  observacion: "Primera recolección de prueba",
  createdAt: new Date(),
  updatedAt: new Date(),
});

db.gastos_negocio.insertMany([
  {
    usuario_id: "U001",
    negocio_id: negocio._id,
    tipo: "abono",
    descripcion: "Compra de abono NPK",
    monto: 350000,
    fecha: new Date("2026-06-04"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    usuario_id: "U001",
    negocio_id: negocio._id,
    tipo: "transporte",
    descripcion: "Transporte de café",
    monto: 80000,
    fecha: new Date("2026-06-04"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    usuario_id: "U001",
    negocio_id: negocio._id,
    tipo: "almuerzo",
    descripcion: "Almuerzos trabajadores",
    monto: 45000,
    fecha: new Date("2026-06-04"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.ventas_negocio.insertOne({
  usuario_id: "U001",
  negocio_id: negocio._id,
  producto: "Café pergamino",
  kilos: 200,
  precio_kilo: 9500,
  total_venta: 200 * 9500,
  fecha: new Date("2026-06-05"),
  comprador: "Comprador local",
  createdAt: new Date(),
  updatedAt: new Date(),
});

print("Colecciones de negocio creadas correctamente.");
print("Negocio usado:");
printjson(negocio);

print("Resumen:");
printjson({
  trabajadores: db.trabajadores_negocio.countDocuments({ negocio_id: negocio._id }),
  producciones: db.producciones_negocio.countDocuments({ negocio_id: negocio._id }),
  gastos: db.gastos_negocio.countDocuments({ negocio_id: negocio._id }),
  ventas: db.ventas_negocio.countDocuments({ negocio_id: negocio._id }),
});