import { pool } from "../db.js";

export async function createRequest({
  title,
  description,
  type,
  requester_id,
  approver_id
}) {
  const result = await pool.query(
    `INSERT INTO requests (title, description, type, status, requester_id, approver_id)
     VALUES ($1, $2, $3, 'pendiente', $4, $5)
     RETURNING *;`,
    [title, description, type, requester_id, approver_id]
  );
  return result.rows[0];
}

export async function getPendingRequestsByApprover(approverId) {
  const result = await pool.query(
    `SELECT *
     FROM requests
     WHERE approver_id = $1 AND status = 'pendiente'
     ORDER BY created_at DESC;`,
    [approverId]
  );
  return result.rows;
}

export async function getRequestById(id) {
  const result = await pool.query(
    `SELECT * FROM requests WHERE id = $1;`,
    [id]
  );
  return result.rows[0] || null;
}

export async function updateRequestStatus(id, newStatus) {
  const result = await pool.query(
    `UPDATE requests
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *;`,
    [newStatus, id]
  );
  return result.rows[0];
}

export async function getRequestsByApprover(approverId) {
  const result = await pool.query(
    `SELECT *
     FROM requests
     WHERE approver_id = $1
     ORDER BY created_at DESC;`,
    [approverId]
  );
  return result.rows;
}
