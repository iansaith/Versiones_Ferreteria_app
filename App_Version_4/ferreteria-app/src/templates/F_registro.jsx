import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registro } from '../auth'

const FormularioRegistro = () => {
  const [formulario, setFormulario] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    setExito('')

    const resultado = await registro(formulario)

    if (resultado.success) {
      setExito('Usuario registrado exitosamente')
      setTimeout(() => navigate('/dashboard'), 1500)
    } else {
      setError(resultado.message)
    }

    setCargando(false)
  }

  return (
    <div className="card shadow p-4">
      <h2 className="mb-4">Registro de Usuario</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      <form onSubmit={manejarEnvio}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Nombre:</label>
          <input
            type="text"
            className="form-control"
            value={formulario.name}
            onChange={(e) => setFormulario({ ...formulario, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Email:</label>
          <input
            type="email"
            className="form-control"
            value={formulario.email}
            onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Contrasena:</label>
          <input
            type="password"
            className="form-control"
            value={formulario.password}
            onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
            required
            minLength="6"
          />
        </div>

        <button type="submit" className="btn btn-warning w-100" disabled={cargando}>
          {cargando ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" />
          ) : null}
          {cargando ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="text-center mt-3 mb-0">
        Ya tienes cuenta? <Link to="/">Inicia sesion aqui</Link>
      </p>
    </div>
  )
}

export default FormularioRegistro