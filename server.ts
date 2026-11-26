import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  findUserByEmail,
  findUserByUid,
  getOrCreateGoogleUser,
  logEmailBroadcast,
  saveUserAvatar,
  upsertVerifiedEmailUser,
} from './src/db/users.ts';
import {
  AuthenticatedRequest,
  hashPassword,
  requireAuth,
  signSessionToken,
  verifyPassword,
} from './src/lib/auth-server.ts';
import {
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // ================= AUTH: MANUAL REGISTER =================
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
      res.status(400).json({ error: 'Masukkan alamat email yang valid.' });
      return;
    }
    if (cleanPassword.length < 6) {
      res.status(400).json({ error: 'Kata sandi minimal 6 karakter demi keamanan akun.' });
      return;
    }

    try {
      const existing = await findUserByEmail(cleanEmail);
      if (existing && existing.passwordHash) {
        res.status(409).json({
          error: 'Email ini sudah terdaftar. Silakan langsung Masuk (Login).',
        });
        return;
      }

      const uid = existing?.uid || `evr_${crypto.randomUUID()}`;
      const passwordHash = hashPassword(cleanPassword);
      const userRecord = await upsertVerifiedEmailUser({
        uid,
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: cleanRole,
      });

      const token = signSessionToken({
        uid: userRecord.uid,
        email: userRecord.email,
        role: sanitizeRole(userRecord.role),
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
          verified: true,
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
      const msg = error instanceof Error ? error.message : 'Gagal memproses pendaftaran.';
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
          error: 'Email belum terdaftar atau memakai Google Sign-In. Silakan Daftar Akun dulu.',
        });
        return;
      }

      if (!verifyPassword(cleanPassword, userRecord.passwordHash)) {
        res.status(401).json({ error: 'Kata sandi tidak sesuai. Silakan periksa kembali.' });
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
