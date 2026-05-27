import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import DashboardPage from './DashboardPage'
import { getCurrentUser, logout } from './auth'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [verificando, setVerificando] = useState(true)

  // Verifica si hay JWT válido al cargar la app
  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user)
      setVerificando(false)
    })
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
  }

  // Espera la verificación del token antes de renderizar rutas
  if (verificando) return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <p>Cargando...</p>
    </div>
  )

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
              currentUser ?
              <Navigate to="/dashboard" /> :
              <LoginPage onLoginSuccess={handleLogin} />
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              currentUser ?
              <DashboardPage
                currentUser={currentUser}
                onLogout={handleLogout}
              /> :
              <Navigate to="/" />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App