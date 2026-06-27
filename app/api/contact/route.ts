import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { addAppointment } from "../../lib/appointments";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = "antonail016@gmail.com";

// Correspondance label formulaire → clé stats + prix FCFA
const SVC_MAP: Record<string, { key: string; price: number }> = {
  "Pose Gel":       { key: "gel",      price: 39000 },
  "Nail Art":       { key: "nailart",  price: 52000 },
  "Baby Boomer":    { key: "bb",       price: 49000 },
  "Dépose & Soin":  { key: "depose",   price: 23000 },
  "Manucure":       { key: "manucure", price: 30000 },
  "Semi-Permanent": { key: "semi",     price: 33000 },
};

function parseSvc(label: string) {
  for (const [name, data] of Object.entries(SVC_MAP)) {
    if (label.startsWith(name)) return data;
  }
  return { key: "unknown", price: 0 };
}

export async function POST(req: NextRequest) {
  const { nom, whatsapp, prestation, message, date, time, image } = await req.json();

  if (!nom || !whatsapp || !prestation) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const svc         = parseSvc(prestation);
  const apptDate    = date || new Date().toISOString().slice(0, 10);
  const submittedAt = new Date().toISOString();

  // 1 — Sauvegarde pour les statistiques
  await addAppointment({
    id:        crypto.randomUUID(),
    date:      apptDate,
    service:   svc.key,
    price:     svc.price,
    nom,
    whatsapp,
    message:   message ?? "",
    createdAt: submittedAt,
  });

  // 2 — Email de notification
  if (process.env.RESEND_API_KEY) {
    const rdvFr = date
      ? new Date(date + "T12:00:00").toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        })
      : null;
    const receivedFr = new Date().toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const rdvRow = rdvFr ? `
      <tr>
        <td style="padding:13px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.14em;width:130px">Date souhaitée</td>
        <td style="padding:13px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-weight:700;color:#1a1a1a">${rdvFr}${time ? " à " + time : ""}</td>
      </tr>` : "";

    const attachments = image
      ? [{ filename: "inspiration.jpg", content: Buffer.from(image.split(",")[1], "base64") }]
      : [];

    await resend.emails.send({
      from:        "Anto Nail <onboarding@resend.dev>",
      to:          ADMIN_EMAIL,
      subject:     `✨ Nouvelle demande — ${prestation.split(",")[0]}${rdvFr ? " · " + rdvFr : ""}`,
      attachments,
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"/></head>
        <body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#faf8f4">
          <div style="border-left:3px solid #C9A8E0;padding-left:20px;margin-bottom:28px">
            <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#888888;margin:0 0 6px">Anto Nail</p>
            <h2 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em">Nouvelle demande de RDV</h2>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
            <tr>
              <td style="padding:13px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.14em;width:130px">Nom</td>
              <td style="padding:13px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-weight:600">${nom}</td>
            </tr>
            <tr>
              <td style="padding:13px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.14em">WhatsApp</td>
              <td style="padding:13px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-weight:600">${whatsapp}</td>
            </tr>
            <tr>
              <td style="padding:13px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.14em">Prestation</td>
              <td style="padding:13px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-weight:600;color:#9B72C8">${prestation}</td>
            </tr>
            ${rdvRow}
            ${message ? `
            <tr>
              <td style="padding:13px 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.14em">Message</td>
              <td style="padding:13px 0;color:#444;line-height:1.6">${message}</td>
            </tr>` : ""}
          </table>

          <p style="font-size:11px;color:#aaa;margin:0">Reçu le ${receivedFr}</p>
        </body></html>
      `,
    });
  }

  return NextResponse.json({ ok: true });
}
