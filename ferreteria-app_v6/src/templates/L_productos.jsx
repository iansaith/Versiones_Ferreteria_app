import { useState, useEffect } from 'react'
import ItemProducto from './I_producto.jsx'
import FormularioProducto from './F_producto.jsx'
import Carrito from './Carrito.jsx'
import { productosAPI } from '../api.js'

// Importamos las librerías para la generación del reporte
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

  // Función exclusiva del Administrador para exportar PDF
  const exportarAPDF = () => {
    if (!esAdmin) return

    const doc = new jsPDF()

    // Encabezado del documento
    doc.setFontSize(18)
    doc.text('Reporte de Inventario - Ferretería', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`, 14, 28)
    doc.text(`Generado por: ${usuarioActual?.nombre || 'Administrador'}`, 14, 34)

    // Definición de columnas de la tabla
    const columnas = ['Nombre', 'Categoría', 'Ubicación', 'Proveedor', 'Stock', 'P. Venta', 'Ganancia']

    // Mapeamos los productos filtrados actuales
    const filas = productosFiltrados.map(p => [
      p.name,
      p.category || 'N/A',
      p.currentLocation || 'N/A',
      p.mainSupplier || 'N/A',
      parseInt(p.stock) === 0 ? 'Sin Stock' : p.stock,
      formatearPrecio(p.price),
      formatearPrecio(p.profit)
    ])

    // AHORA SÍ RECONOCERÁ LA FUNCIÓN DIRECTAMENTE EN EL DOC
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 40,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [255, 193, 7], textColor: [0, 0, 0], fontWeight: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })

    // Resumen de costos al final de la tabla usando doc.lastAutoTable
    const finalY = doc.lastAutoTable.finalY || 40
    const totalesFiltrados = calcularTotales(productosFiltrados)

    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Productos Listados: ${productosFiltrados.length}`, 14, finalY + 15)
    doc.text(`Ganancia Estimada de lo Listado: ${formatearPrecio(totalesFiltrados.gananciaTotal)}`, 14, finalY + 22)

    doc.save('reporte_inventario_ferreteria.pdf')
  }

  const cargarProductos = async () => {
    setCargando(true)
    try {
      const respuesta = await productosAPI.obtenerTodos()
      const listaProductos = respuesta.data || []
      setProductos(listaProductos)
      setError('')

      // Lógica de semáforo para anuncios flotantes
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

      setTimeout(() => {
        setAlertasFlotantes([])
      }, 6000)

    } catch {
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

  const agregarAlCarrito = (producto) => {
    console.log("Producto agregado:", producto)

    setCarrito(prev => {
      const existente = prev.find(i => String(i.id) === String(producto.id))
      let nuevoCarrito

      if (existente) {
        if (existente.cantidad >= parseInt(producto.stock)) {
          console.log("Stock máximo alcanzado")
          return prev
        }
        nuevoCarrito = prev.map(i =>
          String(i.id) === String(producto.id) ? { ...i, cantidad: i.cantidad + 1 } : i
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

  const productosFiltrados = productos.filter(p => {
    const nombre = p.name?.toLowerCase().includes(filtros.nombre.toLowerCase())
    const categoria = p.category?.toLowerCase().includes(filtros.categoria.toLowerCase())
    const ubicacion = p.currentLocation?.toLowerCase().includes(filtros.ubicacion.toLowerCase())
    const proveedor = p.mainSupplier?.toLowerCase().includes(filtros.proveedor.toLowerCase())
    return nombre && categoria && ubicacion && proveedor
  })

  if (cargando) return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  )

  return (
    <div style={{ position: 'relative' }}>

      {/* Contenedor de Anuncios Flotantes (Toasts) */}
      <div
        style={{
          position: 'fixed',
          top: '25px',
          right: '25px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '360px'
        }}
      >
        {alertasFlotantes.map(anuncio => (
          <div
            key={anuncio.id}
            className={`alert alert-${anuncio.tipo} alert-dismissible fade show shadow-lg mb-0`}
            role="alert"
            style={{ borderRadius: '8px' }}
          >
            <strong>{anuncio.mensaje}</strong>
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlertasFlotantes(prev => prev.filter(a => a.id !== anuncio.id))}
            ></button>
          </div>
        ))}
      </div>

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

          {/* RESTRICCIÓN DE SEGURIDAD: Solo visible para el Administrador */}
          {esAdmin && (
            <button
              className="btn btn-outline-danger"
              onClick={exportarAPDF}
            >
              Exportar PDF
            </button>
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
              onChange={e => setFiltros({ ...filtros, nombre: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por categoria..."
              value={filtros.categoria}
              onChange={e => setFiltros({ ...filtros, categoria: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por ubicacion..."
              value={filtros.ubicacion}
              onChange={e => setFiltros({ ...filtros, ubicacion: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por proveedor..."
              value={filtros.proveedor}
              onChange={e => setFiltros({ ...filtros, proveedor: e.target.value })}
            />
          </div>
        </div>
        {(filtros.nombre || filtros.categoria || filtros.ubicacion || filtros.proveedor) && (
          <div className="mt-2 d-flex justify-content-between align-items-center">
            <small className="text-muted">{productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''}</small>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFiltros({ nombre: '', categoria: '', ubicacion: '', proveedor: '' })}>
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