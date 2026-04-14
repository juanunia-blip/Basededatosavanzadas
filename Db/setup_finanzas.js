use("expense_tracker");

// Limpiar si ya existen
db.usuarios.drop();
db.categorias.drop();
db.gastos.drop();
db.ingresos.drop();
db.presupuestos.drop();
db.ahorros.drop();

// =========================
// COLECCION: USUARIOS
// =========================
db.usuarios.insertMany([
  { usuario_id: "U001", nombre: "Juan Perez", email: "juan@email.com", ciudad: "Bogota", fecha_registro: new Date("2024-01-01") },
  { usuario_id: "U002", nombre: "Ana Gomez", email: "ana@email.com", ciudad: "Medellin", fecha_registro: new Date("2024-01-05") },
  { usuario_id: "U003", nombre: "Carlos Ramirez", email: "carlos@email.com", ciudad: "Cali", fecha_registro: new Date("2024-01-10") },
  { usuario_id: "U004", nombre: "Maria Torres", email: "maria@email.com", ciudad: "Cartagena", fecha_registro: new Date("2024-01-15") },
  { usuario_id: "U005", nombre: "Luis Rios", email: "luis@email.com", ciudad: "Pereira", fecha_registro: new Date("2024-01-20") },
  { usuario_id: "U006", nombre: "Marco Velez", email: "marco@email.com", ciudad: "Popayan", fecha_registro: new Date("2024-01-22") },
  { usuario_id: "U007", nombre: "Cristian Bargas", email: "cristian@email.com", ciudad: "Cali", fecha_registro: new Date("2024-01-24") }
]);

// =========================
// COLECCION: CATEGORIAS
// =========================
db.categorias.insertMany([
  { categoria_id: "C001", nombre: "Alimentacion" },
  { categoria_id: "C002", nombre: "Transporte" },
  { categoria_id: "C003", nombre: "Entretenimiento" },
  { categoria_id: "C004", nombre: "Salud" },
  { categoria_id: "C005", nombre: "Educacion" },
  { categoria_id: "C006", nombre: "Servicios" },
  { categoria_id: "C007", nombre: "Arriendo" }
]);

// =========================
// COLECCION: GASTOS
// =========================
db.gastos.insertMany([
  { gasto_id: "G001", usuario_id: "U001", categoria_id: "C001", monto: 25, descripcion: "Almuerzo", fecha: new Date("2024-02-01") },
  { gasto_id: "G002", usuario_id: "U002", categoria_id: "C002", monto: 10, descripcion: "Bus", fecha: new Date("2024-02-02") },
  { gasto_id: "G003", usuario_id: "U003", categoria_id: "C003", monto: 40, descripcion: "Cine", fecha: new Date("2024-02-02") },
  { gasto_id: "G004", usuario_id: "U001", categoria_id: "C006", monto: 60, descripcion: "Internet", fecha: new Date("2024-02-03") },
  { gasto_id: "G005", usuario_id: "U004", categoria_id: "C004", monto: 30, descripcion: "Farmacia", fecha: new Date("2024-02-03") },
  { gasto_id: "G006", usuario_id: "U005", categoria_id: "C001", monto: 50, descripcion: "Supermercado", fecha: new Date("2024-02-04") },
  { gasto_id: "G007", usuario_id: "U002", categoria_id: "C003", monto: 20, descripcion: "Netflix", fecha: new Date("2024-02-05") },
  { gasto_id: "G008", usuario_id: "U003", categoria_id: "C002", monto: 15, descripcion: "Taxi", fecha: new Date("2024-02-06") },
  { gasto_id: "G009", usuario_id: "U004", categoria_id: "C005", monto: 100, descripcion: "Curso Online", fecha: new Date("2024-02-06") },
  { gasto_id: "G010", usuario_id: "U005", categoria_id: "C006", monto: 80, descripcion: "Luz", fecha: new Date("2024-02-07") }
]);

// =========================
// COLECCION: INGRESOS
// =========================
db.ingresos.insertMany([
  { ingreso_id: "I001", usuario_id: "U001", fuente: "Salario", monto: 1500, descripcion: "Pago mensual", fecha: new Date("2024-02-01") },
  { ingreso_id: "I002", usuario_id: "U002", fuente: "Freelance", monto: 900, descripcion: "Diseño web", fecha: new Date("2024-02-02") },
  { ingreso_id: "I003", usuario_id: "U003", fuente: "Salario", monto: 1800, descripcion: "Pago mensual", fecha: new Date("2024-02-03") },
  { ingreso_id: "I004", usuario_id: "U004", fuente: "Ventas", monto: 700, descripcion: "Venta de productos", fecha: new Date("2024-02-04") },
  { ingreso_id: "I005", usuario_id: "U005", fuente: "Salario", monto: 1300, descripcion: "Pago mensual", fecha: new Date("2024-02-05") }
]);

// =========================
// COLECCION: PRESUPUESTOS
// =========================
db.presupuestos.insertMany([
  { presupuesto_id: "P001", usuario_id: "U001", categoria_id: "C001", limite: 300, mes: "Febrero" },
  { presupuesto_id: "P002", usuario_id: "U002", categoria_id: "C002", limite: 150, mes: "Febrero" },
  { presupuesto_id: "P003", usuario_id: "U003", categoria_id: "C003", limite: 200, mes: "Febrero" },
  { presupuesto_id: "P004", usuario_id: "U004", categoria_id: "C004", limite: 180, mes: "Febrero" },
  { presupuesto_id: "P005", usuario_id: "U005", categoria_id: "C006", limite: 250, mes: "Febrero" }
]);

// =========================
// COLECCION: AHORROS
// =========================
db.ahorros.insertMany([
  { ahorro_id: "A001", usuario_id: "U001", meta: "Viaje", monto_objetivo: 1000, monto_actual: 200 },
  { ahorro_id: "A002", usuario_id: "U002", meta: "Laptop", monto_objetivo: 1500, monto_actual: 400 },
  { ahorro_id: "A003", usuario_id: "U003", meta: "Emergencias", monto_objetivo: 2000, monto_actual: 500 },
  { ahorro_id: "A004", usuario_id: "U004", meta: "Moto", monto_objetivo: 3000, monto_actual: 800 },
  { ahorro_id: "A005", usuario_id: "U005", meta: "Casa", monto_objetivo: 10000, monto_actual: 1500 }
]);

// =========================
// INDICES
// =========================
db.usuarios.createIndex({ usuario_id: 1 }, { unique: true });
db.usuarios.createIndex({ email: 1 }, { unique: true });

db.categorias.createIndex({ categoria_id: 1 }, { unique: true });
db.categorias.createIndex({ nombre: 1 }, { unique: true });

db.gastos.createIndex({ gasto_id: 1 }, { unique: true });
db.gastos.createIndex({ usuario_id: 1 });
db.gastos.createIndex({ categoria_id: 1 });

db.ingresos.createIndex({ ingreso_id: 1 }, { unique: true });
db.ingresos.createIndex({ usuario_id: 1 });

db.presupuestos.createIndex({ presupuesto_id: 1 }, { unique: true });
db.presupuestos.createIndex({ usuario_id: 1, categoria_id: 1, mes: 1 });

db.ahorros.createIndex({ ahorro_id: 1 }, { unique: true });
db.ahorros.createIndex({ usuario_id: 1 });

// =========================
// CONSULTAS DE PRUEBA
// =========================
print("Base de datos expense_tracker creada correctamente.");
print("Colecciones:");
printjson(db.getCollectionNames());