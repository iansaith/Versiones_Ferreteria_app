import { useState, useEffect } from 'react'
import ItemUsuario from './I_usuario'
import FormularioUsuario from './F_usuario'
import { usuariosAPI } from '../api'

const ListaUsuarios = ({ esAdmin }) => {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [filtros, setFiltros] = useState({ nombre: '', email: '', rol: '' })
  const [vistaLista, setVistaLista] = useState(false)

  const cargarUsuarios = async () => {
    setCargando(true)
    try {
      const respuesta = await usuariosAPI.obtenerTodos()
      setUsuarios(respuesta.data || [])
      setError('')
    } catch {
      setError('Error cargando usuarios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const manejarGuardado = () => {
    setUsuarioEditando(null)
    setMostrarFormulario(false)
    cargarUsuarios()
  }

  const manejarEdicion = (usuario) => {
    if (!esAdmin) return alert('Solo administradores pueden editar usuarios')
    setUsuarioEditando(usuario)
    setMostrarFormulario(true)
  }

  const manejarEliminacion = async (id) => {
    if (!esAdmin) return alert('Solo administradores pueden eliminar usuarios')
    if (window.confirm('Eliminar usuario? Esta accion no se puede deshacer.')) {
      try {
        await usuariosAPI.eliminar(id)
        cargarUsuarios()
      } catch {
        alert('Error eliminando usuario')
      }
    }
  }

  if (cargando) return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  )

  const normalizarTexto = (valor = '') => String(valor ?? '').toLowerCase().trim()

  const usuariosFiltrados = usuarios.filter(u => {
    const nombre = normalizarTexto(u.name).includes(normalizarTexto(filtros.nombre))
    const email = normalizarTexto(u.email).includes(normalizarTexto(filtros.email))
    const rol = filtros.rol === '' || normalizarTexto(u.role) === normalizarTexto(filtros.rol)
    return nombre && email && rol
  })

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Usuarios ({usuarios.length})</h2>
        <div className="d-flex gap-2">
          <div className="btn-group">
            <button
              className={`btn btn-sm ${!vistaLista ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setVistaLista(false)}
              title="Vista cuadricula"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
              </svg>
            </button>
            <button
              className={`btn btn-sm ${vistaLista ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setVistaLista(true)}
              title="Vista lista"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
              </svg>
            </button>
          </div>
          {esAdmin && (
            <button
              className="btn btn-warning"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              {mostrarFormulario ? 'Cancelar' : 'Nuevo Usuario'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre..."
              value={filtros.nombre}
              onChange={e => setFiltros(prev => ({ ...prev, nombre: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por email..."
              value={filtros.email}
              onChange={e => setFiltros(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filtros.rol}
              onChange={e => setFiltros(prev => ({ ...prev, rol: e.target.value }))}
            >
            <option value="">Todos los roles</option>
<option value="Administrador">Administrador</option>
<option value="Encargado del inventario">Encargado</option>
            </select>
          </div>
        </div>
        {(filtros.nombre || filtros.email || filtros.rol) && (
          <div className="mt-2 d-flex justify-content-between align-items-center">
            <small className="text-muted">{usuariosFiltrados.length} resultado{usuariosFiltrados.length !== 1 ? 's' : ''}</small>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFiltros({ nombre: '', email: '', rol: '' })}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {mostrarFormulario && esAdmin && (
        <FormularioUsuario
          usuario={usuarioEditando}
          onGuardar={manejarGuardado}
          onCancelar={() => {
            setUsuarioEditando(null)
            setMostrarFormulario(false)
          }}
        />
      )}

      <div className={vistaLista ? 'd-flex flex-column gap-2' : 'product-grid'}>
        {usuariosFiltrados.length === 0 ? (
          <div className="card text-center p-5">
            <h4>No se encontraron usuarios</h4>
            <p className="text-muted">Intenta con otros filtros</p>
          </div>
        ) : (
          usuariosFiltrados.map(usuario => (
            <ItemUsuario
              key={usuario.id}
              usuario={usuario}
              esAdmin={esAdmin}
              vistaLista={vistaLista}
              onEditar={manejarEdicion}
              onEliminar={manejarEliminacion}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ListaUsuarios