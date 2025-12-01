// src/models/requestTypesModel.js
import { pool } from "../db.js";

export async function getAllRequestTypes() {
  const res = await pool.query(
    `SELECT id, key, label, category, description, active
     FROM request_types
     ORDER BY category, label`
  );
  return res.rows;
}

export async function createRequestType({ key, label, category, description }) {
  const res = await pool.query(
    `INSERT INTO request_types (key, label, category, description, active)
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING id, key, label, category, description, active`,
    [key, label, category, description]
  );
  return res.rows[0];
}

export async function updateRequestType(id, { label, category, description, active }) {
  const res = await pool.query(
    `UPDATE request_types
     SET label = COALESCE($1, label),
         category = COALESCE($2, category),
         description = COALESCE($3, description),
         active = COALESCE($4, active)
     WHERE id = $5
     RETURNING id, key, label, category, description, active`,
    [label, category, description, active, id]
  );
  return res.rows[0] || null;
}

// “Delete” = soft delete → active = false
export async function softDeleteRequestType(id) {
  const res = await pool.query(
    `UPDATE request_types
     SET active = FALSE
     WHERE id = $1
     RETURNING id, key, label, category, description, active`,
    [id]
  );
  return res.rows[0] || null;
}
