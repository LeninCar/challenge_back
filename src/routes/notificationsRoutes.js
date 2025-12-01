import { Router } from "express";
import {
  listMyNotifications,
  markNotificationReadController,
} from "../controllers/notificationsController.js";

const router = Router();

router.get("/", listMyNotifications);
router.patch("/:id/read", markNotificationReadController);

export default router;
