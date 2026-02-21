import { User } from './types';

const API_BASE = 'http://localhost:3000/api';

function getToken(): string | null {
    return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
}

async function handleResponse(res: Response) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

// ── Auth ─────────────────────────────────────────────
export const apiSendOtp = async (email: string, name: string) => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
    });
    return handleResponse(res);
};

export const apiSignup = async (name: string, email: string, password: string, otp: string) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp }),
    });
    return handleResponse(res);
};

export const apiLogin = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
};

export const apiGetMe = async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiGoogleLogin = async (credential: string) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
    });
    return handleResponse(res);
};

// ── Events ───────────────────────────────────────────
export const apiGetEvents = async (cursor?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    if (limit) params.set('limit', String(limit));
    const res = await fetch(`${API_BASE}/events?${params}`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiUploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
            // Do not set Content-Type header manually when using FormData, 
            // the browser sets it automatically with the correct boundary
            Authorization: `Bearer ${getToken()}`
        },
        body: formData,
    });
    return handleResponse(res);
};

export const apiGenerateDescription = async (title: string, category: string) => {
    const res = await fetch(`${API_BASE}/ai/generate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title, category }),
    });
    return handleResponse(res);
};

export const apiCreateEvent = async (eventData: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(eventData),
    });
    return handleResponse(res);
};

export const apiUpdateEvent = async (id: number, eventData: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(eventData),
    });
    return handleResponse(res);
};

export const apiDeleteEvent = async (id: number) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
};

// ── Registrations ────────────────────────────────────
export const apiGetRegistrations = async () => {
    const res = await fetch(`${API_BASE}/registrations`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiGetAllRegistrations = async () => {
    const res = await fetch(`${API_BASE}/registrations/all`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiGetAllUsers = async () => {
    const res = await fetch(`${API_BASE}/registrations/users`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiJoinEvent = async (eventId: number) => {
    const res = await fetch(`${API_BASE}/registrations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ eventId }),
    });
    return handleResponse(res);
};

export const apiLeaveEvent = async (eventId: number) => {
    const res = await fetch(`${API_BASE}/registrations/${eventId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
};

// ── Discovery ────────────────────────────────────────
export const apiDiscovery = async (cursor?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    if (limit) params.set('limit', String(limit));
    const res = await fetch(`${API_BASE}/discovery?${params}`, { headers: authHeaders() });
    return handleResponse(res);
};

// ── Admin ────────────────────────────────────────────
export const apiAdminGetEvents = async () => {
    const res = await fetch(`${API_BASE}/admin/events`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiAdminUpdateEvent = async (id: number, eventData: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/admin/events/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(eventData),
    });
    return handleResponse(res);
};

export const apiAdminDeleteEvent = async (id: number) => {
    const res = await fetch(`${API_BASE}/admin/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
};

export const apiAdminGetRegistrations = async (eventId: number) => {
    const res = await fetch(`${API_BASE}/admin/events/${eventId}/registrations`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
};

export const apiAdminRemoveRegistration = async (regId: number) => {
    const res = await fetch(`${API_BASE}/admin/registrations/${regId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
};

export const apiAdminGetUsers = async () => {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() });
    return handleResponse(res);
};
