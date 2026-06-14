import { useState, useEffect } from 'react'
import { usuariosAPI } from '../api'

const FormularioUsuario = ({ usuario, onGuardar, onCancelar }) => {
  const [formulario, setFormulario] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (usuario?.id) {
      setFormulario({
        name: usuario.name || '',
        email: usuario.email || '',
        password: '',
        role: usuario.role || 'user'
      })
    } else {
      setFormulario({ name: '', email: '', password: '', role: 'user' })
    }
    setConfirmarPassword('')
  }, [usuario])

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    if (!formulario.name.trim() || !formulario.email.trim()) {
      setError('Nombre y email son obligatorios')
      setCargando(false)
      return
    }

    if (formulario.password && formulario.password !== confirmarPassword) {
      setError('Las contrasenas no coinciden')
      setCargando(false)
      return
    }

    if (formulario.password && formulario.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      setCargando(false)
      return
    }

    try {
      if (usuario?.id) {
        const datosActualizar = { ...formulario }
        if (!datosActualizar.password) delete datosActualizar.password
        await usuariosAPI.actualizar(usuario.id, datosActualizar)
      } else {
        await usuariosAPI.crear(formulario)
      }
      onGuardar()
    } catch {
      setError('Error al guardar usuario')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="card shadow p-4 mb-4">
      <h4 className="mb-4">{usuario?.id ? 'Editar' : 'Nuevo'} Usuario</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={manejarEnvio}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formulario.name}
            onChange={e => setFormulario({ ...formulario, name: e.target.value })}
            placeholder="Ej: Juan Perez"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
          <input
            type="email"
            className="form-control"
            value={formulario.email}
            onChange={e => setFormulario({ ...formulario, email: e.target.value })}
            placeholder="usuario@ferreteria.com"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Contrasena {usuario?.id ? <span className="text-muted fw-normal">(opcional)</span> : <span className="text-danger">*</span>}
          </label>
          <input
            type="password"
            className="form-control"
            value={formulario.password}
            onChange={e => setFormulario({ ...formulario, password: e.target.value })}
            placeholder="Minimo 6 caracteres"
            required={!usuario?.id}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Confirmar Contrasena:</label>
          <input
            type="password"
            className="form-control"
            value={confirmarPassword}
            onChange={e => setConfirmarPassword(e.target.value)}
            placeholder="Repite la contrasena"
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Rol:</label>
         <select
      className="form-select"
      value={formulario.role}
      onChange={e => setFormulario({ ...formulario, role: e.target.value })}
    >
      <option value="Encargado del inventario">Encargado</option>
      <option value="Administrador">Administrador</option>
    </select>
        </div>

        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-warning flex-fill py-2" disabled={cargando}>
            {cargando ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
            {cargando ? 'Guardando...' : 'Guardar Usuario'}
          </button>
          <button type="button" className="btn btn-secondary flex-fill py-2" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioUsuario