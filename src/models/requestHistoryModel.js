import { pool } from "../db.js";

// Inserta una fila en request_history
export async function createHistoryEntry({
  request_id,
  actor_id,
  old_status,
  new_status,
  comment,
}) {
  const result = await pool.query(
    `INSERT INTO request_history (request_id, actor_id, old_status, new_status, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, request_id, actor_id, old_status, new_status, comment, created_at;`,
    [request_id, actor_id, old_status, new_status, comment]
  );
  return result.rows[0];
}

// Devuelve el historial de una solicitud (con actor_name)
export async function getHistoryByRequestId(requestId) {
  const result = await pool.query(
    `SELECT
        h.id,
        h.request_id,
        h.actor_id,
        u.name AS actor_name,
        h.old_status,
        h.new_status,
        h.comment,
        h.created_at
     FROM request_history h
     LEFT JOIN users u ON u.id = h.actor_id
     WHERE h.request_id = $1
     ORDER BY h.created_at DESC;`,
    [requestId]
  );
  return result.rows;
}
