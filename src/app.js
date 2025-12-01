import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { currentUser } from "./middlewares/currentUser.js";

import { router as usersRouter } from "./routes/usersRoutes.js";
import { router as requestsRouter } from "./routes/requestsRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";

import { sendMail } from "./utils/mailer.js";

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

app.get("/api/test-email", async (req, res) => {
  try {
    const to = GMAIL_USER || "lenincarabali@gmail.com";

    await sendMail({
      to,
      subject: "Test desde Sistema de Aprobaciones (Gmail API)",
      text: "Hola, este es un correo de prueba enviado usando la Gmail API.",
    });

    return res.json({
      ok: true,
      message: `Correo de prueba enviado a ${to}`,
    });
  } catch (err) {
    console.error("Error en /api/test-email:", err.response?.data || err);
    return res.status(500).json({
      error: "Error enviando correo de prueba",
      details: err.message,
    });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
