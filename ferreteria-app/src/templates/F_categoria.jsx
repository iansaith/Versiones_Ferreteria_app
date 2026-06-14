import { useState, useEffect } from 'react'
import { categoriasAPI } from '../api'

const FormularioCategoria = ({ categoria, onGuardar, onCancelar }) => {
  const [formulario, setFormulario] = useState({ name: '', description: '', icon: '📦' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const iconos = ['📦', '⚡', '🎨', '🔨', '🪛', '🔩', '🪚', '🚜', '🌱']

  useEffect(() => {
    if (categoria?.id) {
      setFormulario({ name: categoria.name, description: categoria.description, icon: categoria.icon })
    } else {
      setFormulario({ name: '', description: '', icon: '📦' })
    }
  }, [categoria])

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    if (!formulario.name.trim()) {
      setError('El nombre es obligatorio')
      setCargando(false)
      return
    }

    try {
      if (categoria?.id) {
        await categoriasAPI.actualizar(categoria.id, formulario)
      } else {
        await categoriasAPI.crear(formulario)
      }
      onGuardar()
    } catch {
      setError('Error al guardar la categoria')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="card shadow p-4 mb-4">
      <h4 className="mb-4">{categoria?.id ? 'Editar' : 'Nueva'} Categoria</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={manejarEnvio}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formulario.name}
            onChange={e => setFormulario({ ...formulario, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Descripcion:</label>
          <textarea
            className="form-control"
            value={formulario.description}
            onChange={e => setFormulario({ ...formulario, description: e.target.value })}
            rows="3"
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Icono:</label>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {iconos.map(icono => (
              <button
                key={icono}
                type="button"
                className={`btn ${formulario.icon === icono ? 'btn-success' : 'btn-outline-secondary'}`}
                style={{ fontSize: '1.5em', padding: '8px 12px' }}
                onClick={() => setFormulario({ ...formulario, icon: icono })}
              >
                {icono}
              </button>
            ))}
          </div>
        </div>

        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-warning flex-fill py-2" disabled={cargando}>
            {cargando ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
            {cargando ? 'Guardando...' : 'Guardar Categoria'}
          </button>
          <button type="button" className="btn btn-secondary flex-fill py-2" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioCategoria