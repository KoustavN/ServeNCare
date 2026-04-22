import axios from 'axios';

const baseURL = '/api';

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(err);
  }
);

export async function uploadImage(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await client.post('/upload/image', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.url;
}

export const auth = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  googleLogin: (credential) => client.post('/auth/google', { credential }),
  register: (body) => client.post('/auth/register', body),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => client.post('/auth/reset-password', { token, newPassword }),
  me: () => client.get('/auth/me'),
  updateMe: (body) => client.patch('/auth/me', body),
};

export const categories = {
  list: () => client.get('/categories'),
  flat: () => client.get('/categories/flat'),
  get: (id) => client.get(`/categories/${id}`),
};

export const services = {
  list: (params) => client.get('/services', { params }),
  get: (id) => client.get(`/services/${id}`),
  create: (data) => client.post('/services', data),
  update: (id, data) => client.patch(`/services/${id}`, data),
  remove: (id) => client.delete(`/services/${id}`),
};

export const bookings = {
  list: (params) => client.get('/bookings', { params }),
  get: (id) => client.get(`/bookings/${id}`),
  create: (data) => client.post('/bookings', data),
  confirm: (id) => client.patch(`/bookings/${id}/confirm`),
  reject: (id) => client.patch(`/bookings/${id}/reject`),
  complete: (id, data) => client.patch(`/bookings/${id}/complete`, data),
  cancel: (id) => client.patch(`/bookings/${id}/cancel`),
  counterOffer: (id, data) => client.patch(`/bookings/${id}/counter-offer`, data),
  acceptCounter: (id) => client.patch(`/bookings/${id}/accept-counter`),
  rejectCounter: (id) => client.patch(`/bookings/${id}/reject-counter`),
};

export const reviews = {
  byService: (serviceId) => client.get(`/reviews/service/${serviceId}`),
  create: (data) => client.post('/reviews', data),
};

export const provider = {
  services: () => client.get('/provider/services'),
  profile: () => client.get('/provider/profile'),
  updateProfile: (data) => client.put('/provider/profile', data),
  availability: () => client.get('/provider/availability'),
  setAvailability: (slots) => client.put('/provider/availability', { slots }),
  earnings: () => client.get('/provider/earnings'),
  sos: (body) => client.post('/provider/sos', body),
};

export const notifications = {
  list: (params) => client.get('/notifications', { params }),
  markRead: (id) => client.patch(`/notifications/${id}/read`),
  markAllRead: () => client.patch('/notifications/read-all'),
};

export const wallet = {
  get: () => client.get('/wallet'),
};

export const admin = {
  services: (params) => client.get('/services/admin/all', { params }),
  providers: (params) => client.get('/admin/providers', { params }),
  verifyProvider: (id) => client.patch(`/admin/providers/${id}/verify`),
  stats: () => client.get('/admin/stats'),
  sosList: (params) => client.get('/admin/sos', { params }),
  sosAssign: (id) => client.patch(`/admin/sos/${id}/assign`),
  sosResolve: (id) => client.patch(`/admin/sos/${id}/resolve`),
};

export const favorites = {
  list: () => client.get('/favorites'),
  add: (serviceId) => client.post(`/favorites/${serviceId}`),
  remove: (serviceId) => client.delete(`/favorites/${serviceId}`),
};

export const chat = {
  send: (message, history, lang) =>
    client.post('/chat', { message, history, lang }),
};

export default client;
