const ItemUsuario = ({ usuario, esAdmin, onEditar, onEliminar }) => {
  const colorRol = usuario.role === 'admin' ? 'success' : 'warning'
  const textoRol = usuario.role === 'admin' ? 'Administrador' : 'Encargado'

  return (
    <div className="product-card">
      <h5 className="mb-2">{usuario.name}</h5>
      <p className="mb-1"><strong>Email:</strong> {usuario.email}</p>
      <p className="mb-3">
        <strong>Rol:</strong>
        <span className={`badge bg-${colorRol} ms-2`}>{textoRol}</span>
      </p>

      <div>
        {esAdmin ? (
          <div className="d-flex gap-2">
            <button className="btn btn-warning btn-sm" onClick={() => onEditar(usuario)}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={() => onEliminar(usuario.id)}>Eliminar</button>
          </div>
        ) : (
          <span className="text-muted fst-italic small">Solo Admin puede editar</span>
        )}
      </div>
    </div>
  )
}

export default ItemUsuario