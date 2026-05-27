const UserItem = ({ user, isAdmin, onEdit, onDelete }) => {
  const getRoleColor = (role) => {
    return role === 'admin' ? '#4CAF50' : '#ff9800'
  }

  // Mostrar el rol como texto plano, sin bloque de color
  const displayRole = user.role === 'admin' ? 'ADMINISTRADOR' : 'ENCARGADO'

  return (
    <div className="product-card">
      <h3>{user.name}</h3>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Rol:</strong> 
        <span style={{
          marginLeft: '8px',
          color: getRoleColor(user.role),
          fontWeight: 'bold'
        }}>
          {displayRole}
        </span>
      </p>
      
      <div style={{ marginTop: '15px' }}>
        {isAdmin ? (
          <>
            <button
              className="btn"
              onClick={() => onEdit(user)}
              style={{marginRight: '10px'}}
            >
              Editar
            </button>
            <button
              className="btn btn-danger"
              onClick={() => onDelete(user.id)}
            >
              Eliminar
            </button>
          </>
        ) : (
          <span style={{
            color: '#999',
            fontStyle: 'italic',
            padding: '8px 12px',
            background: '#f0f0f0',
            borderRadius: '6px'
          }}>
            Solo lectura - Admin puede editar
          </span>
        )}
      </div>
    </div>
  )
}

export default UserItem