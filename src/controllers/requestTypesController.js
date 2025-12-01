// src/controllers/requestTypesController.js
import {
  getAllRequestTypes,
  createRequestType,
  // updateRequestType,
  // softDeleteRequestType,
} from "../models/requestTypesModel.js";

export async function listRequestTypesController(req, res) {
  try {
    const types = await getAllRequestTypes();
    res.json(types);
  } catch (err) {
    console.error("Error listRequestTypesController:", err);
    res.status(500).json({ error: "Error listando tipos de solicitud" });
  }
}

export async function createRequestTypeController(req, res) {
  try {
    // 👇 Solo exige estar autenticado, NO rol admin
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { key, label, category, description } = req.body;

    if (!key || !label || !category) {
      return res.status(400).json({
        error: "key, label y category son obligatorios",
      });
    }

    const created = await createRequestType({
      key: key.trim(),
      label: label.trim(),
      category: category.trim(),
      description: description?.trim() || null,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Error createRequestTypeController:", err);
    res.status(500).json({ error: "Error creando tipo de solicitud" });
  }
}
