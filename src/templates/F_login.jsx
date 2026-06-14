

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../auth'
import { authAPI } from '../api'
import miLogo from '../assets/logo.png'




const FormularioLogin = ({ onLoginSuccess }) => {
  const [formulario, setFormulario] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

const [emailRecuperacion, setEmailRecuperacion] = useState('')
const [mensajeRecuperacion, setMensajeRecuperacion] = useState('')
const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false)

  const navigate = useNavigate()

const recuperarPassword = async () => {
  if (!emailRecuperacion) {
    alert('Ingresa tu correo')
    return
  }

  try {
    const respuesta = await authAPI.recuperarPassword(emailRecuperacion)

    setMensajeRecuperacion(
      respuesta.data.message || 'Correo enviado correctamente'
    )
  } catch (error) {
    console.error(error)
    alert('Error enviando correo')
  }
}

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
    <div className="login-container">
      {/*  Formulario */}
      <div className="login-form-side">
        
        {/* Encabezado con el logo */}
        <div className="login-header">  
          <span className="logo-text">
                 
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
          <p className="text-muted small mb-1"></p>
          <h2>Iniciar Sesion</h2>

          {error && (
            <div className="alert alert-danger py-2 small">{error}</div>
          )}

          <form onSubmit={manejarEnvio}>
            
            {/*  Correo Electrónico */}
            <div className="custom-input-group">
              <label>Correo </label>
              <input
                type="email"
                placeholder="ejemplo@gmail.com"
                value={formulario.email}
                onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                required
              />
              {/* Icono de carta */}
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
            </div>

            {/*  Contraseña */}
            <div className="custom-input-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formulario.password}
                onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                required
              />
              {/* Icono de ojo  */}
              <span className="input-icon" style={{ cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </span>
            </div>

<div className="text-end mb-3">
  <button
    type="button"
    className="btn btn-link p-0"
    onClick={() => setMostrarRecuperacion(!mostrarRecuperacion)}
  >
    ¿Olvidaste tu contraseña?
  </button>
</div>

{mostrarRecuperacion && (
  <div className="mb-3">
    <input
      type="email"
      className="form-control mb-2"
      placeholder="Ingresa tu correo"
      value={emailRecuperacion}
      onChange={(e) => setEmailRecuperacion(e.target.value)}
    />

    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={recuperarPassword}
    >
      Enviar enlace
    </button>

    {mensajeRecuperacion && (
      <div className="alert alert-success mt-2">
        {mensajeRecuperacion}
      </div>
    )}
  </div>
)}



            {/* Botón de Enviar */}
            <button type="submit" className="btn-insidebox" disabled={cargando}>
              {cargando && (
                <span className="spinner-border spinner-border-sm me-2" role="status" style={{ color: 'white' }} />
              )}
              {cargando ? 'Iniciando Sesion' : 'Iniciar Sesion'}
            </button>
          </form>
        </div>

        {/*  enlace que redirige a registro */}
        <div className="login-footer">
          No tienes cuenta? <Link to="/registro">Registrate</Link>
        </div>

      </div>

      {/* Imagen  de fondo */}
      <div className="login-image-side"></div>
    </div>
  )
}

export default FormularioLogin