import nodemailer from 'nodemailer';

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getRoleLabel(role: string): string {
  if (role === 'organizer') return 'Panitia Event (Organizer)';
  if (role === 'admin') return 'Admin Platform';
  return 'Peserta Event';
}

export function buildWelcomeBroadcastEmailHtml(params: {
  name: string;
  email: string;
  role: string;
  appUrl?: string;
}): string {
  const safeName = escapeHtml(params.name);
  const safeRole = escapeHtml(getRoleLabel(params.role));
  const baseUrl = escapeHtml(params.appUrl || 'https://evora.app');

  return `<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><title>Selamat Datang di EVORA — Broadcast Event Seru!</title></head>
<body style="margin:0;padding:24px;background-color:#E8F5FA;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#0F172A;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:30px;overflow:hidden;border:2px solid #9FD2D6;box-shadow:0 20px 44px rgba(55,126,192,0.16);">
    <!-- Festive Header -->
    <div style="background:linear-gradient(135deg,#377EC0 0%,#5460AC 60%,#12BAAA 100%);padding:32px 28px;text-align:center;color:#FFFFFF;">
      <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:#FBDF54;color:#0F172A;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">
        EVORA OFFICIAL BROADCAST · AKUN AKTIF
      </div>
      <h1 style="margin:14px 0 6px;font-size:28px;font-weight:800;line-height:1.2;">
        Yeay, Selamat Bergabung ${safeName}!
      </h1>
      <p style="margin:0;font-size:14px;opacity:0.95;">
        Akun <strong>${safeRole}</strong> kamu sudah resmi terverifikasi dan siap berpetualang di EVORA.
      </p>
    </div>

    <!-- Intro + Quick Highlights -->
    <div style="padding:26px 28px 10px;">
      <div style="background:#FFF4E5;border:1.5px solid #FBDF54;border-radius:20px;padding:16px 18px;margin-bottom:22px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:800;color:#B45309;">
          🎁 Hadiah Welcome Starter Pack untuk Kamu!
        </p>
        <p style="margin:0;font-size:12.5px;line-height:1.6;color:#475569;">
          Klaim diskon <strong>20%</strong> tiket event pilihan dengan kode promo <strong style="color:#F04F52;background:#FFFFFF;padding:2px 8px;border-radius:6px;border:1px solid #FDBA74;">EVORA20</strong> dan buka studio Kamar Ganti untuk mendandani avatar chibi-mu!
        </p>
      </div>

      <h2 style="margin:0 0 12px;font-size:16px;font-weight:800;color:#1E3A8A;">
        📍 Broadcast Agenda & Spotlight Event Bulan Ini
      </h2>

      <!-- Event Card 1 -->
      <div style="background:#F4FAFC;border:1.5px solid #9FD2D6;border-radius:18px;padding:14px 16px;margin-bottom:10px;">
        <div style="font-size:11px;font-weight:800;color:#F04F52;text-transform:uppercase;">12 Des 2026 · Jakarta Pusat</div>
        <div style="font-size:15px;font-weight:800;color:#0F172A;margin:3px 0;">Pastel Creative Fest 2026</div>
        <div style="font-size:12px;color:#475569;">Area Kreatif Jakarta Pusat · Pasar kreatif, ilustrasi & sesi akustik.</div>
      </div>

      <!-- Event Card 2 -->
      <div style="background:#F4FAFC;border:1.5px solid #9FD2D6;border-radius:18px;padding:14px 16px;margin-bottom:10px;">
        <div style="font-size:11px;font-weight:800;color:#377EC0;text-transform:uppercase;">19 Des 2026 · Bandung</div>
        <div style="font-size:15px;font-weight:800;color:#0F172A;margin:3px 0;">UI/UX & Product Design Summit</div>
        <div style="font-size:12px;color:#475569;">Balai Inovasi Bandung · Workshop desain produk & networking (Kode: <strong>DESIGN15</strong>).</div>
      </div>

      <!-- Event Card 3 -->
      <div style="background:#F4FAFC;border:1.5px solid #9FD2D6;border-radius:18px;padding:14px 16px;margin-bottom:20px;">
        <div style="font-size:11px;font-weight:800;color:#F7891F;text-transform:uppercase;">26 Des 2026 · Jakarta Selatan</div>
        <div style="font-size:15px;font-weight:800;color:#0F172A;margin:3px 0;">Senja Indie Music Gathering</div>
        <div style="font-size:12px;color:#475569;">Taman Terbuka Jakarta Selatan · Piknik & pertunjukan musik indie senja.</div>
      </div>

      <h2 style="margin:0 0 10px;font-size:16px;font-weight:800;color:#1E3A8A;">
        🚀 4 Hal Seru yang Langsung Bisa Kamu Coba:
      </h2>
      <table style="width:100%;border-collapse:separate;border-spacing:0 8px;font-size:12.5px;color:#334155;">
        <tr>
          <td style="background:#E8F5FA;padding:10px 12px;border-radius:12px;">
            <strong>1. Rute Peta Google Maps Real-Time:</strong> Lihat rute langsung dari posisimu ke venue & buka navigasi di aplikasi Google Maps.
          </td>
        </tr>
        <tr>
          <td style="background:#E6F9F7;padding:10px 12px;border-radius:12px;">
            <strong>2. Kamar Ganti Avatar Estetik:</strong> Racik wajah, rambut, baju, jaket & aksesoris lucu lalu simpan ke lemari!
          </td>
        </tr>
        <tr>
          <td style="background:#FFF4E5;padding:10px 12px;border-radius:12px;">
            <strong>3. Streak Panitia Bulanan & Quest:</strong> Gabung tim panitia untuk menyalakan api streak & main mini game berburu item event.
          </td>
        </tr>
        <tr>
          <td style="background:#F5F3FF;padding:10px 12px;border-radius:12px;">
            <strong>4. Customer Service & Masukan:</strong> Hubungi WA CS 089603963329 atau kirim masukan ke msriotss@gmail.com.
          </td>
        </tr>
      </table>

      <div style="text-align:center;margin:24px 0 14px;">
        <a href="${baseUrl}" style="display:inline-block;padding:13px 28px;border-radius:14px;background:#377EC0;color:#FFFFFF;font-size:14px;font-weight:800;text-decoration:none;box-shadow:0 8px 20px rgba(55,126,192,0.28);">
          Buka Website EVORA Sekarang →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F8FAFC;padding:18px 28px;border-top:1px solid #E2E8F0;text-align:center;font-size:11.5px;color:#64748B;line-height:1.6;">
      Dibuat oleh <strong>Muhammad Satrio Wibisono</strong> · Instagram <strong>@msriotsss</strong><br/>
      CS WhatsApp: <strong>089603963329</strong> · Keluh Kesah & Masukan: <strong>msriotss@gmail.com</strong>
    </div>
  </div>
</body>
</html>`;
}

