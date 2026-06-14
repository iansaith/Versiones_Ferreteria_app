  import { useState, useEffect } from 'react'
  import ItemProducto from './I_producto.jsx'
  import FormularioProducto from './F_producto.jsx'
  import Carrito from './Carrito.jsx'
  import { productosAPI } from '../api.js'
  const ListaProductos = ({ esAdmin, usuarioActual }) => {  const [productos, setProductos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [productoEditando, setProductoEditando] = useState(null)
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [carrito, setCarrito] = useState([])
    const [mostrarCarrito, setMostrarCarrito] = useState(false)
    const [mensajeCompra, setMensajeCompra] = useState('')
    const [filtros, setFiltros] = useState({ nombre: '', categoria: '', ubicacion: '', proveedor: '' })
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [ordenPrecio, setOrdenPrecio] = useState('')
  const [soloStockBajo, setSoloStockBajo] = useState(false)
  const normalizarTexto = (valor = '') => String(valor ?? '').toLowerCase().trim()
    const formatearPrecio = (valor) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor || 0)
    }
    const calcularTotales = (lista) => {
      return lista.reduce((totales, producto) => {
        totales.cantidad += 1
        totales.valorTotal += parseFloat(producto.price) || 0
        totales.gananciaTotal += parseFloat(producto.profit) || 0
        return totales
      }, { cantidad: 0, valorTotal: 0, gananciaTotal: 0 })
    }
  const cargarProductos = async () => {
    setCargando(true)
    try {
      const respuesta = await productosAPI.obtenerTodos()

      console.log("Productos recibidos:", respuesta.data)
      setProductos(respuesta.data || [])
      setError('')
    } catch (error) {
      console.error(error)
      setError('Error cargando productos')
    } finally {
      setCargando(false)
    }
  }
    useEffect(() => {
      cargarProductos()
    }, [])
  useEffect(() => {
    console.log("ListaProductos MONTADO")

    return () => {
      console.log("ListaProductos DESMONTADO")
    }
  }, [])
    const manejarGuardado = () => {
      setProductoEditando(null)
      setMostrarFormulario(false)
      cargarProductos()
    }
    const manejarEdicion = (producto) => {
      if (!esAdmin) return alert('Solo administradores pueden editar')
      setProductoEditando(producto)
      setMostrarFormulario(true)
    }
    const manejarEliminacion = async (id) => {
      if (!esAdmin) return alert('Solo administradores pueden eliminar')
      if (window.confirm('Eliminar producto?')) {
        try {
          await productosAPI.eliminar(id)
          cargarProductos()
        } catch {
          alert('Error eliminando producto')
        }
      }
    }

  // ─── CARRITO ──────────────────────────────────────────────────────────────────
  const agregarAlCarrito = (producto) => {
    console.log("Producto agregado:", producto)

    setCarrito(prev => {
      const existente = prev.find(
        i => String(i.id) === String(producto.id)
      )
      let nuevoCarrito
      if (existente) {
        if (existente.cantidad >= parseInt(producto.stock)) {
          console.log("Stock máximo alcanzado")
          return prev
        }
        nuevoCarrito = prev.map(i =>
          String(i.id) === String(producto.id)
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      } else {
        nuevoCarrito = [...prev, { ...producto, cantidad: 1 }]
      }

      console.log("Nuevo carrito:", nuevoCarrito)

      return nuevoCarrito
    })

    setMostrarCarrito(true)
  }
  const cambiarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return
    setCarrito(prev =>
      prev.map(i => String(i.id) === String(id) ? { ...i, cantidad: nuevaCantidad } : i)
    )
  }
  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(i => String(i.id) !== String(id)))
  }
  const confirmarCompra = async (items) => {
    try {
      await Promise.all(items.map(item =>
        productosAPI.actualizar(item.id, {
          name: item.name,
          minStock: item.minStock,
          currentLocation: item.currentLocation,
          category: item.category,
          mainSupplier: item.mainSupplier,
          price: item.price,
          wholesalePrice: item.wholesalePrice,
          profit: item.profit,
          stock: item.cantidad,
          esCompra: true,
          usuarioId: usuarioActual?.id
        })
      ))
      setCarrito([])
      setMostrarCarrito(false)
      setMensajeCompra('Compra confirmada correctamente')
      setTimeout(() => setMensajeCompra(''), 3000)
      cargarProductos()
    } catch {
      alert('Error al confirmar la compra')
    }
  }
    const totalItemsCarrito = carrito.reduce((total, item) => total + item.cantidad, 0)
    const totales = calcularTotales(productos)

    const categoriasDisponibles = [...new Set(productos.map(p => p.category).filter(Boolean))].sort()

    let productosFiltrados = productos.filter(p => {
    const nombre = normalizarTexto(p.name).includes(normalizarTexto(filtros.nombre))
    const categoria = normalizarTexto(p.category).includes(normalizarTexto(filtros.categoria))
    const ubicacion = normalizarTexto(p.currentLocation).includes(normalizarTexto(filtros.ubicacion))
    const proveedor = normalizarTexto(p.mainSupplier).includes(normalizarTexto(filtros.proveedor))

    const filtroCategoria = !categoriaFiltro || normalizarTexto(p.category) === normalizarTexto(categoriaFiltro)
    const filtroStock = !soloStockBajo || parseInt(p.stock, 10) <= parseInt(p.minStock, 10)

    return nombre && categoria && ubicacion && proveedor && filtroCategoria && filtroStock
  })
  if (ordenPrecio === 'precioAsc') {
    productosFiltrados.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
  }
  if (ordenPrecio === 'precioDesc') {
    productosFiltrados.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
  }

    if (cargando) return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-warning" role="status" />
      </div>
    )
    console.log('Estado carrito:', carrito, 'Mostrar:', mostrarCarrito)

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-0">Productos ({totales.cantidad})</h2>
            {esAdmin && (
              <p className="text-muted mb-0">
                Ganancia total: <strong className="text-success">{formatearPrecio(totales.gananciaTotal)}</strong>
              </p>
            )}
          </div>
  
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary position-relative"
              onClick={() => setMostrarCarrito(!mostrarCarrito)}
            >
              Carrito
              {totalItemsCarrito > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {totalItemsCarrito}
                </span>
              )}
            </button>
            {esAdmin && (
              <button
                className="btn btn-warning"
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
              >
                {mostrarFormulario ? 'Cancelar' : 'Nuevo Producto'}
              </button>
            )}
          </div>
        </div>
        {mensajeCompra && <div className="alert alert-success">{mensajeCompra}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card p-3 mb-4">
          <div className="row g-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre..."
                value={filtros.nombre}
                onChange={e => setFiltros(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por categoria..."
                value={filtros.categoria}
                onChange={e => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por ubicacion..."
                value={filtros.ubicacion}
                onChange={e => setFiltros(prev => ({ ...prev, ubicacion: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por proveedor..."
                value={filtros.proveedor}
                onChange={e => setFiltros(prev => ({ ...prev, proveedor: e.target.value }))}
              />
            </div>

            
            <div className="col-md-3">
              <select
                className="form-select"
                value={categoriaFiltro}
                onChange={e => setCategoriaFiltro(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categoriasDisponibles.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={ordenPrecio}
                onChange={e => setOrdenPrecio(e.target.value)}
              >
                <option value="">Sin ordenar</option>
                <option value="precioAsc">Precio: menor a mayor</option>
                <option value="precioDesc">Precio: mayor a menor</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-center">
              <label className="form-check-label ms-2" htmlFor="stockBajo">Solo stock bajo</label>
              <input
                id="stockBajo"
                className="form-check-input ms-2"
                type="checkbox"
                checked={soloStockBajo}
                onChange={e => setSoloStockBajo(e.target.checked)}
              />
            </div>
          </div>
          {(filtros.nombre || filtros.categoria || filtros.ubicacion || filtros.proveedor || categoriaFiltro || soloStockBajo) && (
            <div className="mt-2 d-flex justify-content-between align-items-center">
              <small className="text-muted">{productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''}</small>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setFiltros({ nombre: '', categoria: '', ubicacion: '', proveedor: '' }); setCategoriaFiltro(''); setOrdenPrecio(''); setSoloStockBajo(false) }}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
        {mostrarCarrito && (
          <div className="mb-4">
            <Carrito
              items={carrito}
              onCambiarCantidad={cambiarCantidad}
              onEliminarItem={eliminarDelCarrito}
              onConfirmarCompra={confirmarCompra}
              onCerrar={() => setMostrarCarrito(false)}
            />
          </div>
        )}
        {mostrarFormulario && esAdmin && (
          <FormularioProducto
            producto={productoEditando}
            onGuardar={manejarGuardado}
            onCancelar={() => { setProductoEditando(null); setMostrarFormulario(false) }}
          />
        )}
        <div className="product-grid">
          {productosFiltrados.length === 0 ? (
            <div className="card text-center p-5">
              <h4>No se encontraron productos</h4>
              <p className="text-muted">Intenta con otros filtros</p>
            </div>
          ) : (
            productosFiltrados.map(producto => (
              <ItemProducto
                key={producto.id}
                producto={producto}
                esAdmin={esAdmin}
                onEditar={manejarEdicion}
                onEliminar={manejarEliminacion}
                onAgregarCarrito={agregarAlCarrito}
              />
            ))
          )}
        </div>

        {productos.length > 0 && (
          <div className="card shadow mt-4 p-4">
            <h4 className="mb-3">Resumen</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 rounded" style={{ background: '#e8f5e8' }}>
                  <h6 className="text-success">Valor Total</h6>
                  <div className="fs-4 fw-bold text-success">{formatearPrecio(totales.valorTotal)}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 rounded" style={{ background: '#e1f5fe' }}>
                  <h6 className="text-primary">Ganancia Total</h6>
                  <div className="fs-4 fw-bold text-primary">{formatearPrecio(totales.gananciaTotal)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  export default ListaProductos