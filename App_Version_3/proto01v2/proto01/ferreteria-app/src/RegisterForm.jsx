import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from './auth'

const RegisterForm = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '' 
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const result = await register(formData)
    
    if (result.success) {
      setSuccess('Usuario registrado exitosamente')
      setTimeout(() => navigate('/dashboard'), 1500)
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="card">
      <h1>Registro de Usuario</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="input-group">
          <label>Email:</label>
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
            minLength="6"
          />
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      
      <p style={{textAlign: 'center', marginTop: '20px'}}>
        Ya tienes cuenta <Link to="/">Inicia sesion aqui</Link>
      </p>
    </div>
  )
}

export default RegisterForm