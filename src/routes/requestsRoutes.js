import express from "express";
import {
  createRequestController,
  getPendingController,
  approveOrRejectController,
  getRequestDetailController,
  getByApproverController
} from "../controllers/requestsController.js";

export const router = express.Router();

// Crear solicitud
router.post("/", createRequestController);

// Listar pendientes de un aprobador
router.get("/pending/:approverId", getPendingController);

// Aprobar / Rechazar solicitud
router.post("/:id/status", approveOrRejectController);

// Ver detalle + historial
router.get("/:id", getRequestDetailController);

// Todas las solicitudes de un aprobador (cualquier estado)
router.get("/by-approver/:approverId", getByApproverController);

