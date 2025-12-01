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

app.use(cors());
app.use(express.json());

app.use(currentUser);

// Rutas
app.use("/api/users", usersRouter);
app.use("/api/requests", requestsRouter);

app.get("/", (req, res) => {
  res.json({ message: "API Flujo de Aprobación funcionando" });
});

const { GMAIL_USER } = process.env;


app.get("/api/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  res.json(req.user);
});

app.use("/api/notifications", notificationsRoutes);

app.use("/api/request-types", requestTypesRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
