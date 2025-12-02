// src/initDb.js
import { pool } from "./db.js";

async function createTables() {
  console.log("🔧 Creando tablas (si no existen)...");

  // USERS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(150) NOT NULL UNIQUE,
      role        VARCHAR(20),
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      google_id   VARCHAR(255)
    );
  `);

  // REQUEST_TYPES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS request_types (
      id          SERIAL PRIMARY KEY,
      key         TEXT        NOT NULL UNIQUE,
      label       TEXT        NOT NULL,
      category    TEXT,
      description TEXT,
      active      BOOLEAN     NOT NULL DEFAULT TRUE
    );
  `);

  // REQUESTS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS requests (
      id           SERIAL PRIMARY KEY,
      title        VARCHAR(200) NOT NULL,
      description  TEXT         NOT NULL,
      type         VARCHAR(50)  NOT NULL,
      status       VARCHAR(20)  NOT NULL DEFAULT 'pendiente',
      requester_id INTEGER      NOT NULL REFERENCES users(id),
      approver_id  INTEGER      NOT NULL REFERENCES users(id),
      created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  // REQUEST_HISTORY
  await pool.query(`
    CREATE TABLE IF NOT EXISTS request_history (
      id         SERIAL PRIMARY KEY,
      request_id INTEGER      NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      old_status VARCHAR(20),
      new_status VARCHAR(20)  NOT NULL,
      comment    TEXT,
      actor_id   INTEGER      NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  // NOTIFICATIONS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER      NOT NULL REFERENCES users(id),
      request_id INTEGER      NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      message    TEXT         NOT NULL,
      created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
      read_at    TIMESTAMP
    );
  `);

  console.log("✅ Tablas listas");
}

async function seedUsers() {
  console.log("🔍 Revisando si hay usuarios...");
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM users");
  if (rows[0].count > 0) {
    console.log("ℹ️ users ya tiene datos, no se hace seed");
    return;
  }

  console.log("➕ Insertando usuario aprobador (tu correo)...");
  await pool.query(
    `
    INSERT INTO users (name, email, role)
    VALUES ($1, $2, $3);
  `,
    [
      "Lenin Carabalí",
      "lenin.carabali@correounivalle.edu.co",
      "aprobador",
    ]
  );

  console.log("✅ Usuario aprobador creado");
}

async function seedRequestTypes() {
  console.log("🔍 Revisando request_types...");
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM request_types"
  );
  if (rows[0].count > 0) {
    console.log("ℹ️ request_types ya tiene datos, no se hace seed");
    return;
  }

  console.log("➕ Insertando tipos de solicitud...");
  await pool.query(
    `
    INSERT INTO request_types (key, label, category, description, active)
    VALUES
      ($1,  $2,  $3,  $4,  TRUE),
      ($5,  $6,  $7,  $8,  TRUE),
      ($9,  $10, $11, $12, TRUE),
      ($13, $14, $15, $16, TRUE);
  `,
    [
      // 1) Cambio técnico
      "cambio_tecnico",
      "Cambio técnico",
      "Misceláneo",
      "Cambio puntual sobre la solución técnica ya existente.",
      // 2) Acceso
      "acceso",
      "Solicitud de acceso",
      "Accesos",
      "Pedir acceso a repositorios, bases de datos u otras herramientas.",
      // 3) Despliegue
      "despliegue",
      "Despliegue de versión",
      "Despliegues",
      "Salida de una nueva versión a un ambiente (dev, stage, prod, etc).",
      // 4) CI/CD
      "ci/cd",
      "CI/CD",
      "Despliegues",
      "Cambios en pipelines de integración y despliegue continuos.",
    ]
  );

  console.log("✅ Tipos de solicitud creados");
}

async function main() {
  console.log("🚀 Iniciando initDb...");
  try {
    await createTables();
    await seedUsers();
    await seedRequestTypes();
    console.log("🎉 initDb terminado correctamente");
  } catch (err) {
    console.error("❌ Error en initDb:", err);
    // Cierro pool y salgo con error
    try {
      await pool.end();
    } catch (e) {
      console.error("Error cerrando pool:", e);
    }
    process.exit(1);
  }

  // Si todo salió bien:
  try {
    console.log("🔚 Cerrando pool de conexiones...");
    await pool.end();
  } catch (e) {
    console.error("Error cerrando pool:", e);
  }

  console.log("✅ Proceso completado, saliendo...");
  process.exit(0);
}

// Ejecutar siempre que se llame `node src/initDb.js`
main();
