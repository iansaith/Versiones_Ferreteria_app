const ItemUsuario = ({ usuario, esAdmin, vistaLista, onEditar, onEliminar }) => {
  const colorRol = usuario.role === 'admin' ? 'success' : 'warning'
  const textoRol = usuario.role === 'admin' ? 'Administrador' : 'Encargado'

  const botones = (
    <div className="d-flex gap-2">
      {esAdmin ? (
        <>
          <button className="btn btn-warning btn-sm" onClick={() => onEditar(usuario)}>Editar</button>
          <button className="btn btn-danger btn-sm" onClick={() => onEliminar(usuario.id)}>Eliminar</button>
        </>
      ) : (
        <span className="text-muted fst-italic small">Solo Admin puede editar</span>
      )}
    </div>
  )

  if (vistaLista) {
    return (
      <div className="card px-4 py-3 d-flex flex-row align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-4">
          <h6 className="mb-0" style={{ minWidth: '150px' }}>{usuario.name}</h6>
          <span className="text-muted small">{usuario.email}</span>
          <span className={`badge bg-${colorRol}`}>{textoRol}</span>
        </div>
        {botones}
      </div>
    )
  }

  return (
    <div className="product-card">
      <h5 className="mb-2">{usuario.name}</h5>
      <p className="mb-1"><strong>Email:</strong> {usuario.email}</p>
      <p className="mb-3">
        <strong>Rol:</strong>
        <span className={`badge bg-${colorRol} ms-2`}>{textoRol}</span>
      </p>
      {botones}
    </div>
  )
}

export default ItemUsuario