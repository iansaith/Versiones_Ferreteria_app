import { useState, useEffect } from 'react'
import ItemProducto from './I_producto.jsx'
import FormularioProducto from './F_producto.jsx'
import Carrito from './Carrito.jsx'
import { productosAPI } from '../api.js'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const ListaProductos = ({ esAdmin, usuarioActual }) => {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [productoEditando, setProductoEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [carrito, setCarrito] = useState([])
  const [mostrarCarrito, setMostrarCarrito] = useState(false)
  const [mensajeCompra, setMensajeCompra] = useState('')
  const [filtros, setFiltros] = useState({ nombre: '', categoria: '', ubicacion: '', proveedor: '' })
  const [alertasFlotantes, setAlertasFlotantes] = useState([])

  // ── Los 3 filtros adicionales ───────────────────────
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [ordenPrecio, setOrdenPrecio] = useState('')
  const [soloStockBajo, setSoloStockBajo] = useState(false)

  // ── Historial de compras registradas en esta sesión ──────────────────
  const [historialCompras, setHistorialCompras] = useState([])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)

  // ── Filtro de periodo para el reporte ────────────────────────────────
  const hoy = new Date().toISOString().split('T')[0]
  const [periodoReporte, setPeriodoReporte] = useState({ desde: hoy, hasta: hoy })
  const [mostrarOpcionesPDF, setMostrarOpcionesPDF] = useState(false)

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor || 0)
  }

  const formatearFechaHora = (isoString) => {
    return new Date(isoString).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  }

  const calcularTotales = (lista) => {
    return lista.reduce((totales, producto) => {
      const stockActual = parseInt(producto.stock) || 0
      totales.cantidad += 1
      totales.valorTotal += (parseFloat(producto.price) || 0) * stockActual
      totales.gananciaTotal += (parseFloat(producto.profit) || 0) * stockActual
      return totales
    }, { cantidad: 0, valorTotal: 0, gananciaTotal: 0 })
  }

  const exportarAPDF = () => {
    if (!esAdmin) return

    const doc = new jsPDF()

    // ── Portada / encabezado ────────────────────────────────────────────────
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text('Reporte de Inventario - Ferretería Isabella', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`, 14, 28)
    doc.text(`Por: ${usuarioActual?.nombre || usuarioActual?.name || 'Administrador'}`, 14, 34)
    doc.text(`Periodo del reporte: ${periodoReporte.desde} al ${periodoReporte.hasta}`, 14, 40)

    // ── Tabla 1: existencias actuales ────────────────────────────────────────
    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    doc.text('1. Existencias actuales', 14, 52)

    const columnasInventario = ['Nombre', 'Categoría', 'Ubicación', 'Proveedor', 'Stock', 'P. Venta', 'Ganancia']
    const filasInventario = productosFiltrados.map(p => [
      p.name,
      p.category || 'N/A',
      p.currentLocation || 'N/A',
      p.mainSupplier || 'N/A',
      parseInt(p.stock) === 0 ? 'Sin Stock' : String(p.stock),
      formatearPrecio(p.price),
      formatearPrecio(p.profit)
    ])

    autoTable(doc, {
      head: [columnasInventario],
      body: filasInventario,
      startY: 56,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [255, 193, 7], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })

    const finTabla1 = doc.lastAutoTable.finalY || 56
    const totalesFiltrados = calcularTotales(productosFiltrados)

    doc.setFontSize(9)
    doc.setTextColor(60)
    doc.text(`Total productos listados: ${productosFiltrados.length}`, 14, finTabla1 + 8)
    doc.text(`Valor Total del listado: ${formatearPrecio(totalesFiltrados.valorTotal)}`, 14, finTabla1 + 14)
    doc.text(`Ganancia estimada del listado: ${formatearPrecio(totalesFiltrados.gananciaTotal)}`, 14, finTabla1 + 20)

    // ── Tabla 2: movimientos (compras) del periodo ───────────────────────────
    const comprasFiltradas = historialCompras.filter(compra => {
      const fechaCompra = compra.fecha.split('T')[0]
      return fechaCompra >= periodoReporte.desde && fechaCompra <= periodoReporte.hasta
    })

    const inicioTabla2 = finTabla1 + 30

    if (inicioTabla2 > 240) doc.addPage()

    const yTabla2 = inicioTabla2 > 240 ? 20 : inicioTabla2

    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    doc.text('2. Movimientos del periodo (compras)', 14, yTabla2)

    if (comprasFiltradas.length === 0) {
      doc.setFontSize(10)
      doc.setTextColor(120)
      doc.text('No se registraron compras en este periodo.', 14, yTabla2 + 8)
    } else {
      const columnasMovimientos = ['Fecha', 'Usuario', 'Producto', 'Cant.', 'P. Unitario', 'Total']
      const filasMovimientos = []

      comprasFiltradas.forEach(compra => {
        compra.items.forEach(item => {
          filasMovimientos.push([
            formatearFechaHora(compra.fecha),
            compra.usuario,
            item.name,
            String(item.cantidad),
            formatearPrecio(item.price),
            formatearPrecio(parseFloat(item.price) * item.cantidad)
          ])
        })
      })

      autoTable(doc, {
        head: [columnasMovimientos],
        body: filasMovimientos,
        startY: yTabla2 + 4,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 248, 255] }
      })

      const finTabla2 = doc.lastAutoTable.finalY || yTabla2
      const totalMovimientos = comprasFiltradas.reduce(
        (sum, c) => sum + c.items.reduce((s, i) => s + parseFloat(i.price) * i.cantidad, 0), 0
      )
      doc.setFontSize(9)
      doc.setTextColor(60)
      doc.text(`Total vendido en el periodo: ${formatearPrecio(totalMovimientos)}`, 14, finTabla2 + 8)
    }

    doc.save(`reporte_inventario_${periodoReporte.desde}_${periodoReporte.hasta}.pdf`)
    setMostrarOpcionesPDF(false)
  }

  const cargarProductos = async () => {
    setCargando(true)
    try {
      const respuesta = await productosAPI.obtenerTodos()
      const listaProductos = respuesta.data || []
      setProductos(listaProductos)
      setError('')

      const nuevosAnuncios = []
      listaProductos.forEach(prod => {
        const stockActual = parseInt(prod.stock || 0)
        const stockMinimo = parseInt(prod.minStock || 0)

        if (stockActual === 0) {
          nuevosAnuncios.push({
            id: `sin-${prod.id}`,
            mensaje: `¡URGENTE! "${prod.name}" se encuentra SIN STOCK (Rojo).`,
            tipo: 'danger'
          })
        } else if (stockActual <= stockMinimo) {
          nuevosAnuncios.push({
            id: `bajo-${prod.id}`,
            mensaje: `¡ATENCIÓN! "${prod.name}" tiene stock bajo: ${stockActual} unidades (Amarillo).`,
            tipo: 'warning'
          })
        }
      })

      setAlertasFlotantes(nuevosAnuncios.slice(0, 3))
      setTimeout(() => setAlertasFlotantes([]), 6000)

    } catch {
      setError('Error cargando productos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarProductos() }, [])

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
    if (window.confirm('¿Eliminar producto?')) {
      try {
        await productosAPI.eliminar(id)
        cargarProductos()
      } catch {
        alert('Error eliminando producto')
      }
    }
  }

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existente = prev.find(i => String(i.id) === String(producto.id))
      let nuevoCarrito

      if (existente) {
        if (existente.cantidad >= parseInt(producto.stock)) return prev
        nuevoCarrito = prev.map(i =>
          String(i.id) === String(producto.id) ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      } else {
        nuevoCarrito = [...prev, { ...producto, cantidad: 1 }]
      }
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

      const nuevoMovimiento = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        usuario: usuarioActual?.nombre || usuarioActual?.name || 'Usuario',
        items: items.map(i => ({ ...i })),
        total: items.reduce((sum, i) => sum + parseFloat(i.price) * i.cantidad, 0)
      }
      setHistorialCompras(prev => [nuevoMovimiento, ...prev])

      setCarrito([])
      setMostrarCarrito(false)
      setMensajeCompra('Compra confirmada y registrada correctamente')
      setTimeout(() => setMensajeCompra(''), 3000)
      cargarProductos()
    } catch {
      alert('Error al confirmar la compra')
    }
  }

  const totalItemsCarrito = carrito.reduce((total, item) => total + item.cantidad, 0)
  const totales = calcularTotales(productos)

  // ── Lógica de filtrado unificada y corregida por fin ──
  const productosFiltrados = productos
    .filter(p => {
      const nombre = p.name?.toLowerCase().includes(filtros.nombre.toLowerCase())
      const categoria = p.category?.toLowerCase().includes(filtros.categoria.toLowerCase())
      const ubicacion = p.currentLocation?.toLowerCase().includes(filtros.ubicacion.toLowerCase())
      const proveedor = p.mainSupplier?.toLowerCase().includes(filtros.proveedor.toLowerCase())
      
      // Filtro Categoría desde el Selector independiente
      const cumpleCategoriaSelect = categoriaFiltro ? p.category === categoriaFiltro : true
      
      // LÓGICA CORREGIDA: Sincronizada exactamente con las tarjetas
      const stockNum = parseInt(p.stock || 0)
      const minStockNum = parseInt(p.minStock || 0)
      
      const cumpleStockBajo = soloStockBajo 
        ? (stockNum > 0 && stockNum <= minStockNum) 
        : true

      return nombre && categoria && ubicacion && proveedor && cumpleCategoriaSelect && cumpleStockBajo
    })
    .sort((a, b) => {
      if (ordenPrecio === 'asc') return parseFloat(a.price || 0) - parseFloat(b.price || 0)
      if (ordenPrecio === 'desc') return parseFloat(b.price || 0) - parseFloat(a.price || 0)
      return 0
    })

  // Obtener las categorías únicas disponibles en los productos para llenar el select automáticamente
  const categoriasUnicas = [...new Set(productos.map(p => p.category).filter(Boolean))]

  if (cargando) return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  )

  return (
    <div style={{ position: 'relative' }}>

      {/* Alertas flotantes de stock */}
      <div style={{ position: 'fixed', top: '25px', right: '25px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
        {alertasFlotantes.map(anuncio => (
          <div key={anuncio.id} className={`alert alert-${anuncio.tipo} alert-dismissible fade show shadow-lg mb-0`} role="alert" style={{ borderRadius: '8px' }}>
            <strong>{anuncio.mensaje}</strong>
            <button type="button" className="btn-close" onClick={() => setAlertasFlotantes(prev => prev.filter(a => a.id !== anuncio.id))} />
          </div>
        ))}
      </div>

      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Productos ({totales.cantidad})</h2>
          {esAdmin && (
            <p className="text-muted mb-0">
              Ganancia total del inventario: <strong className="text-success">{formatearPrecio(totales.gananciaTotal)}</strong>
            </p>
          )}
        </div>
        <div className="d-flex gap-2 flex-wrap justify-content-end">

          <button
            className="btn btn-outline-info position-relative"
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
          >
            Historial
            {historialCompras.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info text-dark">
                {historialCompras.length}
              </span>
            )}
          </button>

          {esAdmin && (
            <div className="position-relative">
              <button
                className="btn btn-outline-danger"
                onClick={() => setMostrarOpcionesPDF(!mostrarOpcionesPDF)}
              >
                Exportar PDF
              </button>
              {mostrarOpcionesPDF && (
                <div
                  className="card shadow p-3"
                  style={{ position: 'absolute', right: 0, top: '110%', zIndex: 1050, minWidth: '260px' }}
                >
                  <p className="fw-semibold mb-2 small">Periodo del reporte</p>
                  <div className="mb-2">
                    <label className="form-label small mb-1">Desde</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={periodoReporte.desde}
                      onChange={e => setPeriodoReporte(prev => ({ ...prev, desde: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small mb-1">Hasta</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={periodoReporte.hasta}
                      onChange={e => setPeriodoReporte(prev => ({ ...prev, hasta: e.target.value }))}
                    />
                  </div>
                  <button className="btn btn-danger btn-sm w-100" onClick={exportarAPDF}>
                    Descargar PDF
                  </button>
                </div>
              )}
            </div>
          )}

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
            <button className="btn btn-warning" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              {mostrarFormulario ? 'Cancelar' : 'Nuevo Producto'}
            </button>
          )}
        </div>
      </div>

      {mensajeCompra && <div className="alert alert-success">{mensajeCompra}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Panel de Filtros */}
      <div className="card p-3 mb-4">
        {/* Fila 1: Buscadores de texto */}
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Buscar por nombre..." value={filtros.nombre} onChange={e => setFiltros({ ...filtros, nombre: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Buscar por categoria..." value={filtros.categoria} onChange={e => setFiltros({ ...filtros, categoria: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Buscar por ubicación..." value={filtros.ubicacion} onChange={e => setFiltros({ ...filtros, ubicacion: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Buscar por proveedor..." value={filtros.proveedor} onChange={e => setFiltros({ ...filtros, proveedor: e.target.value })} />
          </div>
        </div>

        {/* Fila 2: Selects de Filtro Especiales */}
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <select className="form-select" value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={ordenPrecio} onChange={e => setOrdenPrecio(e.target.value)}>
              <option value="">Ordenar por precio...</option>
              <option value="asc">Precio: de Menor a Mayor</option>
              <option value="desc">Precio: de Mayor a Menor</option>
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <div className="form-check ms-2">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="checkStockBajo" 
                checked={soloStockBajo} 
                onChange={e => setSoloStockBajo(e.target.checked)} 
              />
              <label className="form-check-label fw-semibold text-danger" htmlFor="checkStockBajo" >
                Marcar bajo stock
              </label>
            </div>
          </div>
        </div>

        {/* Botón de limpiar unificado */}
        {(filtros.nombre || filtros.categoria || filtros.ubicacion || filtros.proveedor || categoriaFiltro || ordenPrecio || soloStockBajo) && (
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <small className="text-muted">{productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''}</small>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => {
              setFiltros({ nombre: '', categoria: '', ubicacion: '', proveedor: '' });
              setCategoriaFiltro('');
              setOrdenPrecio('');
              setSoloStockBajo(false);
            }}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {mostrarHistorial && (
        <div className="card shadow p-4 mb-4" style={{ borderLeft: '5px solid #0dcaf0' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Historial de compras <span className="badge bg-info text-dark ms-2">{historialCompras.length}</span></h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setMostrarHistorial(false)}>Cerrar</button>
          </div>

          {historialCompras.length === 0 ? (
            <p className="text-muted mb-0">Aún no se han registrado compras en esta sesión.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {historialCompras.map(compra => (
                <div key={compra.id} className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span className="fw-semibold">{formatearFechaHora(compra.fecha)}</span>
                      <span className="text-muted ms-2 small">— {compra.usuario}</span>
                    </div>
                    <span className="badge bg-success">{formatearPrecio(compra.total)}</span>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {compra.items.map(item => (
                      <span key={item.id} className="badge bg-light text-dark border">
                        {item.name} × {item.cantidad}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Carrito */}
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

      {/* Formulario nuevo/editar producto */}
      {mostrarFormulario && esAdmin && (
        <FormularioProducto
          producto={productoEditando}
          onGuardar={manejarGuardado}
          onCancelar={() => { setProductoEditando(null); setMostrarFormulario(false) }}
        />
      )}

      {/* Grid de productos */}
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

      {/* Resumen */}
      {productos.length > 0 && (
        <div className="card shadow mt-4 p-4">
          <h4 className="mb-3">Resumen de Inventario</h4>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3 rounded" style={{ background: '#e8f5e8' }}>
                <h6 className="text-success">Valor Comercial Total (Stock × Precio)</h6>
                <div className="fs-4 fw-bold text-success">{formatearPrecio(totales.valorTotal)}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 rounded" style={{ background: '#e1f5fe' }}>
                <h6 className="text-primary">Ganancia Potencial Total (Stock × Ganancia)</h6>
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