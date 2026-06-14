import { useState, useEffect } from 'react'
import { proveedoresAPI } from '../api'

const ListaProveedores = ({ esAdmin }) => {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState(null)
  const [formulario, setFormulario] = useState({ nombre: '', contacto: '' })
  const [errorForm, setErrorForm] = useState('')
  const [cargandoForm, setCargandoForm] = useState(false)
  const [filtro, setFiltro] = useState('')

  const cargarProveedores = async () => {
    setCargando(true)
    try {
      const res = await proveedoresAPI.obtenerTodos()
      setProveedores(res.data || [])
      setError('')
    } catch {
      setError('Error cargando proveedores')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarProveedores() }, [])

  const abrirFormulario = (proveedor = null) => {
    setProveedorEditando(proveedor)
    setFormulario({ nombre: proveedor?.nombre || '', contacto: proveedor?.contacto || '' })
    setErrorForm('')
    setMostrarFormulario(true)
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    if (!formulario.nombre.trim()) return setErrorForm('El nombre es obligatorio')
    setCargandoForm(true)
    try {
      if (proveedorEditando?.id) {
        await proveedoresAPI.actualizar(proveedorEditando.id, formulario)
      } else {
        await proveedoresAPI.crear(formulario)
      }
      setMostrarFormulario(false)
      setProveedorEditando(null)
      cargarProveedores()
    } catch {
      setErrorForm('Error al guardar proveedor')
    } finally {
      setCargandoForm(false)
    }
  }

  const manejarEliminacion = async (id) => {
    if (!window.confirm('Eliminar proveedor?')) return
    try {
      await proveedoresAPI.eliminar(id)
      cargarProveedores()
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error eliminando proveedor'
      alert(mensaje)
    }
  }

  if (cargando) return <div className="d-flex justify-content-center p-5"><div className="spinner-border text-warning" /></div>

  const normalizarTexto = (valor = '') => String(valor ?? '').toLowerCase().trim()
  const proveedoresFiltrados = proveedores.filter(proveedor =>
    normalizarTexto(proveedor.nombre).includes(normalizarTexto(filtro)) ||
    normalizarTexto(proveedor.contacto).includes(normalizarTexto(filtro))
  )

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Proveedores ({proveedores.length})</h2>
        {esAdmin && (
          <button className="btn btn-warning" onClick={() => abrirFormulario()}>
            {mostrarFormulario ? 'Cancelar' : 'Nuevo Proveedor'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-3 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar proveedor o contacto..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
        {filtro && <small className="text-muted mt-2 d-block">{proveedoresFiltrados.length} resultado{proveedoresFiltrados.length !== 1 ? 's' : ''}</small>}
      </div>

      {mostrarFormulario && esAdmin && (
        <div className="card shadow p-4 mb-4">
          <h4 className="mb-4">{proveedorEditando ? 'Editar' : 'Nuevo'} Proveedor</h4>
          {errorForm && <div className="alert alert-danger">{errorForm}</div>}
          <form onSubmit={manejarEnvio}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={formulario.nombre}
                onChange={e => setFormulario({ ...formulario, nombre: e.target.value })}
                placeholder="Ej: Distribuidora Bosch"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Contacto:</label>
              <input
                type="text"
                className="form-control"
                value={formulario.contacto}
                onChange={e => setFormulario({ ...formulario, contacto: e.target.value })}
                placeholder="Ej: 3001234567"
              />
            </div>
            <div className="d-flex gap-3">
              <button type="submit" className="btn btn-warning flex-fill" disabled={cargandoForm}>
                {cargandoForm ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" className="btn btn-secondary flex-fill" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="product-grid">
        {proveedoresFiltrados.length === 0 ? (
          <div className="card text-center p-5">
            <h4>No hay proveedores registrados</h4>
          </div>
        ) : (
          proveedoresFiltrados.map(p => (
            <div key={p.id} className="card shadow p-3" style={{ borderLeft: '5px solid #ff9800' }}>
              <h5 className="mb-1">{p.nombre}</h5>
              <p className="text-muted mb-2">📞 {p.contacto || 'Sin contacto'}</p>
              {esAdmin && (
                <div className="d-flex gap-2">
                  <button className="btn btn-warning btn-sm" onClick={() => abrirFormulario(p)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => manejarEliminacion(p.id)}>Eliminar</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ListaProveedores