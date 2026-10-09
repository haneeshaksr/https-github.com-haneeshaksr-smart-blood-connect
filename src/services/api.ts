import { User, DonorProfile, HospitalProfile, BloodInventoryItem, BloodRequest, DonorResponse, Notification, SystemStats } from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('smart_blood_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('smart_blood_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('smart_blood_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // Public
  getStats: () => request<{ success: boolean; data: SystemStats }>('/public/stats'),
  findBlood: (params: { bloodGroup?: string; component?: string; city?: string; includeCompatible?: boolean }) => {
    const query = new URLSearchParams();
    if (params.bloodGroup) query.set('bloodGroup', params.bloodGroup);
    if (params.component) query.set('component', params.component);
    if (params.city) query.set('city', params.city);
    if (params.includeCompatible) query.set('includeCompatible', 'true');
    return request<{
      success: boolean;
      data: {
        exactMatches: BloodInventoryItem[];
        compatibleMatches: BloodInventoryItem[];
        totalExactUnits: number;
        totalCompatibleUnits: number;
        disclaimer: string;
      };
    }>(`/public/find-blood?${query.toString()}`);
  },
  getVerifiedHospitals: () => request<{ success: boolean; data: any[] }>('/public/verified-hospitals'),
  createPublicRequest: (payload: any) => request<{ success: boolean; message: string; data: BloodRequest }>('/public/request-blood', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Auth
  registerDonor: (payload: any) => request<{ success: boolean; message: string; token: string; user: User; profile: DonorProfile }>('/auth/register-donor', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  registerHospital: (payload: any) => request<{ success: boolean; message: string; token: string; user: User; profile: HospitalProfile }>('/auth/register-hospital', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  login: (payload: any) => request<{ success: boolean; token: string; user: User; donorProfile?: DonorProfile; hospitalProfile?: HospitalProfile }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getMe: () => request<{ success: boolean; user: User; donorProfile?: DonorProfile; hospitalProfile?: HospitalProfile }>('/auth/me'),
  demoSwitch: (roleType: string) => request<{ success: boolean; token: string; user: User; donorProfile?: DonorProfile; hospitalProfile?: HospitalProfile }>('/auth/demo-switch', {
    method: 'POST',
    body: JSON.stringify({ roleType }),
  }),

  // Donor
  getDonorProfile: () => request<{ success: boolean; data: { user: User; profile: DonorProfile } }>('/donor/profile'),
  updateDonorProfile: (payload: any) => request<{ success: boolean; data: DonorProfile }>('/donor/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  submitScreening: (payload: any) => request<{ success: boolean; message: string; data: any }>('/donor/screening', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  toggleDonorAvailability: (status: 'available' | 'unavailable') => request<{ success: boolean; data: { availabilityStatus: string } }>('/donor/availability', {
    method: 'PUT',
    body: JSON.stringify({ availabilityStatus: status }),
  }),
  getMatchingRequests: (params?: { city?: string; priority?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.city) query.set('city', params.city);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.status) query.set('status', params.status);
    return request<{ success: boolean; data: BloodRequest[] }>(`/donor/matching-requests?${query.toString()}`);
  },
  respondToRequest: (payload: { requestId: string; status: string; contactConsent: boolean; notes?: string }) => request<{ success: boolean; message: string; data: DonorResponse }>('/donor/respond', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getDonorNotifications: () => request<{ success: boolean; data: Notification[] }>('/donor/notifications'),
  markDonorNotificationRead: (id: string) => request<{ success: boolean }>(`/donor/notifications/${id}/read`, { method: 'PUT' }),
  getDonorHistory: () => request<{ success: boolean; data: { donations: any[]; responses: DonorResponse[] } }>('/donor/history'),

  // Hospital
  getHospitalDashboard: () => request<{
    success: boolean;
    data: {
      hospital: HospitalProfile;
      verificationStatus: string;
      isVerified: boolean;
      metrics: {
        totalRequests: number;
        pendingRequests: number;
        inProgressRequests: number;
        fulfilledRequests: number;
        totalAvailableUnits: number;
        expiredUnitsCount: number;
        lowStockAlertsCount: number;
        totalInventoryRecords: number;
      };
      recentNotifications: Notification[];
    };
  }>('/hospital/dashboard-overview'),
  getHospitalInventory: () => request<{ success: boolean; data: BloodInventoryItem[] }>('/hospital/inventory'),
  addHospitalInventory: (payload: any) => request<{ success: boolean; message: string; data: BloodInventoryItem }>('/hospital/inventory', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateHospitalInventory: (id: string, payload: any) => request<{ success: boolean; data: BloodInventoryItem }>(`/hospital/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteHospitalInventory: (id: string) => request<{ success: boolean }>(`/hospital/inventory/${id}`, { method: 'DELETE' }),
  getHospitalRequests: () => request<{ success: boolean; data: BloodRequest[] }>('/hospital/requests'),
  createHospitalRequest: (payload: any) => request<{ success: boolean; message: string; data: BloodRequest }>('/hospital/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateRequestStatus: (id: string, payload: { status: string; comment?: string }) => request<{ success: boolean; data: BloodRequest }>(`/hospital/requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  broadcastRequest: (id: string) => request<{ success: boolean; message: string; data: { notifiedDonorsCount: number; request: BloodRequest } }>(`/hospital/requests/${id}/broadcast`, {
    method: 'POST',
  }),
  getRequestResponses: (id: string) => request<{ success: boolean; data: DonorResponse[] }>(`/hospital/requests/${id}/responses`),
  updateDonorResponse: (id: string, payload: any) => request<{ success: boolean; data: DonorResponse }>(`/hospital/responses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  recordDonation: (payload: any) => request<{ success: boolean; message: string; data: any }>('/hospital/record-donation', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getHospitalProfile: () => request<{ success: boolean; data: HospitalProfile }>('/hospital/profile'),
  updateHospitalProfile: (payload: any) => request<{ success: boolean; data: HospitalProfile }>('/hospital/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  // Admin
  getAdminDashboard: () => request<{ success: boolean; data: any }>('/admin/dashboard'),
  getAdminHospitals: (status?: string) => request<{ success: boolean; data: HospitalProfile[] }>(`/admin/hospitals${status ? `?status=${status}` : ''}`),
  verifyHospital: (id: string, payload: { status: 'verified' | 'rejected'; notes: string }) => request<{ success: boolean; message: string; data: HospitalProfile }>(`/admin/hospitals/${id}/verify`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  getAdminUsers: (params?: { role?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    return request<{ success: boolean; data: any[] }>(`/admin/users?${query.toString()}`);
  },
  toggleUserStatus: (id: string, status: 'active' | 'suspended') => request<{ success: boolean; data: any }>(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  getAdminRequests: () => request<{ success: boolean; data: BloodRequest[] }>('/admin/requests'),
  getAdminAuditLogs: () => request<{ success: boolean; data: any[] }>('/admin/audit-logs'),
  getAdminInventoryAudit: () => request<{ success: boolean; data: any }>('/admin/inventory-audit'),
};
