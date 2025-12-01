// src/controllers/authController.js
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { findOrCreateUserFromGoogle } from "../services/authService.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLoginController(req, res) {
  try {
    const { credential } = req.body; // ID token que manda el front
    if (!credential) {
      return res.status(400).json({ message: "Falta credential" });
    }

    // Verificar el ID token con Google (firma, expiración, aud, iss, etc.):contentReference[oaicite:2]{index=2}
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;  // sub = googleId

    const user = await findOrCreateUserFromGoogle({
      googleId: sub,
      email,
      name,
    });

    // Crear un JWT propio para tu API
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error en googleLoginController:", err);
    return res.status(401).json({ message: "Token de Google inválido" });
  }
}
