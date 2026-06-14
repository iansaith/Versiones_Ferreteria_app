import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registro } from '../auth'
import miLogo from '../assets/logo.png'


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
    <div className="register-container">
      {}
      <div className="register-form-side">
        
        <div className="login-header">  
                  <span className="logo-text">
                         {/* Encabezado con el logo */}
                          <div className="login-header">
                            <img 
                            src={miLogo} 
                            alt="Logo Ferretería" 
                            style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
                          </div>        
                    Ferreteria Isabella
                  </span>
                </div>

        <div className="login-content">
          
          <h2>Crea tu cuenta</h2>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {exito && <div className="alert alert-success py-2 small">{exito}</div>}

          <form onSubmit={manejarEnvio}>
            
            <div className="custom-input-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={formulario.name}
                onChange={(e) => setFormulario({ ...formulario, name: e.target.value })}
                required
              />
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
            </div>

            <div className="custom-input-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={formulario.email}
                onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                required
              />
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
            </div>

            <div className="custom-input-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formulario.password}
                onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                required
                minLength="6"
              />
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
            </div>

            <button type="submit" className="btn-insidebox" disabled={cargando}>
              {cargando && (
                <span className="spinner-border spinner-border-sm me-2" role="status" style={{ color: 'white' }} />
              )}
              {cargando ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className="login-footer mt-4 text-center">
            ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
          </div>
        </div>
      </div>

      {/* Imagen de fondo */}
      <div className="register-image-side"></div>
    </div>
  )
}

export default FormularioRegistro