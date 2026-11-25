import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  createOtpChallenge,
  findUserByEmail,
  findUserByUid,
  getLatestOtpChallenge,
  getOrCreateGoogleUser,
  incrementOtpAttempt,
  logEmailBroadcast,
  markOtpConsumed,
  saveUserAvatar,
  upsertVerifiedEmailUser,
} from './src/db/users.ts';
import {
  AuthenticatedRequest,
  generateSixDigitOtp,
  hashOtp,
  hashPassword,
  requireAuth,
  signSessionToken,
  verifyOtpHash,
  verifyPassword,
} from './src/lib/auth-server.ts';
import {
  buildOtpEmailHtml,
  buildWelcomeBroadcastEmailHtml,
  sendEvoraEmail,
} from './src/lib/email-service.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const VALID_ROLES = new Set(['peserta', 'organizer', 'admin']);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitizeRole(role: unknown): 'peserta' | 'organizer' | 'admin' {
  if (typeof role === 'string' && VALID_ROLES.has(role)) {
    return role as 'peserta' | 'organizer' | 'admin';
  }
  return 'peserta';
}

const EVORA_SYSTEM_INSTRUCTION = `Kamu adalah Bot AI EVORA, asisten virtual resmi yang ramah, rapi, dan sistematis untuk platform manajemen event EVORA (karya Muhammad Satrio Wibisono).

SELALU jawab dengan format yang TERSTRUKTUR dan SISTEMATIS menggunakan:
- Judul singkat atau ringkasan 1 kalimat di awal
- Poin bernomor (1., 2., 3.) untuk langkah-langkah berurutan
- Bullet (-) dengan penekanan **kata kunci tebal** untuk daftar fitur atau pilihan
- Paragraf ringkas (hindari dinding teks panjang)

Pengetahuan resmi EVORA yang wajib kamu kuasai dan jelaskan secara sistematis bila ditanya:

1. **Apa Saja yang Bisa Dilakukan di Website EVORA**:
   - **Jelajahi Peta & Rute Google Maps Real-Time**: Lihat lokasi event di Indonesia, cari area lewat Google Places, aktifkan GPS real-time, hitung jalur rute langsung di peta, lalu klik **"Buka Rute di Google Maps"** untuk navigasi langsung.
   - **Mode Jalur Jadwal (Timeline)**: Pantau urutan tanggal & rundown acara secara kronologis.
   - **Beli Tiket & E-Tiket QR (Peserta)**: Pilih kategori tiket, gunakan kode promo (mis. \`EVORA20\`, \`DESIGN15\`), dapatkan e-tiket QR, pengingat H-1, check-in acara, dan unduh sertifikat kehadiran.
   - **Gabung atau Buat Event (Panitia / Organizer)**: Klik **"Ikut Jadi Panitia (+1 Streak)"** di kartu event atau ajukan event baru dari Dashboard Panitia (mendukung 3 langkah wizard, check-in QR peserta, dan laporan evaluasi).
   - **Streak Panitia Bulanan & Mini Quest**: Kumpulkan streak aktif tiap bulan (dengan animasi api menyala & mode beku pelindung es) serta mainkan mini-game EVORA Quest untuk membuka maskot.
   - **Kamar Ganti Avatar Chibi Estetik**: Setelah Sign In / Sign Up, buka halaman **Profil & Avatar** untuk mengubah bentuk wajah, alis, warna kulit & riasan, mata, hidung, mulut, rambut, baju, jaket, sepatu, hingga aksesoris di dalam kamar lemari estetik, lalu simpan atau unduh sebagai Icon PNG.
   - **Verifikasi Admin Platform**: Role Admin mereview pengajuan event panitia (Publikasikan ke Peta atau Kirim Catatan Revisi).

2. **Cara Daftar & Login (Verifikasi OTP Gmail + Broadcast Sambutan)**:
   - Klik tombol **Sign In / Sign Up** atau **Registrasi Akun Panitia** di bar atas.
   - Pilih peran akun: **Peserta**, **Panitia**, atau **Admin**.
   - Isi **Nama Lengkap**, **Email Gmail aktif**, dan **Kata Sandi** (minimal 6 karakter), lalu klik **Kirim Kode OTP ke Gmail**.
   - Sistem akan mengirim **6 digit kode OTP** ke alamat Gmail kamu (berlaku 10 menit). Masukkan kode OTP tersebut di layar verifikasi.
   - Setelah OTP terverifikasi, akun aktif di database dan kamu langsung menerima **Email Welcome Broadcast EVORA** berisi sorotan event bulan ini, kode promo, dan panduan ringkas!
   - Alternatif cepat: Tersedia juga tombol **Masuk dengan Google** untuk login instan memakai akun Google.

3. **Layanan Bantuan & Kontak Resmi Creator**:
   - **Creator**: Muhammad Satrio Wibisono
   - **Instagram**: @msriotsss
   - **Customer Service WhatsApp**: 089603963329
   - **Email Keluh Kesah & Masukan**: msriotss@gmail.com`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // ================= AUTH: REGISTER (SEND 6-DIGIT OTP TO GMAIL) =================
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');
    const cleanRole = sanitizeRole(role);

    if (cleanName.length < 2) {
      res.status(400).json({ error: 'Nama lengkap minimal 2 karakter.' });
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({ error: 'Masukkan alamat email Gmail yang valid.' });
      return;
    }
    if (cleanPassword.length < 6) {
      res.status(400).json({ error: 'Kata sandi minimal 6 karakter demi keamanan akun.' });
      return;
    }

    try {
      const existing = await findUserByEmail(cleanEmail);
      if (existing && existing.verified && existing.passwordHash) {
        res.status(409).json({
          error: 'Email ini sudah terdaftar dan terverifikasi. Silakan langsung Masuk (Login).',
        });
        return;
      }

      const otp = generateSixDigitOtp();
      const otpHash = hashOtp(cleanEmail, otp);
      const passwordHash = hashPassword(cleanPassword);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await createOtpChallenge({
        email: cleanEmail,
        name: cleanName,
        role: cleanRole,
        passwordHash,
        otpHash,
        expiresAt,
      });

      const html = buildOtpEmailHtml({
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        otp,
      });

      const mailResult = await sendEvoraEmail({
        to: cleanEmail,
        subject: `[EVORA] Kode OTP Verifikasi Akun: ${otp}`,
        html,
        text: `Halo ${cleanName}, kode OTP verifikasi akun EVORA kamu adalah: ${otp} (berlaku 10 menit).`,
      });

      res.json({
        ok: true,
        email: cleanEmail,
        delivered: mailResult.delivered,
        deliveryMode: mailResult.deliveryMode,
        notice: mailResult.notice,
        otpPreviewHtml: mailResult.previewHtml,
        devOtpHint: mailResult.deliveryMode === 'preview' ? otp : undefined,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal memproses pendaftaran.';
      res.status(500).json({ error: msg });
    }
  });

  // ================= AUTH: RESEND OTP =================
  app.post('/api/auth/resend-otp', async (req, res) => {
    const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({ error: 'Email tidak valid.' });
      return;
    }

    try {
      const latest = await getLatestOtpChallenge(cleanEmail);
      if (!latest) {
        res.status(404).json({ error: 'Belum ada pendaftaran aktif untuk email ini.' });
        return;
      }

      const otp = generateSixDigitOtp();
      const otpHash = hashOtp(cleanEmail, otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await createOtpChallenge({
        email: cleanEmail,
        name: latest.name,
        role: latest.role,
        passwordHash: latest.passwordHash,
        otpHash,
        expiresAt,
      });

      const html = buildOtpEmailHtml({
        name: latest.name,
        email: cleanEmail,
        role: latest.role,
        otp,
      });

      const mailResult = await sendEvoraEmail({
        to: cleanEmail,
        subject: `[EVORA] Kode OTP Baru: ${otp}`,
        html,
        text: `Halo ${latest.name}, kode OTP baru EVORA kamu adalah: ${otp} (berlaku 10 menit).`,
      });

      res.json({
        ok: true,
        email: cleanEmail,
        delivered: mailResult.delivered,
        deliveryMode: mailResult.deliveryMode,
        notice: mailResult.notice,
        otpPreviewHtml: mailResult.previewHtml,
        devOtpHint: mailResult.deliveryMode === 'preview' ? otp : undefined,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengirim ulang OTP.';
      res.status(500).json({ error: msg });
    }
  });

  // ================= AUTH: VERIFY OTP & SEND FUN WELCOME BROADCAST TO GMAIL =================
  app.post('/api/auth/verify-otp', async (req, res) => {
    const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
    const cleanOtp = String(req.body?.otp || '').replace(/\D/g, '');

    if (!isValidEmail(cleanEmail) || cleanOtp.length !== 6) {
      res.status(400).json({ error: 'Masukkan email dan 6 digit kode OTP dengan benar.' });
      return;
    }

    try {
      const challenge = await getLatestOtpChallenge(cleanEmail);
      if (!challenge || challenge.consumed) {
        res.status(400).json({ error: 'Kode OTP tidak ditemukan atau sudah digunakan. Kirim ulang kode baru.' });
        return;
      }
      if (new Date(challenge.expiresAt).getTime() < Date.now()) {
        res.status(400).json({ error: 'Kode OTP sudah kedaluwarsa (>10 menit). Silakan kirim ulang OTP.' });
        return;
      }
      if (challenge.attempts >= 5) {
        res.status(429).json({ error: 'Terlalu banyak percobaan salah. Silakan kirim ulang OTP baru.' });
        return;
      }

      if (!verifyOtpHash(cleanEmail, cleanOtp, challenge.otpHash)) {
        await incrementOtpAttempt(challenge.id, challenge.attempts);
        res.status(400).json({
          error: `Kode OTP salah. Sisa percobaan: ${Math.max(0, 4 - challenge.attempts)}x.`,
        });
        return;
      }

      await markOtpConsumed(challenge.id);

      const uid = `evr_${crypto.randomUUID()}`;
      const userRecord = await upsertVerifiedEmailUser({
        uid,
        name: challenge.name,
        email: cleanEmail,
        passwordHash: challenge.passwordHash,
        role: challenge.role,
      });

      const token = signSessionToken({
        uid: userRecord.uid,
        email: userRecord.email,
        role: userRecord.role,
      });

      const broadcastSubject = `🎉 Selamat Datang di EVORA, ${userRecord.name}! Jadwal Event & Promo Spesial`;
      const broadcastHtml = buildWelcomeBroadcastEmailHtml({
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        appUrl: process.env.APP_URL,
      });

      const broadcastResult = await sendEvoraEmail({
        to: userRecord.email,
        subject: broadcastSubject,
        html: broadcastHtml,
        text: `Selamat bergabung di EVORA, ${userRecord.name}! Gunakan kode promo EVORA20 dan jelajahi rute event di Google Maps EVORA.`,
      });

      await logEmailBroadcast({
        userId: userRecord.id,
        recipientEmail: userRecord.email,
        subject: broadcastSubject,
        deliveryMode: broadcastResult.deliveryMode,
      });

      res.json({
        ok: true,
        token,
        user: {
          id: userRecord.uid,
          name: userRecord.name,
          email: userRecord.email,
          role: sanitizeRole(userRecord.role),
          verified: userRecord.verified,
        },
        avatarConfig: userRecord.avatarConfig ? JSON.parse(userRecord.avatarConfig) : null,
        broadcastEmail: {
          subject: broadcastSubject,
          delivered: broadcastResult.delivered,
          deliveryMode: broadcastResult.deliveryMode,
          notice: broadcastResult.notice,
          previewHtml: broadcastResult.previewHtml,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Verifikasi OTP gagal.';
      res.status(500).json({ error: msg });
    }
  });

  // ================= AUTH: REAL LOGIN =================
  app.post('/api/auth/login', async (req, res) => {
    const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
    const cleanPassword = String(req.body?.password || '');
    const requestedRole = req.body?.role ? sanitizeRole(req.body.role) : null;

    if (!isValidEmail(cleanEmail) || !cleanPassword) {
      res.status(400).json({ error: 'Masukkan email dan kata sandi dengan lengkap.' });
      return;
    }

    try {
      const userRecord = await findUserByEmail(cleanEmail);
      if (!userRecord || !userRecord.passwordHash) {
        res.status(401).json({
          error: 'Email belum terdaftar atau memakai Google Sign-In. Silakan Registrasi Akun dulu.',
        });
        return;
      }

      if (!verifyPassword(cleanPassword, userRecord.passwordHash)) {
        res.status(401).json({ error: 'Kata sandi tidak sesuai. Silakan periksa kembali.' });
        return;
      }

      if (!userRecord.verified) {
        res.status(403).json({
          error: 'Akun belum terverifikasi OTP Gmail. Silakan registrasi ulang untuk verifikasi.',
        });
        return;
      }

      const activeRole = requestedRole || sanitizeRole(userRecord.role);
      const token = signSessionToken({
        uid: userRecord.uid,
        email: userRecord.email,
        role: activeRole,
      });

      res.json({
        ok: true,
        token,
        user: {
          id: userRecord.uid,
          name: userRecord.name,
          email: userRecord.email,
          role: activeRole,
          verified: true,
        },
        avatarConfig: userRecord.avatarConfig ? JSON.parse(userRecord.avatarConfig) : null,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal masuk ke akun.';
      res.status(500).json({ error: msg });
    }
  });

  // ================= AUTH: GOOGLE SIGN-IN SYNC =================
  app.post('/api/auth/google', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const cleanRole = sanitizeRole(req.body?.role);
      const existing = await findUserByEmail(req.authUser.email);
      const userRecord = await getOrCreateGoogleUser(
        req.authUser.uid,
        req.authUser.email,
        req.authUser.name || req.authUser.email.split('@')[0],
        cleanRole
      );

      let broadcastEmail = null;
      if (!existing) {
        const broadcastSubject = `🎉 Selamat Datang di EVORA, ${userRecord.name}! Jadwal Event & Promo Spesial`;
        const broadcastHtml = buildWelcomeBroadcastEmailHtml({
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.role,
          appUrl: process.env.APP_URL,
        });
        const mailRes = await sendEvoraEmail({
          to: userRecord.email,
          subject: broadcastSubject,
          html: broadcastHtml,
          text: `Selamat bergabung di EVORA, ${userRecord.name}!`,
        });
        await logEmailBroadcast({
          userId: userRecord.id,
          recipientEmail: userRecord.email,
          subject: broadcastSubject,
          deliveryMode: mailRes.deliveryMode,
        });
        broadcastEmail = {
          subject: broadcastSubject,
          delivered: mailRes.delivered,
          deliveryMode: mailRes.deliveryMode,
          notice: mailRes.notice,
          previewHtml: mailRes.previewHtml,
        };
      }

      res.json({
        ok: true,
        user: {
          id: userRecord.uid,
          name: userRecord.name,
          email: userRecord.email,
          role: sanitizeRole(userRecord.role),
          verified: userRecord.verified,
        },
        avatarConfig: userRecord.avatarConfig ? JSON.parse(userRecord.avatarConfig) : null,
        broadcastEmail,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal sinkronisasi akun Google.';
      res.status(500).json({ error: msg });
    }
  });

  // ================= PROFILE: SAVE & LOAD AVATAR =================
  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const userRecord =
        (await findUserByUid(req.authUser.uid)) || (await findUserByEmail(req.authUser.email));
      if (!userRecord) {
        res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        return;
      }
      res.json({
        user: {
          id: userRecord.uid,
          name: userRecord.name,
          email: userRecord.email,
          role: sanitizeRole(userRecord.role),
          verified: userRecord.verified,
        },
        avatarConfig: userRecord.avatarConfig ? JSON.parse(userRecord.avatarConfig) : null,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal memuat profil.';
      res.status(500).json({ error: msg });
    }
  });

  app.put('/api/profile/avatar', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const avatarConfig = req.body?.avatarConfig;
      if (!avatarConfig || typeof avatarConfig !== 'object') {
        res.status(400).json({ error: 'Konfigurasi avatar tidak valid.' });
        return;
      }
      const updated = await saveUserAvatar(req.authUser.uid, JSON.stringify(avatarConfig));
      if (!updated) {
        res.status(404).json({ error: 'Akun pengguna tidak ditemukan.' });
        return;
      }
      res.json({ ok: true, avatarConfig });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan avatar.';
      res.status(500).json({ error: msg });
    }
  });

  // ================= SEND / PREVIEW FUN BROADCAST EMAIL =================
  app.post('/api/auth/send-broadcast', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const userRecord =
        (await findUserByUid(req.authUser.uid)) || (await findUserByEmail(req.authUser.email));
      const name = userRecord?.name || req.authUser.name || req.authUser.email.split('@')[0];
      const role = userRecord?.role || req.authUser.role || 'peserta';
      const subject = `✨ EVORA Event Broadcast: Agenda Seru & Promo Buat ${name}!`;
      const html = buildWelcomeBroadcastEmailHtml({
        name,
        email: req.authUser.email,
        role,
        appUrl: process.env.APP_URL,
      });
      const result = await sendEvoraEmail({
        to: req.authUser.email,
        subject,
        html,
        text: `Halo ${name}, ini dia broadcast jadwal event seru & promo EVORA20 di EVORA!`,
      });
      await logEmailBroadcast({
        userId: userRecord?.id,
        recipientEmail: req.authUser.email,
        subject,
        deliveryMode: result.deliveryMode,
      });

      res.json({
        ok: true,
        subject,
        delivered: result.delivered,
        deliveryMode: result.deliveryMode,
        notice: result.notice,
        previewHtml: result.previewHtml,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengirim broadcast.';
      res.status(500).json({ error: msg });
    }
  });

  // ================= BOT AI EVORA (SYSTEMATIC GEMINI CHAT) =================
  app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi pada panel Settings > Secrets.',
      });
      return;
    }

    const { messages } = req.body as {
      messages?: Array<{ role: 'user' | 'assistant'; text: string }>;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Pesan chat tidak boleh kosong.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = messages.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.text || '').slice(0, 2000) }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: EVORA_SYSTEM_INSTRUCTION,
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({ error: 'Bot AI tidak mengembalikan jawaban. Silakan coba lagi.' });
        return;
      }

      res.json({ reply: replyText });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada Bot AI.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EVORA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
