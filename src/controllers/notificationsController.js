import {
  getNotificationsForUser,
  markNotificationRead,
} from "../models/notificationsModel.js";

export async function listMyNotifications(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const notis = await getNotificationsForUser(req.user.id);
    res.json(notis);
  } catch (err) {
    console.error("Error listMyNotifications:", err);
    res.status(500).json({ error: "Error listando notificaciones" });
  }
}

export async function markNotificationReadController(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const id = req.params.id;
    const updated = await markNotificationRead(id, req.user.id);
    if (!updated) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Error markNotificationReadController:", err);
    res.status(500).json({ error: "Error marcando notificación" });
  }
}
