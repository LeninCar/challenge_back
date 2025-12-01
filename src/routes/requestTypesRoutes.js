// src/routes/requestTypesRoutes.js
import express from "express";
import {
  listRequestTypesController,
  createRequestTypeController,
} from "../controllers/requestTypesController.js";

export const router = express.Router();

// GET /api/request-types  → cualquiera puede ver
router.get("/", listRequestTypesController);

// POST /api/request-types → cualquier usuario autenticado puede crear
router.post("/", createRequestTypeController);

// 👇 Por ahora NO montamos PATCH/DELETE
// router.patch("/:id", updateRequestTypeController);
// router.delete("/:id", deleteRequestTypeController);
