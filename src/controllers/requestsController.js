import {
  createNewRequest,
  listPendingRequests,
  changeRequestStatus,
  getRequestWithHistory,
  listRequestsByApprover,
  getRequestsByRequesterId,
} from "../services/requestsService.js";

export async function getMyRequests(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const myRequests = await getRequestsByRequesterId(req.user.id);
    res.json(myRequests);
  } catch (err) {
    console.error("Error en getMyRequests:", err);
    res.status(500).json({ error: "Error cargando tus solicitudes" });
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

export async function getRequestDetailController(req, res) {
  try {
    const id = req.params.id;
    const data = await getRequestWithHistory(id);
    if (!data) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }
    res.json(data); // 👈 { request, history }
  } catch (err) {
    console.error("Error getRequestDetailController:", err);
    res.status(500).json({ error: "Error obteniendo solicitud" });
  }
}

export async function createRequestController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { title, description, type, approver_id } = req.body;

    const request = await createNewRequest({
      title,
      description,
      type,
      approver_id: Number(approver_id),
      actor_id: req.user.id,
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("Error createRequestController:", err);
    res.status(500).json({ error: "Error creando solicitud" });
  }
}


export async function changeRequestStatusController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { id } = req.params;
    const { newStatus, comment } = req.body;

    const result = await changeRequestStatus({
      requestId: Number(id),   
      newStatus,
      comment,
      actor_id: req.user.id, 
    });

    // 👇 devolvemos lo que arme el service, con { changed, request, message }
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error changeRequestStatusController:", err);
    return res.status(err.statusCode || 500).json({
      error: err.message || "Error cambiando estado",
    });
  }
}

