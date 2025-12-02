import { pool } from "../db.js";
import { getHistoryByRequestId } from "./requestHistoryModel.js";

// Crear una nueva solicitud
export async function createRequest({
  title,
  description,
  type,
  requester_id,
  approver_id,
}) {
  const result = await pool.query(
    `INSERT INTO requests (title, description, type, status, requester_id, approver_id)
     VALUES ($1, $2, $3, 'pendiente', $4, $5)
     RETURNING *;`,
    [title, description, type, requester_id, approver_id]
  );
  return result.rows[0];
}

export async function getRequestById(id) {
  const res = await pool.query(
    `SELECT * FROM requests WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

// Traer una solicitud + historial
export async function getRequestWithHistory(id) {
  const reqRes = await pool.query(
    `SELECT * FROM requests WHERE id = $1`,
    [id]
  );

  if (reqRes.rows.length === 0) {
    return null;
  }

  const request = reqRes.rows[0];
  const history = await getHistoryByRequestId(id);

  return { request, history };
}

// Listar solicitudes pendientes para un aprobador
export async function getPendingRequestsByApprover(approverId) {
  const result = await pool.query(
    `SELECT *
     FROM requests
     WHERE approver_id = $1
       AND status = 'pendiente'
     ORDER BY created_at DESC;`,
    [approverId]
  );
  return result.rows;
}

// (opcional) Listar todas las solicitudes
export async function getAllRequests() {
  const result = await pool.query(
    `SELECT * FROM requests ORDER BY created_at DESC;`
  );
  return result.rows;
}

// 🔹 NUEVO: listar TODAS las solicitudes de un aprobador (cualquier estado)
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

export async function getRequestsByRequesterId(requesterId) {
  const res = await pool.query(
    `SELECT *
     FROM requests
     WHERE requester_id = $1
     ORDER BY created_at DESC`,
    [requesterId]
  );
  return res.rows;
}