import { pool } from "../db.js";

export async function createHistoryEntry({
  request_id,
  old_status,
  new_status,
  comment,
  actor_id
}) {
  const result = await pool.query(
    `INSERT INTO request_history
     (request_id, old_status, new_status, comment, actor_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *;`,
    [request_id, old_status, new_status, comment, actor_id]
  );

  return result.rows[0];
}

export async function getHistoryByRequestId(requestId) {
  const result = await pool.query(
    `SELECT rh.*, u.name AS actor_name
     FROM request_history rh
     JOIN users u ON u.id = rh.actor_id
     WHERE request_id = $1
     ORDER BY created_at ASC;`,
    [requestId]
  );
  return result.rows;
}
