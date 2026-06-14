import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Token requerido' })

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = payload
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

export const soloAdmin = (req, res, next) => {
  if (req.usuario.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' })
  }
  next()
}