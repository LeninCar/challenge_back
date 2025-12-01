// src/middlewares/currentUser.js
import jwt from "jsonwebtoken";
// import { getUserById } from "../models/userModel.js"; // si quieres recargar desde DB

export function currentUser(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Opcional: recargar desde la DB
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (err) {
    console.error("Token JWT inválido:", err.message);
    req.user = null;
  }

  next();
}
