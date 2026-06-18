import express from 'express'
import pool from '../db.js'
import { verificarToken } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        m.idMovimiento_Inventario AS id,
        m.Fecha_Movimiento AS fecha,
        m.Tipo_Movimiento AS tipo,
        m.Cantidad_Movimiento AS cantidad,
        p.Nombre_Producto AS producto,
        u.Nombre AS usuario
       FROM Movimiento_Inventario m
       JOIN Producto p ON m.Producto_idProducto = p.idProducto
       JOIN Usuarios u ON m.Usuarios_idUsuarios = u.idUsuarios
       ORDER BY m.Fecha_Movimiento DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener movimientos' })
  }
})

export default router