export interface EmailSendResult {
  delivered: boolean;
  deliveryMode: 'smtp-gmail' | 'preview';
  previewHtml: string;
  notice: string;
}

function stripQuotes(val?: string): string {
  return (val || '').trim().replace(/^["']|["']$/g, '');
}

function explainSmtpError(err: unknown): string {
  const anyErr = err as { code?: string; responseCode?: number; message?: string } | undefined;
  const code = anyErr?.code || '';
  const respCode = anyErr?.responseCode;
  const msg = String(anyErr?.message || '');

  if (code === 'EAUTH' || respCode === 535 || msg.includes('Username and Password not accepted')) {
    return 'Gmail menolak login SMTP (535). Pastikan SMTP_USER adalah alamat Gmail lengkap dan SMTP_PASS memakai 16 digit Google App Password (bukan sandi Gmail biasa).';
  }
  if (code === 'ETIMEDOUT' || code === 'ESOCKET' || code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
    return `Koneksi ke server SMTP gagal (${code}).`;
  }
  return 'Pengiriman SMTP Gmail gagal (periksa SMTP_USER / Google App Password di Settings > Secrets).';
}

async function trySendViaTransport(params: {
  host: string;
  port: number;
  user: string;
  pass: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    host: params.host,
    port: params.port,
    secure: params.port === 465,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 7000,
    auth: {
      user: params.user,
      pass: params.pass,
    },
  });

  await transporter.sendMail({
    from: `"EVORA Events" <${params.user}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}

export async function sendEvoraEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  const smtpUser = stripQuotes(process.env.SMTP_USER);
  // Google App Passwords are often copied with spaces ("xxxx xxxx xxxx xxxx")
  const smtpPass = stripQuotes(process.env.SMTP_PASS).replace(/\s+/g, '');
  const smtpHost = stripQuotes(process.env.SMTP_HOST) || 'smtp.gmail.com';
  const configuredPort = Number(stripQuotes(process.env.SMTP_PORT) || 465);

  if (!smtpUser || !smtpPass) {
    return {
      delivered: false,
      deliveryMode: 'preview',
      previewHtml: params.html,
      notice:
        'Mode Pratinjau Aktif: Tampilan email broadcast tetap dapat dilihat langsung di layar.',
    };
  }

  const portsToTry = configuredPort === 465 ? [465, 587] : [configuredPort];
  let lastError: unknown = null;

  for (const port of portsToTry) {
    try {
      await trySendViaTransport({
        host: smtpHost,
        port,
        user: smtpUser,
        pass: smtpPass,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });

      return {
        delivered: true,
        deliveryMode: 'smtp-gmail',
        previewHtml: params.html,
        notice: `Email resmi berhasil dikirim ke kotak masuk ${params.to}!`,
      };
    } catch (err) {
      lastError = err;
      const anyErr = err as { code?: string; responseCode?: number };
      // Do not retry second port on authentication rejection
      if (anyErr?.code === 'EAUTH' || anyErr?.responseCode === 535) {
        break;
      }
    }
  }

  const errSummary = explainSmtpError(lastError);
  console.error('SMTP delivery failed, using instant screen preview:', errSummary);
  return {
    delivered: false,
    deliveryMode: 'preview',
    previewHtml: params.html,
    notice: `${errSummary} Pratinjau email tersedia di layar.`,
  };
}

