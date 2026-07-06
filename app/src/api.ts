const BASE_URL = 'https://aed1-189-28-42-50.ngrok-free.app';

let authToken: string | null = null;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export type User = {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Credential = {
  _id: string;
  uid: string;
  ownerName: string;
  userId?: string;
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
  userId: string | null;
  uid: string | null;
  message: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export const api = {
  setToken(token: string | null) {
    authToken = token;
  },

  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>('/control/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<User>('/control/auth/me'),
    createUser: (email: string, name: string, password: string, role: 'admin' | 'user') =>
      request<User>('/control/auth/create-user', {
        method: 'POST',
        body: JSON.stringify({ email, name, password, role }),
      }),
  },

  users: {
    getAll: () => request<User[]>('/control/users'),
    update: (id: string, data: { name?: string; role?: string; active?: boolean }) =>
      request<User>(`/control/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/control/users/${id}`, { method: 'DELETE' }),
  },

  credentials: {
    getAll: () => request<Credential[]>('/control/credentials'),
    create: (uid: string, ownerName: string, userId?: string) =>
      request<Credential>('/control/credentials', {
        method: 'POST',
        body: JSON.stringify({ uid, ownerName, userId }),
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
    start: (ownerName: string, userId?: string) =>
      request<EnrollmentStatus>('/control/credentials/enrollment', {
        method: 'POST',
        body: JSON.stringify({ ownerName, userId }),
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
