// src/services/email.service.js
// Usa la API REST de Brevo (no SMTP) — compatible con Render Free tier

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const getSenderEmail = () => (process.env.BREVO_SENDER_EMAIL || '').trim();
const getApiKey = () => (process.env.BREVO_API_KEY || '').trim();

const send = async ({ to, subject, html, text }) => {
  const apiKey = getApiKey();
  const senderEmail = getSenderEmail();

  if (!apiKey || !senderEmail) {
    console.warn(`[EMAIL SIMULADO] Faltan BREVO_API_KEY o BREVO_SENDER_EMAIL. Para: ${to} | Asunto: ${subject}`);
    return { messageId: 'simulated' };
  }

  const body = {
    sender: { name: 'Bionatural', email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text,
  };

  console.log(`[EMAIL] Enviando via API REST a: ${to} | Asunto: ${subject}`);

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`[EMAIL ERROR] Brevo API respondió ${response.status}:`, data);
    throw new Error(data?.message || `Brevo API error ${response.status}`);
  }

  console.log(`[EMAIL OK] Enviado a ${to} | messageId: ${data.messageId}`);
  return data;
};

// ─── Plantillas ────────────────────────────────────────────────────────────────

const sendEmailWithCode = async ({ to, code, subject, text }) => {
  const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">🌿 Bionatural</h1>
        </td></tr>
        <tr><td style="padding:36px 40px;text-align:center;">
          <p style="color:#374151;font-size:15px;margin:0 0 24px;">${text || subject}</p>
          <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:12px;padding:20px;display:inline-block;">
            <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Tu código</p>
            <p style="color:#16a34a;font-size:36px;font-weight:700;letter-spacing:8px;margin:0;font-family:monospace;">${code}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;">Este código expira pronto. No lo compartas con nadie.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© 2024 Bionatural · Tienda Naturista</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return send({ to, subject, html, text: `Tu código es: ${code}` });
};

const sendWelcomeEmail = async ({ to, name }) => {
  const subject = '¡Bienvenido a Bionatural! 🌿';
  const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:40px;text-align:center;">
          <span style="font-size:40px;">🌿</span>
          <h1 style="color:#fff;margin:8px 0 0;font-size:28px;font-weight:700;">Bionatural</h1>
          <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:14px;">Tienda Naturista</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 12px;">¡Hola, ${name}! 👋</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Nos alegra tenerte en <strong style="color:#16a34a;">Bionatural</strong>. Tu cuenta ha sido creada exitosamente.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:24px;">
            <tr><td style="padding:6px 0;"><span style="color:#16a34a;">✅</span> <span style="color:#374151;font-size:14px;margin-left:8px;">Acceso al catálogo de productos naturales</span></td></tr>
            <tr><td style="padding:6px 0;"><span style="color:#16a34a;">✅</span> <span style="color:#374151;font-size:14px;margin-left:8px;">Realiza pedidos en línea fácilmente</span></td></tr>
            <tr><td style="padding:6px 0;"><span style="color:#16a34a;">✅</span> <span style="color:#374151;font-size:14px;margin-left:8px;">Historial de compras y seguimiento de pedidos</span></td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 10px;">📍 Encuéntranos</p>
              <p style="color:#374151;font-size:13px;margin:0 0 2px;"><strong>Bionatural — Tienda Principal</strong></p>
              <p style="color:#6b7280;font-size:12px;margin:0 0 12px;">Calle 47 #45-87 · C.C. San Antonio, Local 101</p>
              <a href="https://wa.me/573155397493?text=Hola%20Bionatural%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n"
                 style="display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="18" height="18" alt="WhatsApp" style="vertical-align:middle;"/>
                Contáctanos por WhatsApp
              </a>
            </td></tr>
          </table>
          <p style="color:#6b7280;font-size:13px;margin:0;">Con cariño,<br/><strong style="color:#16a34a;">El equipo de Bionatural 🌱</strong></p>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© 2024 Bionatural · Tienda Naturista</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return send({ to, subject, html, text: `Hola ${name}, bienvenido a Bionatural. Visítanos en Calle 47 #45-87, C.C. San Antonio Local 101 o escríbenos al +57 315 5397493.` });
};

