import { useState, useEffect } from 'react'
import ItemProducto from './I_producto'
import FormularioProducto from './F_producto'
import { productosAPI } from '../api'

const ListaProductos = ({ esAdmin }) => {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [productoEditando, setProductoEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

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
      setProductos(respuesta.data || [])
      setError('')
    } catch {
      setError('Error cargando productos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarProductos()
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

  const totales = calcularTotales(productos)

  if (cargando) return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  )

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
        {esAdmin && (
          <button
            className="btn btn-warning"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? 'Cancelar' : 'Nuevo Producto'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {mostrarFormulario && esAdmin && (
        <FormularioProducto
          producto={productoEditando}
          onGuardar={manejarGuardado}
          onCancelar={() => { setProductoEditando(null); setMostrarFormulario(false) }}
        />
      )}

      <div className="product-grid">
        {productos.length === 0 ? (
          <div className="card text-center p-5">
            <h4>No hay productos registrados</h4>
            <p className="text-muted">Crea el primer producto</p>
          </div>
        ) : (
          productos.map(producto => (
            <ItemProducto
              key={producto.id}
              producto={producto}
              esAdmin={esAdmin}
              onEditar={manejarEdicion}
              onEliminar={manejarEliminacion}
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