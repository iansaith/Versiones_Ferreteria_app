import { SignJWT, jwtVerify } from 'jose'
import { usersAPI } from './api'

const SECRET_KEY = new TextEncoder().encode('ferreteria_secret_key_2024')
const TOKEN_KEY = 'token'

const generarToken = async (user) => {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(SECRET_KEY)
}

export const verifyToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload
  } catch {
    return null
  }
}

export const login = async (email, password) => {
  try {
    const response = await usersAPI.findByEmail(email)
    const user = response.data[0]

    if (!user || user.password !== password) {
      return { success: false, message: 'Credenciales inválidas' }
    }

    const token = await generarToken(user)
    localStorage.setItem(TOKEN_KEY, token)
    return { success: true, user }
  } catch {
    return { success: false, message: 'Error al conectar con el servidor' }
  }
}

export const register = async (userData) => {
  try {
    const response = await usersAPI.getAll()
    const existingUser = response.data.find(u => u.email === userData.email)

    if (existingUser) {
      return { success: false, message: 'Email ya registrado' }
    }

    const newUserData = { ...userData, role: 'user' }
    const newUser = await usersAPI.create(newUserData)

    const token = await generarToken(newUser.data)
    localStorage.setItem(TOKEN_KEY, token)
    return { success: true, user: newUser.data }
  } catch {
    return { success: false, message: 'Error al registrar usuario' }
  }
}

export const getCurrentUser = async () => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  return await verifyToken(token)
}

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)