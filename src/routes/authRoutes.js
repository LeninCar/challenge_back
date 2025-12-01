// src/routes/authRoutes.js
import { Router } from "express";
import { googleLoginController } from "../controllers/authController.js";

const router = Router();

router.post("/google", googleLoginController);

export default router;
