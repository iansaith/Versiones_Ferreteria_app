import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import FormularioLogin from './templates/F_login'
import FormularioRegistro from './templates/F_registro'
import Dashboard from './templates/Dashboard'
import { obtenerUsuarioActual, cerrarSesion } from './auth'

function App() {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    obtenerUsuarioActual().then((usuario) => {
      setUsuarioActual(usuario)
      setVerificando(false)
    })
  }, [])

  const manejarLogin = (usuario) => {
    setUsuarioActual(usuario)
  }

  const manejarLogout = () => {
    cerrarSesion()
    setUsuarioActual(null)
  }

  if (verificando) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-warning" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  )

  return (
    <Router>
      <div className="container py-4">
        <Routes>
          <Route
            path="/"
            element={
              usuarioActual
                ? <Navigate to="/dashboard" />
                : <div style={{ maxWidth: '500px', margin: '50px auto' }}>
                    <FormularioLogin onLoginSuccess={manejarLogin} />
                  </div>
            }
          />
          <Route
            path="/registro"
            element={
              <div style={{ maxWidth: '500px', margin: '50px auto' }}>
                <FormularioRegistro />
              </div>
            }
          />
          <Route
            path="/dashboard"
            element={
              usuarioActual
                ? <Dashboard usuarioActual={usuarioActual} onLogout={manejarLogout} />
                : <Navigate to="/" />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App