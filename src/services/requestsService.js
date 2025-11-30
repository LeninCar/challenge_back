import {
  createRequest,
  getPendingRequestsByApprover,
  getRequestById,
  updateRequestStatus,
  getRequestsByApprover
} from "../models/requestModel.js";

import {
  createHistoryEntry,
  getHistoryByRequestId
} from "../models/requestHistoryModel.js";

export async function createNewRequest(data) {
  const request = await createRequest(data);

  // Registrar en historial la creación
  await createHistoryEntry({
    request_id: request.id,
    old_status: null,
    new_status: request.status,
    comment: "Solicitud creada",
    actor_id: data.requester_id
  });

  return request;
}

export async function listPendingRequests(approverId) {
  return await getPendingRequestsByApprover(approverId);
}

export async function changeRequestStatus({
  requestId,
  newStatus,
  comment,
  actor_id
}) {
  const existing = await getRequestById(requestId);
  if (!existing) {
    const error = new Error("Solicitud no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (existing.status === newStatus) {
    const error = new Error("La solicitud ya tiene ese estado");
    error.statusCode = 400;
    throw error;
  }

  if (existing.status !== "pendiente") {
    const error = new Error("Solo se puede cambiar estado desde 'pendiente'");
    error.statusCode = 400;
    throw error;
  }

  const updated = await updateRequestStatus(requestId, newStatus);

  await createHistoryEntry({
    request_id: requestId,
    old_status: existing.status,
    new_status: newStatus,
    comment,
    actor_id
  });

  return updated;
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
