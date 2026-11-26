import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { emailBroadcasts, users } from './schema.ts';

export async function getOrCreateGoogleUser(uid: string, email: string, name: string, role = 'peserta') {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const existingByEmail = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existingByEmail[0]) {
      const updated = await db
        .update(users)
        .set({
          uid,
          name: existingByEmail[0].name || cleanName,
          role,
          verified: true,
        })
        .where(eq(users.id, existingByEmail[0].id))
        .returning();
      return updated[0];
    }

    const result = await db
      .insert(users)
      .values({
        uid,
        name: cleanName,
        email: cleanEmail,
        role,
        verified: true,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: cleanEmail,
          name: cleanName,
          role,
          verified: true,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateGoogleUser:', error);
    throw new Error('Gagal menyinkronkan akun ke database.', { cause: error });
  }
}

export async function findUserByEmail(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const rows = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database query failed in findUserByEmail:', error);
    throw new Error('Gagal memeriksa data pengguna.', { cause: error });
  }
}

export async function findUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database query failed in findUserByUid:', error);
    throw new Error('Gagal mengambil profil pengguna.', { cause: error });
  }
}

export async function upsertVerifiedEmailUser(params: {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}) {
  try {
    const cleanEmail = params.email.trim().toLowerCase();
    const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existing[0]) {
      const updated = await db
        .update(users)
        .set({
          name: params.name.trim(),
          passwordHash: params.passwordHash,
          role: params.role,
          verified: true,
        })
        .where(eq(users.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const inserted = await db
      .insert(users)
      .values({
        uid: params.uid,
        name: params.name.trim(),
        email: cleanEmail,
        passwordHash: params.passwordHash,
        role: params.role,
        verified: true,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in upsertVerifiedEmailUser:', error);
    throw new Error('Gagal menyimpan akun terverifikasi.', { cause: error });
  }
}

export async function saveUserAvatar(uid: string, avatarJson: string) {
  try {
    const updated = await db
      .update(users)
      .set({ avatarConfig: avatarJson })
      .where(eq(users.uid, uid))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Database query failed in saveUserAvatar:', error);
    throw new Error('Gagal menyimpan konfigurasi avatar.', { cause: error });
  }
}

export async function logEmailBroadcast(params: {
  userId?: number;
  recipientEmail: string;
  subject: string;
  deliveryMode: string;
}) {
  try {
    await db.insert(emailBroadcasts).values({
      userId: params.userId,
      recipientEmail: params.recipientEmail.trim().toLowerCase(),
      subject: params.subject,
      deliveryMode: params.deliveryMode,
    });
  } catch (error) {
    console.error('Database query failed in logEmailBroadcast:', error);
    throw new Error('Gagal mencatat riwayat broadcast email.', { cause: error });
  }
}
