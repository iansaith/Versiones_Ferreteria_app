import axios from 'axios'
//se cambio el puerto de 3001 a 3005
const API_BASE_URL = 'http://localhost:3005'

const api = axios.create({
  baseURL: API_BASE_URL
})

// ✅ Adjunta el JWT en cada request automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`)
}

export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (user) => api.post('/users', user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`),
  findByEmail: (email) => api.get(`/users?email=${email}`)
}

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (category) => api.post('/categories', category),
  update: (id, category) => api.put(`/categories/${id}`, category),
  delete: (id) => api.delete(`/categories/${id}`)
}

export default api