const sendOrderConfirmEmail = async ({ to, clientName, orderId, items, total, pickupTime }) => {
  const subject = `✅ Pedido #${orderId} confirmado — Bionatural`;
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:right;">${Number(i.lineTotal).toLocaleString('es-CO')}</td>
    </tr>`).join('');
  const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">🌿 Bionatural</h1>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:40px;">✅</span>
            <h2 style="color:#1a1a1a;font-size:22px;margin:8px 0;">¡Pedido confirmado!</h2>
            <p style="color:#6b7280;font-size:14px;margin:0;">Pedido <strong>#${orderId}</strong></p>
          </div>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Hola <strong>${clientName}</strong>, tu pedido ha sido recibido. Te avisaremos cuando esté listo para recoger.
          </p>
          ${pickupTime ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
            <p style="color:#1d4ed8;font-size:13px;font-weight:700;margin:0 0 4px;">🕐 Hora de retiro solicitada</p>
            <p style="color:#1e40af;font-size:14px;font-weight:600;margin:0;">${pickupTime}</p>
          </div>` : ''}
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#f9fafb;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Producto</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;">Cant.</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;">Subtotal</th>
            </tr>
            ${itemsHtml}
            <tr style="background:#f0fdf4;">
              <td colspan="2" style="padding:10px 12px;font-weight:700;color:#16a34a;font-size:14px;">Total a pagar en tienda</td>
              <td style="padding:10px 12px;font-weight:700;color:#16a34a;font-size:14px;text-align:right;">${Number(total).toLocaleString('es-CO')}</td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 8px;">📍 Dónde recoger</p>
              <p style="color:#374151;font-size:13px;margin:0 0 2px;"><strong>Bionatural — Tienda Principal</strong></p>
              <p style="color:#6b7280;font-size:12px;margin:0 0 12px;">Calle 47 #45-87 · C.C. San Antonio, Local 101</p>
              <a href="https://wa.me/573155397493?text=Hola%20Bionatural%2C%20quiero%20consultar%20sobre%20mi%20pedido%20%23${orderId}"
                 style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="16" height="16" alt="WhatsApp" style="vertical-align:middle;margin-right:6px;"/>
                Contáctanos · +57 315 5397493
              </a>
            </td></tr>
          </table>
          <p style="color:#6b7280;font-size:13px;margin:0;">El pago se realiza en tienda al recoger.<br/><strong style="color:#16a34a;">El equipo de Bionatural 🌱</strong></p>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© 2024 Bionatural · Tienda Naturista</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return send({ to, subject, html, text: `Hola ${clientName}, tu pedido #${orderId} fue confirmado. Total: ${Number(total).toLocaleString('es-CO')} COP.` });
};

const sendOrderCancelledEmail = async ({ to, clientName, orderId, items, total }) => {
  const subject = `Tu pedido #${orderId} ha sido cancelado — Bionatural`;
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:right;">${Number(i.lineTotal).toLocaleString('es-CO')}</td>
    </tr>`).join('');
  const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">🌿 Bionatural</h1>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">Hola, ${clientName}</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 20px;">Tu pedido <strong>#${orderId}</strong> ha sido <strong style="color:#dc2626;">cancelado</strong>.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#f9fafb;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Producto</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;">Cant.</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;">Subtotal</th>
            </tr>
            ${itemsHtml}
            <tr style="background:#f0fdf4;">
              <td colspan="2" style="padding:10px 12px;font-weight:700;color:#16a34a;font-size:14px;">Total</td>
              <td style="padding:10px 12px;font-weight:700;color:#16a34a;font-size:14px;text-align:right;">${Number(total).toLocaleString('es-CO')}</td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:13px;margin:0;">Gracias por confiar en nosotros.<br/><strong style="color:#16a34a;">El equipo de Bionatural 🌱</strong></p>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© 2024 Bionatural · Tienda Naturista</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return send({ to, subject, html, text: `Hola ${clientName}, tu pedido #${orderId} ha sido cancelado.` });
};

const sendStockCancelledEmail = async ({ to, clientName, orderId, items, total, stockIssues }) => {
  const subject = `Tu pedido #${orderId} fue cancelado por falta de stock — Bionatural`;
  const issuesHtml = stockIssues.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #fee2e2;color:#374151;font-size:13px;">${i.productName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #fee2e2;color:#dc2626;font-size:13px;text-align:center;">Pedido: ${i.requested} · Disponible: ${i.available}</td>
    </tr>`).join('');
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;text-align:right;">${Number(i.lineTotal).toLocaleString('es-CO')}</td>
    </tr>`).join('');
  const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">🌿 Bionatural</h1>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">Hola, ${clientName}</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 16px;">Tu pedido <strong>#${orderId}</strong> fue <strong style="color:#dc2626;">cancelado automáticamente</strong> por falta de stock.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin-bottom:24px;">
            <tr><td style="padding:14px 16px;">
              <p style="color:#dc2626;font-size:13px;font-weight:700;margin:0 0 10px;">⚠️ Productos con stock insuficiente:</p>
              <table width="100%" cellpadding="0" cellspacing="0">${issuesHtml}</table>
            </td></tr>
          </table>
          <p style="color:#6b7280;font-size:13px;margin:0;">Disculpa los inconvenientes.<br/><strong style="color:#16a34a;">El equipo de Bionatural 🌱</strong></p>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© 2024 Bionatural · Tienda Naturista</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return send({ to, subject, html, text: `Hola ${clientName}, tu pedido #${orderId} fue cancelado por falta de stock.` });
};

