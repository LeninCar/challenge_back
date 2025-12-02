// src/routes/requestsRoutes.js
import express from "express";
import {
  createRequestController,
  getPendingController,
  getRequestDetailController,
  changeRequestStatusController,
  getByApproverController,
  getMyRequests,
} from "../controllers/requestsController.js";

export const router = express.Router();

// Crear solicitud
router.post("/", createRequestController);

// IMPORTANTE: va ANTES de "/:id"
router.get("/mine", getMyRequests);

// Listar pendientes de un aprobador
router.get("/pending/:approverId", getPendingController);

// Todas las solicitudes de un aprobador (cualquier estado)
router.get("/by-approver/:approverId", getByApproverController);

// Aprobar / Rechazar solicitud
router.post("/:id/status", changeRequestStatusController);

// Ver detalle + historial (SIEMPRE AL FINAL)
router.get("/:id", getRequestDetailController);
