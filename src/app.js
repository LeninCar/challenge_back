import express from "express";
import cors from "cors";
import dotenv from "dotenv";


import { router as usersRouter } from "./routes/usersRoutes.js";
import { router as requestsRouter } from "./routes/requestsRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/users", usersRouter);
app.use("/api/requests", requestsRouter);

app.get("/", (req, res) => {
  res.json({ message: "API Flujo de Aprobación funcionando" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
