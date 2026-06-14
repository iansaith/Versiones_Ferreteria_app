import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

// LOGIN 


router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    
    const [rows] = await pool.query(
      `SELECT u.idUsuarios, u.Nombre, u.Email, u.Contrasena, r.Nombre_Rol
       FROM Usuarios u
       JOIN Roles r ON u.Roles_idRoles = r.idRoles
       WHERE u.Email = ?`,
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const usuario = rows[0]

    const passwordValida = await bcrypt.compare(password, usuario.Contrasena)
    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      {
        id: usuario.idUsuarios,
        nombre: usuario.Nombre,
        email: usuario.Email,
        role: usuario.Nombre_Rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    )

    res.json({
      success: true,
      token,
      usuario: {
        id: usuario.idUsuarios,
        nombre: usuario.Nombre,
        email: usuario.Email,
        role: usuario.Nombre_Rol
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// registro
router.post('/registro', async (req, res) => {
  const { name, email, password } = req.body

  try {
    const [existe] = await pool.query(
      'SELECT idUsuarios FROM Usuarios WHERE Email = ?',
      [email]
    )

    if (existe.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    const hash = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO Usuarios (Nombre, Email, Contrasena, Roles_idRoles) VALUES (?, ?, ?, 2)',
      [name, email, hash]
    )

    const token = jwt.sign(
      {
        id: result.insertId,
        nombre: name,
        email,
        role: 'Encargado del inventario'
      },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    )

    res.status(201).json({
      success: true,
      token,
      usuario: {
        id: result.insertId,
        nombre: name,
        email,
        role: 'Encargado del inventario'
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

export default router