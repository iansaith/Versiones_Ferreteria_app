import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from './auth'

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess(result.user)
      }
      navigate('/dashboard')
    } else {
      setError(result.message || 'Error desconocido')
    }
    
    setLoading(false)
  }

  return (
    <div className="card">
      <h1>Iniciar Sesion</h1>
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Correo:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        
        <div className="input-group">
          <label>Contrasena:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        
        <button type="submit" className="btn" disabled={loading} style={{width: '100%'}}>
          {loading ? 'Iniciando...' : 'Iniciar Sesion'}
        </button>
      </form>
      
      <p style={{textAlign: 'center', marginTop: '20px'}}>
        Nuevo <Link to="/register">Registrate</Link>
      </p>
    </div>
  )
}

export default LoginForm