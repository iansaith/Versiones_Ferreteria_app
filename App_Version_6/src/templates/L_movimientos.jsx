import { useState, useEffect } from 'react'
import { movimientosAPI } from '../api'

const ListaMovimientos = () => {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({ tipo: '', producto: '', usuario: '' })

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await movimientosAPI.obtenerTodos()
        setMovimientos(res.data || [])
      } catch {
        setError('Error cargando movimientos')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const movimientosFiltrados = movimientos.filter(m => {
    const tipo = filtros.tipo === '' || m.tipo === filtros.tipo
    const producto = m.producto?.toLowerCase().includes(filtros.producto.toLowerCase())
    const usuario = m.usuario?.toLowerCase().includes(filtros.usuario.toLowerCase())
    return tipo && producto && usuario
  })

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (cargando) return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  )

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Historial de Movimientos ({movimientosFiltrados.length})</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filtros */}
      <div className="card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-4">
            <select
              className="form-select"
              value={filtros.tipo}
              onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
            >
              <option value="">Todos los tipos</option>
              <option value="Entrada">Entrada</option>
              <option value="Salida">Salida</option>
            </select>
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por producto..."
              value={filtros.producto}
              onChange={e => setFiltros({ ...filtros, producto: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por usuario..."
              value={filtros.usuario}
              onChange={e => setFiltros({ ...filtros, usuario: e.target.value })}
            />
          </div>
        </div>
        {(filtros.tipo || filtros.producto || filtros.usuario) && (
          <div className="mt-2 text-end">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setFiltros({ tipo: '', producto: '', usuario: '' })}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="card shadow">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-warning">
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movimientosFiltrados.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{formatearFecha(m.fecha)}</td>
                    <td>
                      <span className={`badge ${m.tipo === 'Entrada' ? 'bg-success' : 'bg-danger'}`}>
                        {m.tipo === 'Entrada' ? '⬆ Entrada' : '⬇ Salida'}
                      </span>
                    </td>
                    <td>{m.producto}</td>
                    <td className="fw-bold">{m.cantidad}</td>
                    <td>{m.usuario}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ListaMovimientos