import api from './api';

const authService = {
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
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    }
};

export default authService;
