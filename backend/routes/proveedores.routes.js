import express from 'express'
import pool from '../db.js'
import { verificarToken, soloAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT idProveedor AS id, Nombre_Proveedor AS nombre, Contacto AS contacto FROM Proveedor'
    )
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener proveedores' })
  }
})

router.post('/', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, contacto } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO Proveedor (Nombre_Proveedor, Contacto) VALUES (?, ?)',
      [nombre, contacto || null]
    )
    res.status(201).json({ id: result.insertId, message: 'Proveedor creado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al crear proveedor' })
  }
})

router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, contacto } = req.body
  try {
    await pool.query(
      'UPDATE Proveedor SET Nombre_Proveedor=?, Contacto=? WHERE idProveedor=?',
      [nombre, contacto || null, req.params.id]
    )
    res.json({ message: 'Proveedor actualizado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar proveedor' })
  }
})

router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const [related] = await pool.query(
      'SELECT COUNT(*) AS count FROM Producto WHERE Proveedor_idProveedor = ?',
      [req.params.id]
    )

    if (related[0].count > 0) {
      return res.status(409).json({
        message: 'No se puede eliminar el proveedor porque tiene productos asociados'
      })
    }

    await pool.query('DELETE FROM Proveedor WHERE idProveedor = ?', [req.params.id])
    res.json({ message: 'Proveedor eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar proveedor' })
  }
})

export default router