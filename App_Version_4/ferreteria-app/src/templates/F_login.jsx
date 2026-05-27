import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../auth'

const FormularioLogin = ({ onLoginSuccess }) => {
  const [formulario, setFormulario] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const resultado = await login(formulario.email, formulario.password)

    if (resultado.success) {
      if (onLoginSuccess) onLoginSuccess(resultado.usuario)
      navigate('/dashboard')
    } else {
      setError(resultado.message || 'Error desconocido')
    }

    setCargando(false)
  }

  return (
    <div className="card shadow p-4">
      <h2 className="mb-4">Iniciar Sesion</h2>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={manejarEnvio}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Correo:</label>
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
          />
        </div>

        <button type="submit" className="btn btn-warning w-100" disabled={cargando}>
          {cargando ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" />
          ) : null}
          {cargando ? 'Iniciando...' : 'Iniciar Sesion'}
        </button>
      </form>

      <p className="text-center mt-3 mb-0">
        Nuevo? <Link to="/registro">Registrate aqui</Link>
      </p>
    </div>
  )
}

export default FormularioLogin