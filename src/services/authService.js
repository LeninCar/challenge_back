// src/services/authService.js
import { pool } from "../db.js";

export async function findOrCreateUserFromGoogle({ googleId, email, name }) {
  // ¿Ya existe?
  const existing = await pool.query(
    `SELECT id, name, email, role, google_id
     FROM users
     WHERE google_id = $1 OR email = $2
     LIMIT 1`,
    [googleId, email]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Si no existe, lo creamos con role = NULL
  const insert = await pool.query(
    `INSERT INTO users (google_id, email, name, role)
     VALUES ($1, $2, $3, NULL)
     RETURNING id, name, email, role, google_id`,
    [googleId, email, name]
  );

  return insert.rows[0];
}
