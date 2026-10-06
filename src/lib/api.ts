/**
 * src/lib/api.ts — Type-safe HTTP Client for NeedBridge REST API.
 * All requests use credentials: 'include' for JWT cookie authentication.
 */

import type {
  User,
  NgoProfile,
  VolunteerProfile,
  Requirement,
  Application,
  Notification,
  ImpactStats,
  MatchScore,
  ApiResponse,
  PagedResult,
  SDGNumber,
  UrgencyLevel,
  ContributionType,
  RequirementStatus,
  ApplicationStatus,
} from '../../shared/types';

class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: 'include', // sends cookies
  });

  const json: ApiResponse<T> = await res.json().catch(() => ({
    ok: false,
    error: `Network error or invalid JSON response (Status: ${res.status})`,
  }));

  if (!json.ok) {
    throw new ApiError(json.error || 'Request failed', res.status, (json as any).details);
  }

  return json.data;
}

export const api = {
  // ─── Public ─────────────────────────────────────────────────────────────
  public: {
    health: () => request<{ status: string; uptime: number }>('/api/health'),
    getImpact: () => request<ImpactStats>('/api/impact'),
    getFeaturedRequirements: () => request<Requirement[]>('/api/featured/requirements'),
    getFeaturedNgos: () => request<NgoProfile[]>('/api/featured/ngos'),
    getCategories: () => request<any[]>('/api/categories'),
    suggestText: (text: string) => request<{
      category: string | null;
      urgency: UrgencyLevel;
      contributionType: ContributionType;
      sdgTags: SDGNumber[];
      skills: string[];
    }>('/api/suggest', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  },

  // ─── Auth ───────────────────────────────────────────────────────────────
  auth: {
    register: (data: { email: string; password: string; role: 'volunteer' | 'ngo'; name?: string }) =>
      request<{ user: User; profile: NgoProfile | VolunteerProfile | null }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ user: User; profile: NgoProfile | VolunteerProfile | null }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    adminLogin: (data: { email: string; password: string }) =>
      request<{ user: User; profile: null }>('/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
    me: () => request<{ user: User; profile: NgoProfile | VolunteerProfile | null }>('/api/auth/me'),
    changePassword: (data: { currentPassword?: string; newPassword: string }) =>
      request<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ─── Volunteers ─────────────────────────────────────────────────────────
  volunteers: {
    getMe: () => request<VolunteerProfile>('/api/volunteers/me'),
    updateMe: (data: Partial<VolunteerProfile>) =>
      request<VolunteerProfile>('/api/volunteers/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getMatches: () => request<Array<Requirement & { _matchScore: MatchScore }>>('/api/volunteers/me/matches'),
    getMyApplications: () => request<Application[]>('/api/volunteers/me/applications'),
  },

  // ─── NGOs ───────────────────────────────────────────────────────────────
  ngos: {
    list: async (params?: { verifiedOnly?: boolean; causeArea?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.verifiedOnly) q.set('verifiedOnly', 'true');
      if (params?.causeArea) q.set('causeArea', params.causeArea);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());
      const res = await request<PagedResult<NgoProfile> | NgoProfile[]>(`/api/ngos?${q.toString()}`);
      return Array.isArray(res) ? res : res.items;
    },
    getById: (id: string) => request<NgoProfile>(`/api/ngos/${id}`),
    getMe: () => request<NgoProfile>('/api/ngos/me'),
    updateMe: (data: Partial<NgoProfile>) =>
      request<NgoProfile>('/api/ngos/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    uploadDocument: (file: File) => {
      const fd = new FormData();
      fd.append('documents', file); // must match server multer field name
      return request<{ documents: any[]; profile: NgoProfile }>('/api/ngos/me/documents', {
        method: 'POST',
        body: fd,
      });
    },
    getMyRequirements: () => request<Requirement[]>('/api/ngos/me/requirements'),
    getMyApplications: () => request<Application[]>('/api/ngos/me/applications'),
  },

  // ─── Requirements ───────────────────────────────────────────────────────
  requirements: {
    list: async (params?: {
      category?: string;
      urgency?: UrgencyLevel;
      type?: ContributionType;
      sdgTag?: number;
      search?: string;
      status?: RequirementStatus;
      ngoId?: string;
      page?: number;
      limit?: number;
    }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.urgency) q.set('urgency', params.urgency);
      if (params?.type) q.set('type', params.type);
      if (params?.sdgTag) q.set('sdgTag', params.sdgTag.toString());
      if (params?.search) q.set('search', params.search);
      if (params?.status) q.set('status', params.status);
      if (params?.ngoId) q.set('ngoId', params.ngoId);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());
      const res = await request<PagedResult<Requirement> | Requirement[]>(`/api/requirements?${q.toString()}`);
      return Array.isArray(res) ? res : res.items;
    },
    getById: (id: string) => request<Requirement>(`/api/requirements/${id}`),
    create: (data: Partial<Requirement>) =>
      request<Requirement>('/api/requirements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Requirement>) =>
      request<Requirement>(`/api/requirements/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<{ message: string }>(`/api/requirements/${id}`, { method: 'DELETE' }),
    updateStatus: (id: string, status: RequirementStatus) =>
      request<Requirement>(`/api/requirements/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // ─── Applications & Pledges ─────────────────────────────────────────────
  applications: {
    applyOrPledge: (data: {
      requirementId: string;
      kind: 'time' | 'goods';
      message?: string;
      pledgedQuantity?: number;
    }) =>
      request<Application>('/api/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getById: (id: string) => request<Application>(`/api/applications/${id}`),
    decide: (id: string, status: 'accepted' | 'rejected') =>
      request<Application>(`/api/applications/${id}/${status === 'accepted' ? 'accept' : 'reject'}`, {
        method: 'PUT',
      }),
    withdraw: (id: string) =>
      request<Application>(`/api/applications/${id}/withdraw`, {
        method: 'PUT',
      }),
    markFulfilled: (
      id: string,
      data?: { hoursLogged?: number; proofImageUrl?: string; proofNote?: string }
    ) =>
      request<Application>(`/api/applications/${id}/fulfill`, {
        method: 'PUT',
        body: JSON.stringify(data || {}),
      }),
  },

  // ─── Notifications ──────────────────────────────────────────────────────
  notifications: {
    list: () => request<Notification[]>('/api/notifications'),
    markRead: (id: string) => request<Notification>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request<{ message: string }>('/api/notifications/read-all', { method: 'POST' }),
  },

  // ─── Admin ──────────────────────────────────────────────────────────────
  admin: {
    getOverview: () => request<any>('/api/admin/overview'),
    getUsers: async () => {
      const res = await request<PagedResult<User> | User[]>('/api/admin/users');
      return Array.isArray(res) ? res : res.items;
    },
    getPendingNgos: async () => {
      const res = await request<PagedResult<NgoProfile> | NgoProfile[]>('/api/admin/verifications?status=pending');
      return Array.isArray(res) ? res : res.items;
    },
    getAllNgos: async () => {
      const res = await request<PagedResult<NgoProfile> | NgoProfile[]>('/api/ngos');
      return Array.isArray(res) ? res : res.items;
    },
    verifyNgo: (ngoId: string, decision: 'verified' | 'rejected', note?: string) =>
      request<NgoProfile>(`/api/admin/verifications/${ngoId}`, {
        method: 'PUT',
        body: JSON.stringify({ decision, note }),
      }),
    getAllRequirements: async () => {
      const res = await request<PagedResult<Requirement> | Requirement[]>('/api/admin/requirements');
      return Array.isArray(res) ? res : res.items;
    },
  },
};
