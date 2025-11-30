import {
  createNewRequest,
  listPendingRequests,
  changeRequestStatus,
  getRequestWithHistory,
  listRequestsByApprover
} from "../services/requestsService.js";

export async function createRequestController(req, res) {
  try {
    const { title, description, type, requester_id, approver_id } = req.body;

    const request = await createNewRequest({
      title,
      description,
      type,
      requester_id,
      approver_id
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("Error createRequestController:", err);
    res.status(500).json({ error: "Error creando solicitud" });
  }
}

export async function getByApproverController(req, res) {
  try {
    const approverId = req.params.approverId;
    const requests = await listRequestsByApprover(approverId);
    res.json(requests);
  } catch (err) {
    console.error("Error getByApproverController:", err);
    res.status(500).json({ error: "Error listando solicitudes" });
  }
}


export async function getPendingController(req, res) {
  try {
    const approverId = req.params.approverId;
    const requests = await listPendingRequests(approverId);
    res.json(requests);
  } catch (err) {
    console.error("Error getPendingController:", err);
    res.status(500).json({ error: "Error listando solicitudes pendientes" });
  }
}

export async function approveOrRejectController(req, res) {
  try {
    const requestId = req.params.id;
    const { newStatus, comment, actor_id } = req.body;

    const updated = await changeRequestStatus({
      requestId,
      newStatus,
      comment,
      actor_id
    });

    res.json(updated);
  } catch (err) {
    console.error("Error approveOrRejectController:", err);
    res.status(err.statusCode || 500).json({
      error: err.message || "Error cambiando estado"
    });
  }
}

export async function getRequestDetailController(req, res) {
  try {
    const requestId = req.params.id;
    const data = await getRequestWithHistory(requestId);
    res.json(data);
  } catch (err) {
    console.error("Error getRequestDetailController:", err);
    res.status(err.statusCode || 500).json({
      error: err.message || "Error obteniendo detalle"
    });
  }
}
