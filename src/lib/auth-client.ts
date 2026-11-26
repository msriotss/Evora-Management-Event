import { AvatarConfig, UserAccount } from '../types/evora';
import { UserRole } from '../components/EvoraMascots';

export interface BroadcastEmailInfo {
  subject: string;
  delivered: boolean;
  deliveryMode: string;
  notice: string;
  previewHtml: string;
}

export const PENDING_GOOGLE_ROLE_KEY = 'evora_pending_google_role';

export async function parseJsonResponse<T>(res: Response): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  rawText: string;
}> {
  const rawText = await res.text();
  if (!rawText) {
    return { ok: res.ok, status: res.status, data: null, rawText: '' };
  }
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(rawText) as T, rawText };
  } catch {
    return { ok: res.ok, status: res.status, data: null, rawText };
  }
}

export async function syncGoogleTokenWithServer(params: {
  idToken: string;
  role: UserRole;
  timeoutMs?: number;
}): Promise<{
  user: UserAccount;
  token: string;
  avatarConfig: AvatarConfig | null;
  broadcastEmail: BroadcastEmailInfo | null;
}> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), params.timeoutMs ?? 15000);
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.idToken}`,
      },
      signal: controller.signal,
      body: JSON.stringify({ role: params.role }),
    });

    const parsed = await parseJsonResponse<{
      ok?: boolean;
      token?: string;
      user?: UserAccount;
      avatarConfig?: AvatarConfig | null;
      broadcastEmail?: BroadcastEmailInfo | null;
      error?: string;
    }>(res);

    if (!parsed.ok || !parsed.data?.user) {
      const fallbackError =
        parsed.data?.error ||
        (parsed.status === 404 || parsed.status >= 500
          ? `Server autentikasi Google belum siap (HTTP ${parsed.status}). Pastikan server EVORA berjalan.`
          : 'Gagal menyinkronkan akun Google dengan server EVORA.');
      throw new Error(fallbackError);
    }

    return {
      user: parsed.data.user,
      token: parsed.data.token || params.idToken,
      avatarConfig: parsed.data.avatarConfig ?? null,
      broadcastEmail: parsed.data.broadcastEmail ?? null,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
