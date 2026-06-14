import { SignJWT, jwtVerify } from 'jose'
import { usuariosAPI } from './api.js'

const CLAVE_SECRETA = new TextEncoder().encode('ferreteria_secret_key_2024')
const CLAVE_TOKEN = 'token'

const generarToken = async (usuario) => {
  return await new SignJWT({
    id: usuario.id,
    nombre: usuario.name,
    email: usuario.email,
    role: usuario.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2m')
    .sign(CLAVE_SECRETA)
}

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
    const respuesta = await usuariosAPI.buscarPorEmail(email)
    const usuario = respuesta.data[0]

    if (!usuario || usuario.password !== password) {
      return { success: false, message: 'Credenciales invalidas' }
    }

    const token = await generarToken(usuario)
    localStorage.setItem(CLAVE_TOKEN, token)
    return { success: true, usuario }
  } catch {
    return { success: false, message: 'Error al conectar con el servidor' }
  }
}

export const registro = async (datosUsuario) => {
  try {
    const respuesta = await usuariosAPI.obtenerTodos()
    const usuarioExistente = respuesta.data.find(u => u.email === datosUsuario.email)

    if (usuarioExistente) {
      return { success: false, message: 'El email ya esta registrado' }
    }

    const nuevoUsuario = await usuariosAPI.crear({ ...datosUsuario, role: 'user' })
    const token = await generarToken(nuevoUsuario.data)
    localStorage.setItem(CLAVE_TOKEN, token)
    return { success: true, usuario: nuevoUsuario.data }
  } catch {
    return { success: false, message: 'Error al registrar usuario' }
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