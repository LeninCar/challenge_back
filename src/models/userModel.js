import { pool } from "../db.js";

export async function getAllUsers() {
  const result = await pool.query("SELECT * FROM users ORDER BY id;");
  return result.rows;
}

export async function createUser({ name, email, role }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, role)
     VALUES ($1, $2, $3)
     RETURNING *;`,
    [name, email, role]
  );
  return result.rows[0];
}
