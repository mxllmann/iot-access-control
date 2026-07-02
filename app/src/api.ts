const BASE_URL = 'https://ce79-179-181-81-14.ngrok-free.app';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export type Credential = {
  _id: string;
  uid: string;
  ownerName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AccessLog = {
  _id: string;
  credentialUid: string;
  ownerName?: string;
  authorized: boolean;
  timestamp: string;
};

export type EnrollmentStatus = {
  enabled: boolean;
  status: 'waiting_credential' | 'success' | 'error' | 'already_registered';
  ownerName: string;
  uid: string | null;
  message: string;
};

export const api = {
  credentials: {
    getAll: () => request<Credential[]>('/control/credentials'),
    create: (uid: string, ownerName: string) =>
      request<Credential>('/control/credentials', {
        method: 'POST',
        body: JSON.stringify({ uid, ownerName }),
      }),
    update: (uid: string, data: { ownerName?: string; active?: boolean }) =>
      request<Credential>(`/control/credentials/${uid}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (uid: string) =>
      request<void>(`/control/credentials/${uid}`, { method: 'DELETE' }),
  },

  enrollment: {
    start: (ownerName: string) =>
      request<EnrollmentStatus>('/control/credentials/enrollment', {
        method: 'POST',
        body: JSON.stringify({ ownerName }),
      }),
    getStatus: () =>
      request<EnrollmentStatus>('/control/credentials/enrollment'),
  },

  logs: {
    getAll: (params?: { credentialUid?: string; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.credentialUid) query.set('credentialUid', params.credentialUid);
      if (params?.limit) query.set('limit', String(params.limit));
      const qs = query.toString();
      return request<AccessLog[]>(`/logs${qs ? `?${qs}` : ''}`);
    },
  },
};
