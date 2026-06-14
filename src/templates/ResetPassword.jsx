import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const cambiarPassword = async (e) => {
    e.preventDefault()

    if (password !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      const respuesta = await authAPI.resetPassword(
        token,
        password
      )

      setMensaje(respuesta.data.message)

      setTimeout(() => {
        navigate('/')
      }, 3000)

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Error al cambiar contraseña'
      )
    }
  }

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h3>Nueva contraseña</h3>

        {mensaje && (
          <div className="alert alert-success">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={cambiarPassword}>
          <div className="mb-3">
            <label>Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              className="form-control"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
          >
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword