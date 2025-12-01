// src/utils/mailer.js
import { google } from "googleapis";

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_USER,
  NODE_ENV,
} = process.env;

const IS_DEV = NODE_ENV !== "production";

// Cliente OAuth2 para Gmail API
const oAuth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET
);

if (GMAIL_REFRESH_TOKEN) {
  oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
} else {
  console.warn("[GMAIL] ⚠ GMAIL_REFRESH_TOKEN no está definido");
}

// Helper para construir el RAW del correo (formato RFC 2822, base64url)
function createRawEmail({ from, to, subject, text, html }) {
  let message = "";
  message += `From: ${from}\r\n`;
  message += `To: ${to}\r\n`;
  message += `Subject: ${subject}\r\n`;
  message += "MIME-Version: 1.0\r\n";

  if (html) {
    message += 'Content-Type: text/html; charset="UTF-8"\r\n';
    message += "\r\n";
    message += html;
  } else {
    message += 'Content-Type: text/plain; charset="UTF-8"\r\n';
    message += "\r\n";
    message += text || "";
  }

  // base64 url-safe
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Enviar correo genérico usando Gmail API.
 * @param {Object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} [opts.text]
 * @param {string} [opts.html]
 */
export async function sendMail({ to, subject, text, html }) {
  // En dev, si falta configuración, no revientes la app
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !GMAIL_USER) {
    console.log("📧 [GMAIL MOCK] Falta config, mostrando correo simulado:");
    console.log({ to, subject, text, html });
    return { mocked: true };
  }

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const raw = createRawEmail({
    from: GMAIL_USER,
    to,
    subject,
    text,
    html,
  });

  if (IS_DEV) {
    console.log("📧 [GMAIL API] Enviando correo (DEV) a:", to);
  }

  const res = await gmail.users.messages.send({
    userId: "me", // "me" = la cuenta del token (GMAIL_USER)
    requestBody: {
      raw,
    },
  });

  console.log("[GMAIL API] Mensaje enviado. ID:", res.data.id);
  return res.data;
}

// Helpers específicos del sistema (igual que antes)

export async function sendRequestCreatedEmail({ to, request }) {
  return sendMail({
    to,
    subject: `Nueva solicitud #${request.id}: ${request.title}`,
    text: `Se creó la solicitud #${request.id} con estado ${request.status}.`,
  });
}

export async function sendRequestStatusChangedEmail({ to, request, newStatus }) {
  return sendMail({
    to,
    subject: `Actualización solicitud #${request.id}: ${newStatus}`,
    text: `Tu solicitud #${request.id} cambió a estado: ${newStatus}.`,
  });
}
