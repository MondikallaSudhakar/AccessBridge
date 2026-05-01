import api from './api';

const authService = {
    getTokenPayload() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const [, payload] = token.split('.');
            if (!payload) return null;

            const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
            const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '='));
            return JSON.parse(json);
        } catch {
            return null;
        }
    },

    isTokenExpired(token = localStorage.getItem('token')) {
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
    },

    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response));
        }
        return response;
    },

    async register(userData) {
        const response = await api.post('/auth/register', userData);
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response));
        }
        return response;
    },

    async getProfile(userId) {
        return api.get(`/users/profile/${userId}`);
    },

    async updateProfile(userId, profileData) {
        const response = await api.put(`/users/profile/${userId}`, profileData);
        const currentUser = this.getCurrentUser();
        if (currentUser && String(currentUser.userId ?? currentUser.id) === String(userId)) {
            const merged = { ...currentUser, ...response, userId: response.id ?? currentUser.userId ?? currentUser.id };
            localStorage.setItem('user', JSON.stringify(merged));
        }
        return response;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        if (this.isTokenExpired()) {
            this.logout();
            return null;
        }

        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    }
};

export default authService;
