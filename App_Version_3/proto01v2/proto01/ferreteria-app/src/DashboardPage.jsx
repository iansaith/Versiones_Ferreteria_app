import { useState } from 'react'
import ProductList from './ProductList'
import UsersList from './UsersList'
import CategoryList from './CategoryList'

const DashboardPage = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('products')
  const isAdmin = currentUser?.role === 'admin'
  const isEncargado = currentUser?.role === 'user' // user es el encargado

  // El encargado puede ver productos y categorias, pero NO usuarios
  const canManageUsers = isAdmin
  const canManageCategories = isAdmin || isEncargado
  const canManageProducts = isAdmin || isEncargado

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductList isAdmin={canManageProducts} />
      case 'users':
        return canManageUsers ? <UsersList isAdmin={canManageUsers} /> : <div>No tienes permiso</div>
      case 'categories':
        return canManageCategories ? <CategoryList isAdmin={canManageCategories} /> : <div>No tienes permiso</div>
      default:
        return <ProductList isAdmin={canManageProducts} />
    }
  }

  // Obtener el rol mostrable
  const displayRole = isAdmin ? 'ADMINISTRADOR' : 'ENCARGADO'

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ padding: '30px', textAlign: 'center', marginBottom: '30px' }}>
        <h1>Gestion Ferreteria</h1>
        <p style={{ fontSize: '1.2em', color: '#666' }}>
          Bienvenido <strong>{currentUser?.name}</strong>
          <span style={{
            marginLeft: '15px',
            padding: '8px 16px',
            borderRadius: '25px',
            background: isAdmin ? '#4CAF50' : '#ff9800',
            color: 'white',
            fontSize: '1em',
            fontWeight: 'bold'
          }}>
            {displayRole}
          </span>
        </p>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ marginBottom: '30px' }}>
        <button 
          className={`btn ${activeTab === 'products' ? '' : 'btn-secondary'}`}
          onClick={() => setActiveTab('products')}
          style={{ marginRight: '10px' }}
        >
          Productos
        </button>
        {canManageUsers && (
          <button 
            className={`btn ${activeTab === 'users' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
            style={{ marginRight: '10px' }}
          >
            Usuarios
          </button>
        )}
        {canManageCategories && (
          <button 
            className={`btn ${activeTab === 'categories' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('categories')}
          >
            Categorias
          </button>
        )}
      </nav>

      {/* Content */}
      {renderContent()}

      {/* Logout */}
      <div style={{ marginTop: '50px', padding: '20px 0', textAlign: 'left' }}>
        <button className="btn btn-danger" onClick={onLogout} style={{ padding: '15px 30px', fontSize: '16px' }}>
          Cerrar Sesion
        </button>
      </div>
    </div>
  )
}

export default DashboardPage