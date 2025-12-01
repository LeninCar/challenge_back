import { google } from "googleapis";

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_USER,
  NODE_ENV,
  APP_NAME,
  FRONTEND_URL,
} = process.env;

const IS_DEV = NODE_ENV !== "production";

const SYSTEM_NAME = APP_NAME || "Sistema de Solicitudes CoE";
const BASE_URL = FRONTEND_URL || ""; // ej: https://mi-front.render.com

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
    requestBody: { raw },
  });

  console.log("[GMAIL API] Mensaje enviado. ID:", res.data.id);
  return res.data;
}

/* -------------------------------------------------------------------------- */
/*                          Templates HTML bonitos                             */
/* -------------------------------------------------------------------------- */

function baseEmailLayout({ title, intro, highlight, fields = [], footerNote }) {
  // fields: [{ label, value }]
  const fieldsRows = fields
    .map(
      (f) => `
      <tr>
        <td style="padding: 6px 0; color:#555; font-size:13px; width: 120px;">
          <strong>${f.label}:</strong>
        </td>
        <td style="padding: 6px 0; color:#222; font-size:13px;">
          ${f.value ?? "-"}
        </td>
      </tr>`
    )
    .join("");

  return `
  <div style="background-color:#f4f4f5; padding:20px 0; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:white; border-radius:8px; box-shadow:0 4px 12px rgba(15,23,42,0.12); overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0f172a,#1d4ed8); padding:16px 24px;">
        <h1 style="margin:0; font-size:18px; color:#e5e7eb;">${SYSTEM_NAME}</h1>
        <p style="margin:4px 0 0; font-size:12px; color:#9ca3af;">Gestión de solicitudes y aprobaciones</p>
      </div>

      <div style="padding:20px 24px;">
        <h2 style="margin:0 0 8px; font-size:18px; color:#111827;">
          ${title}
        </h2>
        <p style="margin:0 0 16px; font-size:14px; color:#4b5563; line-height:1.5;">
          ${intro}
        </p>

        ${
          highlight
            ? `<div style="margin-bottom:16px; padding:10px 12px; border-radius:6px; background-color:#eff6ff; border:1px solid #bfdbfe; font-size:13px; color:#1d4ed8;">
                 ${highlight}
               </div>`
            : ""
        }

        ${
          fields.length
            ? `<table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
                 <tbody>
                   ${fieldsRows}
                 </tbody>
               </table>`
            : ""
        }

        ${
          footerNote
            ? `<p style="margin:0 0 4px; font-size:12px; color:#6b7280;">${footerNote}</p>`
            : ""
        }
        <p style="margin:0; font-size:12px; color:#9ca3af;">
          Por favor, no respondas directamente a este correo. Si tienes dudas, revisa el detalle de la solicitud en el sistema.
        </p>
      </div>

      <div style="border-top:1px solid #e5e7eb; padding:10px 24px; text-align:center;">
        <p style="margin:0; font-size:11px; color:#9ca3af;">
          © ${new Date().getFullYear()} ${SYSTEM_NAME}
        </p>
      </div>
    </div>
  </div>
  `;
}

function buildRequestLink(requestId) {
  if (!BASE_URL) return "";
  const url = `${BASE_URL.replace(/\/+$/, "")}/requests/${requestId}`;
  return `
    <p style="margin:12px 0 0; font-size:13px;">
      <a href="${url}" 
         style="display:inline-block; padding:8px 14px; border-radius:999px; background-color:#2563eb; color:white; text-decoration:none; font-size:13px;">
        Ver detalle de la solicitud
      </a>
    </p>
  `;
}

function buildRequestCreatedHtml(request) {
  const highlight = `Se ha registrado una <strong>nueva solicitud</strong> y está pendiente de revisión.`;
  const fields = [
    { label: "ID", value: `#${request.id}` },
    { label: "Título", value: request.title },
    { label: "Tipo", value: request.type || "No especificado" },
    { label: "Estado", value: request.status || "pendiente" },
  ];

  const footerNote = BASE_URL
    ? "Puedes revisar el detalle completo, historial y acciones disponibles en el sistema."
    : "Si necesitas más detalles, consulta el sistema interno de solicitudes.";

  const base = baseEmailLayout({
    title: `Nueva solicitud registrada`,
    intro: `Se ha creado una nueva solicitud que requiere tu atención como aprobador.`,
    highlight,
    fields,
    footerNote,
  });

  return base.replace(
    "</div>\n\n      <div style=\"border-top:1px solid #e5e7eb;",
    `${buildRequestLink(request.id)}</div>\n\n      <div style="border-top:1px solid #e5e7eb;`
  );
}

function buildStatusChangedHtml(request, newStatus) {
  const estadoLabel = (newStatus || request.status || "").toUpperCase();

  let estadoColor = "#6b7280";
  if (newStatus === "aprobado") estadoColor = "#16a34a";
  if (newStatus === "rechazado") estadoColor = "#dc2626";
  if (newStatus === "pendiente") estadoColor = "#f97316";

  const highlight = `
    El estado de tu solicitud ha cambiado a 
    <span style="font-weight:600; color:${estadoColor};">${estadoLabel}</span>.
  `;

  const fields = [
    { label: "ID", value: `#${request.id}` },
    { label: "Título", value: request.title },
    { label: "Tipo", value: request.type || "No especificado" },
    { label: "Nuevo estado", value: estadoLabel },
  ];

  const footerNote = BASE_URL
    ? "Desde el sistema puedes consultar el detalle del cambio, comentarios y el historial completo."
    : "Para más detalles, revisa el sistema interno o comunícate con tu equipo de soporte.";

  const base = baseEmailLayout({
    title: `Actualización de estado de tu solicitud`,
    intro: `Tu solicitud ha sido actualizada en el sistema.`,
    highlight,
    fields,
    footerNote,
  });

  return base.replace(
    "</div>\n\n      <div style=\"border-top:1px solid #e5e7eb;",
    `${buildRequestLink(request.id)}</div>\n\n      <div style="border-top:1px solid #e5e7eb;`
  );
}

/* -------------------------------------------------------------------------- */
/*                 Helpers específicos del sistema (ya mejorados)             */
/* -------------------------------------------------------------------------- */

export async function sendRequestCreatedEmail({ to, request }) {
  const subject = `Nueva solicitud #${request.id}: ${request.title}`;
  const text = `Se creó la solicitud #${request.id} con estado ${request.status || "pendiente"}.\n\nTítulo: ${request.title}\nTipo: ${request.type || "No especificado"}`;

  const html = buildRequestCreatedHtml(request);

  return sendMail({
    to,
    subject,
    text,
    html,
  });
}

export async function sendRequestStatusChangedEmail({ to, request, newStatus }) {
  const subject = `Actualización solicitud #${request.id}: ${newStatus}`;
  const text = `Tu solicitud #${request.id} cambió a estado: ${newStatus}.\n\nTítulo: ${request.title}\nTipo: ${request.type || "No especificado"}`;

  const html = buildStatusChangedHtml(request, newStatus);

  return sendMail({
    to,
    subject,
    text,
    html,
  });
}