const sendOrderReadyEmail = async ({ to, clientName, orderId, items, total, expiresAt }) => {
  const subject = `¡Tu pedido #${orderId} está listo para recoger! 🌿 — Bionatural`;
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;text-align:right;">${Number(i.lineTotal).toLocaleString('es-CO')}</td>
    </tr>`).join('');
  const expiresFormatted = new Date(expiresAt).toLocaleString('es-CO', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Bogota',
  });
  const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">🌿 Bionatural</h1>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">¡Hola, ${clientName}! 👋</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 20px;">Tu pedido <strong>#${orderId}</strong> ya está <strong style="color:#16a34a;">listo para recoger</strong>.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="color:#92400e;font-size:14px;font-weight:700;margin:0 0 6px;">⏰ Tienes 24 horas para recogerlo</p>
              <p style="color:#92400e;font-size:13px;margin:0;">Expira el: <strong>${expiresFormatted}</strong></p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#f9fafb;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Producto</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;">Cant.</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;">Subtotal</th>
            </tr>
            ${itemsHtml}
            <tr style="background:#f0fdf4;">
              <td colspan="2" style="padding:10px 12px;font-weight:700;color:#16a34a;font-size:14px;">Total a pagar en tienda</td>
              <td style="padding:10px 12px;font-weight:700;color:#16a34a;font-size:14px;text-align:right;">${Number(total).toLocaleString('es-CO')}</td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 8px;">📍 Dónde recoger</p>
              <p style="color:#374151;font-size:13px;margin:0 0 4px;"><strong>Bionatural — Tienda Principal</strong></p>
              <p style="color:#6b7280;font-size:12px;margin:0 0 2px;">Calle 47 #45-87 · C.C. San Antonio, Local 101</p>
              <p style="color:#6b7280;font-size:12px;margin:0 0 12px;">🕐 Lun–Vie 8:00 AM – 6:00 PM · Sáb 8:00 AM – 2:00 PM</p>
              <a href="https://wa.me/573155397493?text=Hola%20Bionatural%2C%20tengo%20una%20pregunta%20sobre%20mi%20pedido%20%23${orderId}"
                 style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="16" height="16" alt="WhatsApp" style="vertical-align:middle;margin-right:6px;"/>
                Contáctanos · +57 315 5397493
              </a>
            </td></tr>
          </table>
          <p style="color:#6b7280;font-size:13px;margin:0;">Presenta tu nombre o email al llegar. El pago se realiza en tienda.<br/><strong style="color:#16a34a;">El equipo de Bionatural 🌱</strong></p>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© 2024 Bionatural · Tienda Naturista</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return send({ to, subject, html, text: `Hola ${clientName}, tu pedido #${orderId} está listo. Tienes hasta el ${expiresFormatted} para recogerlo.` });
};

// ─── Alerta de stock crítico al admin ─────────────────────────────────────────
const sendStockAlertEmail = async ({ to, products }) => {
  const subject = '⚠️ Alerta de stock crítico — Bionatural';
  const rowsHtml = products.map(p => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #fee2e2;color:#374151;font-size:14px;font-weight:500;">${p.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #fee2e2;color:#dc2626;font-size:14px;font-weight:700;text-align:center;">${p.stock} unidades</td>
      <td style="padding:10px 12px;border-bottom:1px solid #fee2e2;color:#9ca3af;font-size:13px;text-align:center;">Mínimo: ${p.minStock || 5}</td>
    </tr>`).join('');
  const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">⚠️ Alerta de Stock</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Bionatural — Sistema de Gestión</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Los siguientes <strong>${products.length} producto${products.length !== 1 ? 's' : ''}</strong> tienen stock crítico (5 unidades o menos) y requieren reabastecimiento:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fecaca;border-radius:8px;overflow:hidden;margin-bottom:24px;background:#fef2f2;">
            <tr style="background:#fee2e2;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#991b1b;font-weight:600;">Producto</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#991b1b;font-weight:600;">Stock actual</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#991b1b;font-weight:600;">Stock mínimo</th>
            </tr>
            ${rowsHtml}
          </table>
          <p style="color:#6b7280;font-size:13px;margin:0;">Revisa el inventario en el panel de administración.<br/><strong style="color:#16a34a;">Sistema Bionatural 🌱</strong></p>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© 2024 Bionatural · Tienda Naturista</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return send({ to, subject, html, text: `Alerta: ${products.length} productos con stock crítico. Revisa el inventario.` });
};

module.exports = {
  sendEmailWithCode,
  sendWelcomeEmail,
  sendOrderConfirmEmail,
  sendOrderCancelledEmail,
  sendStockCancelledEmail,
  sendOrderReadyEmail,
  sendStockAlertEmail,
};
