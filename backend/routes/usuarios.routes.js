import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db.js'
import { verificarToken, soloAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()


router.get('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.idUsuarios AS id, u.Nombre AS name, u.Email AS email, r.Nombre_Rol AS role
       FROM Usuarios u JOIN Roles r ON u.Roles_idRoles = r.idRoles`
    )
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener usuarios' })
  }
})

//crear
router.post('/', verificarToken, soloAdmin, async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    const [existe] = await pool.query(
      'SELECT idUsuarios FROM Usuarios WHERE Email = ?', [email]
    )
    if (existe.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    const rolId = role === 'Administrador' ? 1 : 2
    const hash = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO Usuarios (Nombre, Email, Contrasena, Roles_idRoles) VALUES (?, ?, ?, ?)',
      [name, email, hash, rolId]
    )
    res.status(201).json({ id: result.insertId, message: 'Usuario creado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al crear usuario' })
  }
})

//actualizar
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    const rolId = role === 'Administrador' ? 1 : 2

    if (password) {
      const hash = await bcrypt.hash(password, 10)
      await pool.query(
        'UPDATE Usuarios SET Nombre=?, Email=?, Contrasena=?, Roles_idRoles=? WHERE idUsuarios=?',
        [name, email, hash, rolId, req.params.id]
      )
    } else {
      await pool.query(
        'UPDATE Usuarios SET Nombre=?, Email=?, Roles_idRoles=? WHERE idUsuarios=?',
        [name, email, rolId, req.params.id]
      )
    }
    res.json({ message: 'Usuario actualizado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar usuario' })
  }
})

//eliminar
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM Usuarios WHERE idUsuarios = ?', [req.params.id])
    res.json({ message: 'Usuario eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar usuario' })
  }
})

export default router