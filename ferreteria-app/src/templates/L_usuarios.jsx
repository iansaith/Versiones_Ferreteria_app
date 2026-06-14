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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Usuarios ({usuarios.length})</h2>
        {esAdmin && (
          <button
            className="btn btn-warning"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? 'Cancelar' : 'Nuevo Usuario'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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

      <div className="product-grid">
        {usuarios.length === 0 ? (
          <div className="card text-center p-5">
            <h4>No hay usuarios registrados</h4>
          </div>
        ) : (
          usuarios.map(usuario => (
            <ItemUsuario
              key={usuario.id}
              usuario={usuario}
              esAdmin={esAdmin}
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