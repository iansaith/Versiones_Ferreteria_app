import ListaProductos from './L_productos.jsx'
import ListaUsuarios from './L_usuarios.jsx'
import ListaCategorias from './L_categoria.jsx'
import ListaProveedores from './L_proveedores.jsx'  
import { useState } from 'react'

const Dashboard = ({ usuarioActual, onLogout }) => {
  const [tabActiva, setTabActiva] = useState('productos')

  const esAdmin = usuarioActual?.role === 'Administrador'
  const esEncargado = usuarioActual?.role === 'Encargado del inventario'

  const renderContenido = () => {
    switch (tabActiva) {
      case 'productos': return <ListaProductos esAdmin={esAdmin} usuarioActual={usuarioActual} />
      case 'usuarios': return esAdmin
        ? <ListaUsuarios esAdmin={esAdmin} />
        : <div className="alert alert-warning">No tienes permiso.</div>
      case 'categorias': return <ListaCategorias esAdmin={esAdmin} />
      case 'proveedores': return <ListaProveedores esAdmin={esAdmin} />  // ← nuevo
      default: return <ListaProductos esAdmin={esAdmin} usuarioActual={usuarioActual} />
    }
  }

  const rolMostrado = esAdmin ? 'Administrador' : 'Encargado'
  const colorRol = esAdmin ? 'success' : 'warning'

  return (
    <div>
      <div className="card shadow text-center p-4 mb-4">
        <h1 className="mb-2">Gestion Ferreteria</h1>
        <p className="mb-0 fs-5 text-muted">
          Bienvenido, <strong>{usuarioActual?.nombre}</strong>
          <span className={`badge bg-${colorRol} ms-3 fs-6`}>{rolMostrado}</span>
        </p>
      </div>

      <nav className="card shadow p-3 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          <button className={`btn ${tabActiva === 'productos' ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setTabActiva('productos')}>Productos</button>
          {esAdmin && <button className={`btn ${tabActiva === 'usuarios' ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setTabActiva('usuarios')}>Usuarios</button>}
          <button className={`btn ${tabActiva === 'categorias' ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setTabActiva('categorias')}>Categorias</button>
          <button className={`btn ${tabActiva === 'proveedores' ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setTabActiva('proveedores')}>Proveedores</button>
        </div>
      </nav>

      {renderContenido()}

      <div className="mt-5 pt-3">
        <button className="btn btn-danger px-4 py-2" onClick={onLogout}>Cerrar Sesion</button>
      </div>
    </div>
  )
}

export default Dashboard