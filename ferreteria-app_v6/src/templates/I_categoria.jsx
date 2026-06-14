const ItemCategoria = ({ categoria, esAdmin, onEditar, onEliminar }) => {
  return (
    <div className="product-card" style={{ borderLeft: '5px solid #4CAF50' }}>
      <div className="d-flex align-items-center mb-3">
        <span style={{ fontSize: '2em', marginRight: '15px' }}>{categoria.icon}</span>
        <div>
          <h5 className="mb-0 text-success">{categoria.name}</h5>
          <p className="mb-0 text-muted small">{categoria.description}</p>
        </div>
      </div>

      <div>
        {esAdmin ? (
          <div className="d-flex gap-2">
            <button className="btn btn-warning btn-sm" onClick={() => onEditar(categoria)}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={() => onEliminar(categoria.id)}>Eliminar</button>
          </div>
        ) : (
          <span className="text-muted fst-italic small">Solo Admin puede editar</span>
        )}
      </div>
    </div>
  )
}

export default ItemCategoria