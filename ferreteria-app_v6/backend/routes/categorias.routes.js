import express from 'express'
import pool from '../db.js'
import { verificarToken, soloAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// ─── OBTENER TODAS ────────────────────────────────────────────────────────────
router.get('/', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        idCategoria AS id,
        Nombre_Categoria AS name,
        Descripcion AS description,
        Simbologia AS icon
       FROM Categoria`
    )
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener categorías' })
  }
})

// ─── CREAR ────────────────────────────────────────────────────────────────────
router.post('/', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, descripcion, simbologia } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO Categoria (Nombre_Categoria, Descripcion, Simbologia) VALUES (?, ?, ?)',
      [nombre, descripcion || '', simbologia || '📦']
    )
    res.status(201).json({ id: result.insertId, message: 'Categoría creada' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al crear categoría' })
  }
})

// actualizar
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, descripcion, simbologia } = req.body
  try {
    await pool.query(
      'UPDATE Categoria SET Nombre_Categoria=?, Descripcion=?, Simbologia=? WHERE idCategoria=?',
      [nombre, descripcion || '', simbologia || '📦', req.params.id]
    )
    res.json({ message: 'Categoría actualizada' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar categoría' })
  }
})

//eliminar
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM Categoria WHERE idCategoria = ?', [req.params.id])
    res.json({ message: 'Categoría eliminada' })
  } catch {
    res.status(500).json({ message: 'Error al eliminar categoría' })
  }
})

export default router