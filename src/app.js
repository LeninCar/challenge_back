import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { currentUser } from "./middlewares/currentUser.js";

import { router as usersRouter } from "./routes/usersRoutes.js";
import { router as requestsRouter } from "./routes/requestsRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import { router as requestTypesRoutes } from "./routes/requestTypesRoutes.js";

dotenv.config();

const app = express();

// 🔹 Dominios permitidos para el frontend
const allowedOrigins = [
  "http://localhost:5173",          // Vite dev
  "http://localhost:3000",          // CRA dev
  process.env.FRONTEND_URL,         // tu front en Vercel / S3
].filter(Boolean); // quita los undefined

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(currentUser);

// Rutas
app.use("/api/users", usersRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/request-types", requestTypesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Flujo de Aprobación funcionando" });
});

app.get("/api/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  res.json(req.user);
});

const PORT = process.env.PORT || 4000;

// 🔹 Escuchar en 0.0.0.0 para aceptar tráfico externo
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
