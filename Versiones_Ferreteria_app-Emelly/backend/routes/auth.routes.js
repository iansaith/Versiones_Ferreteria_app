import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { enviarCorreo } from '../services/email.service.js'

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




router.post('/recuperar', async (req, res) => {
  const { email } = req.body

  try {

    const [usuarios] = await pool.query(
      'SELECT idUsuarios, Email FROM Usuarios WHERE Email = ?',
      [email]
    )

    if (usuarios.length === 0) {
      return res.json({
        message: 'Si el correo existe, recibirá instrucciones.'
      })
    }

    const usuario = usuarios[0]

    const token = crypto.randomBytes(32).toString('hex')

    const expiracion = new Date(
      Date.now() + 60 * 60 * 1000
    )

    await pool.query(
      `INSERT INTO Password_Reset
      (usuario_id, token, expiracion)
      VALUES (?, ?, ?)`,
      [usuario.idUsuarios, token, expiracion]
    )

    const enlace =
      `http://localhost:3000/restablecer/${token}`

    await enviarCorreo(usuario.Email, enlace)
console.log('TOKEN GENERADO:', token)
console.log('ENLACE:', enlace)



    res.json({
      message: 'Correo enviado'
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error del servidor'
    })
  }
})


// ===============================
// RECUPERAR CONTRASEÑA
// ===============================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body

  console.log('ENTRO A FORGOT PASSWORD')
  console.log('EMAIL RECIBIDO:', email)

  try {
    const [usuario] = await pool.query(
  'SELECT idUsuarios, Email FROM Usuarios WHERE Email = ?',
  [email]
)
console.log('USUARIO ENCONTRADO:', usuario)
console.log('ID USUARIO:', usuario[0].idUsuarios)

    console.log('USUARIO ENCONTRADO:', usuario)

    if (usuario.length === 0) {
      return res.json({
        success: true,
        message: 'Si el correo existe, se enviará un enlace.'
      })
    }

    console.log('GENERANDO TOKEN')

    const token = crypto.randomBytes(32).toString('hex')

    const expiracion = new Date()
    expiracion.setHours(expiracion.getHours() + 1)

    console.log('GUARDANDO TOKEN EN MYSQL')

    await pool.query(
  'INSERT INTO password_resets (usuario_id, token, expiracion) VALUES (?, ?, ?)',
  [usuario[0].idUsuarios, token, expiracion]
) 

    console.log('TOKEN GUARDADO')

    const enlace = `${process.env.FRONTEND_URL}/reset-password/${token}`

    console.log('ENVIANDO CORREO...')

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <h2>Recuperar contraseña</h2>
        <a href="${enlace}">
          Cambiar contraseña
        </a>
      `
    })

    console.log('CORREO ENVIADO')
    console.log(info)

    res.json({
      success: true,
      message: 'Correo enviado correctamente'
    })

  } catch (error) {
    console.error('ERROR FORGOT PASSWORD:')
    console.error(error)

    res.status(500).json({
      message: 'Error al enviar correo'
    })
  }
})

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body

  try {

   const [rows] = await pool.query(
  `SELECT * FROM password_resets
   WHERE token = ?
   AND expiracion > NOW()
   ORDER BY id DESC
   LIMIT 1`,
  [token]
)

    if (rows.length === 0) {
      return res.status(400).json({
        message: 'Token inválido o expirado'
      })
    }

    const usuarioId = rows[0].usuario_id

const [usuarios] = await pool.query(
  'SELECT Email FROM Usuarios WHERE idUsuarios = ?',
  [usuarioId]
)

const email = usuarios[0].Email

    const hash = await bcrypt.hash(password, 10)

    await pool.query(
      'UPDATE Usuarios SET Contrasena = ? WHERE Email = ?',
      [hash, email]
    )

 await pool.query(
  'DELETE FROM password_resets WHERE usuario_id = ?',
  [usuarioId]
)

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al actualizar contraseña'
    })
  }
})



export default router