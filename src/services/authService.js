import { pool } from "../db.js";

export async function findOrCreateUserFromGoogle({ googleId, email, name }) {
  // Ajusta al esquema real de tu tabla users
  const existing = await pool.query(
    "SELECT * FROM users WHERE google_id = $1 OR email = $2 LIMIT 1",
    [googleId, email]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Rol por defecto, cámbialo si quieres
  const role = "solicitante";

  const insert = await pool.query(
    `INSERT INTO users (google_id, email, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [googleId, email, name, role]
  );

  return insert.rows[0];
}
