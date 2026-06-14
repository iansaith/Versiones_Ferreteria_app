import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import FormularioLogin from './templates/F_login'
import FormularioRegistro from './templates/F_registro'
import Dashboard from './templates/Dashboard'
import { obtenerUsuarioActual, cerrarSesion } from './auth'
import ResetPassword from './templates/ResetPassword'

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
      
      <Routes>
        <Route
          path="/"
          element={
            usuarioActual
              ? <Navigate to="/dashboard" />
              : <FormularioLogin onLoginSuccess={manejarLogin} />
          }
        />
        <Route
          path="/registro"
          element={
            
              <FormularioRegistro />
            
          }
        />
<Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>


        <Route
          path="/dashboard"
          element={
            <div className="container py-4">
              {usuarioActual
                ? <Dashboard usuarioActual={usuarioActual} onLogout={manejarLogout} />
                : <Navigate to="/" />
              }
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App