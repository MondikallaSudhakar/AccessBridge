const BASE_URL = '/api';

const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const [, payload] = token.split('.');
        if (!payload) return true;

        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '='));
        const decoded = JSON.parse(json);
        return !decoded.exp || Date.now() >= decoded.exp * 1000;
    } catch {
        return true;
    }
};

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error('Session expired. Please sign in again.')
        }

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            
            let data = null;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            }

            if (!response.ok) {
                const errorMessage = data?.error || data?.message || `Error ${response.status}: ${response.statusText}`;
                if (response.status === 401 && token) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    },

    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
    },

    patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },
};

export default api;
