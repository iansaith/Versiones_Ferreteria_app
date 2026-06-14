import { jwtVerify } from 'jose'
import { authAPI } from './api.js'

const CLAVE_SECRETA = new TextEncoder().encode('ferreteria_secret_key_2024')
const CLAVE_TOKEN = 'token'

export const verificarToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, CLAVE_SECRETA)
    return payload
  } catch {
    return null
  }
}

export const login = async (email, password) => {
  try {
    const respuesta = await authAPI.login({ email, password })
    const { token, usuario } = respuesta.data

    localStorage.setItem(CLAVE_TOKEN, token)
    return { success: true, usuario }
  } catch (error) {
    const mensaje = error.response?.data?.message || 'Error al conectar con el servidor'
    return { success: false, message: mensaje }
  }
}

export const registro = async (datosUsuario) => {
  try {
    const respuesta = await authAPI.registro(datosUsuario)
    const { token, usuario } = respuesta.data

    localStorage.setItem(CLAVE_TOKEN, token)
    return { success: true, usuario }
  } catch (error) {
    const mensaje = error.response?.data?.message || 'Error al registrar usuario'
    return { success: false, message: mensaje }
  }
}

export const obtenerUsuarioActual = async () => {
  const token = localStorage.getItem(CLAVE_TOKEN)
  if (!token) return null
  return await verificarToken(token)
}

export const cerrarSesion = () => {
  localStorage.removeItem(CLAVE_TOKEN)
}

export const obtenerToken = () => localStorage.getItem(CLAVE_TOKEN)