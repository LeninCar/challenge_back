import {
  createRequest,
  getPendingRequestsByApprover,
  getRequestById,
  getRequestsByApprover
} from "../models/requestModel.js";

import { pool } from "../db.js";

import { sendRequestStatusChangedEmail } from "../utils/mailer.js";
import { sendRequestCreatedEmail } from "../utils/mailer.js";

import {
  createHistoryEntry,
  getHistoryByRequestId
} from "../models/requestHistoryModel.js";
import { createNotification } from "../models/notificationsModel.js";

async function getUserById(id) {
  const res = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [id]
  );
  return res.rows[0] || null;
}


export async function createNewRequest({
  title,
  description,
  type,
  approver_id,
  actor_id,
}) {
  const request = await createRequest({
    title,
    description,
    type,
    requester_id: actor_id,
    approver_id,
  });

  await createHistoryEntry({
    request_id: request.id,
    old_status: null,
    new_status: request.status,
    comment: "Solicitud creada",
    actor_id,
  });

  // Notificación interna + correo opcional
  if (approver_id) {
    await createNotification({
      userId: approver_id,
      requestId: request.id,
      message: `Nueva solicitud #${request.id}: ${request.title}`,
    });

    // 🔔 Enviar correo al aprobador (si tiene email)
    const approver = await getUserById(approver_id);
    if (approver?.email) {
      try {
        await sendRequestCreatedEmail({
          to: approver.email,
          request,
        });
      } catch (err) {
        console.error("Error enviando correo de nueva solicitud:", err);
      }
    }
  }

  return request;
}

export async function listPendingRequests(approverId) {
  return await getPendingRequestsByApprover(approverId);
}

export async function changeRequestStatus({
  requestId,
  newStatus,
  comment,
  actor_id,
}) {
  const current = await getRequestById(requestId);
  if (!current) {
    const err = new Error("Solicitud no encontrada");
    err.statusCode = 404;
    throw err;
  }

  const oldStatus = current.status;

  // ⛔ Evitar movimientos sin cambio real de estado
  if (current.status === newStatus) {
  return {
    changed: false,
    request: current,
    message: `La solicitud ya está en estado "${newStatus}", no hay cambios que guardar.`,
  };
}

  const updateRes = await pool.query(
    `UPDATE requests
     SET status = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING *;`,
    [newStatus, requestId]
  );
  const updated = updateRes.rows[0];

  await createHistoryEntry({
    request_id: requestId,
    actor_id,
    old_status: oldStatus,
    new_status: newStatus,
    comment,
  });

  await createNotification({
    userId: current.requester_id,
    requestId,
    message: `Tu solicitud #${requestId} cambió a estado ${newStatus}.`,
  });

  //  Enviar correo al solicitante (si tiene email)
  try {
    const requester = await getUserById(current.requester_id);
    if (requester?.email) {
      await sendRequestStatusChangedEmail({
        to: requester.email,
        request: updated,   // usamos la solicitud ya actualizada
        newStatus,
      });
    }
  } catch (err) {
    console.error(
      "Error enviando correo de cambio de estado de solicitud:",
      err
    );
    // no lanzamos error porque el cambio de estado ya se hizo en BD
  }

  return {
    changed: true,
    request: updated,
    message: `Estado actualizado de "${oldStatus}" a "${newStatus}".`,
  };
}


export async function getRequestWithHistory(requestId) {
  const request = await getRequestById(requestId);
  if (!request) {
    const error = new Error("Solicitud no encontrada");
    error.statusCode = 404;
    throw error;
  }

  const history = await getHistoryByRequestId(requestId);
  return { request, history };
}

export async function listRequestsByApprover(approverId) {
  return await getRequestsByApprover(approverId);
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


