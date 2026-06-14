import axios from 'axios'

const URL_BASE = 'http://localhost:3005'

const api = axios.create({
  baseURL: URL_BASE
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const productosAPI = {
  obtenerTodos: () => api.get('/products'),
  crear: (producto) => api.post('/products', producto),
  actualizar: (id, producto) => api.put(`/products/${id}`, producto),
  eliminar: (id) => api.delete(`/products/${id}`)
}

export const usuariosAPI = {
  obtenerTodos: () => api.get('/users'),
  crear: (usuario) => api.post('/users', usuario),
  actualizar: (id, usuario) => api.put(`/users/${id}`, usuario),
  eliminar: (id) => api.delete(`/users/${id}`),
  buscarPorEmail: (email) => api.get(`/users?email=${email}`)
}

export const categoriasAPI = {
  obtenerTodos: () => api.get('/categories'),
  crear: (categoria) => api.post('/categories', categoria),
  actualizar: (id, categoria) => api.put(`/categories/${id}`, categoria),
  eliminar: (id) => api.delete(`/categories/${id}`)
}

export default api