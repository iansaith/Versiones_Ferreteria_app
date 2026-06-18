import axios from 'axios'

const URL_BASE = 'http://localhost:4000/api'

const api = axios.create({
  baseURL: URL_BASE
})

// Adjunta el JWT en cada request automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})


export const movimientosAPI = {
  obtenerTodos: () => api.get('/movimientos')
}




// ─── PROVEEDORES ────────────────────────────────────────────────────────────
export const proveedoresAPI = {
  obtenerTodos: () => api.get('/proveedores'),
  crear: (proveedor) => api.post('/proveedores', proveedor),
  actualizar: (id, proveedor) => api.put(`/proveedores/${id}`, proveedor),
  eliminar: (id) => api.delete(`/proveedores/${id}`)
}

// ─── PRODUCTOS ──────────────────────────────────────────────────────────────
export const productosAPI = {
  obtenerTodos: () => api.get('/productos'),

  obtenerFiltrados: (params) =>
    api.get('/productos', { params }),

  crear: (producto) => api.post('/productos', producto),

  actualizar: (id, producto) =>
    api.put(`/productos/${id}`, producto),

  eliminar: (id) =>
    api.delete(`/productos/${id}`)
}

// ─── USUARIOS ───────────────────────────────────────────────────────────────
export const usuariosAPI = {
  obtenerTodos: () => api.get('/usuarios'),
  crear: (usuario) => api.post('/usuarios', usuario),
  actualizar: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
  eliminar: (id) => api.delete(`/usuarios/${id}`)
}

// ─── CATEGORÍAS ─────────────────────────────────────────────────────────────
export const categoriasAPI = {
  obtenerTodos: () => api.get('/categorias'),
  crear: (categoria) => api.post('/categorias', categoria),
  actualizar: (id, categoria) => api.put(`/categorias/${id}`, categoria),
  eliminar: (id) => api.delete(`/categorias/${id}`)
}

// ─── AUTENTICACIÓN ──────────────────────────────────────────────────────────
export const authAPI = {
  login: (datos) => api.post('/auth/login', datos),

  registro: (datos) => api.post('/auth/registro', datos),

  recuperarPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post('/auth/reset-password', {
      token,
      password
    })
}

export default api