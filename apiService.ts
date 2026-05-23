

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE}/api`;

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
    if (!res.ok) {
        const error: any = new Error(data.message || 'Request failed');
        if (data.limitReached !== undefined) error.limitReached = data.limitReached;
        throw error;
    }
    return data;
}

// ── Auth ─────────────────────────────────────────────
export const apiSendOtp = async (email: string, name: string) => {
    const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
    });
    return handleResponse(res);
};

export const apiSignup = async (name: string, email: string, password: string, otp: string) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp }),
    });
    return handleResponse(res);
};

export const apiLogin = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
};

export const apiGetMe = async () => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiGoogleLogin = async (credential: string) => {
    const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
    });
    return handleResponse(res);
};

export const apiForgotPassword = async (email: string) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return handleResponse(res);
};

export const apiResetPassword = async (email: string, otp: string, newPassword: string) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
    });
    return handleResponse(res);
};

// ── Events ───────────────────────────────────────────
export const apiGetEvents = async (cursor?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    if (limit) params.set('limit', String(limit));
    const res = await fetch(`${API_URL}/events?${params}`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiGetPublicEvents = async () => {
    const res = await fetch(`${API_URL}/events/public`, {
        headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
};

export const apiUploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/upload`, {
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
    const res = await fetch(`${API_URL}/ai/generate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title, category }),
    });
    return handleResponse(res);
};

// ── Chatbot ──────────────────────────────────────────
export const apiSendChatMessage = async (message: string, history: { role: string, text: string }[] = []) => {
    const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message, history }),
    });
    return handleResponse(res);
};

export const apiCreateEvent = async (eventData: Record<string, unknown>) => {
    const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(eventData),
    });
    return handleResponse(res);
};

export const apiUpdateEvent = async (id: number, eventData: Record<string, unknown>) => {
    const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(eventData),
    });
    return handleResponse(res);
};

export const apiDeleteEvent = async (id: number) => {
    const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
};

// ── Mega Events ──────────────────────────────────────
export const apiGetMegaEventStatus = async () => {
    const res = await fetch(`${API_URL}/mega-events/status`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiJoinMegaEvent = async () => {
    const res = await fetch(`${API_URL}/mega-events/register`, {
        method: 'POST',
        headers: authHeaders(),
    });
    return handleResponse(res);
};

export const apiGetMegaEventLineup = async () => {
    const res = await fetch(`${API_URL}/mega-events/lineup`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiAdminUpdateMegaEventLineup = async (id: number, lineUpData: Record<string, unknown>) => {
    const res = await fetch(`${API_URL}/mega-events/admin/lineup/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(lineUpData),
    });
    return handleResponse(res);
};

// ── Registrations ────────────────────────────────────
export const apiGetRegistrations = async () => {
    const res = await fetch(`${API_URL}/registrations`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiGetAllRegistrations = async () => {
    const res = await fetch(`${API_URL}/registrations/all`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiGetAllUsers = async () => {
    const res = await fetch(`${API_URL}/registrations/users`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiJoinEvent = async (eventId: number, teamName?: string) => {
    const res = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ eventId, teamName }),
    });
    return handleResponse(res);
};

export const apiLeaveEvent = async (eventId: number) => {
    const res = await fetch(`${API_URL}/registrations/${eventId}`, {
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
    const res = await fetch(`${API_URL}/discovery?${params}`, { headers: authHeaders() });
    return handleResponse(res);
};

// ── Admin ────────────────────────────────────────────
export const apiAdminGetEvents = async () => {
    const res = await fetch(`${API_URL}/admin/events`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiAdminUpdateEvent = async (id: number, eventData: Record<string, unknown>) => {
    const res = await fetch(`${API_URL}/admin/events/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(eventData),
    });
    return handleResponse(res);
};

export const apiAdminDeleteEvent = async (id: number) => {
    const res = await fetch(`${API_URL}/admin/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
};

export const apiAdminGetRegistrations = async (eventId: number) => {
    const res = await fetch(`${API_URL}/admin/events/${eventId}/registrations`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
};

export const apiAdminRemoveRegistration = async (regId: number) => {
    const res = await fetch(`${API_URL}/admin/registrations/${regId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
};

export const apiAdminGetUsers = async () => {
    const res = await fetch(`${API_URL}/admin/users`, { headers: authHeaders() });
    return handleResponse(res);
};

// ── Admin Todos ──────────────────────────────────────
export const apiAdminGetTodos = async () => {
    const res = await fetch(`${API_URL}/admin-todos`, { headers: authHeaders() });
    return handleResponse(res);
};

export const apiAdminCreateTodo = async (text: string) => {
    const res = await fetch(`${API_URL}/admin-todos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text }),
    });
    return handleResponse(res);
};

export const apiAdminUpdateTodo = async (id: number, completed: boolean) => {
    const res = await fetch(`${API_URL}/admin-todos/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ completed }),
    });
    return handleResponse(res);
};

export const apiAdminDeleteTodo = async (id: number) => {
    const res = await fetch(`${API_URL}/admin-todos/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
};

// ── Feedback (Public) ────────────────────────────────
export const apiGetFeedback = async () => {
    const res = await fetch(`${API_URL}/feedback`, {
        headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
};

export const apiSubmitFeedback = async (data: { name: string; email: string; role: string; rating: number; comment: string }) => {
    const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ── Event Specific Feedback ───────────────────────────
export const apiGetEventFeedback = async (eventId: number) => {
    const res = await fetch(`${API_URL}/events/${eventId}/feedback`, {
        headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
};

export const apiSubmitEventFeedback = async (eventId: number, data: { rating: number; comment: string }) => {
    const res = await fetch(`${API_URL}/events/${eventId}/feedback`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ── Admin Feedback ─────────────────────────────────────
export const apiAdminGetFeedback = async () => {
    const res = await fetch(`${API_URL}/admin/feedback`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
};

export const apiAdminDeleteFeedback = async (id: number) => {
    const res = await fetch(`${API_URL}/admin/feedback/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
};
