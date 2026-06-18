  import express from 'express'
  import pool from '../db.js'
  import { verificarToken, soloAdmin } from '../middleware/auth.middleware.js'

  const router = express.Router()
router.get('/', verificarToken, async (req, res) => {

  const { categoria, orden, stock } = req.query

  let query = `
    SELECT 
      p.idProducto AS id,
      p.Nombre_Producto AS name,
      p.Stock_Minimo AS minStock,
      p.ubicacion AS currentLocation,
      p.price,
      p.wholesalePrice,
      p.profit,
      c.Nombre_Categoria AS category,
      c.idCategoria AS categoriaId,
      pr.Nombre_Proveedor AS mainSupplier,
      pr.idProveedor AS proveedorId,
      IFNULL(SUM(
        CASE
          WHEN m.Tipo_Movimiento = 'Entrada' THEN m.Cantidad_Movimiento
          WHEN m.Tipo_Movimiento = 'Salida' THEN -m.Cantidad_Movimiento
        END
      ), 0) AS stock
    FROM Producto p
    LEFT JOIN Categoria c ON p.Categoria_idCategoria = c.idCategoria
    LEFT JOIN Proveedor pr ON p.Proveedor_idProveedor = pr.idProveedor
    LEFT JOIN Movimiento_Inventario m ON p.idProducto = m.Producto_idProducto
  `

  const condiciones = []

  if (categoria) {
    condiciones.push(`c.Nombre_Categoria = '${categoria}'`)
  }

  if (condiciones.length > 0) {
    query += ` WHERE ${condiciones.join(' AND ')}`
  }

  query += `
    GROUP BY p.idProducto, p.Nombre_Producto, p.Stock_Minimo,
             p.ubicacion, p.price, p.wholesalePrice, p.profit,
             c.Nombre_Categoria, c.idCategoria,
             pr.Nombre_Proveedor, pr.idProveedor
  `

  if (stock === 'bajo') {
    query += `
      HAVING stock <= minStock
    `
  }

  if (orden === 'precioAsc') {
    query += ` ORDER BY p.price ASC`
  }

  if (orden === 'precioDesc') {
    query += ` ORDER BY p.price DESC`
  }

  try {
    const [rows] = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener productos' })
  }
})






  //crear
  router.post('/', verificarToken, soloAdmin, async (req, res) => {
    let { name, minStock, stock, currentLocation, category, mainSupplier, price, wholesalePrice, profit } = req.body

    name = name?.trim()
    mainSupplier = mainSupplier?.trim()
    category = category?.trim()
    currentLocation = currentLocation?.trim() || 'Estante 1'

    if (!name || !mainSupplier || price === undefined || price === null || wholesalePrice === undefined || wholesalePrice === null) {
      return res.status(400).json({ message: 'Faltan campos obligatorios para crear el producto' })
    }

    minStock = parseInt(minStock) || 0
    price = parseFloat(price)
    wholesalePrice = parseFloat(wholesalePrice)
    profit = parseFloat(profit)

    if (isNaN(price) || isNaN(wholesalePrice)) {
      return res.status(400).json({ message: 'Precio y precio mayorista deben ser números válidos' })
    }
    if (isNaN(profit)) {
      profit = price - wholesalePrice
    }

    try {
      // Busca el id de la categoría por nombre
      const [cats] = await pool.query(
        'SELECT idCategoria FROM Categoria WHERE Nombre_Categoria = ?', [category]
      )
      const categoriaId = cats[0]?.idCategoria || null

      // Busca el id del proveedor por nombre, lo crea si no existe
      let [provs] = await pool.query(
        'SELECT idProveedor FROM Proveedor WHERE Nombre_Proveedor = ?', [mainSupplier]
      )
      let proveedorId = provs[0]?.idProveedor
      if (!proveedorId) {
        const [nuevo] = await pool.query(
          'INSERT INTO Proveedor (Nombre_Proveedor) VALUES (?)', [mainSupplier]
        )
        proveedorId = nuevo.insertId
      }

      // Inserta el producto
      const [result] = await pool.query(
        `INSERT INTO Producto 
        (Nombre_Producto, Stock_Minimo, ubicacion, Categoria_idCategoria, Proveedor_idProveedor, price, wholesalePrice, profit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, minStock || 0, currentLocation, categoriaId, proveedorId, price || 0, wholesalePrice || 0, profit || 0]
      )

      // Registra el stock inicial como movimiento de entrada
      const stockInicial = parseInt(stock)
      if (!isNaN(stockInicial) && stockInicial > 0) {
        await pool.query(
          `INSERT INTO Movimiento_Inventario 
          (Tipo_Movimiento, Cantidad_Movimiento, Usuarios_idUsuarios, Producto_idProducto)
          VALUES ('Entrada', ?, 1, ?)`,
          [stockInicial, result.insertId]
        )
      }

      res.status(201).json({ id: result.insertId, message: 'Producto creado' })
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ya existe un producto con ese nombre' })
      }
      console.error(error)
      res.status(500).json({ message: 'Error al crear producto' })
    }
  })

  //actualizar
  router.put('/:id', verificarToken, async (req, res) => {
    const { name, minStock, currentLocation, category, mainSupplier, price, wholesalePrice, profit, stock, esCompra, usuarioId } = req.body

    try {
      const [cats] = await pool.query(
        'SELECT idCategoria FROM Categoria WHERE Nombre_Categoria = ?', [category]
      )
      const categoriaId = cats[0]?.idCategoria || null

      let proveedorId = null
      if (mainSupplier) {
        let [provs] = await pool.query(
          'SELECT idProveedor FROM Proveedor WHERE Nombre_Proveedor = ?', [mainSupplier]
        )
        proveedorId = provs[0]?.idProveedor
        if (!proveedorId) {
          const [nuevo] = await pool.query(
            'INSERT INTO Proveedor (Nombre_Proveedor) VALUES (?)', [mainSupplier]
          )
          proveedorId = nuevo.insertId
        }
      }

      await pool.query(
        `UPDATE Producto SET 
          Nombre_Producto=?, Stock_Minimo=?, ubicacion=?,
          Categoria_idCategoria=?, Proveedor_idProveedor=?,
          price=?, wholesalePrice=?, profit=?
        WHERE idProducto=?`,
        [name, minStock || 0, currentLocation, categoriaId, proveedorId,
        price || 0, wholesalePrice || 0, profit || 0, req.params.id]
      )

      if (esCompra && stock) {
        await pool.query(
          `INSERT INTO Movimiento_Inventario 
          (Tipo_Movimiento, Cantidad_Movimiento, Usuarios_idUsuarios, Producto_idProducto)
          VALUES ('Salida', ?, ?, ?)`,
          [stock, usuarioId || 1, req.params.id]
        )
      }

  if (req.body.stockNuevo && parseInt(req.body.stockNuevo) > 0) {
    await pool.query(
      `INSERT INTO Movimiento_Inventario 
      (Tipo_Movimiento, Cantidad_Movimiento, Usuarios_idUsuarios, Producto_idProducto)
      VALUES ('Entrada', ?, 1, ?)`,
      [parseInt(req.body.stockNuevo), req.params.id]
    )
  }
      res.json({ message: 'Producto actualizado' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error al actualizar producto' })
    }
  })



  //eliminar
  router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
    try {
      await pool.query('DELETE FROM Producto WHERE idProducto = ?', [req.params.id])
      res.json({ message: 'Producto eliminado' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error al eliminar producto' })
    }
  })

  export default router